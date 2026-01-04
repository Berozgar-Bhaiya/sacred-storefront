import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Banknote } from "lucide-react";
import { z } from "zod";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

const addressSchema = z.object({
  fullName: z.string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters")
    .regex(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces"),
  phone: z.string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  address: z.string()
    .trim()
    .min(10, "Address must be at least 10 characters")
    .max(500, "Address must be less than 500 characters"),
  city: z.string()
    .trim()
    .min(2, "City must be at least 2 characters")
    .max(50, "City must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "City can only contain letters"),
  state: z.string()
    .min(1, "Please select a state"),
  pincode: z.string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode"),
});

export default function Checkout() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const totalPrice = getTotalPrice();
  const deliveryCharge = 0; // Free delivery
  const finalTotal = totalPrice;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    // Input restrictions based on field type
    if (name === "phone") {
      // Only allow digits, max 10
      sanitizedValue = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "pincode") {
      // Only allow digits, max 6
      sanitizedValue = value.replace(/\D/g, "").slice(0, 6);
    } else if (name === "fullName" || name === "city" || name === "state") {
      // Only allow letters and spaces
      sanitizedValue = value.replace(/[^a-zA-Z\s]/g, "");
    }

    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Please sign in",
        description: "You need to be signed in to place an order.",
      });
      navigate("/auth");
      return;
    }

    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Cart is empty",
        description: "Please add items to your cart before checkout.",
      });
      return;
    }

    // Validate form
    const result = addressSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: finalTotal,
          payment_status: "pending",
          order_status: "pending",
          shipping_address: formData,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // COD order - payment will be collected on delivery
      // Update order status to confirmed
      await supabase
        .from("orders")
        .update({ 
          order_status: "confirmed" 
        })
        .eq("id", order.id);

      clearCart();
      
      toast({
        title: "Order placed successfully!",
        description: `Order ID: ${order.id.slice(0, 8).toUpperCase()}`,
      });

      navigate(`/order-confirmation/${order.id}`);
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        variant: "destructive",
        title: "Order failed",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <h1 className="mb-8 font-display text-3xl font-bold text-foreground md:text-4xl">
          Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Address Form */}
            <div className="space-y-6 lg:col-span-2">
              {/* Delivery Address */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                  Delivery Address
                </h2>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number * <span className="text-xs text-muted-foreground">(10 digits)</span></Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">+91</span>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="9876543210"
                        maxLength={10}
                        className="pl-12"
                      />
                    </div>
                    {formData.phone && formData.phone.length < 10 && (
                      <p className="text-xs text-muted-foreground">{formData.phone.length}/10 digits</p>
                    )}
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">Complete Address *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="House/Flat No, Building, Street, Landmark"
                      rows={3}
                    />
                    {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter city name"
                      maxLength={50}
                    />
                    {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) => {
                        setFormData((prev) => ({ ...prev, state: value }));
                        if (errors.state) {
                          setErrors((prev) => ({ ...prev, state: "" }));
                        }
                      }}
                    >
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue placeholder="Select your state" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border shadow-lg z-50 max-h-60">
                        {INDIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode * <span className="text-xs text-muted-foreground">(6 digits)</span></Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      type="tel"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="Enter 6-digit pincode"
                      maxLength={6}
                    />
                    {formData.pincode && formData.pincode.length < 6 && (
                      <p className="text-xs text-muted-foreground">{formData.pincode.length}/6 digits</p>
                    )}
                    {errors.pincode && <p className="text-sm text-destructive">{errors.pincode}</p>}
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-primary/5 p-4">
                  <p className="text-sm text-muted-foreground">
                    🇮🇳 We currently deliver only within India. International shipping coming soon!
                  </p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                  Payment Method
                </h2>

                <div className="flex items-center gap-3 rounded-lg border-2 border-primary bg-primary/5 p-4">
                  <Banknote className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Order Summary
                </h2>

                {/* Items */}
                <div className="mt-4 max-h-60 space-y-3 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium text-primary">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-3 border-t border-border pt-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery</span>
                    <span className="flex items-center gap-2">
                      <span className="line-through text-muted-foreground/60">₹49</span>
                      <span className="text-green-600 dark:text-green-400 font-semibold">FREE</span>
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-foreground pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">₹{finalTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="saffron"
                  size="xl"
                  className="mt-6 w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Place Order - ₹${finalTotal.toLocaleString("en-IN")}`
                  )}
                </Button>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  By placing this order, you agree to our Terms & Conditions
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
