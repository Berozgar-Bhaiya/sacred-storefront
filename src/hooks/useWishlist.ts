import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export function useWishlist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wishlistItems = [], isLoading } = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("wishlists")
        .select("product_id")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data.map((item) => item.product_id);
    },
    enabled: !!user,
  });

  const addToWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Must be logged in");
      
      const { error } = await supabase
        .from("wishlists")
        .insert({ user_id: user.id, product_id: productId });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast({
        title: "Added to wishlist",
        description: "Product saved for later.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add to wishlist.",
      });
    },
  });

  const removeFromWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Must be logged in");
      
      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast({
        title: "Removed from wishlist",
        description: "Product removed from your wishlist.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove from wishlist.",
      });
    },
  });

  const toggleWishlist = (productId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to save products to your wishlist.",
      });
      return;
    }

    if (wishlistItems.includes(productId)) {
      removeFromWishlist.mutate(productId);
    } else {
      addToWishlist.mutate(productId);
    }
  };

  const isInWishlist = (productId: string) => wishlistItems.includes(productId);

  return {
    wishlistItems,
    isLoading,
    toggleWishlist,
    isInWishlist,
    addToWishlist: addToWishlist.mutate,
    removeFromWishlist: removeFromWishlist.mutate,
  };
}