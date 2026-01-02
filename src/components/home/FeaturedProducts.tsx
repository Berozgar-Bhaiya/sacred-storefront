import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock featured products data
const featuredProducts = [
  {
    id: "1",
    name: "Brass Ganesh Idol",
    price: 2499,
    originalPrice: 2999,
    image: "https://images.unsplash.com/photo-1567591370504-80e1bd6d531a?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 156,
    badge: "Bestseller",
  },
  {
    id: "2",
    name: "Premium Rudraksha Mala",
    price: 1299,
    originalPrice: 1599,
    image: "https://images.unsplash.com/photo-1609619385076-36a873425636?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 234,
    badge: "Top Rated",
  },
  {
    id: "3",
    name: "Copper Kalash Set",
    price: 1899,
    originalPrice: 2299,
    image: "https://images.unsplash.com/photo-1602615576820-ea14cf3e476a?w=400&h=400&fit=crop",
    rating: 4.7,
    reviews: 89,
    badge: null,
  },
  {
    id: "4",
    name: "Sandalwood Dhoop Cones",
    price: 349,
    originalPrice: 449,
    image: "https://images.unsplash.com/photo-1602615580829-fa75c7b98527?w=400&h=400&fit=crop",
    rating: 4.6,
    reviews: 312,
    badge: "New",
  },
];

export function FeaturedProducts() {
  return (
    <section className="bg-card py-16 md:py-24">
      <div className="container">
        {/* Section Header */}
        <div className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Featured Products
            </h2>
            <p className="mt-2 text-muted-foreground">
              Handpicked items loved by our devotees
            </p>
          </div>
          <Link to="/products">
            <Button variant="outline">
              View All Products
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product, index) => (
            <div
              key={product.id}
              className="group relative overflow-hidden rounded-2xl bg-background shadow-card transition-all duration-300 hover:shadow-lg animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Badge */}
                {product.badge && (
                  <span className={cn(
                    "absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold",
                    product.badge === "Bestseller" && "bg-primary text-primary-foreground",
                    product.badge === "Top Rated" && "bg-gold text-foreground",
                    product.badge === "New" && "bg-secondary text-secondary-foreground"
                  )}>
                    {product.badge}
                  </span>
                )}

                {/* Wishlist Button */}
                <button className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-background hover:text-destructive">
                  <Heart className="h-5 w-5" />
                </button>

                {/* Quick Add */}
                <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-gradient-to-t from-background/90 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">
                  <Button variant="saffron" className="w-full">
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Rating */}
                <div className="mb-2 flex items-center gap-1">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviews})
                  </span>
                </div>

                {/* Title */}
                <Link to={`/products/${product.id}`}>
                  <h3 className="font-display text-lg font-semibold text-foreground transition-colors hover:text-primary">
                    {product.name}
                  </h3>
                </Link>

                {/* Price */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xl font-bold text-primary">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{product.originalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
