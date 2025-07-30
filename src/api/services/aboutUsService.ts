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
      console.log('🏢 Fetching About Us data...');
      
      const response = await apiClient.get<AboutUs>(
        API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US
      );

      console.log('📥 About Us response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch About Us:', error);
      throw error;
    }
  }

  // Update About Us data
  static async updateAboutUs(data: UpdateAboutUsRequest): Promise<ApiResponse<AboutUs>> {
    try {
      console.log('📝 Updating About Us data...');
      console.log('📦 Update data:', data);
      
      const response = await apiClient.patch<AboutUs>(
        API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US,
        data
      );

      console.log('📥 Update response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update About Us:', error);
      throw error;
    }
  }

  // Get specific section
  static async getSection(sectionId: string): Promise<ApiResponse<any>> {
    try {
      console.log(`📄 Fetching section: ${sectionId}`);
      
      const response = await apiClient.get<any>(
        `${API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US}/sections/${sectionId}`
      );

      console.log('📥 Section response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch section:', error);
      throw error;
    }
  }

  // Update specific section
  static async updateSection(sectionId: string, data: UpdateSectionRequest): Promise<ApiResponse<any>> {
    try {
      console.log(`📝 Updating section: ${sectionId}`);
      console.log('📦 Update data:', data);
      
      const response = await apiClient.patch<any>(
        `${API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US}/sections/${sectionId}`,
        data
      );

      console.log('📥 Section update response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update section:', error);
      throw error;
    }
  }

  // Delete specific section
  static async deleteSection(sectionId: string): Promise<ApiResponse<void>> {
    try {
      console.log(`🗑️ Deleting section: ${sectionId}`);
      
      const response = await apiClient.delete<void>(
        `${API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US}/sections/${sectionId}`
      );

      console.log('📥 Section delete response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to delete section:', error);
      throw error;
    }
  }

  // Upload section image
  static async uploadSectionImage(sectionId: string, imageFile: File): Promise<ApiResponse<any>> {
    try {
      console.log(`📸 Uploading section image: ${sectionId}`);
      
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await apiClient.upload<any>(
        `${API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US}/sections/${sectionId}/upload-image`,
        formData
      );

      console.log('📥 Section image upload response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to upload section image:', error);
      throw error;
    }
  }

  // Get specific team member
  static async getTeamMember(memberId: string): Promise<ApiResponse<any>> {
    try {
      console.log(`👤 Fetching team member: ${memberId}`);
      
      const response = await apiClient.get<any>(
        `${API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US}/team-members/${memberId}`
      );

      console.log('📥 Team member response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch team member:', error);
      throw error;
    }
  }

  // Update specific team member
  static async updateTeamMember(memberId: string, data: UpdateTeamMemberRequest): Promise<ApiResponse<any>> {
    try {
      console.log(`📝 Updating team member: ${memberId}`);
      console.log('📦 Update data:', data);
      
      const response = await apiClient.patch<any>(
        `${API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US}/team-members/${memberId}`,
        data
      );

      console.log('📥 Team member update response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update team member:', error);
      throw error;
    }
  }

  // Delete specific team member
  static async deleteTeamMember(memberId: string): Promise<ApiResponse<void>> {
    try {
      console.log(`🗑️ Deleting team member: ${memberId}`);
      
      const response = await apiClient.delete<void>(
        `${API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US}/team-members/${memberId}`
      );

      console.log('📥 Team member delete response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to delete team member:', error);
      throw error;
    }
  }

  // Upload team member image
  static async uploadTeamMemberImage(memberId: string, imageFile: File): Promise<ApiResponse<any>> {
    try {
      console.log(`📸 Uploading team member image: ${memberId}`);
      
      const formData = new FormData();
      formData.append('image', imageFile);

      const uploadEndpoint = `${API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US}/team-members/${memberId}/upload-image`;
      console.log('🔗 Upload endpoint:', uploadEndpoint);
      console.log('🔗 Full upload URL:', `${API_CONFIG.BASE_URL}${uploadEndpoint}`);
      console.log('📁 FormData contents:', formData);

      const response = await apiClient.upload<any>(
        uploadEndpoint,
        formData
      );

      console.log('📥 Team member image upload response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to upload team member image:', error);
      console.error('❌ Error details:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  }

  // Create new section
  static async createSection(data: { title: string; content: string; order: number }): Promise<ApiResponse<any>> {
    try {
      console.log('📝 Creating new section...');
      console.log('📦 Create data:', data);
      
      const response = await apiClient.post<any>(
        API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US_SECTIONS,
        data
      );

      console.log('📥 Section create response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create section:', error);
      throw error;
    }
  }

  // Create section with image upload
  static async createSectionWithImage(
    data: { title: string; content: string; order: number },
    imageFile?: File
  ): Promise<ApiResponse<any>> {
    try {
      console.log('📝 Creating new section with image...');
      
      // First create the section
      const sectionResponse = await this.createSection(data);
      
      // If image is provided and section was created successfully, upload the image
      if (imageFile && sectionResponse.success && sectionResponse.data?._id) {
        try {
          console.log('📸 Uploading image for section:', sectionResponse.data._id);
          
          const formData = new FormData();
          formData.append('image', imageFile);

          const uploadResponse = await apiClient.upload<any>(
            `${API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US}/sections/${sectionResponse.data._id}/upload-image`,
            formData
          );

          console.log('📥 Image upload response:', uploadResponse);
          
          // Return the section response with updated image data
          return {
            ...sectionResponse,
            data: {
              ...sectionResponse.data,
              image: uploadResponse.data?.imageUrl || sectionResponse.data.image
            }
          };
        } catch (uploadError) {
          console.warn('⚠️ Image upload failed, but section was created:', uploadError);
          // Return the section response even if image upload failed
          return sectionResponse;
        }
      }
      
      return sectionResponse;
    } catch (error) {
      console.error('❌ Failed to create section with image:', error);
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
      console.log('👤 Creating new team member...');
      console.log('📦 Create data:', data);
      console.log('🔗 Endpoint:', API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US_TEAM_MEMBERS);
      console.log('🔗 Full URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US_TEAM_MEMBERS}`);
      
      const response = await apiClient.post<any>(
        API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US_TEAM_MEMBERS,
        data
      );

      console.log('📥 Team member create response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create team member:', error);
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
      console.log('👤 Creating new team member with image...');
      
      // First create the team member
      const memberResponse = await this.createTeamMember(data);
      
      // If image is provided and member was created successfully, upload the image
      if (imageFile && memberResponse.success && memberResponse.data?._id) {
        try {
          console.log('📸 Uploading image for team member:', memberResponse.data._id);
          
          const formData = new FormData();
          formData.append('image', imageFile);

          const uploadResponse = await apiClient.upload<any>(
            `${API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US}/team-members/${memberResponse.data._id}/upload-image`,
            formData
          );

          console.log('📥 Image upload response:', uploadResponse);
          
          // Return the member response with updated image data
          return {
            ...memberResponse,
            data: {
              ...memberResponse.data,
              image: uploadResponse.data?.imageUrl || memberResponse.data.image
            }
          };
        } catch (uploadError) {
          console.warn('⚠️ Image upload failed, but team member was created:', uploadError);
          // Return the member response even if image upload failed
          return memberResponse;
        }
      }
      
      return memberResponse;
    } catch (error) {
      console.error('❌ Failed to create team member with image:', error);
      throw error;
    }
  }

  // Upload main About Us image
  static async uploadMainImage(imageFile: File): Promise<ApiResponse<any>> {
    try {
      console.log('📸 Uploading main About Us image...');
      
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await apiClient.upload<any>(
        API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US_MAIN_IMAGE,
        formData
      );

      console.log('📥 Main image upload response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to upload main About Us image:', error);
      throw error;
    }
  }

  // Remove main About Us image
  static async removeMainImage(): Promise<ApiResponse<any>> {
    try {
      console.log('🗑️ Removing main About Us image...');
      
      const response = await apiClient.delete<any>(
        API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US_MAIN_IMAGE
      );

      console.log('📥 Main image remove response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to remove main About Us image:', error);
      throw error;
    }
  }
} 