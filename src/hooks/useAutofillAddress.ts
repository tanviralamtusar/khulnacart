import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAutofillAddress<T>(
  setForm: (updateFn: (prev: T) => T) => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;
    
    const autofill = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isPhoneEmail = user.email?.endsWith('@phone.local');
      const phoneVal = user.phone || user.user_metadata?.phone || (isPhoneEmail ? user.email?.replace('@phone.local', '') : '');

      // 1. Try default address
      const { data: addressData } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .maybeSingle();

      if (addressData) {
        setForm(prev => ({
          ...prev,
          name: addressData.name || (prev as { name?: string }).name || '',
          phone: addressData.phone || phoneVal || (prev as { phone?: string }).phone || '',
          address: `${addressData.street || ''}, ${addressData.city || ''}, ${addressData.district || ''}`.replace(/^,\s*|,\s*$/, '').trim() || (prev as { address?: string }).address || '',
        }));
        return;
      }

      // 2. Try last order
      const { data: lastOrder } = await supabase
        .from('orders')
        .select('shipping_name, shipping_phone, shipping_street, shipping_city, shipping_district')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastOrder) {
        setForm(prev => ({
          ...prev,
          name: lastOrder.shipping_name || (prev as { name?: string }).name || '',
          phone: lastOrder.shipping_phone || phoneVal || (prev as { phone?: string }).phone || '',
          address: `${lastOrder.shipping_street || ''}, ${lastOrder.shipping_city || ''}, ${lastOrder.shipping_district || ''}`.replace(/^,\s*|,\s*$/, '').trim() || (prev as { address?: string }).address || '',
        }));
        return;
      }

      // 3. Try profile info
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        setForm(prev => ({
          ...prev,
          name: profile.full_name || user.user_metadata?.full_name || user.user_metadata?.name || (prev as { name?: string }).name || '',
          phone: profile.phone || phoneVal || (prev as { phone?: string }).phone || '',
        }));
      } else {
        setForm(prev => ({
          ...prev,
          name: user.user_metadata?.full_name || user.user_metadata?.name || (prev as { name?: string }).name || '',
          phone: phoneVal || (prev as { phone?: string }).phone || '',
        }));
      }
    };

    autofill();
  }, [setForm, enabled]);
}
