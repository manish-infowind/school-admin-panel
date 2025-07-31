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
      console.log('📋 Fetching products...', params);
      
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);

      const url = `${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}?${queryParams.toString()}`;
      
      const response = await apiClient.get<ProductListResponse>(url);
      
      console.log('📥 Products response:', response);
      console.log('📥 Products response.data:', response.data);
      console.log('📥 Products response.data.products:', response.data?.products);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch products:', error);
      throw error;
    }
  }

  // Get single product by ID
  static async getProduct(productId: string): Promise<ApiResponse<Product>> {
    try {
      console.log('📋 Fetching product:', productId);
      
      const response = await apiClient.get<Product>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.DETAILS.replace(':id', productId)}`
      );
      
      console.log('📥 Product response:', response);
      console.log('📥 Product response.data:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch product:', error);
      throw error;
    }
  }

  // Create new product
  static async createProduct(data: CreateProductRequest): Promise<ApiResponse<Product>> {
    try {
      console.log('📝 Creating product...', data);
      
      const response = await apiClient.post<Product>(
        API_CONFIG.ENDPOINTS.PRODUCTS.CREATE,
        data
      );
      
      console.log('📥 Create product response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create product:', error);
      throw error;
    }
  }

  // Update existing product
  static async updateProduct(productId: string, data: UpdateProductRequest): Promise<ApiResponse<Product>> {
    try {
      console.log('📝 Updating product:', productId, data);
      
      const response = await apiClient.put<Product>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE.replace(':id', productId)}`,
        data
      );
      
      console.log('📥 Update product response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update product:', error);
      throw error;
    }
  }

  // Delete product
  static async deleteProduct(productId: string): Promise<ApiResponse<{ id: string; deletedAt: string }>> {
    try {
      console.log('🗑️ Deleting product:', productId);
      
      const response = await apiClient.delete<{ id: string; deletedAt: string }>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.DELETE.replace(':id', productId)}`
      );
      
      console.log('📥 Delete product response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to delete product:', error);
      throw error;
    }
  }

  // Upload product image
  static async uploadProductImage(productId: string, imageFile: File): Promise<ApiResponse<{ imageUrl: string }>> {
    try {
      console.log('📤 Uploading product image:', productId);
      
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
      
      console.log('📥 Upload image response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to upload product image:', error);
      throw error;
    }
  }

  // Update product status
  static async updateProductStatus(productId: string, data: UpdateProductStatusRequest): Promise<ApiResponse<Product>> {
    try {
      console.log('📝 Updating product status:', productId, data);
      
      const response = await apiClient.patch<Product>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE.replace(':id', productId)}/status`,
        data
      );
      
      console.log('📥 Update status response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update product status:', error);
      throw error;
    }
  }
} 