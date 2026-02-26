import {
  User,
} from './types';

// Mock User Data
export const mockUser: User = {
  id: '1',
  username: 'admin',
  email: 'admin@gmail.com',
  role: 'super_admin',
  profilePic: '/logo.svg',
  firstName: 'Admin',
  lastName: 'User',
  phone: '+1234567890',
  location: 'New York, USA',
  isActive: true,
  lastLogin: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock Dashboard Data
export const mockDashboardData = {
  stats: {
    totalUsers: 1,
  },
  recentActivity: [
    {
      action: 'Login Successful',
      page: 'Dashboard',
      time: new Date().toISOString(),
      type: 'login',
    },
  ],
};

// Helper function to simulate delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to generate ID
export const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper function to paginate array
export const paginate = <T>(array: T[], page: number = 1, limit: number = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = array.slice(startIndex, endIndex);
  const totalPages = Math.ceil(array.length / limit);

  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total: array.length,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

// Helper function to filter array
export const filterArray = <T>(array: T[], filters: Record<string, any>) => {
  return array.filter(item => {
    return Object.keys(filters).every(key => {
      const filterValue = filters[key];
      if (filterValue === undefined || filterValue === null || filterValue === '') {
        return true;
      }

      const itemValue = (item as any)[key];
      if (typeof filterValue === 'string') {
        return String(itemValue).toLowerCase().includes(filterValue.toLowerCase());
      }
      return itemValue === filterValue;
    });
  });
};