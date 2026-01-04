import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Eye, Download, CheckCircle, XCircle, Truck, Package, Clock, CalendarIcon } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  refunded: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  confirmed: <CheckCircle className="h-4 w-4" />,
  shipped: <Truck className="h-4 w-4" />,
  delivered: <Package className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      const statusMessages: Record<string, string> = {
        confirmed: "Order confirmed and processing",
        shipped: "Order marked as shipped",
        delivered: "Order marked as delivered",
        cancelled: "Order has been cancelled",
        pending: "Order set to pending",
      };
      toast({ title: statusMessages[variables.status] || "Order status updated" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const updateDeliveryDateMutation = useMutation({
    mutationFn: async ({ id, date }: { id: string; date: Date | null }) => {
      const { error } = await supabase
        .from("orders")
        .update({ estimated_delivery_date: date ? format(date, "yyyy-MM-dd") : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({ title: "Estimated delivery date updated" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const handleQuickAction = (orderId: string, action: "confirm" | "cancel" | "ship") => {
    const statusMap = {
      confirm: "confirmed" as const,
      cancel: "cancelled" as const,
      ship: "shipped" as const,
    };
    updateStatusMutation.mutate({ id: orderId, status: statusMap[action] });
  };

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
      <div className="mb-6 md:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Orders</h1>
          <p className="mt-1 text-sm md:text-base text-muted-foreground">Manage customer orders</p>
        </div>
        <Button variant="outline" onClick={exportToCSV} className="w-full sm:w-auto">
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
                    <TableHead>Est. Delivery</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.map((order) => (
                    <TableRow key={order.id} className="group">
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
                            <div className="flex items-center gap-2">
                              {statusIcons[order.order_status]}
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-500" /> Pending
                              </div>
                            </SelectItem>
                            <SelectItem value="confirmed">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-500" /> Confirmed
                              </div>
                            </SelectItem>
                            <SelectItem value="shipped">
                              <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4 text-purple-500" /> Shipped
                              </div>
                            </SelectItem>
                            <SelectItem value="delivered">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-green-500" /> Delivered
                              </div>
                            </SelectItem>
                            <SelectItem value="cancelled">
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-500" /> Cancelled
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                "w-32 justify-start text-left font-normal",
                                !order.estimated_delivery_date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {order.estimated_delivery_date
                                ? format(new Date(order.estimated_delivery_date), "dd MMM")
                                : "Set date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={order.estimated_delivery_date ? new Date(order.estimated_delivery_date) : undefined}
                              onSelect={(date) => updateDeliveryDateMutation.mutate({ id: order.id, date: date || null })}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Actions */}
                          {order.order_status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                                onClick={() => handleQuickAction(order.id, "confirm")}
                                disabled={updateStatusMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirm
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => handleQuickAction(order.id, "cancel")}
                                disabled={updateStatusMutation.isPending}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </>
                          )}
                          {order.order_status === "confirmed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                              onClick={() => handleQuickAction(order.id, "ship")}
                              disabled={updateStatusMutation.isPending}
                            >
                              <Truck className="h-4 w-4 mr-1" />
                              Ship
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => viewOrderDetails(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
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
            <DialogTitle className="flex items-center gap-2">
              Order #{selectedOrder?.id.slice(0, 8).toUpperCase()}
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[selectedOrder?.order_status]}`}>
                {selectedOrder?.order_status}
              </span>
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 animate-fade-in">
              {/* Customer Info */}
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {selectedOrder.shipping_address?.fullName?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                  Customer Details
                </h4>
                <div className="text-sm space-y-2 ml-10">
                  <p><span className="text-muted-foreground">Name:</span> <span className="font-medium">{selectedOrder.shipping_address?.fullName}</span></p>
                  <p><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{selectedOrder.shipping_address?.phone}</span></p>
                  <p><span className="text-muted-foreground">Email:</span> <span className="font-medium">{selectedOrder.shipping_address?.email || "N/A"}</span></p>
                  <p className="text-muted-foreground">
                    <span>Address:</span>{" "}
                    <span className="text-foreground">
                      {selectedOrder.shipping_address?.address}, {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pincode}
                    </span>
                  </p>
                </div>
              </div>

              {/* Estimated Delivery Date */}
              <div className="rounded-lg border border-border p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Estimated Delivery Date
                </h4>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedOrder.estimated_delivery_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedOrder.estimated_delivery_date
                        ? format(new Date(selectedOrder.estimated_delivery_date), "PPP")
                        : "Select estimated delivery date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedOrder.estimated_delivery_date ? new Date(selectedOrder.estimated_delivery_date) : undefined}
                      onSelect={(date) => {
                        updateDeliveryDateMutation.mutate({ id: selectedOrder.id, date: date || null });
                        setSelectedOrder({ ...selectedOrder, estimated_delivery_date: date ? format(date, "yyyy-MM-dd") : null });
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

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
                <div className="flex justify-between items-center mb-4">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">
                    ₹{Number(selectedOrder.total_amount).toLocaleString("en-IN")}
                  </span>
                </div>
                
                {/* Quick Actions in Modal */}
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.order_status === "pending" && (
                    <>
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          handleQuickAction(selectedOrder.id, "confirm");
                          setIsDetailsOpen(false);
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Order
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => {
                          handleQuickAction(selectedOrder.id, "cancel");
                          setIsDetailsOpen(false);
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Order
                      </Button>
                    </>
                  )}
                  {selectedOrder.order_status === "confirmed" && (
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => {
                        handleQuickAction(selectedOrder.id, "ship");
                        setIsDetailsOpen(false);
                      }}
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Mark as Shipped
                    </Button>
                  )}
                  {selectedOrder.order_status === "shipped" && (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        updateStatusMutation.mutate({ id: selectedOrder.id, status: "delivered" });
                        setIsDetailsOpen(false);
                      }}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Mark as Delivered
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}