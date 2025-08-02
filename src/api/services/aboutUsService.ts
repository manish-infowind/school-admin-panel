import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { 
  AboutUs, 
  UpdateAboutUsRequest, 
  UpdateSectionRequest, 
  UpdateTeamMemberRequest, 
  ApiResponse 
} from '../types';

export class AboutUsService {
  // Get About Us data
  static async getAboutUs(): Promise<ApiResponse<AboutUs>> {
    try {
      const response = await apiClient.get<AboutUs>(
        API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update About Us data
  static async updateAboutUs(data: UpdateAboutUsRequest): Promise<ApiResponse<AboutUs>> {
    try {
      const response = await apiClient.patch<AboutUs>(
        API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US,
        data
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get specific section
  static async getSection(sectionId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get<any>(
        `${API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US}/sections/${sectionId}`
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update specific section
  static async updateSection(sectionId: string, data: UpdateSectionRequest): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.patch<any>(
        `${API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US}/sections/${sectionId}`,
        data
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete specific section
  static async deleteSection(sectionId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<void>(
        `${API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US}/sections/${sectionId}`
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Upload section image
  static async uploadSectionImage(sectionId: string, imageFile: File): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await apiClient.upload<any>(
        `${API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US}/sections/${sectionId}/upload-image`,
        formData
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get specific team member
  static async getTeamMember(memberId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get<any>(
        `${API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US}/team-members/${memberId}`
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update specific team member
  static async updateTeamMember(memberId: string, data: UpdateTeamMemberRequest): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.patch<any>(
        `${API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US}/team-members/${memberId}`,
        data
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete specific team member
  static async deleteTeamMember(memberId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<void>(
        `${API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US}/team-members/${memberId}`
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Upload team member image
  static async uploadTeamMemberImage(memberId: string, imageFile: File): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const uploadEndpoint = `${API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US}/team-members/${memberId}/upload-image`;

      const response = await apiClient.upload<any>(
        uploadEndpoint,
        formData
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Create new section
  static async createSection(data: { title: string; content: string; order: number }): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post<any>(
        API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US_SECTIONS,
        data
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Create section with image upload
  static async createSectionWithImage(
    data: { title: string; content: string; order: number },
    imageFile?: File
  ): Promise<ApiResponse<any>> {
    try {
      // First create the section
      const sectionResponse = await this.createSection(data);
      
      // If image is provided and section was created successfully, upload the image
      if (imageFile && sectionResponse.success && sectionResponse.data?._id) {
        try {
          const formData = new FormData();
          formData.append('image', imageFile);

          const uploadResponse = await apiClient.upload<any>(
            `${API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US}/sections/${sectionResponse.data._id}/upload-image`,
            formData
          );
          
          // Return the section response with updated image data
          return {
            ...sectionResponse,
            data: {
              ...sectionResponse.data,
              image: uploadResponse.data?.imageUrl || sectionResponse.data.image
            }
          };
        } catch (uploadError) {
          // Return the section response even if image upload failed
          return sectionResponse;
        }
      }
      
      return sectionResponse;
    } catch (error) {
      throw error;
    }
  }

  // Create new team member
  static async createTeamMember(data: {
    name: string;
    position: string;
    bio: string;
    email?: string;
    linkedin?: string;
    twitter?: string;
    order: number;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post<any>(
        API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US_TEAM_MEMBERS,
        data
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Create team member with image upload
  static async createTeamMemberWithImage(
    data: {
      name: string;
      position: string;
      bio: string;
      email?: string;
      linkedin?: string;
      twitter?: string;
      order: number;
    },
    imageFile?: File
  ): Promise<ApiResponse<any>> {
    try {
      // First create the team member
      const memberResponse = await this.createTeamMember(data);
      
      // If image is provided and member was created successfully, upload the image
      if (imageFile && memberResponse.success && memberResponse.data?._id) {
        try {
          const formData = new FormData();
          formData.append('image', imageFile);

          const uploadResponse = await apiClient.upload<any>(
            `${API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US}/team-members/${memberResponse.data._id}/upload-image`,
            formData
          );
          
          // Return the member response with updated image data
          return {
            ...memberResponse,
            data: {
              ...memberResponse.data,
              image: uploadResponse.data?.imageUrl || memberResponse.data.image
            }
          };
        } catch (uploadError) {
          // Return the member response even if image upload failed
          return memberResponse;
        }
      }
      
      return memberResponse;
    } catch (error) {
      throw error;
    }
  }

  // Upload main About Us image
  static async uploadMainImage(imageFile: File): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await apiClient.upload<any>(
        API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US_MAIN_IMAGE,
        formData
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Remove main About Us image
  static async removeMainImage(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.delete<any>(
        API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US_MAIN_IMAGE
      );

      return response;
    } catch (error) {
      throw error;
    }
  }
} 