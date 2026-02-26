import { useState, useCallback } from 'react';
import {
  profileService,
  UserProfile,
  UpdateProfileRequest,
} from '../services/profileService';
import { PasswordService } from '../services/passwordService';
import { ChangePasswordRequest } from '../types';
import { useToast } from '@/hooks/use-toast';

export interface UseProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  uploadingAvatar: boolean;
  changingPassword: boolean;

  // Actions
  loadProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<boolean>;
  resetError: () => void;
}

export function useProfile(): UseProfileReturn {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await profileService.getProfile();

      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        setError(response.message || 'Failed to load profile');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    setSaving(true);
    setError(null);

    try {
      const response = await profileService.updateProfile(data);

      if (response.success && response.data) {
        setProfile(prev => prev ? { ...prev, ...response.data } : response.data!);
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      } else {
        const msg = response.message || 'Failed to update profile';
        setError(msg);
        toast({
          title: "Error",
          description: msg,
          variant: "destructive",
        });
      }
    } catch (err) {
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

  const uploadAvatar = useCallback(async (file: File) => {
    setUploadingAvatar(true);
    setError(null);

    try {
      const response = await profileService.uploadAvatar(file);

      if (response.success && response.data) {
        setProfile(prev => prev ? {
          ...prev,
          avatar: response.data!.avatarUrl
        } : null);

        toast({
          title: "Success",
          description: "Avatar uploaded successfully",
        });
      } else {
        const msg = response.message || 'Failed to upload avatar';
        setError(msg);
        toast({
          title: "Error",
          description: msg,
          variant: "destructive",
        });
      }
    } catch (err) {
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
      const response = await PasswordService.changePassword(data);

      if (response.success) {
        toast({
          title: "Success",
          description: "Password changed successfully",
        });
        return true;
      } else {
        setError(response.message || 'Failed to change password');
        return false;
      }
    } catch (err) {
      setError('Failed to change password');
      return false;
    } finally {
      setChangingPassword(false);
    }
  }, [toast]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    profile,
    loading,
    error,
    saving,
    uploadingAvatar,
    changingPassword,
    loadProfile,
    updateProfile,
    uploadAvatar,
    changePassword,
    resetError,
  };
}