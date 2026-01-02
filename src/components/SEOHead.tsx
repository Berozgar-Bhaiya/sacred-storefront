import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
}

export function SEOHead({ 
  title, 
  description = "Shop authentic Hindu puja items, brass idols, diyas, and religious essentials. Delivered across India with Cash on Delivery.",
  keywords = "puja items, hindu religious items, brass idols, diya, agarbatti, pooja kit",
  canonicalUrl 
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = `${title} | Puja Bhandar`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    }

    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute("content", keywords);
    }

    // Update OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", `${title} | Puja Bhandar`);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute("content", description);
    }

    // Update canonical URL if provided
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute("href", canonicalUrl);
      }
    }

    return () => {
      // Reset to default on unmount
      document.title = "Puja Bhandar - Authentic Hindu Puja Items & Religious Essentials | India";
    };
  }, [title, description, keywords, canonicalUrl]);

  return null;
}
