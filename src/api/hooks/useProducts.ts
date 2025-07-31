import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductService, type Product, type CreateProductRequest, type UpdateProductRequest, type UpdateProductStatusRequest } from '../services/productService';
import { useToast } from '@/hooks/use-toast';

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: { page?: number; limit?: number; search?: string }) => 
    [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// Get all products
export const useProducts = (params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => ProductService.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get single product
export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => ProductService.getProduct(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Create product mutation
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => ProductService.createProduct(data),
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: "Product created successfully",
        variant: "default",
      });
      
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Create product error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });
};

// Update product mutation
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: UpdateProductRequest }) =>
      ProductService.updateProduct(productId, data),
    onSuccess: (response, { productId }) => {
      toast({
        title: "Success",
        description: "Product updated successfully",
        variant: "default",
      });
      
      // Invalidate and refetch specific product and products list
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Update product error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });
};

// Delete product mutation
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (productId: string) => ProductService.deleteProduct(productId),
    onSuccess: (response, productId) => {
      toast({
        title: "Success",
        description: "Product deleted successfully",
        variant: "default",
      });
      
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      // Remove the deleted product from cache
      queryClient.removeQueries({ queryKey: productKeys.detail(productId) });
    },
    onError: (error: any) => {
      console.error('Delete product error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });
};

// Upload product image mutation
export const useUploadProductImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ productId, imageFile }: { productId: string; imageFile: File }) =>
      ProductService.uploadProductImage(productId, imageFile),
    onSuccess: (response, { productId }) => {
      toast({
        title: "Success",
        description: "Product image uploaded successfully",
        variant: "default",
      });
      
      // Invalidate and refetch specific product and products list
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Upload product image error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to upload product image",
        variant: "destructive",
      });
    },
  });
};

// Update product status mutation
export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: UpdateProductStatusRequest }) =>
      ProductService.updateProductStatus(productId, data),
    onSuccess: (response, { productId }) => {
      toast({
        title: "Success",
        description: "Product status updated successfully",
        variant: "default",
      });
      
      // Invalidate and refetch specific product and products list
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Update product status error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update product status",
        variant: "destructive",
      });
    },
  });
}; 