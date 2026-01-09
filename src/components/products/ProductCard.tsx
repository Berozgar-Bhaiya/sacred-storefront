import { Link } from "react-router-dom";
import { ShoppingCart, Heart, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: any;
  index: number;
  isInWishlist: boolean;
  onToggleWishlist: () => void;
  onAddToCart: () => void;
}

export function ProductCard({
  product,
  index,
  isInWishlist,
  onToggleWishlist,
  onAddToCart,
}: ProductCardProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-lg animate-fade-in-up"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Image */}
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.image_urls?.[0] || "https://via.placeholder.com/400"}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {product.original_price &&
            Number(product.original_price) > Number(product.price) && (
              <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                {Math.round(
                  (1 - Number(product.price) / Number(product.original_price)) * 100
                )}
                % OFF
              </span>
            )}

          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleWishlist();
            }}
            className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
              isInWishlist
                ? "bg-destructive text-destructive-foreground"
                : "bg-background/80 text-muted-foreground hover:bg-background hover:text-destructive"
            }`}
          >
            <Heart className={`h-5 w-5 ${isInWishlist ? "fill-current" : ""}`} />
          </button>

          {product.stock_status === "out_of_stock" && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <span className="rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-body text-lg font-semibold text-foreground transition-colors hover:text-primary line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {(product.categories as any)?.name}
          </p>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              product.returnable
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <RotateCcw className="h-3 w-3" />
            {product.returnable ? "Returnable" : "No Return"}
          </span>
        </div>

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
          onClick={onAddToCart}
          disabled={product.stock_status === "out_of_stock"}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
