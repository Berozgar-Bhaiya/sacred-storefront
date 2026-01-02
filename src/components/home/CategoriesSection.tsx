import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const categories = [
  {
    id: "puja-items",
    name: "Puja Items",
    description: "Essential items for daily worship",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=400&fit=crop",
    color: "from-primary/20 to-saffron-light/20",
  },
  {
    id: "idols",
    name: "Idols & Murtis",
    description: "Handcrafted divine sculptures",
    image: "https://images.unsplash.com/photo-1567591370504-80e1bd6d531a?w=400&h=400&fit=crop",
    color: "from-gold/20 to-gold-light/20",
  },
  {
    id: "rudraksha",
    name: "Rudraksha",
    description: "Sacred seeds for spiritual growth",
    image: "https://images.unsplash.com/photo-1609619385076-36a873425636?w=400&h=400&fit=crop",
    color: "from-secondary/20 to-maroon-light/20",
  },
  {
    id: "incense",
    name: "Incense & Dhoop",
    description: "Premium fragrances for worship",
    image: "https://images.unsplash.com/photo-1602615576820-ea14cf3e476a?w=400&h=400&fit=crop",
    color: "from-primary/20 to-gold/20",
  },
  {
    id: "books",
    name: "Books & Scriptures",
    description: "Sacred texts and spiritual guides",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
    color: "from-saffron-light/20 to-primary/20",
  },
  {
    id: "accessories",
    name: "Accessories",
    description: "Complete your puja setup",
    image: "https://images.unsplash.com/photo-1602615580829-fa75c7b98527?w=400&h=400&fit=crop",
    color: "from-gold-light/20 to-gold/20",
  },
];

export function CategoriesSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-4 text-muted-foreground">
            Explore our wide range of authentic religious items for your spiritual journey
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="group relative overflow-hidden rounded-2xl shadow-card transition-all duration-300 hover:shadow-lg animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background Gradient */}
              <div className={cn("absolute inset-0 bg-gradient-to-br", category.color)} />
              
              {/* Content */}
              <div className="relative flex items-center gap-4 p-6">
                <div className="flex-1">
                  <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
                <div className="h-20 w-20 overflow-hidden rounded-xl shadow-sm">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
