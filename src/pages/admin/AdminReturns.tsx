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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Eye, RotateCcw, CheckCircle, XCircle, Clock, Package } from "lucide-react";

const returnStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const returnStatusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  approved: <CheckCircle className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
  completed: <Package className="h-4 w-4" />,
};

interface ReturnRequest {
  id: string;
  order_id: string;
  user_id: string;
  reason: string;
  status: string;
  created_at: string;
  updated_at: string;
  order?: {
    id: string;
    total_amount: number;
    shipping_address: any;
    order_items: any[];
    created_at: string;
  };
}

export default function AdminReturns() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: returnRequests, isLoading } = useQuery({
    queryKey: ["admin-returns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("return_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch order details for each return request
      const returnsWithOrders = await Promise.all(
        data.map(async (returnReq) => {
          const { data: orderData } = await supabase
            .from("orders")
            .select("*, order_items(*)")
            .eq("id", returnReq.order_id)
            .maybeSingle();
          return { ...returnReq, order: orderData };
        })
      );

      return returnsWithOrders as ReturnRequest[];
    },
  });

  const updateReturnStatusMutation = useMutation({
    mutationFn: async ({ id, status, orderId }: { id: string; status: string; orderId: string }) => {
      const { error } = await supabase
        .from("return_requests")
        .update({ status })
        .eq("id", id);
      if (error) throw error;

      // If approved, we might want to update the order status
      if (status === "approved" || status === "completed") {
        // Keep order status as return_requested or update as needed
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-returns"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      const statusMessages: Record<string, string> = {
        approved: "Return request approved",
        rejected: "Return request rejected",
        completed: "Return completed",
        pending: "Return set to pending",
      };
      toast({ title: statusMessages[variables.status] || "Return status updated" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const viewReturnDetails = (returnReq: ReturnRequest) => {
    setSelectedReturn(returnReq);
    setIsDetailsOpen(true);
  };

  const pendingCount = returnRequests?.filter(r => r.status === "pending").length || 0;

  return (
    <>
      <div className="mb-6 md:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <RotateCcw className="h-7 w-7 text-orange-500" />
            Return Requests
          </h1>
          <p className="mt-1 text-sm md:text-base text-muted-foreground">
            Manage customer return requests
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 text-sm px-3 py-1">
            {pendingCount} pending
          </Badge>
        )}
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>All Return Requests ({returnRequests?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : returnRequests?.length === 0 ? (
            <div className="text-center py-12">
              <RotateCcw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No return requests yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Return ID</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returnRequests?.map((returnReq) => (
                    <TableRow key={returnReq.id} className="group">
                      <TableCell className="font-semibold tracking-wide">
                        {returnReq.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {returnReq.order_id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {returnReq.order?.shipping_address?.fullName || "N/A"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {returnReq.order?.shipping_address?.phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{returnReq.reason}</span>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{Number(returnReq.order?.total_amount || 0).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={returnReq.status}
                          onValueChange={(value) =>
                            updateReturnStatusMutation.mutate({
                              id: returnReq.id,
                              status: value,
                              orderId: returnReq.order_id,
                            })
                          }
                        >
                          <SelectTrigger className="w-32">
                            <div className="flex items-center gap-2">
                              {returnStatusIcons[returnReq.status]}
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-500" /> Pending
                              </div>
                            </SelectItem>
                            <SelectItem value="approved">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" /> Approved
                              </div>
                            </SelectItem>
                            <SelectItem value="rejected">
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-500" /> Rejected
                              </div>
                            </SelectItem>
                            <SelectItem value="completed">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-blue-500" /> Completed
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(returnReq.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {returnReq.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                                onClick={() =>
                                  updateReturnStatusMutation.mutate({
                                    id: returnReq.id,
                                    status: "approved",
                                    orderId: returnReq.order_id,
                                  })
                                }
                                disabled={updateReturnStatusMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() =>
                                  updateReturnStatusMutation.mutate({
                                    id: returnReq.id,
                                    status: "rejected",
                                    orderId: returnReq.order_id,
                                  })
                                }
                                disabled={updateReturnStatusMutation.isPending}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => viewReturnDetails(returnReq)}>
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

      {/* Return Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Return #{selectedReturn?.id.slice(0, 8).toUpperCase()}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                  returnStatusColors[selectedReturn?.status || "pending"]
                }`}
              >
                {selectedReturn?.status}
              </span>
            </DialogTitle>
          </DialogHeader>
          {selectedReturn && (
            <div className="space-y-6 animate-fade-in">
              {/* Return Reason */}
              <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <RotateCcw className="h-4 w-4" />
                  Return Reason
                </h4>
                <p className="text-sm">{selectedReturn.reason}</p>
              </div>

              {/* Order Info */}
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="font-medium mb-3">Order Details</h4>
                <div className="text-sm space-y-2">
                  <p>
                    <span className="text-muted-foreground">Order ID:</span>{" "}
                    <span className="font-medium">{selectedReturn.order_id.slice(0, 8).toUpperCase()}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Order Date:</span>{" "}
                    <span className="font-medium">
                      {selectedReturn.order?.created_at
                        ? format(new Date(selectedReturn.order.created_at), "dd MMM yyyy")
                        : "N/A"}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Total Amount:</span>{" "}
                    <span className="font-bold text-primary">
                      ₹{Number(selectedReturn.order?.total_amount || 0).toLocaleString("en-IN")}
                    </span>
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="font-medium mb-3">Customer Details</h4>
                <div className="text-sm space-y-2">
                  <p>
                    <span className="text-muted-foreground">Name:</span>{" "}
                    <span className="font-medium">{selectedReturn.order?.shipping_address?.fullName}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Phone:</span>{" "}
                    <span className="font-medium">{selectedReturn.order?.shipping_address?.phone}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Address:</span>{" "}
                    <span className="font-medium">
                      {selectedReturn.order?.shipping_address?.address},{" "}
                      {selectedReturn.order?.shipping_address?.city},{" "}
                      {selectedReturn.order?.shipping_address?.state} -{" "}
                      {selectedReturn.order?.shipping_address?.pincode}
                    </span>
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-3">Order Items</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedReturn.order?.order_items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-2 px-3 rounded-lg bg-muted/30"
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

              {/* Action Buttons */}
              {selectedReturn.status === "pending" && (
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      updateReturnStatusMutation.mutate({
                        id: selectedReturn.id,
                        status: "approved",
                        orderId: selectedReturn.order_id,
                      });
                      setIsDetailsOpen(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Return
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      updateReturnStatusMutation.mutate({
                        id: selectedReturn.id,
                        status: "rejected",
                        orderId: selectedReturn.order_id,
                      });
                      setIsDetailsOpen(false);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Return
                  </Button>
                </div>
              )}

              {/* Request Date */}
              <p className="text-xs text-muted-foreground text-center">
                Return requested on{" "}
                {format(new Date(selectedReturn.created_at), "dd MMM yyyy 'at' hh:mm a")}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
