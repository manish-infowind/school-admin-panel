# Admin Panel API Specification (Simplified)

This document outlines the minimized API requirements for the Admin Panel frontend, focusing on authentication and basic profile management.

## Base URL
The API base URL is configured via `VITE_API_BASE_URL`.
Base path: `/admin`

---

## 1. Authentication Module

### Login
**Endpoint:** `POST /login`  
**Description:** Authenticates user and returns tokens.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "your_secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "admin@example.com",
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token"
    }
  },
  "message": "Login successful"
}
```

### Logout
**Endpoint:** `POST /auth/logout`  
**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 2. Password Management

### Forgot Password
**Endpoint:** `POST /forgot-password`  
**Request Body:**
```json
{
  "email": "admin@example.com"
}
```

### Change Password (Logged In)
**Endpoint:** `POST /change-password`  
**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

---

## 3. Profile Module (Minimal)

### Get Profile
**Endpoint:** `GET /admin-profile`  
**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "avatar": "https://path-to-image.jpg"
  }
}
```

### Update Profile
**Endpoint:** `PUT /admin-profile`  
**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}
```

### Upload Avatar
**Endpoint:** `POST /admin-profile/avatar`  
**Content-Type:** `multipart/form-data`

**Request Body:**
- `file`: Image file

**Response:**
```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://path-to-new-image.jpg"
  }
}
```

---

## Global Response Format
```json
{
  "success": boolean,
  "data": object | null,
  "message": "Message string"
}
```
