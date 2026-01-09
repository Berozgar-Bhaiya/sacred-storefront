import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Package, MapPin, ArrowRight, Clock, CreditCard, ShoppingBag, CalendarDays, Phone, User } from "lucide-react";
import { format } from "date-fns";

export default function OrderConfirmation() {
  const { orderId } = useParams();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", orderId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="mx-auto max-w-2xl space-y-6">
            <Skeleton className="h-24 w-24 rounded-full mx-auto" />
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Order not found</h1>
          <Link to="/orders">
            <Button variant="outline" className="mt-4">
              View All Orders
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const shippingAddress = order.shipping_address as {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };

  // Calculate estimated delivery (5-7 days from order date)
  const orderDate = new Date(order.created_at);
  const estimatedDelivery = new Date(orderDate);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
  const estimatedDeliveryEnd = new Date(orderDate);
  estimatedDeliveryEnd.setDate(estimatedDeliveryEnd.getDate() + 7);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const totalItems = order.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="mx-auto max-w-3xl">
          {/* Success Header */}
          <div className="text-center animate-fade-in">
            <div className="mx-auto mb-6 flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-10 w-10 md:h-14 md:w-14 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Order Placed Successfully!
            </h1>
            <p className="mt-2 text-muted-foreground">
              Thank you for your order. We'll notify you when it ships.
            </p>
          </div>

          {/* Order ID & Date Card */}
          <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="text-xl md:text-2xl font-bold text-primary tracking-wide">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-sm text-muted-foreground">Placed on</p>
                <p className="font-medium text-foreground">
                  {format(orderDate, "dd MMMM yyyy")} at {format(orderDate, "hh:mm a")}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <ShoppingBag className="h-5 w-5 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{totalItems}</p>
              <p className="text-xs text-muted-foreground">Items</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <CreditCard className="h-5 w-5 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-primary">₹{Number(order.total_amount).toLocaleString("en-IN")}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <Clock className="h-5 w-5 mx-auto text-primary mb-2" />
              <p className="text-lg font-bold text-foreground capitalize">{order.order_status.replace("_", " ")}</p>
              <p className="text-xs text-muted-foreground">Status</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <CalendarDays className="h-5 w-5 mx-auto text-primary mb-2" />
              <p className="text-lg font-bold text-foreground">{formatDate(estimatedDelivery)}</p>
              <p className="text-xs text-muted-foreground">Est. Delivery</p>
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="mt-6 grid gap-6 md:grid-cols-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            {/* Delivery Address */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">Delivery Address</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 font-medium text-foreground">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {shippingAddress.fullName}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  +91 {shippingAddress.phone}
                </p>
                <p className="text-muted-foreground pl-6">
                  {shippingAddress.address}<br />
                  {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
                </p>
              </div>
            </div>

            {/* Estimated Delivery */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">Estimated Delivery</h3>
              </div>
              <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                  {formatDate(estimatedDelivery)} - {formatDate(estimatedDeliveryEnd)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Delivered to your doorstep
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium text-foreground">Cash on Delivery</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Payment Status</span>
                <span className="inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:text-yellow-400">
                  Pay on Delivery
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mt-6 rounded-2xl border border-border bg-card p-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <h3 className="font-display text-lg font-semibold mb-4">Order Items ({totalItems})</h3>
            <div className="space-y-4">
              {order.order_items?.map((item: any, index: number) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{Number(item.price).toLocaleString("en-IN")} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-foreground">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Total */}
            <div className="mt-4 pt-4 border-t-2 border-dashed border-border">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-foreground">Amount Payable</span>
                <span className="text-2xl font-bold text-primary">
                  ₹{Number(order.total_amount).toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-right">
                To be paid on delivery
              </p>
            </div>
          </div>

          {/* What's Next */}
          <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-6 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <h3 className="font-display text-lg font-semibold mb-3">What happens next?</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</div>
                <p className="text-muted-foreground">We'll confirm your order and prepare it for shipping</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">2</div>
                <p className="text-muted-foreground">You'll receive tracking updates via notifications</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">3</div>
                <p className="text-muted-foreground">Pay cash when your order is delivered</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <Link to="/orders" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                <Package className="mr-2 h-5 w-5" />
                Track Order
              </Button>
            </Link>
            <Link to="/products" className="flex-1">
              <Button variant="saffron" size="lg" className="w-full">
                Continue Shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
