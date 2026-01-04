import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight, MapPin, Phone, User } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const statusConfig: Record<string, { 
  icon: React.ReactNode; 
  color: string; 
  bgColor: string;
  message: string;
  description: string;
}> = {
  pending: {
    icon: <Clock className="h-5 w-5" />,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    message: "Order Processing",
    description: "Your order is being reviewed and will be approved shortly by the owner.",
  },
  confirmed: {
    icon: <CheckCircle className="h-5 w-5" />,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    message: "Order Confirmed",
    description: "Your order has been confirmed and is being prepared for shipping.",
  },
  shipped: {
    icon: <Truck className="h-5 w-5" />,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    message: "Order Shipped",
    description: "Your order is on its way! It will be delivered soon.",
  },
  delivered: {
    icon: <Package className="h-5 w-5" />,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    message: "Order Delivered",
    description: "Your order has been successfully delivered. Enjoy!",
  },
  cancelled: {
    icon: <XCircle className="h-5 w-5" />,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    message: "Order Cancelled",
    description: "This order has been cancelled.",
  },
};

const orderSteps = ["pending", "confirmed", "shipped", "delivered"];

function OrderTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = orderSteps.indexOf(currentStatus);
  const isCancelled = currentStatus === "cancelled";

  if (isCancelled) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 animate-fade-in">
          <XCircle className="h-6 w-6" />
          <span className="font-medium">Order Cancelled</span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        {orderSteps.map((step, index) => {
          const config = statusConfig[step];
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500
                    ${isCompleted 
                      ? `${config.bgColor} ${config.color}` 
                      : "bg-muted text-muted-foreground"
                    }
                    ${isCurrent ? "ring-2 ring-offset-2 ring-primary scale-110" : ""}
                  `}
                  style={{
                    animationDelay: `${index * 150}ms`,
                  }}
                >
                  {config.icon}
                </div>
                <span className={`mt-2 text-xs font-medium capitalize ${isCompleted ? config.color : "text-muted-foreground"}`}>
                  {step}
                </span>
              </div>
              {index < orderSteps.length - 1 && (
                <div className="mx-2 h-0.5 flex-1">
                  <div
                    className={`h-full transition-all duration-700 ${
                      index < currentIndex ? "bg-primary" : "bg-muted"
                    }`}
                    style={{
                      width: index < currentIndex ? "100%" : "0%",
                      transitionDelay: `${index * 200}ms`,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <h1 className="mb-8 font-display text-3xl font-bold text-foreground md:text-4xl">
          My Orders
        </h1>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        ) : orders?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">No orders yet</h2>
            <p className="mt-2 text-muted-foreground">Start shopping to see your orders here.</p>
            <Link to="/products">
              <Button variant="saffron" className="mt-6">Shop Now</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders?.map((order, index) => {
              const config = statusConfig[order.order_status];
              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-border bg-card p-6 cursor-pointer hover:shadow-lg transition-all duration-300 animate-fade-in group"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => viewOrderDetails(order)}
                >
                  {/* Status Banner */}
                  <div className={`-mx-6 -mt-6 mb-4 px-6 py-3 ${config.bgColor} rounded-t-2xl`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`${config.color}`}>
                          {config.icon}
                        </div>
                        <div>
                          <p className={`font-semibold ${config.color}`}>{config.message}</p>
                          <p className="text-sm text-muted-foreground">{config.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-mono text-sm text-muted-foreground">
                        Order ID: {order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Placed on {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        ₹{Number(order.total_amount).toLocaleString("en-IN")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.order_items?.length} items
                      </p>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                    {order.order_items?.slice(0, 3).map((item: any) => (
                      <div
                        key={item.id}
                        className="rounded-lg bg-muted px-3 py-1 text-sm"
                      >
                        {item.product_name} × {item.quantity}
                      </div>
                    ))}
                    {order.order_items?.length > 3 && (
                      <div className="rounded-lg bg-muted px-3 py-1 text-sm text-muted-foreground">
                        +{order.order_items.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Order #{selectedOrder?.id.slice(0, 8).toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 animate-fade-in">
              {/* Order Timeline */}
              <OrderTimeline currentStatus={selectedOrder.order_status} />

              {/* Status Message */}
              <div className={`rounded-xl p-4 ${statusConfig[selectedOrder.order_status].bgColor}`}>
                <div className="flex items-start gap-3">
                  <div className={statusConfig[selectedOrder.order_status].color}>
                    {statusConfig[selectedOrder.order_status].icon}
                  </div>
                  <div>
                    <p className={`font-semibold ${statusConfig[selectedOrder.order_status].color}`}>
                      {statusConfig[selectedOrder.order_status].message}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {statusConfig[selectedOrder.order_status].description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <div className="rounded-xl border border-border p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Delivery Address
                  </h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="text-foreground font-medium">{selectedOrder.shipping_address.fullName}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {selectedOrder.shipping_address.phone}
                    </p>
                    <p className="ml-6">
                      {selectedOrder.shipping_address.address}, {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}
                    </p>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-3">Order Items ({selectedOrder.order_items?.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedOrder.order_items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-3 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{Number(item.price).toLocaleString("en-IN")} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">
                    ₹{Number(selectedOrder.total_amount).toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Ordered on {new Date(selectedOrder.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}