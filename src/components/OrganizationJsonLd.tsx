import { Helmet } from "react-helmet-async";

export function OrganizationJsonLd() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Puja Bhandar",
    url: "https://pujabhandar.com",
    logo: "https://pujabhandar.com/og-image.png",
    description: "Authentic Hindu puja items, brass idols, diyas, and religious essentials delivered across India.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: [],
  };

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Puja Bhandar",
    url: "https://pujabhandar.com",
    description: "Shop authentic Hindu puja items, brass idols, diyas, agarbatti, pooja kits, and religious essentials.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://pujabhandar.com/products?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Puja Bhandar",
    url: "https://pujabhandar.com",
    image: "https://pujabhandar.com/og-image.png",
    description: "Online store for authentic Hindu puja items and religious essentials.",
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
    paymentAccepted: "Cash on Delivery, UPI, Cards",
    currenciesAccepted: "INR",
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(organizationData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(localBusinessData)}
      </script>
    </Helmet>
  );
}
