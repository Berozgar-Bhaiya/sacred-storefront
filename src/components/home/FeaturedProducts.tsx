import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

export function FeaturedProducts() {
  const { addItem } = useCart();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("featured", true)
        .eq("stock_status", "in_stock")
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image_urls?.[0] || "",
      slug: product.slug,
    });
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  if (isLoading) {
    return (
      <section className="bg-card py-16 md:py-24">
        <div className="container">
          <div className="mb-12 flex items-center justify-between">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

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
            <Button variant="outline">View All Products</Button>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products?.map((product, index) => (
            <div
              key={product.id}
              className="group relative overflow-hidden rounded-2xl bg-background shadow-card transition-all duration-300 hover:shadow-lg animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image Container */}
              <Link to={`/products/${product.slug}`} className="block">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image_urls?.[0] || "https://via.placeholder.com/400"}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Badge */}
                  {product.original_price && Number(product.original_price) > Number(product.price) && (
                    <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      {Math.round((1 - Number(product.price) / Number(product.original_price)) * 100)}% OFF
                    </span>
                  )}

                  {/* Wishlist Button */}
                  <button className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-background hover:text-destructive">
                    <Heart className="h-5 w-5" />
                  </button>
                </div>
              </Link>

              {/* Content */}
              <div className="p-4">
                {/* Title */}
                <Link to={`/products/${product.slug}`}>
                  <h3 className="font-display text-lg font-semibold text-foreground transition-colors hover:text-primary line-clamp-1">
                    {product.name}
                  </h3>
                </Link>

                {/* Price */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xl font-bold text-primary">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </span>
                  {product.original_price && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{Number(product.original_price).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <Button
                  variant="saffron"
                  className="mt-4 w-full"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
