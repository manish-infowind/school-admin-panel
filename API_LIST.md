## Admin Panel API Spec (descriptive)

This is a **backend-ready** API spec for the **current trimmed admin panel** (Login, Dashboard, Members, Profile, Settings).

### Base URL

- **Env var**: `VITE_API_BASE_URL`
- **Default** (see `src/api/config.ts`): `http://localhost:8000/admin`
- All paths below are **relative** to the base URL unless mentioned otherwise.

### Auth & response envelope (what the frontend expects)

- **Auth header**: `Authorization: Bearer <accessToken>`
  - Automatically attached by `src/api/client.ts` when `accessToken` exists in localStorage.

- **Canonical response envelope expected by UI code** (`src/api/types.ts`):

```json
{
  "success": true,
  "message": "optional message",
  "data": {}
}
```

- **Backend may return** `{ statusCode, message, data }`
  - `ApiClient` will normalize it into `{ success, message, data }`
  - If `statusCode` is not 2xx, `ApiClient` throws an error using `message`.

- **401 handling**
  - If request gets `401`, `ApiClient` tries `POST /auth/refresh` and retries the original request.
  - It **does not** refresh for URLs containing `/auth/login`, `/auth/refresh`, or `/password` (see `src/api/client.ts`).

### 1) Auth

#### POST `/login`

- **Purpose**: Admin login.
- **Auth**: no.
- **Request body** (`LoginRequest`):

```json
{
  "email": "admin@example.com",
  "password": "string"
}
```

- **Success response** (`LoginResponse`):

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "string",
    "email": "string",
    "is_super_admin": true,
    "permissions": [
      { "permissionName": "admin_management", "allowedActions": ["read", "update"] }
    ],
    "roles": [
      { "id": 1, "roleName": "super_admin", "description": "optional" }
    ],
    "tokens": {
      "accessToken": "jwt",
      "refreshToken": "jwt",
      "accessTokenExpiresAt": "ISO",
      "refreshTokenExpiresAt": "ISO",
      "expiresIn": 3600,
      "tokenType": "Bearer"
    },
    "sessionId": "string"
  }
}
```

- **Frontend side effects**:
  - stores `accessToken`, `refreshToken`, `sessionId`, `user` into localStorage (see `src/api/services/authService.ts`).

#### POST `/auth/logout`

- **Purpose**: Logout + invalidate token server-side.
- **Auth**: yes.
- **Request body**: `{}` (empty).
- **Success response**: `ApiResponse<any>` (message is shown in UI sometimes).

#### POST `/auth/refresh`

- **Purpose**: issue new access token using refresh token.
- **Auth**: no (refresh token in body).
- **Request body**:

```json
{ "refreshToken": "jwt" }
```

- **Success response** (`RefreshTokenResponse`):

```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "jwt",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "admin",
      "profilePic": "string",
      "fullName": "string",
      "phone": "string",
      "address": "string"
    }
  }
}
```

#### POST `/auth/verify-2fa`

- **Status**: present in config (`Verify2FARequest` exists), but **not used** by current UI flows.
- **Request body** (`Verify2FARequest`):

```json
{ "otp": "string", "tempToken": "string" }
```

### 2) Password (global endpoints)

Used by `src/api/services/passwordService.ts`.

#### POST `/forgot-password`

- **Purpose**: start reset flow (send email/link).
- **Auth**: no.
- **Body** (`ForgotPasswordRequest`):

```json
{ "email": "user@example.com" }
```

- **Response** (`ForgotPasswordResponse`):

```json
{ "success": true, "message": "optional", "data": { "message": "..." } }
```

#### POST `/reset-password`

- **Purpose**: reset using token.
- **Auth**: no.
- **Body** (`ResetPasswordRequest`):

```json
{ "token": "string", "newPassword": "string", "confirmPassword": "string" }
```

- **Response** (`ResetPasswordResponse`):

```json
{ "success": true, "message": "optional", "data": { "message": "..." } }
```

#### POST `/change-password`

- **Purpose**: change password using current password (authenticated).
- **Auth**: yes.
- **Body** (`ChangePasswordRequest` in `src/api/types.ts`):

```json
{ "currentPassword": "string", "newPassword": "string", "confirmPassword": "string" }
```

- **Response** (`ChangePasswordResponse`):

```json
{ "success": true, "message": "optional", "data": { "message": "..." } }
```

### 3) Dashboard

All implemented in `src/api/services/dashboardService.ts`.

#### GET `/dashboard/stats/summary`

- **Purpose**: small cards at top of dashboard (unfiltered).
- **Auth**: yes.
- **Response** (`DashboardStatsSummary`):
  - `totalUsers: number`
  - `dailyActiveUsers: number`
  - `monthlyActiveUsers: number`
  - `userGrowthThisMonth: number` (can be negative, percentage)
  - `newUsersThisMonth: number`
  - `swipeToMatchRate: number`
  - `lastUpdated: string` (ISO)

#### Analytics endpoints (charts)

All are **GET** and accept query params:

- **Common query**
  - `timeRange`: `daily | weekly | monthly | custom`
  - If `daily|weekly`: `month` (0-11), `year` (YYYY)
  - If `monthly`: `years=YYYY` (repeatable)
  - If `custom`: `startDate`, `endDate` (ISO)

##### GET `/dashboard/analytics/user-growth`

- **Extra query**: `gender` optional (`m|f`)
- **Response** (`UserGrowthResponse`):
  - `userGrowth: Array<{ date: string; users: number; newUsers: number }>`
  - `metadata: { totalRecords; startDate; endDate; timeRange; selectedYears? }`

##### GET `/dashboard/analytics/user-growth/sync`

- **Query**: `date=YYYY-MM-DD` optional
- **Response** (`UserGrowthSyncResponse`):
  - `date: string`
  - `synced: boolean`
  - `externalServiceResponse?: any`

##### GET `/dashboard/analytics/active-users`

- **Extra query**: `gender` optional (`m|f`)
- **Response** (`ActiveUsersResponse`):
  - `activeUsers: Array<{ date: string; dailyActive: number; monthlyActive: number }>`
  - `metadata: { totalRecords; startDate; endDate; timeRange; selectedYears? }`

##### GET `/dashboard/analytics/conversions`

- **Extra query**:
  - `conversionType`: `subscription | message-before-match | likes | matches | gifts`
  - `gender` optional (`m|f`) only for `likes|gifts`
- **Response** (`ConversionAnalyticsResponse`):
  - `conversions: Array<{ metric: string; date: string; value: number; percentage: number }>`
  - `metadata: { timeRange; startDate; endDate; conversionType; selectedYears?; gender? }`

##### GET `/dashboard/analytics/revenue`

- **Extra query**: `gender` optional (`m|f`)
- **Response** (`RevenueAnalyticsResponse`):
  - `revenueAnalytics: Array<{ date: string; averageRevenuePerUser: number; averageRevenuePerPayingUser: number; freeToPaidRate: number; churnRate: number; averageLtv?: number }>`
  - `metadata: { totalRecords; startDate; endDate; timeRange; selectedYears?; yearlyAverageLtv?; monthlyAverageLtv? }`

##### GET `/dashboard/analytics/conversation-analytics`

- **Response** (`ConversationAnalyticsResponse`):
  - `conversationAnalytics: Array<{ date: string; conversationInitiationRate: number; messagesPerMatch: number; ghostingRate: number; swipeToMatchRate?: number }>`
  - `metadata: { totalRecords; startDate; endDate; timeRange; selectedYears? }`

##### GET `/dashboard/analytics/app-store-install-stats`

- **Response** (`AppStoreInstallStatsResponse`):
  - `installStats: Array<{ date: string; signupPercentage: number; iosInstalls?; iosSignups?; androidInstalls?; androidSignups?; totalInstalls?; totalSignups? }>`
  - `metadata?: { totalRecords; startDate; endDate; timeRange; selectedYears? }`

##### GET `/dashboard/analytics/safety-metrics`

- **Response** (`SafetyMetricsResponse`):
  - `safetyMetrics: Array<{ date: string; reportRate: number|string; moderationBacklog: number; banRate: number|string; totalReports?; totalBannedAccounts? }>`
  - `metadata: { totalRecords; startDate; endDate; timeRange; selectedYears? }`

#### Active users map

##### GET `/api/active-users-map`

- **Auth**: yes.
- **Query**: `timeWindow=<minutes>` optional
- **Response**: GeoJSON FeatureCollection (`ActiveUsersMapResponse`)
  - Feature properties used in UI:
    - `count: number`
    - `city: string`
    - optional: `conversionRate`, `paidUsers`, `freeUsers`, `paidToFreeRatio`

### 4) Members (System Users)

All implemented in `src/api/services/userManagementService.ts`.

#### GET `/users`

- **Purpose**: members list (table) - **returns minimal fields only**.
- **Auth**: yes.
- **Query** (`UserListParams`):
  - `page?: number`
  - `limit?: number`
  - `search?: string`
  - `stage?: string | number` (filter by stageId or stageCode, e.g., "1", "2", "3" or "idea", "mvp", "early_revenue")
  - `gender?: "m" | "f" | "o"`
  - `status?: string` (legacy support, deprecated in favor of `stage`)
  - `fields?: string` (comma-separated list of fields to return - **frontend requests only required fields for list view**)
- **Response** (actual backend structure):
  - Backend returns: `{ statusCode: 200, responseCode: "SUCCESS", message: string, data: { data: UserListItem[], pagination: {...} } }`
  - Frontend expects: `{ success: true, data: { data: UserListItem[], pagination: {...} } }`
  - `pagination: { page; limit; total; totalPages; hasNextPage; hasPrevPage }`

**Frontend requests minimal fields for list** (via `fields` parameter):
  - `id,email,countryCode,countryName,stateCode,stateName,cityName,stage,isEmailVerified,isOnboardingCompleted,createdAt,updatedAt`

**Backend may return** (depending on `fields` parameter):
  - **Minimal fields** (when `fields` is specified): Only requested fields
  - **All fields** (when `fields` is not specified): Full user object including:
    - `id: string` (UUID)
    - `email: string | null`
    - `countryCode: string`, `countryName: string | null`
    - `stateCode: string | null`, `stateName: string | null`
    - `cityName: string | null`
    - `stage: { code: string, label: string } | null`
    - `fundingRange: { code: string, label: string } | null`
    - `teamSize: { code: string, label: string } | null`
    - `revenueStatus: { code: string, label: string } | null`
    - `incorporationStatus: { code: string, label: string } | null`
    - `isEmailVerified: boolean`
    - `isOnboardingCompleted: boolean`
    - `emailVerifiedAt: string | null`
    - `termsAcceptedAt: string | null`
    - `onboardingCompletedAt: string | null`
    - `lastLoginAt: string | null`
    - `isDeleted: boolean`, `deletedAt: string | null`
    - `createdAt: string`, `updatedAt: string`

**Example response:**
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
        "stageId": 1,
        "stageLabel": "Idea / Concept",
        "stageCode": "idea",
        "fundingRangeId": 2,
        "teamSizeId": 2,
        "revenueStatusId": 2,
        "incorporationStatusId": 1,
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

#### GET `/users/:id`

- **Purpose**: member detail page - **returns complete user data**.
- **Auth**: yes.
- **URL param**: `id` is a UUID string (not a number).
- **Response**: `UserDetails` (full user object) including:
  - All fields from `UserListItem` (see above)
  - **Complete business information**: `stage`, `fundingRange`, `teamSize`, `revenueStatus`, `incorporationStatus` (all with full `code` and `label`)
  - **Additional fields** (if available): `isPausedByUser: boolean`, `profile`, `address`, `interactions`, `subscriptions`, `firstPlan`
  - **Note**: This endpoint should return **all available user data**, unlike the list endpoint which returns minimal fields.

#### PUT `/users/:id`

- **Purpose**: edit member (business fields + verification switches).
- **Auth**: yes.
- **URL param**: `id` is a UUID string (not a number).
- **Body** (`UpdateUserRequest`, all optional):
  - Business fields: `stageId`, `fundingRangeId`, `teamSizeId`, `revenueStatusId`, `incorporationStatusId`
  - Location fields: `countryCode`, `stateCode`, `cityName`
  - Verification fields: `isEmailVerified`, `isOnboardingCompleted`
  - Legacy fields (for backward compatibility): `firstName`, `lastName`, `email`, `phone`, `dob`, `gender`, `isPhoneVerified`, `isFaceVerified`, `isAccountPaused`, `accountCurrentStatus`
- **Response**: updated `UserDetails`

#### PUT `/users/:id/pause`

- **Purpose**: pause/unpause.
- **Auth**: yes.
- **URL param**: `id` is a UUID string (not a number).
- **Body**: none.
- **Response data**:

```json
{ "id": "uuid-string", "isAccountPaused": true, "updatedAt": "ISO" }
```

#### DELETE `/users/:id`

- **Purpose**: delete (soft delete in UI).
- **Auth**: yes.
- **URL param**: `id` is a UUID string (not a number).
- **Body** (`DeleteUserRequest`, optional):

```json
{ "deletionReason": "optional string" }
```

- **Response**: `ApiResponse<null>`

#### PUT `/users/:id/ban`

- **Purpose**: ban user.
- **Auth**: yes.
- **URL param**: `id` is a UUID string (not a number).
- **Body** (as used by UI):

```json
{
  "actionType": "ban",
  "reasonCode": "string (<=100)",
  "reason": "string optional (<=1000)",
  "relatedReportId": 123,
  "expiresAt": "ISO optional"
}
```

- **Response**: `ApiResponse<null>`

#### PUT `/users/:id/unban`

- **Purpose**: unban user.
- **Auth**: yes.
- **URL param**: `id` is a UUID string (not a number).
- **Body**: none.
- **Response**: `ApiResponse<null>`

#### GET `/users/:id/moderation-actions`

- **Purpose**: fetch latest moderation actions (UI uses it to display ban details).
- **Auth**: yes.
- **URL param**: `id` is a UUID string (not a number).
- **Response**: `ApiResponse<any>`
  - UI tries to read `data.actions` **or** `data.data.actions`.
  - Recommended backend shape:

```json
{
  "success": true,
  "data": {
    "actions": [
      {
        "type": "ban",
        "status": "active",
        "reasonCode": "string",
        "reason": "string optional",
        "relatedReportId": 123,
        "createdAt": "ISO",
        "expiresAt": "ISO or null"
      }
    ]
  }
}
```

### 5) Admin Profile (Profile page)

Implemented in `src/api/services/profileService.ts`.
Most endpoints can include `?userId=<id>` (frontend reads from `localStorage.user.id`).

#### GET `/admin-profile`

- **Purpose**: load profile.
- **Auth**: yes.
- **Response data** (`UserProfile` in `profileService.ts`):
  - `firstName?`, `lastName`, `email`, `phone`, `location?`, `bio?`, `avatar`, `role`
  - `joinDate`, `lastLogin`, `isActive`, `twoFactorEnabled`
  - optional `lastPasswordChange` object

#### PUT `/admin-profile`

- **Purpose**: update profile info.
- **Auth**: yes.
- **Body** (`UpdateProfileRequest`):
  - `firstName`, `lastName`, `email`, `phone`, `location?`, `bio?`
- **Response**: updated profile object

#### POST `/admin-profile/avatar`

- **Purpose**: upload avatar.
- **Auth**: yes.
- **Body**: `multipart/form-data` with `file`.
- **Response data**:
  - `{ avatar: string; avatarUrl: string }` (or equivalent)

#### PUT `/admin-profile/password`

- **Purpose**: change password (profile flow).
- **Auth**: yes.
- **Body**:
  - `{ currentPassword, newPassword, confirmPassword }`
- **Response**: success/message (OTP behavior depends on backend; frontend also supports non-OTP success)

#### POST `/admin-profile/password/verify-otp`

- **Body**: `{ otp: string, newPassword: string }`
- **Response**: success/message

#### POST `/admin-profile/password/reset-request`

- **Body**: `{ email: string }`

#### POST `/admin-profile/password/reset`

- **Body**: `{ token: string, password: string, confirmPassword: string }`

#### PUT `/admin-profile/preferences`

- **Body**: `UpdatePreferencesRequest` (theme/language/notifications flags)

#### GET `/admin-profile/activity`

- **Query**: `page`, `limit`
- **Response data**: array of `UserActivity`

#### 2FA

- **POST** `/admin-profile/2fa/setup` (sends OTP)
- **POST** `/admin-profile/2fa/enable` body `{ otp: string }`
- **POST** `/admin-profile/2fa/disable` body `{ otp: string }`

### 6) Site Settings (Settings page)

Implemented in `src/api/services/siteSettingsService.ts`.

#### POST `/site-settings/initialize`

- **Purpose**: create/seed settings record.
- **Auth**: yes.
- **Response**: `SiteSettings`

#### GET `/site-settings/main`

- **Purpose**: load current settings.
- **Auth**: yes.
- **Response** (`SiteSettings`):
  - `siteName`, `siteUrl`, `siteDescription?`
  - `businessEmail`, `adminEmail`, `timezone?`, `contactNumber`
  - `businessAddress` (`BusinessAddress`)
  - `businessHours?`
  - `socialMedia` (facebook/twitter/linkedin/instagram)
  - `logoUrl?`, `faviconUrl?`, `isActive?`, timestamps optional

#### PUT `/site-settings/main`

- **Purpose**: update settings.
- **Auth**: yes.
- **Body**: `Partial<SiteSettings>`
  - Frontend normalizes `siteDescription` and `businessHours` to `""` (never null).
- **Response**: updated `SiteSettings`

### Legacy helper files present

These exist but are **not used** by current UI flows:

- `src/api/services/authApis/loginApi.tsx`
- `src/api/services/authApis/changePasswordApi.tsx`
- `src/api/services/authApis/verifyOtp.tsx`
- `src/api/services/authApis/2faApi.tsx`

`src/api/services/authApis/logoutApi.tsx` **is used** by UI logout (it posts to `/auth/logout`).

