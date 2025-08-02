import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { ApiResponse } from '../types';

export interface Product {
  _id: string;
  name: string;
  category: string;
  status: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  images: string[];
  isPublished: boolean;
  lastModified?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  category: string;
  status: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  images: string[];
  isPublished: boolean;
}

export interface UpdateProductRequest {
  name?: string;
  category?: string;
  status?: string;
  shortDescription?: string;
  fullDescription?: string;
  features?: string[];
  images?: string[];
  isPublished?: boolean;
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateProductStatusRequest {
  status: string;
  isPublished: boolean;
}

export class ProductService {
  // Get all products with pagination and search
  static async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<ProductListResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);

      const url = `${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}?${queryParams.toString()}`;
      
      const response = await apiClient.get<ProductListResponse>(url);
      
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch products:', error);
      throw error;
    }
  }

  // Get single product by ID
  static async getProduct(productId: string): Promise<ApiResponse<Product>> {
    try {
      const response = await apiClient.get<Product>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.DETAILS.replace(':id', productId)}`
      );
      
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch product:', error);
      throw error;
    }
  }

  // Create new product
  static async createProduct(data: CreateProductRequest): Promise<ApiResponse<Product>> {
    try {
      const response = await apiClient.post<Product>(
        API_CONFIG.ENDPOINTS.PRODUCTS.CREATE,
        data
      );
      
      return response;
    } catch (error) {
      console.error('❌ Failed to create product:', error);
      throw error;
    }
  }

  // Update existing product
  static async updateProduct(productId: string, data: UpdateProductRequest): Promise<ApiResponse<Product>> {
    try {
      const response = await apiClient.put<Product>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE.replace(':id', productId)}`,
        data
      );
      
      return response;
    } catch (error) {
      console.error('❌ Failed to update product:', error);
      throw error;
    }
  }

  // Delete product
  static async deleteProduct(productId: string): Promise<ApiResponse<{ id: string; deletedAt: string }>> {
    try {
      const response = await apiClient.delete<{ id: string; deletedAt: string }>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.DELETE.replace(':id', productId)}`
      );
      
      return response;
    } catch (error) {
      console.error('❌ Failed to delete product:', error);
      throw error;
    }
  }

  // Upload product image
  static async uploadProductImage(productId: string, imageFile: File): Promise<ApiResponse<{ imageUrl: string }>> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await apiClient.post<{ imageUrl: string }>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE.replace(':id', productId)}/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response;
    } catch (error) {
      console.error('❌ Failed to upload product image:', error);
      throw error;
    }
  }

  // Update product status
  static async updateProductStatus(productId: string, data: UpdateProductStatusRequest): Promise<ApiResponse<Product>> {
    try {
      const response = await apiClient.patch<Product>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE.replace(':id', productId)}/status`,
        data
      );
      
      return response;
    } catch (error) {
      console.error('❌ Failed to update product status:', error);
      throw error;
    }
  }
} 