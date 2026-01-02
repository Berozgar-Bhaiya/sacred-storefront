import { Helmet } from "react-helmet-async";

interface ProductJsonLdProps {
  product: {
    name: string;
    description: string | null;
    price: number;
    original_price: number | null;
    image_urls: string[] | null;
    stock_status: string;
    slug: string | null;
  };
  categoryName?: string;
}

export function ProductJsonLd({ product, categoryName }: ProductJsonLdProps) {
  const images = product.image_urls?.length ? product.image_urls : ["/placeholder.svg"];
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `Buy ${product.name} - authentic Hindu puja item.`,
    image: images.map(img => img.startsWith("http") ? img : `https://pujabhandar.com${img}`),
    brand: {
      "@type": "Brand",
      name: "Puja Bhandar",
    },
    category: categoryName || "Puja Items",
    offers: {
      "@type": "Offer",
      url: `https://pujabhandar.com/products/${product.slug}`,
      priceCurrency: "INR",
      price: Number(product.price),
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      availability: product.stock_status === "in_stock" 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Puja Bhandar",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "156",
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}
