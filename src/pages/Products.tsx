import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Heart, Filter, X, Search, ArrowUpDown } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get("category");
  const searchFromUrl = searchParams.get("search");
  const [searchQuery, setSearchQuery] = useState(searchFromUrl || "");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categorySlug);
  const [sortBy, setSortBy] = useState("newest");
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    setSelectedCategory(categorySlug);
  }, [categorySlug]);

  useEffect(() => {
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
  }, [searchFromUrl]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", selectedCategory, priceRange, searchQuery, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*, categories(name, slug)")
        .gte("price", priceRange[0])
        .lte("price", priceRange[1]);

      // Apply sorting
      switch (sortBy) {
        case "price_low":
          query = query.order("price", { ascending: true });
          break;
        case "price_high":
          query = query.order("price", { ascending: false });
          break;
        case "name_asc":
          query = query.order("name", { ascending: true });
          break;
        case "name_desc":
          query = query.order("name", { ascending: false });
          break;
        case "newest":
        default:
          query = query.order("created_at", { ascending: false });
          break;
      }

      if (selectedCategory) {
        const category = categories?.find((c) => c.slug === selectedCategory);
        if (category) {
          query = query.eq("category_id", category.id);
        }
      }

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!categories,
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

  const clearFilters = () => {
    setSelectedCategory(null);
    setPriceRange([0, 5000]);
    setSearchQuery("");
    setSortBy("newest");
    setSearchParams({});
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label>Search Products</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <Label>Categories</Label>
        <div className="space-y-2">
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSearchParams({});
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !selectedCategory
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            All Products
          </button>
          {categories?.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.slug);
                setSearchParams({ category: category.slug });
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === category.slug
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <Label>Price Range</Label>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={5000}
          step={100}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}</span>
        </div>
      </div>

      {/* Clear Filters */}
      <Button variant="outline" className="w-full" onClick={clearFilters}>
        <X className="mr-2 h-4 w-4" />
        Clear Filters
      </Button>
    </div>
  );

  const categoryName = selectedCategory
    ? categories?.find((c) => c.slug === selectedCategory)?.name || "Products"
    : "All Products";

  return (
    <Layout>
      <SEOHead 
        title={categoryName}
        description={`Shop ${categoryName.toLowerCase()} - authentic Hindu puja items and religious essentials. Quality products with Cash on Delivery across India.`}
        keywords={`${categoryName.toLowerCase()}, puja items, hindu religious items, india`}
      />
      <div className="container py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              {categoryName}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {products?.length || 0} products found
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="name_asc">Name: A to Z</SelectItem>
                <SelectItem value="name_desc">Name: Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-6 font-display text-lg font-semibold">Filters</h2>
              <FilterContent />
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="saffron" size="lg" className="shadow-lg">
                  <Filter className="mr-2 h-5 w-5" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-96 rounded-2xl" />
                ))}
              </div>
            ) : products?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-xl text-muted-foreground">No products found</p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products?.map((product, index) => (
                  <div
                    key={product.id}
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
                        
                        {product.original_price && Number(product.original_price) > Number(product.price) && (
                          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                            {Math.round((1 - Number(product.price) / Number(product.original_price)) * 100)}% OFF
                          </span>
                        )}

                        <button className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-background hover:text-destructive">
                          <Heart className="h-5 w-5" />
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
                        <h3 className="font-display text-lg font-semibold text-foreground transition-colors hover:text-primary line-clamp-2">
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
        </div>
      </div>
    </Layout>
  );
}
