import { Truck, Shield, RotateCcw } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "India Delivery",
    description: "Delivering across India",
  },
  {
    icon: Shield,
    title: "100% Authentic",
    description: "Genuine products guaranteed",
  },
  {
    icon: RotateCcw,
    title: "3 Days Return",
    description: "Easy return policy",
  },
];

export function FeaturesBar() {
  return (
    <section className="border-y border-border bg-muted/50 py-6 md:py-8">
      <div className="container">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="flex items-center gap-3 md:gap-4 justify-center sm:justify-start animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground text-sm md:text-base">{feature.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground truncate">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
