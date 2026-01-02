import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { ProductJsonLd } from "@/components/ProductJsonLd";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Heart, Star, Truck, Shield, RotateCcw, ChevronLeft, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { slug } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCart();
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const handleAddToCart = () => {
    if (!product) return;
    
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.image_urls?.[0] || "",
        slug: product.slug || "",
      });
    }
    
    toast({
      title: "Added to cart!",
      description: `${quantity} x ${product.name} added to your cart.`,
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 md:py-12">
          <div className="grid gap-8 lg:grid-cols-2">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container flex flex-col items-center justify-center py-20">
          <h1 className="font-display text-2xl font-bold">Product not found</h1>
          <Link to="/products">
            <Button variant="outline" className="mt-4">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const images = product.image_urls?.length ? product.image_urls : ["/placeholder.svg"];

  return (
    <Layout>
      <SEOHead 
        title={product.name}
        description={product.description || `Buy ${product.name} - authentic Hindu puja item. Cash on Delivery across India.`}
        keywords={`${product.name}, puja items, hindu religious items, ${(product.categories as any)?.name || ""}`}
      />
      <ProductJsonLd 
        product={{
          name: product.name,
          description: product.description,
          price: Number(product.price),
          original_price: product.original_price ? Number(product.original_price) : null,
          image_urls: product.image_urls,
          stock_status: product.stock_status,
          slug: product.slug,
        }}
        categoryName={(product.categories as any)?.name}
      />
      <div className="container py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary">Products</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-2xl bg-muted">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`h-20 w-20 overflow-hidden rounded-lg border-2 transition-colors ${
                      selectedImage === idx ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category Badge */}
            <Link
              to={`/products?category=${(product.categories as any)?.slug}`}
              className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
            >
              {(product.categories as any)?.name}
            </Link>

            {/* Title */}
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-gold text-gold" />
                ))}
              </div>
              <span className="font-medium">4.8</span>
              <span className="text-muted-foreground">(156 reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </span>
              {product.original_price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{Number(product.original_price).toLocaleString("en-IN")}
                  </span>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                    {Math.round((1 - Number(product.price) / Number(product.original_price)) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div className="prose prose-sm text-muted-foreground">
              <p>{product.description}</p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${product.stock_status === "in_stock" ? "bg-green-500" : "bg-red-500"}`} />
              <span className={product.stock_status === "in_stock" ? "text-green-600" : "text-red-600"}>
                {product.stock_status === "in_stock" ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-lg font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="saffron"
                size="xl"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.stock_status === "out_of_stock"}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button variant="outline" size="xl">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Meesho Link */}
            {product.meesho_link && (
              <a
                href={product.meesho_link}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-sm text-muted-foreground hover:text-primary"
              >
                Also available on Meesho →
              </a>
            )}

            {/* Delivery Info */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-display text-lg font-semibold">Delivery & Returns</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">India Delivery</p>
                    <p className="text-sm text-muted-foreground">Delivering across India</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <RotateCcw className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">3 Days Return</p>
                    <p className="text-sm text-muted-foreground">Easy return policy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">100% Authentic</p>
                    <p className="text-sm text-muted-foreground">Genuine products</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
