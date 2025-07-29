import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ProductService } from '../services/productService';
import { CreateProductRequest, UpdateProductRequest, Product, QueryParams } from '../types';

// Query keys for products
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: QueryParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export const useProducts = (params?: QueryParams) => {
  const queryClient = useQueryClient();

  // Get products list
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: productKeys.list(params || {}),
    queryFn: () => ProductService.getProducts(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: (productData: CreateProductRequest) => ProductService.createProduct(productData),
    onSuccess: () => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error) => {
      console.error('Create product failed:', error);
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      ProductService.updateProduct(id, data),
    onSuccess: (response, variables) => {
      // Update product in cache
      queryClient.setQueryData(productKeys.detail(variables.id), response);
      
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error) => {
      console.error('Update product failed:', error);
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => ProductService.deleteProduct(id),
    onSuccess: (_, deletedId) => {
      // Remove product from cache
      queryClient.removeQueries({ queryKey: productKeys.detail(deletedId) });
      
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error) => {
      console.error('Delete product failed:', error);
    },
  });

  // Update product status mutation
  const updateProductStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      ProductService.updateProductStatus(id, status),
    onSuccess: (response, variables) => {
      // Update product in cache
      queryClient.setQueryData(productKeys.detail(variables.id), response);
      
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error) => {
      console.error('Update product status failed:', error);
    },
  });

  // Bulk update status mutation
  const bulkUpdateStatusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: 'active' | 'inactive' }) =>
      ProductService.bulkUpdateStatus(ids, status),
    onSuccess: () => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error) => {
      console.error('Bulk update status failed:', error);
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => ProductService.bulkDelete(ids),
    onSuccess: (_, deletedIds) => {
      // Remove products from cache
      deletedIds.forEach(id => {
        queryClient.removeQueries({ queryKey: productKeys.detail(id) });
      });
      
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error) => {
      console.error('Bulk delete failed:', error);
    },
  });

  return {
    // Data
    products: productsData?.data || [],
    pagination: productsData?.pagination,
    
    // State
    isLoading,
    error,
    
    // Actions
    refetch,
    createProduct: createProductMutation.mutate,
    updateProduct: updateProductMutation.mutate,
    deleteProduct: deleteProductMutation.mutate,
    updateProductStatus: updateProductStatusMutation.mutate,
    bulkUpdateStatus: bulkUpdateStatusMutation.mutate,
    bulkDelete: bulkDeleteMutation.mutate,
    
    // Mutation states
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
    isUpdatingStatus: updateProductStatusMutation.isPending,
    isBulkUpdating: bulkUpdateStatusMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
    
    // Errors
    createError: createProductMutation.error,
    updateError: updateProductMutation.error,
    deleteError: deleteProductMutation.error,
    updateStatusError: updateProductStatusMutation.error,
    bulkUpdateError: bulkUpdateStatusMutation.error,
    bulkDeleteError: bulkDeleteMutation.error,
  };
};

// Hook for single product
export const useProduct = (id: string) => {
  const queryClient = useQueryClient();

  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => ProductService.getProduct(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    product: product?.data,
    isLoading,
    error,
    refetch,
  };
};

// Hook for product search
export const useProductSearch = (query: string, params?: QueryParams) => {
  const {
    data: searchData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [...productKeys.lists(), 'search', query, params],
    queryFn: () => ProductService.searchProducts(query, params),
    enabled: !!query && query.length > 2,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    products: searchData?.data || [],
    pagination: searchData?.pagination,
    isLoading,
    error,
  };
}; 