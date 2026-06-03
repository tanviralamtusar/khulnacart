import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function FaviconLoader() {
  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('key, value')
          .in('key', ['favicon_url', 'site_name', 'shop_name', 'google_site_verification']);

        if (error) {
          console.error('Failed to load site settings:', error);
          return;
        }

        if (data) {
          const settings = data.reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
          }, {} as Record<string, string>);

          // Update favicon
          if (settings.favicon_url) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = settings.favicon_url;
          }

          // Update site title (tab hover)
          const siteName = settings.site_name || settings.shop_name;
          if (siteName && document.title !== siteName) {
            document.title = siteName;
          }

          // Update Google Site Verification
          if (settings.google_site_verification) {
            let meta = document.querySelector("meta[name='google-site-verification']") as HTMLMetaElement;
            if (!meta) {
              meta = document.createElement('meta');
              meta.name = 'google-site-verification';
              document.head.appendChild(meta);
            }
            
            // Handle if they paste the whole tag or just the content
            const contentMatch = settings.google_site_verification.match(/content="([^"]+)"/);
            meta.content = contentMatch ? contentMatch[1] : settings.google_site_verification;
          }
        }
      } catch (error) {
        console.error('Failed to load site settings:', error);
      }
    };

    // Initial load
    loadSiteSettings();

    // Refresh when user comes back to the tab
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadSiteSettings();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Periodic refresh (helps when settings changed in admin without full reload)
    const intervalId = window.setInterval(loadSiteSettings, 30_000);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, []);

  return null;
}
