import { useState, useEffect, useCallback } from 'react';
import { 
  profileService, 
  UserProfile, 
  UpdateProfileRequest, 
  ChangePasswordRequest,
  VerifyOtpRequest,
  ResetPasswordRequest,
  ResetPasswordConfirmRequest
} from '../services/profileService';
import { useToast } from '@/hooks/use-toast';

export interface UseProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  uploadingAvatar: boolean;
  changingPassword: boolean;
  verifyingOtp: boolean;
  requestingReset: boolean;
  resettingPassword: boolean;
  
  // Actions
  loadProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  uploadAvatar: (file: File, onProgress?: (progress: number) => void) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<boolean>;
  verifyOtp: (data: VerifyOtpRequest) => Promise<boolean>;
  requestPasswordReset: (data: ResetPasswordRequest) => Promise<void>;
  resetPassword: (data: ResetPasswordConfirmRequest) => Promise<void>;
  resetError: () => void;
}

export function useProfile(): UseProfileReturn {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [requestingReset, setRequestingReset] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading profile...');
      const response = await profileService.getProfile();
      console.log('📥 Profile response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Setting profile data:', response.data);
        setProfile(response.data);
      } else {
        console.log('❌ Profile response not successful:', response);
        setError(response.message || 'Failed to load profile');
      }
    } catch (err) {
      console.error('💥 Error loading profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    setSaving(true);
    setError(null);
    
    try {
      console.log('🔄 Updating profile with data:', data);
      const response = await profileService.updateProfile(data);
      console.log('📥 Update profile response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Profile updated successfully:', response.data);
        setProfile(response.data);
        toast({
          title: "Success",
          description: response.message || "Profile updated successfully",
        });
      } else {
        console.log('❌ Profile update failed:', response);
        setError(response.message || 'Failed to update profile');
        toast({
          title: "Error",
          description: response.message || 'Failed to update profile',
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('💥 Error updating profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [toast]);

  const uploadAvatar = useCallback(async (file: File, onProgress?: (progress: number) => void) => {
    setUploadingAvatar(true);
    setError(null);
    
    try {
      console.log('🔄 Uploading avatar...');
      
      // Simulate upload progress if no progress callback provided
      if (!onProgress) {
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += Math.random() * 20 + 10; // Random increment between 10-30
          if (progress >= 90) {
            clearInterval(progressInterval);
            onProgress?.(90);
          } else {
            onProgress?.(progress);
          }
        }, 300);
        
        setTimeout(() => {
          clearInterval(progressInterval);
        }, 3000);
      }
      
      const response = await profileService.uploadAvatar(file);
      console.log('📥 Avatar upload response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Avatar uploaded successfully:', response.data);
        
        // Update the profile with new avatar immediately
        setProfile(prev => prev ? {
          ...prev,
          avatar: response.data!.avatar
        } : null);
        
        // Don't refresh the full profile immediately to prevent glitches
        // The avatar URL will be updated through the profile state change
        
        toast({
          title: "Success",
          description: response.message || "Avatar uploaded successfully",
        });
      } else {
        console.log('❌ Avatar upload failed:', response);
        setError(response.message || 'Failed to upload avatar');
        toast({
          title: "Error",
          description: response.message || 'Failed to upload avatar',
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('💥 Error uploading avatar:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload avatar';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  }, [toast]);

  const changePassword = useCallback(async (data: ChangePasswordRequest): Promise<boolean> => {
    setChangingPassword(true);
    setError(null);
    
    try {
      console.log('🔄 Changing password with data:', data);
      const response = await profileService.changePassword(data);
      console.log('📥 Change password response:', response);
      
      if (response.success) {
        console.log('✅ Password change initiated successfully');
        toast({
          title: "OTP Sent",
          description: response.message || "OTP sent to your email for password change verification",
        });
        return true;
      } else {
        console.log('❌ Password change failed:', response);
        setError(response.message || 'Failed to send OTP');
        // Don't show toast error - let the modal handle it
        return false;
      }
    } catch (err) {
      console.error('💥 Error changing password:', err);
      // Handle ApiError objects from ApiClient
      let errorMessage = 'Failed to send OTP';
      if (err && typeof err === 'object') {
        if ('message' in err) {
          errorMessage = (err as any).message;
        } else if ('data' in err && (err as any).data?.message) {
          errorMessage = (err as any).data.message;
        }
      }
      setError(errorMessage);
      // Don't show toast error - let the modal handle it
      return false;
    } finally {
      setChangingPassword(false);
    }
  }, [toast]);

  const verifyOtp = useCallback(async (data: VerifyOtpRequest): Promise<boolean> => {
    setVerifyingOtp(true);
    setError(null);
    
    try {
      console.log('🔄 Verifying OTP with data:', data);
      const response = await profileService.verifyOtp(data);
      console.log('📥 Verify OTP response:', response);
      
      if (response.success) {
        console.log('✅ OTP verified successfully');
        toast({
          title: "Success",
          description: response.message || "Password changed successfully",
        });
        
        // Refresh profile data to get updated lastPasswordChange info
        await loadProfile();
        
        return true;
      } else {
        console.log('❌ OTP verification failed:', response);
        setError(response.message || 'Failed to verify OTP');
        // Don't show toast error - let the modal handle it
        return false;
      }
    } catch (err) {
      console.error('💥 Error verifying OTP:', err);
      // Handle ApiError objects from ApiClient
      let errorMessage = 'Failed to verify OTP';
      if (err && typeof err === 'object') {
        if ('message' in err) {
          errorMessage = (err as any).message;
        } else if ('data' in err && (err as any).data?.message) {
          errorMessage = (err as any).data.message;
        }
      }
      setError(errorMessage);
      // Don't show toast error - let the modal handle it
      return false;
    } finally {
      setVerifyingOtp(false);
    }
  }, [toast, loadProfile]);

  const requestPasswordReset = useCallback(async (data: ResetPasswordRequest) => {
    setRequestingReset(true);
    setError(null);
    
    try {
      const response = await profileService.requestPasswordReset(data);
      
      if (response.success) {
        toast({
          title: "Reset Link Sent",
          description: response.message || "Password reset link sent to your email",
        });
      } else {
        setError(response.message || 'Failed to send reset link');
        toast({
          title: "Error",
          description: response.message || 'Failed to send reset link',
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset link';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setRequestingReset(false);
    }
  }, [toast]);

  const resetPassword = useCallback(async (data: ResetPasswordConfirmRequest) => {
    setResettingPassword(true);
    setError(null);
    
    try {
      const response = await profileService.resetPassword(data);
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Password reset successfully",
        });
      } else {
        setError(response.message || 'Failed to reset password');
        toast({
          title: "Error",
          description: response.message || 'Failed to reset password',
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setResettingPassword(false);
    }
  }, [toast]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // Don't auto-load profile on mount - let components call it explicitly when needed
  // useEffect(() => {
  //   loadProfile();
  // }, [loadProfile]);

  return {
    profile,
    loading,
    error,
    saving,
    uploadingAvatar,
    changingPassword,
    verifyingOtp,
    requestingReset,
    resettingPassword,
    loadProfile,
    updateProfile,
    uploadAvatar,
    changePassword,
    verifyOtp,
    requestPasswordReset,
    resetPassword,
    resetError,
  };
} 