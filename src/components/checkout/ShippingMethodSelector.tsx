import { useState, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ShippingZone = 'inside_khulna';

interface ShippingMethodSelectorProps {
  address: string;
  selectedZone: ShippingZone;
  onZoneChange: (zone: ShippingZone) => void;
}

const SHIPPING_RATES = {
  inside_khulna: 49,
};

export function ShippingMethodSelector({ 
  address, 
  selectedZone, 
  onZoneChange 
}: ShippingMethodSelectorProps) {
  // Always ensure inside_khulna is selected
  useEffect(() => {
    if (selectedZone !== 'inside_khulna') {
      onZoneChange('inside_khulna');
    }
  }, [selectedZone, onZoneChange]);

  return null; // Card removed as requested
}

export { SHIPPING_RATES };
