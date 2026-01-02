import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-5 w-5 text-yellow-500" />,
  confirmed: <CheckCircle className="h-5 w-5 text-blue-500" />,
  shipped: <Truck className="h-5 w-5 text-purple-500" />,
  delivered: <CheckCircle className="h-5 w-5 text-green-500" />,
  cancelled: <XCircle className="h-5 w-5 text-red-500" />,
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function Orders() {
  const { user, loading: authLoading } = useAuth();

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
          <div className="flex flex-col items-center justify-center py-20">
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
            {orders?.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      {statusIcons[order.order_status]}
                      <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColors[order.order_status]}`}>
                        {order.order_status}
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-sm text-muted-foreground">
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
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
