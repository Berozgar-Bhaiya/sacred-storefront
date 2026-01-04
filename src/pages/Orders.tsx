import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight, MapPin, Phone, User, CalendarDays } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";

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
    <div className="py-4 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[280px]">
        {orderSteps.map((step, index) => {
          const config = statusConfig[step];
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full transition-all duration-500
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
                  <span className="[&>svg]:h-4 [&>svg]:w-4 md:[&>svg]:h-5 md:[&>svg]:w-5">
                    {config.icon}
                  </span>
                </div>
                <span className={`mt-2 text-[10px] md:text-xs font-medium capitalize ${isCompleted ? config.color : "text-muted-foreground"}`}>
                  {step}
                </span>
              </div>
              {index < orderSteps.length - 1 && (
                <div className="mx-1 md:mx-2 h-0.5 flex-1">
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
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("orders")
        .update({ order_status: "cancelled" })
        .eq("id", orderId)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", user?.id] });
      toast.success("Order cancelled successfully");
      setCancelOrderId(null);
      setIsDetailsOpen(false);
    },
    onError: () => {
      toast.error("Failed to cancel order");
    },
  });
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
      <div className="container py-6 md:py-12">
        <h1 className="mb-6 md:mb-8 font-display text-2xl font-bold text-foreground md:text-4xl">
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
                  className="rounded-xl md:rounded-2xl border border-border bg-card p-4 md:p-6 cursor-pointer hover:shadow-lg transition-all duration-300 animate-fade-in group"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => viewOrderDetails(order)}
                >
                  {/* Status Banner */}
                  <div className={`-mx-4 md:-mx-6 -mt-4 md:-mt-6 mb-4 px-4 md:px-6 py-2 md:py-3 ${config.bgColor} rounded-t-xl md:rounded-t-2xl`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        <div className={`${config.color} flex-shrink-0`}>
                          {config.icon}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-semibold text-sm md:text-base ${config.color}`}>{config.message}</p>
                          <p className="text-xs md:text-sm text-muted-foreground truncate">{config.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Order ID: <span className="font-semibold text-foreground">{order.id.slice(0, 8).toUpperCase()}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Placed on {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      {order.estimated_delivery_date && order.order_status !== "delivered" && order.order_status !== "cancelled" && (
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Expected by {format(new Date(order.estimated_delivery_date), "dd MMM yyyy")}
                        </p>
                      )}
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

              {/* Estimated Delivery Date */}
              {selectedOrder.estimated_delivery_date && selectedOrder.order_status !== "delivered" && selectedOrder.order_status !== "cancelled" && (
                <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
                      <CalendarDays className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        {format(new Date(selectedOrder.estimated_delivery_date), "EEEE, dd MMMM yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

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

                {/* Cancel Order Button - Show for pending, confirmed, and shipped orders */}
                {["pending", "confirmed", "shipped"].includes(selectedOrder.order_status) && (
                  <Button
                    variant="destructive"
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCancelOrderId(selectedOrder.id);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Order Confirmation */}
      <AlertDialog open={!!cancelOrderId} onOpenChange={() => setCancelOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelOrderId && cancelOrderMutation.mutate(cancelOrderId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelOrderMutation.isPending ? "Cancelling..." : "Yes, Cancel Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}