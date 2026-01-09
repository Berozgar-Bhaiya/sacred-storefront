import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Upload, X, Loader2, Package } from "lucide-react";
import { validateProductForm } from "@/lib/validations/admin";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: string | null;
  stock_status: string;
  image_urls: string[] | null;
  slug: string | null;
  meesho_link: string | null;
  featured: boolean | null;
  returnable: boolean;
};

type Category = {
  id: string;
  name: string;
};

const initialFormData = {
  name: "",
  description: "",
  price: "",
  original_price: "",
  category_id: "",
  stock_status: "in_stock",
  meesho_link: "",
  featured: false,
  returnable: true,
};

export default function AdminProducts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("id, name");
      if (error) throw error;
      return data as Category[];
    },
  });

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);
      urls.push(urlData.publicUrl);
    }
    return urls;
  };

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      setIsUploading(true);
      let imageUrls: string[] = [...existingImages];
      if (imageFiles.length > 0) {
        const uploadedUrls = await uploadImages(imageFiles);
        imageUrls = [...imageUrls, ...uploadedUrls];
      }

      const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const { error } = await supabase.from("products").insert([{
        name: data.name,
        description: data.description || null,
        price: parseFloat(data.price),
        original_price: data.original_price ? parseFloat(data.original_price) : null,
        category_id: data.category_id || null,
        stock_status: data.stock_status as "in_stock" | "out_of_stock",
        meesho_link: data.meesho_link || null,
        featured: data.featured,
        returnable: data.returnable,
        image_urls: imageUrls,
        slug,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Product created successfully" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
    onSettled: () => setIsUploading(false),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!editingProduct) return;
      setIsUploading(true);
      let imageUrls: string[] = [...existingImages];
      if (imageFiles.length > 0) {
        const uploadedUrls = await uploadImages(imageFiles);
        imageUrls = [...imageUrls, ...uploadedUrls];
      }

      const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const { error } = await supabase
        .from("products")
        .update({
          name: data.name,
          description: data.description || null,
          price: parseFloat(data.price),
          original_price: data.original_price ? parseFloat(data.original_price) : null,
          category_id: data.category_id || null,
          stock_status: data.stock_status as "in_stock" | "out_of_stock",
          meesho_link: data.meesho_link || null,
          featured: data.featured,
          returnable: data.returnable,
          image_urls: imageUrls,
          slug,
        })
        .eq("id", editingProduct.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Product updated successfully" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
    onSettled: () => setIsUploading(false),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Product deleted successfully" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingProduct(null);
    setImageFiles([]);
    setExistingImages([]);
    setFormErrors({});
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      original_price: product.original_price ? String(product.original_price) : "",
      category_id: product.category_id || "",
      stock_status: product.stock_status,
      meesho_link: product.meesho_link || "",
      featured: product.featured || false,
      returnable: product.returnable,
    });
    setExistingImages(product.image_urls || []);
    setImageFiles([]);
    setIsDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setImageFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = validateProductForm(formData);
    if (!validation.success) {
      setFormErrors(validation.errors || {});
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors in the form.",
      });
      return;
    }
    
    setFormErrors({});
    
    if (editingProduct) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <>
      <div className="mb-6 md:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Products</h1>
          <p className="mt-1 text-sm md:text-base text-muted-foreground">Manage your product catalog</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button variant="saffron" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={formErrors.name ? "border-destructive" : ""}
                  />
                  {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_price">Original Price / MRP (₹)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    placeholder="e.g. 999 (will be shown as struck off)"
                  />
                  <p className="text-xs text-muted-foreground">This price will be displayed with a strikethrough</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Selling Price / Discounted (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 599 (actual selling price)"
                    required
                    className={formErrors.price ? "border-destructive" : ""}
                  />
                  {formErrors.price && <p className="text-sm text-destructive">{formErrors.price}</p>}
                  <p className="text-xs text-muted-foreground">This is the price customers will pay</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock_status">Stock Status</Label>
                  <Select
                    value={formData.stock_status}
                    onValueChange={(value) => setFormData({ ...formData, stock_status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_stock">In Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      <SelectItem value="low_stock">Low Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="meesho_link">Meesho Supplier Link</Label>
                  <Input
                    id="meesho_link"
                    type="url"
                    value={formData.meesho_link}
                    onChange={(e) => setFormData({ ...formData, meesho_link: e.target.value })}
                    placeholder="https://meesho.com/..."
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label>Product Images</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {existingImages.map((url, idx) => (
                      <div key={`existing-${idx}`} className="relative h-20 w-20">
                        <img src={url} alt="" className="h-full w-full object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx, true)}
                          className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {imageFiles.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative h-20 w-20">
                        <img
                          src={URL.createObjectURL(file)}
                          alt=""
                          className="h-full w-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx, false)}
                          className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 hover:bg-muted/50">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload images</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2 sm:col-span-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="featured">Featured Product</Label>
                </div>

                <div className="flex items-center gap-2 sm:col-span-2">
                  <input
                    type="checkbox"
                    id="returnable"
                    checked={formData.returnable}
                    onChange={(e) => setFormData({ ...formData, returnable: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="returnable">Returnable Product</Label>
                  <span className="text-xs text-muted-foreground">(Allow customers to return this product)</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" variant="saffron" disabled={isUploading}>
                  {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingProduct ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : products?.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No products yet</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="h-12 w-12 overflow-hidden rounded-lg bg-muted">
                        {product.image_urls?.[0] ? (
                          <img src={product.image_urls[0]} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.categories?.name || "-"}</TableCell>
                    <TableCell>₹{Number(product.price).toLocaleString("en-IN")}</TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          product.stock_status === "in_stock"
                            ? "bg-green-100 text-green-800"
                            : product.stock_status === "low_stock"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.stock_status.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteMutation.mutate(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
    </>
  );
}
