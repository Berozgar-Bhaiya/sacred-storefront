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
    <section className="border-y border-border bg-muted/50 py-8">
      <div className="container">
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="flex items-center gap-4 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
