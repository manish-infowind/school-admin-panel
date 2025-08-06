import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SiteSettingsService } from '../services/siteSettingsService';
import { SiteSettings } from '../types';

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await SiteSettingsService.getSettings();
      
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        setError(response.message || 'Failed to fetch settings');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch settings';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updatedSettings: Partial<SiteSettings>) => {
    try {
      setLoading(true);
      
      const response = await SiteSettingsService.updateSettings(updatedSettings);
      
      if (response.success && response.data) {
        setSettings(response.data);
        toast({
          title: "Success",
          description: "Settings updated successfully",
        });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update settings');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const initializeSettings = async () => {
    try {
      setLoading(true);
      
      const response = await SiteSettingsService.initialize();
      
      if (response.success && response.data) {
        setSettings(response.data);
        toast({
          title: "Success",
          description: "Settings initialized successfully",
        });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to initialize settings');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize settings';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updateSettings,
    initializeSettings,
    refetch: fetchSettings,
  };
}; 