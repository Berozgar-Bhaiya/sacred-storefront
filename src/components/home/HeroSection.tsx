import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden gradient-hero mandala-pattern">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-20 top-40 h-60 w-60 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-40 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container relative py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 animate-fade-in">
            <Sparkles className="h-4 w-4 text-gold" />
            <span className="text-sm font-medium text-foreground">
              Authentic Puja Essentials Since 1995
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl animate-fade-in-up">
            Bring Divine Blessings{" "}
            <span className="bg-gradient-to-r from-primary to-saffron-light bg-clip-text text-transparent">
              Home
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Discover our curated collection of authentic Hindu religious items, 
            handcrafted idols, sacred rudraksha, and premium puja essentials 
            delivered with devotion across India.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Link to="/products">
              <Button variant="hero" size="xl">
                Shop Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" size="xl">
                Browse Categories
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span>100% Authentic</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🚚</span>
              <span>Free Shipping ₹499+</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🔒</span>
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🇮🇳</span>
              <span>Made for India</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
