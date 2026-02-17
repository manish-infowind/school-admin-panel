# Users API Requirements

This document specifies the exact data requirements for the Users List and Users Details APIs.

## 1. Users List API (`GET /users`)

### Purpose
Display users in a table with minimal data for performance.

### Request Parameters
- `page?: number` - Page number (default: 1)
- `limit?: number` - Items per page (default: 10)
- `search?: string` - Search by email
- `stage?: string` - Filter by stage code (e.g., "idea", "mvp", "early_revenue")
- `gender?: string` - Filter by gender ("m", "f", "o")
- `fields?: string` - **Comma-separated list of fields to return** (recommended)

### Required Fields for List View
When `fields` parameter is provided, backend should return **ONLY** these fields:

```
id,email,countryCode,countryName,stateCode,stateName,cityName,stage,isEmailVerified,isOnboardingCompleted,createdAt,updatedAt
```

### Field Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | ✅ Yes | User unique identifier |
| `email` | string \| null | ✅ Yes | User email address |
| `countryCode` | string | ✅ Yes | Country code (e.g., "AF") |
| `countryName` | string \| null | ✅ Yes | Country name (e.g., "Afghanistan") |
| `stateCode` | string \| null | ✅ Yes | State/Province code |
| `stateName` | string \| null | ✅ Yes | State/Province name |
| `cityName` | string \| null | ✅ Yes | City name |
| `stage` | object \| null | ✅ Yes | Stage information (see structure below) |
| `isEmailVerified` | boolean | ✅ Yes | Email verification status |
| `isOnboardingCompleted` | boolean | ✅ Yes | Onboarding completion status |
| `createdAt` | string (ISO) | ✅ Yes | Creation timestamp |
| `updatedAt` | string (ISO) | ✅ Yes | Last update timestamp |

### Stage Object Structure (for List)
```json
{
  "code": "idea" | "mvp" | "early_revenue",
  "label": "Idea / Concept" | "MVP / Prototype" | "Early Revenue"
}
```

### Example List Response
```json
{
  "statusCode": 200,
  "responseCode": "SUCCESS",
  "message": "Users fetched successfully",
  "data": {
    "data": [
      {
        "id": "55681435-f383-40d8-aca0-e3ba61a534ba",
        "email": "test4@gmail.com",
        "countryCode": "AF",
        "countryName": "Afghanistan",
        "stateCode": "BDS",
        "stateName": "Badakhshan",
        "cityName": "Ashkāsham",
        "stage": {
          "code": "idea",
          "label": "Idea / Concept"
        },
        "isEmailVerified": false,
        "isOnboardingCompleted": true,
        "createdAt": "2026-02-17T10:21:58.011Z",
        "updatedAt": "2026-02-17T10:22:22.249Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 7,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### Notes for List API
- **Do NOT include**: `fundingRange`, `teamSize`, `revenueStatus`, `incorporationStatus`, `emailVerifiedAt`, `termsAcceptedAt`, `onboardingCompletedAt`, `lastLoginAt`, `deletedAt`, `isDeleted`
- Keep response minimal for better performance
- Only include `stage` object (not individual stage fields)

---

## 2. Users Details API (`GET /users/:id`)

### Purpose
Display complete user information on the details page.

### Request Parameters
- `id` (URL param) - User UUID string

### Required Fields for Details View
Backend should return **ALL available user data** including:

### Core Fields
- `id` - string (UUID)
- `email` - string | null
- `countryCode` - string
- `countryName` - string | null
- `stateCode` - string | null
- `stateName` - string | null
- `cityName` - string | null

### Business Information (Complete Objects)
- `stage` - object | null
  ```json
  {
    "code": "idea" | "mvp" | "early_revenue",
    "label": "Idea / Concept" | "MVP / Prototype" | "Early Revenue"
  }
  ```
- `fundingRange` - object | null
  ```json
  {
    "code": "early" | "seed" | "growth",
    "label": "$0 - $500K" | "$500K - $2M" | "$2M+"
  }
  ```
- `teamSize` - object | null
  ```json
  {
    "code": "solo" | "2-5" | "6-10" | "11+",
    "label": "Solo founder" | "2-5" | "6-10" | "11+"
  }
  ```
- `revenueStatus` - object | null
  ```json
  {
    "code": "pre_revenue" | "early_revenue",
    "label": "Pre-revenue" | "Early revenue"
  }
  ```
- `incorporationStatus` - object | null
  ```json
  {
    "code": "not_incorporated" | "incorporated",
    "label": "Not incorporated" | "Incorporated"
  }
  ```

### Verification & Status Fields
- `isEmailVerified` - boolean
- `isOnboardingCompleted` - boolean
- `emailVerifiedAt` - string (ISO) | null
- `termsAcceptedAt` - string (ISO) | null
- `onboardingCompletedAt` - string (ISO) | null
- `lastLoginAt` - string (ISO) | null
- `isDeleted` - boolean
- `deletedAt` - string (ISO) | null

### Timestamps
- `createdAt` - string (ISO)
- `updatedAt` - string (ISO)

### Optional Additional Fields (if available)
- `profile` - object (user profile details)
- `address` - object (address information)
- `interactions` - object (user interactions stats)
- `subscriptions` - array (user subscriptions)
- `firstPlan` - object (primary subscription plan)

### Example Details Response
```json
{
  "statusCode": 200,
  "responseCode": "SUCCESS",
  "message": "User details fetched successfully",
  "data": {
    "id": "55681435-f383-40d8-aca0-e3ba61a534ba",
    "email": "test4@gmail.com",
    "countryCode": "AF",
    "countryName": "Afghanistan",
    "stateCode": "BDS",
    "stateName": "Badakhshan",
    "cityName": "Ashkāsham",
    "stage": {
      "code": "idea",
      "label": "Idea / Concept"
    },
    "fundingRange": {
      "code": "seed",
      "label": "$500K - $2M"
    },
    "teamSize": {
      "code": "2-5",
      "label": "2-5"
    },
    "revenueStatus": {
      "code": "early_revenue",
      "label": "Early revenue"
    },
    "incorporationStatus": {
      "code": "not_incorporated",
      "label": "Not incorporated"
    },
    "isEmailVerified": false,
    "isOnboardingCompleted": true,
    "emailVerifiedAt": null,
    "termsAcceptedAt": "2026-02-17T10:21:58.010Z",
    "onboardingCompletedAt": "2026-02-17T10:22:22.249Z",
    "lastLoginAt": null,
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-02-17T10:21:58.011Z",
    "updatedAt": "2026-02-17T10:22:22.249Z"
  }
}
```

### Notes for Details API
- **Include ALL business information objects** (stage, fundingRange, teamSize, revenueStatus, incorporationStatus)
- **Include ALL timestamps** (emailVerifiedAt, termsAcceptedAt, onboardingCompletedAt, lastLoginAt, deletedAt)
- Return complete user data for comprehensive view
- All business fields should be objects with `code` and `label` properties

---

## Summary

| Aspect | List API | Details API |
|--------|----------|-------------|
| **Fields Count** | ~12 fields | All available fields |
| **Business Info** | Only `stage` | All 5 objects (stage, fundingRange, teamSize, revenueStatus, incorporationStatus) |
| **Timestamps** | Only `createdAt`, `updatedAt` | All timestamps |
| **Performance** | Optimized (minimal data) | Complete data |
| **Use Case** | Table display | Detail page display |

---

## Backend Implementation Notes

1. **List API** should respect the `fields` query parameter and return only requested fields
2. **Details API** should always return complete user data regardless of any parameters
3. All business information fields (stage, fundingRange, etc.) should be objects with `code` and `label` properties
4. Use consistent field naming and structure across both endpoints
5. Handle `null` values gracefully for optional fields
