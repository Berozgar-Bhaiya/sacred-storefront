import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Package,
  IndianRupee,
  Clock,
  ArrowUpRight,
} from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOverview() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [ordersRes, productsRes] = await Promise.all([
        supabase.from("orders").select("id, total_amount, order_status"),
        supabase.from("products").select("id", { count: "exact" }),
      ]);

      const orders = ordersRes.data || [];
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
      const pendingOrders = orders.filter((o) => o.order_status === "pending").length;

      return {
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        totalProducts: productsRes.count || 0,
      };
    },
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, total_amount, order_status, created_at, shipping_address")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm md:text-base text-muted-foreground">
          Welcome back! Here's what's happening with your store.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 md:mb-8 grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="border-border/50">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-muted-foreground">Total Revenue</p>
                    <p className="mt-1 text-lg md:text-2xl font-bold text-foreground truncate">
                      ₹{stats?.totalRevenue.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <IndianRupee className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-muted-foreground">Total Orders</p>
                    <p className="mt-1 text-lg md:text-2xl font-bold text-foreground">
                      {stats?.totalOrders}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <ShoppingBag className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-muted-foreground">Pending Orders</p>
                    <p className="mt-1 text-lg md:text-2xl font-bold text-foreground">
                      {stats?.pendingOrders}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100">
                    <Clock className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-muted-foreground">Products</p>
                    <p className="mt-1 text-lg md:text-2xl font-bold text-foreground">
                      {stats?.totalProducts}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
                    <Package className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Orders */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-display text-xl">Recent Orders</CardTitle>
            <CardDescription>Latest orders from your store</CardDescription>
          </div>
          <Link to="/admin/orders">
            <Button variant="outline" size="sm">
              View All
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentOrders?.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No orders yet</p>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {recentOrders?.map((order) => {
                const address = order.shipping_address as { fullName?: string } | null;
                return (
                  <div
                    key={order.id}
                    className="flex flex-col gap-3 rounded-lg border border-border p-3 md:p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="flex h-8 w-8 md:h-10 md:w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                        <Clock className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm md:text-base text-foreground">
                          {order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">
                          {address?.fullName || "Customer"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 md:gap-4 ml-11 md:ml-0">
                      <p className="font-semibold text-sm md:text-base text-foreground">
                        ₹{Number(order.total_amount).toLocaleString("en-IN")}
                      </p>
                      <span
                        className={`rounded-full px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium capitalize ${
                          statusColors[order.order_status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.order_status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
