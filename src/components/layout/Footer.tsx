import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import siteLogoAsset from '@/assets/site-logo.png';
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
    <footer className="bg-slate-50 text-foreground pt-20 pb-10 border-t border-border/50">
      <div className="container mx-auto px-6">
        {/* Top Promise Bar */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center p-1 px-4 mb-6 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
            Our Promise
          </div>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Never worry about <span className="font-semibold text-foreground">quality and authenticity</span>—they are our core promises. We strictly check the <span className="font-semibold text-foreground italic">expiry date</span> of every product before delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 mb-20">
          {/* Column 1: Why We Are Best */}
          <div className="md:col-span-4 space-y-6">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">Why We are Best?</h3>
            <ul className="space-y-4">
              {[
                "Fastest Delivery [Same Day]",
                "Verified & Authentic Products",
                "Dedicated Customer Support",
                "Hassle-free Return Policy"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-muted-foreground group">
                  <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  <span className="font-medium group-hover:text-foreground transition-colors">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Customer Support */}
          <div className="md:col-span-3 space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Customer Support</h4>
            <ul className="space-y-3">
              {[
                { label: "Login", to: "/auth" },
                { label: "Register", to: "/auth" },
                { label: "Contact Us", to: "/contact" },
                { label: "Shipping Policy", to: "/contact" },
                { label: "Return Policy", to: "/contact" }
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.to} className="text-muted-foreground hover:text-primary transition-colors inline-block relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-primary hover:after:w-full after:transition-all">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: About & Branding */}
          <div className="md:col-span-5 flex flex-col items-center md:items-end text-center md:text-right space-y-8">
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Our Mission</h4>
              <p className="text-muted-foreground max-w-sm leading-relaxed">
                Just place the order, we will be at your door soon. <span className="font-semibold text-foreground">Your parcel is safe</span> until we hand it over to you. We really love your feedback and strive to improve every day.
              </p>
            </div>
            
            <div className="pt-4">
              <Link to="/" className="inline-block group">
                <img 
                  src={siteSettings?.site_logo || siteLogoAsset} 
                  alt="Khulna Cart" 
                  className="h-16 md:h-20 w-auto transition-transform group-hover:-translate-y-1"
                />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border/50 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-medium text-muted-foreground tracking-wide">
            © {new Date().getFullYear()} KHULNA CART. POWERED BY <a href="https://khulnacart.com" className="text-primary hover:underline">KHULNACART.COM</a>
          </p>
          
          <div className="flex items-center gap-6">
             <Link to="/contact" className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">Privacy</Link>
             <Link to="/contact" className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">Terms</Link>
             <Link to="/contact" className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
