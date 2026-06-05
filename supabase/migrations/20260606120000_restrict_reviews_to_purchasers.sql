create schema if not exists private;

alter table public.reviews
  add column if not exists customer_name text;

create or replace function private.has_purchased_product(check_user_id uuid, check_product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.orders o
    join public.order_items oi on oi.order_id = o.id
    where o.user_id = check_user_id
      and oi.product_id = check_product_id
      and (o.status = 'delivered' or o.payment_status = 'paid')
  );
$$;

grant usage on schema private to anon, authenticated;
grant execute on function private.has_purchased_product(uuid, uuid) to anon, authenticated;

create or replace function private.set_verified_review_details()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  profile_name text;
  order_name text;
begin
  new.is_verified := true;

  select nullif(trim(p.full_name), '')
    into profile_name
  from public.profiles p
  where p.user_id = new.user_id
  limit 1;

  select nullif(trim(o.shipping_name), '')
    into order_name
  from public.orders o
  join public.order_items oi on oi.order_id = o.id
  where o.user_id = new.user_id
    and oi.product_id = new.product_id
    and (o.status = 'delivered' or o.payment_status = 'paid')
  order by o.created_at desc
  limit 1;

  new.customer_name := coalesce(profile_name, order_name, 'Customer');
  return new;
end;
$$;

revoke all on function private.set_verified_review_details() from public, anon, authenticated;

drop trigger if exists set_verified_review_details_on_reviews on public.reviews;
create trigger set_verified_review_details_on_reviews
  before insert or update on public.reviews
  for each row
  execute function private.set_verified_review_details();

drop policy if exists "Anyone can view reviews" on public.reviews;
create policy "Anyone can view verified purchaser reviews"
  on public.reviews
  for select
  using (
    is_verified = true
    and private.has_purchased_product(user_id, product_id)
  );

drop policy if exists "Users can create their own reviews" on public.reviews;
create policy "Users can create reviews for purchased products"
  on public.reviews
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and private.has_purchased_product(user_id, product_id)
    and is_verified = true
  );

drop policy if exists "Users can update their own reviews" on public.reviews;
create policy "Users can update reviews for purchased products"
  on public.reviews
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and private.has_purchased_product(user_id, product_id)
    and is_verified = true
  );

update public.reviews r
set
  is_verified = true,
  customer_name = coalesce(
    (
      select nullif(trim(p.full_name), '')
      from public.profiles p
      where p.user_id = r.user_id
      limit 1
    ),
    (
      select nullif(trim(o.shipping_name), '')
      from public.orders o
      join public.order_items oi on oi.order_id = o.id
      where o.user_id = r.user_id
        and oi.product_id = r.product_id
        and (o.status = 'delivered' or o.payment_status = 'paid')
      order by o.created_at desc
      limit 1
    ),
    r.customer_name,
    'Customer'
  )
where private.has_purchased_product(r.user_id, r.product_id);

create or replace function public.update_product_rating()
returns trigger
language plpgsql
as $$
begin
  update public.products
  set
    rating = (
      select coalesce(avg(rating), 0)
      from public.reviews
      where product_id = coalesce(new.product_id, old.product_id)
        and is_verified = true
        and private.has_purchased_product(user_id, product_id)
    ),
    review_count = (
      select count(*)
      from public.reviews
      where product_id = coalesce(new.product_id, old.product_id)
        and is_verified = true
        and private.has_purchased_product(user_id, product_id)
    )
  where id = coalesce(new.product_id, old.product_id);

  return coalesce(new, old);
end;
$$;

update public.products p
set
  rating = (
    select coalesce(avg(r.rating), 0)
    from public.reviews r
    where r.product_id = p.id
      and r.is_verified = true
      and private.has_purchased_product(r.user_id, r.product_id)
  ),
  review_count = (
    select count(*)
    from public.reviews r
    where r.product_id = p.id
      and r.is_verified = true
      and private.has_purchased_product(r.user_id, r.product_id)
  );
