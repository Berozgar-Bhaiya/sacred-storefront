import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Eye, Download } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default function AdminOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" }) => {
      const { error } = await supabase
        .from("orders")
        .update({ order_status: status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({ title: "Order status updated" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const exportToCSV = () => {
    if (!orders || orders.length === 0) {
      toast({ variant: "destructive", title: "No orders to export" });
      return;
    }

    const headers = [
      "Order ID",
      "Customer Name",
      "Phone",
      "Address",
      "City",
      "State",
      "Pincode",
      "Total Amount",
      "Payment Status",
      "Order Status",
      "Date",
      "Items",
    ];

    const rows = orders.map((order) => {
      const addr = order.shipping_address as any;
      return [
        order.id.slice(0, 8).toUpperCase(),
        addr?.fullName || "",
        addr?.phone || "",
        addr?.address || "",
        addr?.city || "",
        addr?.state || "",
        addr?.pincode || "",
        order.total_amount,
        order.payment_status,
        order.order_status,
        new Date(order.created_at).toLocaleDateString("en-IN"),
        order.order_items?.map((item) => `${item.product_name} x${item.quantity}`).join("; ") || "",
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({ title: "Orders exported successfully" });
  };

  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Orders</h1>
          <p className="mt-1 text-muted-foreground">Manage customer orders</p>
        </div>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>All Orders ({orders?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : orders?.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-medium">
                        {order.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{(order.shipping_address as any)?.fullName || "N/A"}</p>
                          <p className="text-sm text-muted-foreground">
                            {(order.shipping_address as any)?.phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{Number(order.total_amount).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${
                            paymentStatusColors[order.payment_status] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.payment_status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.order_status}
                          onValueChange={(value: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled") =>
                            updateStatusMutation.mutate({ id: order.id, status: value })
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => viewOrderDetails(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Order #{selectedOrder?.id.slice(0, 8).toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="font-medium mb-2">Customer Details</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Name:</strong> {selectedOrder.shipping_address?.fullName}</p>
                  <p><strong>Phone:</strong> {selectedOrder.shipping_address?.phone}</p>
                  <p>
                    <strong>Address:</strong> {selectedOrder.shipping_address?.address},{" "}
                    {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} -{" "}
                    {selectedOrder.shipping_address?.pincode}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-2">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-2 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount</span>
                  <span className="text-xl font-bold text-primary">
                    ₹{Number(selectedOrder.total_amount).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                      paymentStatusColors[selectedOrder.payment_status]
                    }`}
                  >
                    {selectedOrder.payment_status}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                      statusColors[selectedOrder.order_status]
                    }`}
                  >
                    {selectedOrder.order_status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
