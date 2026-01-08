import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PRODUCTS_PER_PAGE = 12;

interface UseInfiniteProductsParams {
  selectedCategory: string | null;
  priceRange: number[];
  searchQuery: string;
  sortBy: string;
  categories: any[] | undefined;
}

export function useInfiniteProducts({
  selectedCategory,
  priceRange,
  searchQuery,
  sortBy,
  categories,
}: UseInfiniteProductsParams) {
  return useInfiniteQuery({
    queryKey: ["infinite-products", selectedCategory, priceRange, searchQuery, sortBy],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PRODUCTS_PER_PAGE;
      const to = from + PRODUCTS_PER_PAGE - 1;

      let query = supabase
        .from("products")
        .select("*, categories(name, slug)", { count: "exact" })
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

      const { data, error, count } = await query.range(from, to);
      if (error) throw error;

      return {
        products: data,
        totalCount: count || 0,
        nextPage: data.length === PRODUCTS_PER_PAGE ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: !!categories,
  });
}

export { PRODUCTS_PER_PAGE };
