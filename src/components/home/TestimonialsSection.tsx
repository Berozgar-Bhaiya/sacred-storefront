import { Star } from "lucide-react";
import testimonial1 from "@/assets/testimonial-1.png";
import testimonial2 from "@/assets/testimonial-2.png";
import testimonial3 from "@/assets/testimonial-3.png";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Mumbai, Maharashtra",
    image: testimonial1,
    rating: 5,
    text: "The brass Ganesh idol I ordered is absolutely stunning. The craftsmanship is exceptional and the delivery was quick. Truly blessed to have found Puja Bhandar!",
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    location: "Delhi",
    image: testimonial2,
    rating: 5,
    text: "Been ordering puja items from here for over a year. The quality is consistent and prices are very reasonable. Highly recommended for all devotees.",
  },
  {
    id: 3,
    name: "Anita Devi",
    location: "Varanasi, UP",
    image: testimonial3,
    rating: 5,
    text: "The rudraksha mala I received is authentic and beautifully energized. Customer service is excellent. Thank you for bringing such sacred items to our homes.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Words from Our Devotees
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join 50,000+ satisfied customers who trust us for their spiritual needs
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="rounded-2xl bg-card p-6 shadow-card transition-all duration-300 hover:shadow-lg animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-gold text-gold" />
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground/90 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
