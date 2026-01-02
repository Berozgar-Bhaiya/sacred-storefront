import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Package, MapPin, ArrowRight } from "lucide-react";

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

  return (
    <Layout>
      <div className="container py-12">
        <div className="mx-auto max-w-2xl">
          {/* Success Icon */}
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-14 w-14 text-green-600" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Order Placed Successfully!
            </h1>
            <p className="mt-2 text-muted-foreground">
              Thank you for your order. We'll send you a confirmation email shortly.
            </p>
          </div>

          {/* Order ID */}
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="mt-1 font-mono text-lg font-bold text-primary">
              {order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          {/* Order Details */}
          <div className="mt-6 space-y-6">
            {/* Estimated Delivery */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium">Estimated Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(estimatedDelivery)} - {formatDate(estimatedDeliveryEnd)}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium">Delivery Address</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {shippingAddress.fullName}<br />
                    {shippingAddress.address}<br />
                    {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}<br />
                    Phone: {shippingAddress.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.product_name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-medium">Total (COD)</span>
                  <span className="font-bold text-primary">
                    ₹{Number(order.total_amount).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">Cash on Delivery</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-muted-foreground">Payment Status</span>
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                  {order.payment_status === "pending" ? "Pay on Delivery" : order.payment_status}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/orders" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                View All Orders
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
