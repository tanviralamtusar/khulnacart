ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS steadfast_consignment_id TEXT;
COMMENT ON COLUMN public.orders.steadfast_consignment_id IS 'Steadfast courier consignment ID';
CREATE INDEX IF NOT EXISTS idx_orders_steadfast_consignment_id ON public.orders(steadfast_consignment_id);;
