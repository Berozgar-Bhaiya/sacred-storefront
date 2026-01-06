import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Heart, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useToast } from "@/hooks/use-toast";

export default function Wishlist() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { removeFromWishlist, wishlistItems } = useWishlist();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery({
    queryKey: ["wishlist-products", wishlistItems],
    queryFn: async () => {
      if (wishlistItems.length === 0) return [];
      
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .in("id", wishlistItems);
      
      if (error) throw error;
      return data;
    },
    enabled: wishlistItems.length > 0,
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

  if (!user) {
    return (
      <Layout>
        <SEOHead title="Wishlist" description="Your saved products" />
        <div className="container flex flex-col items-center justify-center py-20">
          <Heart className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Login to view your wishlist</h1>
          <p className="text-muted-foreground mb-6">Save products for later by logging in.</p>
          <Link to="/auth">
            <Button variant="saffron">Login / Sign Up</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead title="My Wishlist" description="Products you've saved for later" />
      <div className="container py-8 md:py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            My Wishlist
          </h1>
          <p className="mt-2 text-muted-foreground">
            {products?.length || 0} saved items
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        ) : !products || products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-4">Your wishlist is empty</p>
            <Link to="/products">
              <Button variant="saffron">Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="group relative overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-lg animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Link to={`/products/${product.slug}`} className="block">
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image_urls?.[0] || "https://via.placeholder.com/400"}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {product.original_price && Number(product.original_price) > Number(product.price) && (
                      <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                        {Math.round((1 - Number(product.price) / Number(product.original_price)) * 100)}% OFF
                      </span>
                    )}

                    {product.stock_status === "out_of_stock" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                        <span className="rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-destructive backdrop-blur-sm transition-colors hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-5 w-5" />
                </button>

                <div className="p-4">
                  <Link to={`/products/${product.slug}`}>
                    <h3 className="font-body text-lg font-semibold text-foreground transition-colors hover:text-primary line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {(product.categories as any)?.name}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xl font-bold text-primary">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </span>
                    {product.original_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{Number(product.original_price).toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="saffron"
                    className="mt-4 w-full"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock_status === "out_of_stock"}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}