import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const useSEO = ({ title, description, image, url, type = 'website' }: SEOProps) => {
  useEffect(() => {
    const siteName = 'KhulnaCart';
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const currentUrl = url || window.location.href;
    const defaultImage = '/src/assets/favicon1.png'; // Fallback image

    // Update Basic Tags
    if (title) document.title = fullTitle;

    const updateMetaTag = (property: string, content: string, attr: 'name' | 'property' = 'property') => {
      let element = document.querySelector(`meta[${attr}="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // OG Tags
    updateMetaTag('og:title', fullTitle);
    if (description) {
      updateMetaTag('og:description', description);
      updateMetaTag('description', description, 'name');
    }
    updateMetaTag('og:image', image || defaultImage);
    updateMetaTag('og:url', currentUrl);
    updateMetaTag('og:type', type);
    updateMetaTag('og:site_name', siteName);

    // Twitter Tags
    updateMetaTag('twitter:card', 'summary_large_image', 'name');
    updateMetaTag('twitter:title', fullTitle, 'name');
    if (description) updateMetaTag('twitter:description', description, 'name');
    updateMetaTag('twitter:image', image || defaultImage, 'name');

    // Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

  }, [title, description, image, url, type]);
};
