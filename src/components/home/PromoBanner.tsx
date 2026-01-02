import { Button } from "@/components/ui/button";
import { ArrowRight, Gift } from "lucide-react";
import { Link } from "react-router-dom";

export function PromoBanner() {
  return (
    <section className="py-8">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-secondary to-maroon-light">
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-10 -top-10 h-60 w-60 rounded-full border-4 border-secondary-foreground" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full border-4 border-secondary-foreground" />
          </div>

          <div className="relative flex flex-col items-center justify-between gap-6 p-8 md:flex-row md:p-12">
            {/* Content */}
            <div className="text-center md:text-left">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-secondary-foreground/20 px-4 py-1">
                <Gift className="h-4 w-4 text-secondary-foreground" />
                <span className="text-sm font-medium text-secondary-foreground">
                  Limited Time Offer
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold text-secondary-foreground md:text-3xl lg:text-4xl">
                Get 20% Off on First Order
              </h2>
              <p className="mt-2 text-secondary-foreground/80">
                Use code <span className="font-bold">DIVINE20</span> at checkout
              </p>
            </div>

            {/* CTA */}
            <Link to="/products">
              <Button variant="gold" size="xl">
                Shop Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
