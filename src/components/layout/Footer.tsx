import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Footer = () => {
  // Fetch site settings
  const { data: siteSettings } = useQuery({
    queryKey: ['footer-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value')
        .in('key', ['site_name', 'site_logo', 'header_phone', 'whatsapp_number', 'call_number']);
      
      if (error) throw error;
      
      const settingsMap: Record<string, string> = {};
      data?.forEach(item => {
        settingsMap[item.key] = item.value;
      });
      
      return settingsMap;
    },
    staleTime: 5 * 60 * 1000,
  });

  const siteName = siteSettings?.site_name || 'খুলনা কার্ট';
  const siteLogo = siteSettings?.site_logo;

  return (
    <footer className="bg-[#F8F5F0] text-foreground pt-12 pb-8 border-t border-border">
      <div className="container mx-auto px-4">
        {/* Top Promise Bar */}
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Never worry about <span className="font-bold text-foreground">quality and authenticity</span>—they are our core promises. We strictly check the <span className="font-bold text-foreground">expiry date</span> of every product before delivery.
          </p>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Why We are Best?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 items-start">
          {/* Why We Are Best List */}
          <div className="flex flex-col items-center md:items-start">
            <ul className="space-y-3 text-sm md:text-base font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                Fastest Delivery [Same Day]
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                Verified & Authentic Products
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                Customer Support
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                Easy return policy
              </li>
            </ul>
          </div>

          {/* Customer Support Links */}
          <div className="flex flex-col items-center">
            <h4 className="font-bold text-lg mb-6 tracking-tight uppercase">CUSTOMER SUPPORT</h4>
            <ul className="space-y-4 text-center">
              <li><Link to="/auth" className="text-sm md:text-base hover:text-primary transition-colors">Login</Link></li>
              <li><Link to="/auth" className="text-sm md:text-base hover:text-primary transition-colors">Register</Link></li>
              <li><Link to="/contact" className="text-sm md:text-base hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* About & Branding */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right">
            <p className="text-sm md:text-base text-muted-foreground max-w-xs mb-8 leading-relaxed">
              Just place the order, we will be at your door soon. <span className="font-bold text-foreground">Your parcel is safe</span> until we hand it over to you. We really love your feedback.
            </p>
            
            <div className="flex items-center justify-center md:justify-end">
              <span className="text-5xl md:text-6xl font-extrabold tracking-tighter">
                khulna<span className="text-primary">Cart</span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 text-center text-xs md:text-sm text-muted-foreground">
          <p>Powered by khulnacart.com, All rights reserved, 2026.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
