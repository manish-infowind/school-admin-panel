# Profile API Integration

This document outlines the complete Profile API integration for the MedoScopic Admin Panel.

## Overview

The Profile API integration provides full CRUD operations for user profiles, including:
- Profile data retrieval and updates
- Avatar upload functionality
- Secure password changes with OTP verification
- Password reset capabilities
- User activity tracking

## API Endpoints

### Base URL
```
http://localhost:3000/admin
```

### Authentication
All endpoints require JWT token authentication:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Endpoint Details

### 1. Get User Profile
```bash
GET /admin/users/profile?userId=YOUR_USER_ID
```

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "68810a3ca1ce8410258de5b9",
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@medoscopic.com",
    "phone": "+1 (555) 123-4567",
    "location": "San Francisco, CA",
    "bio": "Admin user for MedoScopic Pharma content management system.",
    "avatar": "/uploads/avatars/admin-avatar.jpg",
    "role": "admin",
    "joinDate": "2024-01-15T00:00:00Z",
    "lastLogin": "2024-01-20T10:30:00Z",
    "isActive": true,
    "permissions": ["read", "write", "delete", "admin"]
  }
}
```

### 2. Update User Profile
```bash
PUT /admin/users/profile?userId=YOUR_USER_ID
Content-Type: application/json

{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@medoscopic.com",
  "phone": "+1 (555) 123-4567",
  "location": "San Francisco, CA",
  "bio": "Admin user for MedoScopic Pharma content management system."
}
```

### 3. Upload Avatar
```bash
POST /admin/users/profile/avatar?userId=YOUR_USER_ID
Content-Type: multipart/form-data

file: [image file]
```

### 4. Change Password (Sends OTP)
```bash
PUT /admin/users/profile/password?userId=YOUR_USER_ID
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "NewPassword456!",
  "confirmPassword": "NewPassword456!"
}
```

### 5. Verify OTP
```bash
POST /admin/users/profile/password/verify-otp?userId=YOUR_USER_ID
Content-Type: application/json

{
  "otp": "123456"
}
```

## Frontend Integration

### Profile Service
The `ProfileService` class handles all API interactions:

```typescript
import { profileService } from '@/api/services/profileService';

// Get profile
const profile = await profileService.getProfile();

// Update profile
await profileService.updateProfile({
  firstName: "Admin",
  lastName: "User",
  email: "admin@medoscopic.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  bio: "Admin user for MedoScopic Pharma content management system."
});

// Upload avatar
await profileService.uploadAvatar(file);

// Change password
await profileService.changePassword({
  currentPassword: "oldPassword123",
  newPassword: "NewPassword456!",
  confirmPassword: "NewPassword456!"
});

// Verify OTP
await profileService.verifyOtp({ otp: "123456" });
```

### Profile Hook
The `useProfile` hook provides React state management:

```typescript
import { useProfile } from '@/api/hooks/useProfile';

function ProfileComponent() {
  const {
    profile,
    loading,
    error,
    saving,
    uploadingAvatar,
    changingPassword,
    verifyingOtp,
    updateProfile,
    uploadAvatar,
    changePassword,
    verifyOtp,
    resetError
  } = useProfile();

  // Use the hook methods and states
}
```

## User ID Management

The service automatically retrieves the user ID from localStorage:

```typescript
// Expected localStorage structure
{
  "user": {
    "id": "68810a3ca1ce8410258de5b9",
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@medoscopic.com",
    // ... other user data
  }
}
```

## Error Handling

The service includes comprehensive error handling:

- **401 Unauthorized**: User needs to login again
- **403 Forbidden**: User lacks permission
- **404 Not Found**: Profile not found
- **422 Validation Error**: Invalid input data
- **500 Server Error**: Backend error

## Features

### ✅ Implemented Features
- [x] Profile data retrieval
- [x] Profile updates
- [x] Avatar upload
- [x] Password change with OTP
- [x] OTP verification
- [x] Error handling
- [x] Loading states
- [x] Toast notifications
- [x] Form validation
- [x] User ID auto-detection

### 🔄 User Experience Flow
1. **Profile Loading**: Automatically loads user profile on page load
2. **Profile Updates**: Users can update their information and save changes
3. **Avatar Upload**: Click camera icon to upload new profile picture
4. **Password Change**: 
   - Click "Change Password" button
   - Enter current and new passwords
   - Receive OTP via email
   - Enter OTP to complete change

## Testing

### Manual Testing
1. Navigate to Profile page
2. Verify profile data loads correctly
3. Update profile information
4. Upload new avatar
5. Test password change flow

### API Testing
Use the provided cURL commands to test each endpoint manually.

## Security Considerations

- All endpoints require JWT authentication
- Password changes require OTP verification
- User ID is automatically included from authenticated session
- Form data is validated before submission
- File uploads are restricted to image types

## Troubleshooting

### Common Issues
1. **Profile not loading**: Check localStorage for user data
2. **API errors**: Verify JWT token is valid
3. **Upload failures**: Check file size and type restrictions
4. **OTP issues**: Verify email is correct and OTP is valid

### Debug Logging
The service includes console logging for debugging:
- User ID retrieval
- API call URLs
- Response data
- Error details

## Dependencies

- `axios` for HTTP requests
- `react` for UI components
- `framer-motion` for animations
- `lucide-react` for icons
- `@/hooks/use-toast` for notifications 