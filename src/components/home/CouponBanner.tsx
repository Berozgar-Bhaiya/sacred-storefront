import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tag, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface CouponSettings {
  enabled: boolean;
  code: string;
  discount_text: string;
}

export function CouponBanner() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const { data: settings } = useQuery({
    queryKey: ["site-settings", "coupon"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "coupon")
        .single();
      if (error) throw error;
      return data;
    },
  });

  const coupon = settings?.value as unknown as CouponSettings | undefined;

  if (!coupon?.enabled || !coupon?.code) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      toast({
        title: "Copied!",
        description: `Coupon code "${coupon.code}" copied to clipboard.`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please copy the code manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary via-saffron to-primary text-primary-foreground">
      <div className="container py-2.5">
        <div className="flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-3">
          <Tag className="h-4 w-4 animate-pulse" />
          <span className="text-sm font-medium">
            {coupon.discount_text}
          </span>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-full bg-background/20 px-3 py-1 text-sm font-bold backdrop-blur-sm transition-all hover:bg-background/30"
          >
            <span>{coupon.code}</span>
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
