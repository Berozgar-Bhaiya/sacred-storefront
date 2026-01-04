import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Tag, Save } from "lucide-react";

interface CouponSettings {
  enabled: boolean;
  code: string;
  discount_text: string;
}

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [couponSettings, setCouponSettings] = useState<CouponSettings>({
    enabled: false,
    code: "",
    discount_text: "",
  });

  const { data: settings, isLoading } = useQuery({
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

  useEffect(() => {
    if (settings?.value) {
      const value = settings.value as unknown as CouponSettings;
      setCouponSettings({
        enabled: value.enabled || false,
        code: value.code || "",
        discount_text: value.discount_text || "",
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (newSettings: CouponSettings) => {
      const { error } = await supabase
        .from("site_settings")
        .update({ value: newSettings as unknown as Record<string, never> })
        .eq("key", "coupon");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast({
        title: "Settings saved!",
        description: "Coupon settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleSave = () => {
    updateMutation.mutate(couponSettings);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Settings</h1>
        <p className="text-muted-foreground">Manage your website settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Coupon Code Banner
          </CardTitle>
          <CardDescription>
            Configure the promotional coupon code displayed on the website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="coupon-enabled" className="text-base font-medium">
                Enable Coupon Banner
              </Label>
              <p className="text-sm text-muted-foreground">
                Show the coupon code banner on the main website
              </p>
            </div>
            <Switch
              id="coupon-enabled"
              checked={couponSettings.enabled}
              onCheckedChange={(checked) =>
                setCouponSettings((prev) => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coupon-code">Coupon Code</Label>
            <Input
              id="coupon-code"
              placeholder="e.g. PUJA10"
              value={couponSettings.code}
              onChange={(e) =>
                setCouponSettings((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
              }
            />
            <p className="text-xs text-muted-foreground">
              The coupon code that customers will use at checkout
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount-text">Promotional Text</Label>
            <Input
              id="discount-text"
              placeholder="e.g. Get 10% OFF on your first order!"
              value={couponSettings.discount_text}
              onChange={(e) =>
                setCouponSettings((prev) => ({ ...prev, discount_text: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              The message displayed alongside the coupon code
            </p>
          </div>

          <div className="pt-4">
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Settings
            </Button>
          </div>

          {couponSettings.enabled && couponSettings.code && (
            <div className="mt-6 rounded-lg border border-dashed border-primary/50 bg-primary/5 p-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">Preview:</p>
              <div className="bg-gradient-to-r from-primary to-saffron text-primary-foreground px-4 py-2 rounded-lg text-center">
                <span>{couponSettings.discount_text} Use code: </span>
                <span className="font-bold">{couponSettings.code}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
