import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAppContext } from "@/context/app-context";
import type { Product, InsertProduct, Category } from "@shared/schema";

export default function ProductsManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productData, setProductData] = useState<Partial<InsertProduct>>({});
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { products, categories } = useAppContext();

  const createProductMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product created successfully" });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create product", description: error.message, variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product updated successfully" });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update product", description: error.message, variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/products/${id}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete product", description: error.message, variant: "destructive" });
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setProductData({});
    setSelectedFiles(null);
    setIsCreateOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setProductData(product);
    setSelectedFiles(null);
    setIsCreateOpen(true);
  };

  const handleCloseDialog = () => {
    setIsCreateOpen(false);
    setEditingProduct(null);
    setProductData({});
    setSelectedFiles(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("productData", JSON.stringify(productData));
    
    if (selectedFiles) {
      Array.from(selectedFiles).forEach(file => {
        formData.append("images", file);
      });
    }

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, formData });
    } else {
      createProductMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const isLoading = createProductMutation.isPending || updateProductMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold mb-2">Product Management</h2>
          <p className="text-muted-foreground">Manage your pet shop inventory</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate} data-testid="button-add-product">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto forest-card">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Create New Product"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product-name">Name *</Label>
                  <Input
                    id="product-name"
                    type="text"
                    value={productData.name || ""}
                    onChange={(e) => setProductData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    disabled={isLoading}
                    data-testid="input-product-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="product-category">Category *</Label>
                  <Select 
                    value={productData.categoryId || ""} 
                    onValueChange={(value) => setProductData(prev => ({ ...prev, categoryId: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger data-testid="select-product-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="product-type">Type *</Label>
                  <Select 
                    value={productData.type || ""} 
                    onValueChange={(value: "pet" | "food" | "accessory") => setProductData(prev => ({ ...prev, type: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger data-testid="select-product-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pet">Pet</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="accessory">Accessory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="product-species">Species</Label>
                  <Input
                    id="product-species"
                    type="text"
                    placeholder="e.g., Dog, Cat, Fish"
                    value={productData.species || ""}
                    onChange={(e) => setProductData(prev => ({ ...prev, species: e.target.value }))}
                    disabled={isLoading}
                    data-testid="input-product-species"
                  />
                </div>
                
                <div>
                  <Label htmlFor="product-price">Price (INR) *</Label>
                  <Input
                    id="product-price"
                    type="number"
                    min="1"
                    step="1"
                    value={productData.priceInINR || ""}
                    onChange={(e) => setProductData(prev => ({ ...prev, priceInINR: parseInt(e.target.value) }))}
                    required
                    disabled={isLoading}
                    data-testid="input-product-price"
                  />
                </div>
                
                <div>
                  <Label htmlFor="product-stock">Stock *</Label>
                  <Input
                    id="product-stock"
                    type="number"
                    min="0"
                    value={productData.stock || ""}
                    onChange={(e) => setProductData(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                    required
                    disabled={isLoading}
                    data-testid="input-product-stock"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="product-description">Description *</Label>
                <Textarea
                  id="product-description"
                  value={productData.description || ""}
                  onChange={(e) => setProductData(prev => ({ ...prev, description: e.target.value }))}
                  required
                  disabled={isLoading}
                  className="h-20"
                  data-testid="input-product-description"
                />
              </div>
              
              <div>
                <Label htmlFor="product-images">Images</Label>
                <Input
                  id="product-images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  disabled={isLoading}
                  data-testid="input-product-images"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Select up to 5 images. Leave empty to keep existing images when editing.
                </p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} data-testid="button-save-product">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingProduct ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    editingProduct ? "Update Product" : "Create Product"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.map((product) => (
          <Card key={product.id} className="forest-card">
            <CardHeader className="pb-3">
              {product.images.length > 0 ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-lg"
                  data-testid={`img-admin-product-${product.id}`}
                />
              ) : (
                <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center text-4xl">
                  {product.type === "pet" ? "🐾" : product.type === "food" ? "🥘" : "🎾"}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold" data-testid={`text-admin-product-name-${product.id}`}>
                    {product.name}
                  </h3>
                  <Badge variant="secondary" data-testid={`badge-admin-product-type-${product.id}`}>
                    {product.type}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground" data-testid={`text-admin-product-price-${product.id}`}>
                  {formatPrice(product.priceInINR)}
                </p>
                
                <p className="text-sm text-muted-foreground" data-testid={`text-admin-product-stock-${product.id}`}>
                  Stock: {product.stock}
                </p>
                
                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="flex-1"
                    data-testid={`button-edit-product-${product.id}`}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    className="flex-1"
                    disabled={deleteProductMutation.isPending}
                    data-testid={`button-delete-product-${product.id}`}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {products?.length === 0 && (
          <div className="col-span-full text-center py-12" data-testid="text-no-products-admin">
            <p className="text-muted-foreground text-lg">No products found. Add your first product to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
