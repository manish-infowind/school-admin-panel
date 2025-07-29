import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { 
  Product, 
  CreateProductRequest, 
  UpdateProductRequest, 
  PaginatedResponse, 
  QueryParams,
  ApiResponse 
} from '../types';

export class ProductService {
  // Get all products with pagination and filters
  static async getProducts(params?: QueryParams): Promise<PaginatedResponse<Product>> {
    try {
      const queryString = this.buildQueryString(params);
      const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}${queryString}`;
      
      const response = await apiClient.get<Product[]>(endpoint);
      return response as PaginatedResponse<Product>;
    } catch (error) {
      throw error;
    }
  }

  // Get single product by ID
  static async getProduct(id: string): Promise<ApiResponse<Product>> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.PRODUCTS.DETAILS.replace(':id', id);
      const response = await apiClient.get<Product>(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Create new product
  static async createProduct(productData: CreateProductRequest): Promise<ApiResponse<Product>> {
    try {
      const formData = new FormData();
      
      // Add text fields
      formData.append('name', productData.name);
      formData.append('description', productData.description);
      formData.append('price', productData.price.toString());
      formData.append('category', productData.category);
      
      // Add image if provided
      if (productData.image) {
        formData.append('image', productData.image);
      }

      const response = await apiClient.upload<Product>(
        API_CONFIG.ENDPOINTS.PRODUCTS.CREATE,
        formData
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update existing product
  static async updateProduct(id: string, productData: UpdateProductRequest): Promise<ApiResponse<Product>> {
    try {
      const formData = new FormData();
      
      // Add text fields
      if (productData.name) formData.append('name', productData.name);
      if (productData.description) formData.append('description', productData.description);
      if (productData.price) formData.append('price', productData.price.toString());
      if (productData.category) formData.append('category', productData.category);
      
      // Add image if provided
      if (productData.image) {
        formData.append('image', productData.image);
      }

      const endpoint = API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE.replace(':id', id);
      const response = await apiClient.upload<Product>(endpoint, formData);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete product
  static async deleteProduct(id: string): Promise<ApiResponse<void>> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.PRODUCTS.DELETE.replace(':id', id);
      const response = await apiClient.delete<void>(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update product status
  static async updateProductStatus(id: string, status: 'active' | 'inactive'): Promise<ApiResponse<Product>> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE.replace(':id', id);
      const response = await apiClient.patch<Product>(endpoint, { status });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Search products
  static async searchProducts(query: string, params?: QueryParams): Promise<PaginatedResponse<Product>> {
    try {
      const searchParams = { ...params, search: query };
      const queryString = this.buildQueryString(searchParams);
      const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}${queryString}`;
      
      const response = await apiClient.get<Product[]>(endpoint);
      return response as PaginatedResponse<Product>;
    } catch (error) {
      throw error;
    }
  }

  // Get products by category
  static async getProductsByCategory(category: string, params?: QueryParams): Promise<PaginatedResponse<Product>> {
    try {
      const categoryParams = { ...params, category };
      const queryString = this.buildQueryString(categoryParams);
      const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}${queryString}`;
      
      const response = await apiClient.get<Product[]>(endpoint);
      return response as PaginatedResponse<Product>;
    } catch (error) {
      throw error;
    }
  }

  // Bulk operations
  static async bulkUpdateStatus(ids: string[], status: 'active' | 'inactive'): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.patch<void>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}/bulk-status`,
        { ids, status }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<void>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}/bulk-delete`,
        { ids }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Helper method to build query string
  private static buildQueryString(params?: QueryParams): string {
    if (!params || Object.keys(params).length === 0) {
      return '';
    }

    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }
}

export default ProductService; 