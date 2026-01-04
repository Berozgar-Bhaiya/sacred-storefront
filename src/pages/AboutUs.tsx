import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Heart, Award, Truck, Users, MapPin, Phone, Mail } from "lucide-react";
import logo from "@/assets/logo.png";

const values = [
  {
    icon: Heart,
    title: "Authenticity",
    description: "Every product is sourced directly from trusted artisans and manufacturers across India, ensuring genuine quality.",
  },
  {
    icon: Award,
    title: "Quality Assurance",
    description: "We carefully inspect each item before shipping to ensure it meets our high standards of craftsmanship.",
  },
  {
    icon: Truck,
    title: "Reliable Delivery",
    description: "From Varanasi to every corner of India, we deliver with care and offer Cash on Delivery for your convenience.",
  },
  {
    icon: Users,
    title: "Customer First",
    description: "Our dedicated support team is always ready to help you find the perfect items for your spiritual journey.",
  },
];

const milestones = [
  { year: "1995", title: "Our Beginning", description: "Started as a small puja items shop in the holy city of Varanasi." },
  { year: "2005", title: "Growing Family", description: "Expanded to serve devotees across Uttar Pradesh with authentic products." },
  { year: "2015", title: "Digital Journey", description: "Launched our online presence to reach devotees across India." },
  { year: "2024", title: "Trusted by Thousands", description: "Now serving over 50,000+ happy customers nationwide." },
];

export default function AboutUs() {
  return (
    <Layout>
      <SEOHead
        title="About Us - Our Story & Mission"
        description="Learn about Puja Bhandar's journey from a small shop in Varanasi to India's trusted destination for authentic Hindu puja items and religious essentials."
        keywords="about puja bhandar, hindu religious store, puja items shop india, varanasi puja store"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-saffron/10 py-16 md:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        </div>
        
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <img src={logo} alt="Puja Bhandar Logo" className="mx-auto h-24 w-24 md:h-32 md:w-32 mb-6" />
            <h1 className="font-display text-3xl font-bold text-foreground md:text-5xl">
              Our Sacred Journey
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              For nearly three decades, Puja Bhandar has been dedicated to bringing authentic 
              Hindu religious items to devotees across India, helping families maintain their 
              spiritual traditions with genuine, quality products.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Our Story</span>
              <h2 className="mt-2 font-display text-2xl font-bold text-foreground md:text-4xl">
                From the Holy City of Varanasi
              </h2>
              <div className="mt-6 space-y-4 text-muted-foreground">
                <p>
                  Our story began in 1995, in the sacred lanes of Varanasi, where our founder 
                  Shri Ramesh Sharma started a small shop selling puja essentials to local devotees. 
                  With deep reverence for Hindu traditions and an unwavering commitment to authenticity, 
                  he built relationships with the finest artisans and craftsmen.
                </p>
                <p>
                  What started as a humble endeavor grew into a trusted name, as word spread about 
                  our genuine products and honest service. Families began to rely on us for their 
                  daily puja needs, festival preparations, and special religious ceremonies.
                </p>
                <p>
                  Today, Puja Bhandar continues this legacy, now reaching devotees across India 
                  through our online platform. We remain committed to our founding principles: 
                  providing authentic, high-quality religious items with the same care and devotion 
                  that started it all.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-saffron/20 p-8 md:p-12">
                <div className="h-full w-full rounded-2xl bg-card shadow-xl flex items-center justify-center">
                  <div className="text-center p-6">
                    <span className="text-6xl md:text-8xl">🙏</span>
                    <p className="mt-4 font-display text-xl font-bold text-foreground">
                      Serving with Devotion
                    </p>
                    <p className="mt-2 text-muted-foreground">Since 1995</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-2xl bg-primary/20 -z-10" />
              <div className="absolute -top-6 -left-6 h-32 w-32 rounded-full bg-gold/20 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Our Mission</span>
            <h2 className="mt-2 font-display text-2xl font-bold text-foreground md:text-4xl">
              Bringing Divine Blessings to Every Home
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Our mission is simple yet profound: to make authentic Hindu religious items accessible 
              to every devotee in India. We believe that everyone deserves access to genuine puja 
              essentials, regardless of where they live. Through careful sourcing, quality assurance, 
              and reliable delivery, we strive to be your trusted partner in spiritual practice.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Our Values</span>
            <h2 className="mt-2 font-display text-2xl font-bold text-foreground md:text-4xl">
              What We Stand For
            </h2>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="rounded-2xl border border-border bg-card p-6 text-center transition-all hover:shadow-lg animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Our Journey</span>
            <h2 className="mt-2 font-display text-2xl font-bold text-foreground md:text-4xl">
              Milestones Along the Way
            </h2>
          </div>
          
          <div className="mx-auto max-w-3xl">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-0.5" />
              
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`relative flex gap-6 md:gap-0 mb-8 last:mb-0 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-primary ring-4 ring-background z-10" />
                  
                  {/* Content */}
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                    <div className="rounded-xl bg-card border border-border p-4 shadow-sm">
                      <span className="text-2xl font-bold text-primary">{milestone.year}</span>
                      <h3 className="mt-1 font-display font-semibold text-foreground">{milestone.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-4xl">
              Get in Touch
            </h2>
            <p className="mt-4 text-muted-foreground">
              Have questions or need assistance? We're here to help!
            </p>
            
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <a
                href="tel:+911234567890"
                className="flex flex-col items-center rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50"
              >
                <Phone className="h-8 w-8 text-primary" />
                <span className="mt-3 font-medium text-foreground">Call Us</span>
                <span className="mt-1 text-sm text-muted-foreground">+91 12345 67890</span>
              </a>
              
              <a
                href="mailto:support@pujabhandar.com"
                className="flex flex-col items-center rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50"
              >
                <Mail className="h-8 w-8 text-primary" />
                <span className="mt-3 font-medium text-foreground">Email Us</span>
                <span className="mt-1 text-sm text-muted-foreground">support@pujabhandar.com</span>
              </a>
              
              <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6">
                <MapPin className="h-8 w-8 text-primary" />
                <span className="mt-3 font-medium text-foreground">Visit Us</span>
                <span className="mt-1 text-sm text-muted-foreground text-center">Varanasi, UP 221001</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
