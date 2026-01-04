import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { OrganizationJsonLd } from "@/components/OrganizationJsonLd";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesBar } from "@/components/home/FeaturesBar";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { PromoBanner } from "@/components/home/PromoBanner";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";

const Index = () => {
  return (
    <Layout>
      <SEOHead 
        title="Authentic Hindu Puja Items & Religious Essentials"
        description="Shop authentic Hindu puja items, brass idols, diyas, agarbatti, pooja kits, and religious essentials. Quality products delivered across India with Cash on Delivery."
        keywords="puja items, hindu religious items, brass idols, diya, agarbatti, pooja kit, rudraksha, ganesh murti, puja samagri, india"
      />
      <OrganizationJsonLd />
      <HeroSection />
      <FeaturesBar />
      <CategoriesSection />
      <FeaturedProducts />
      <PromoBanner />
      <TestimonialsSection />
    </Layout>
  );
};

export default Index;
