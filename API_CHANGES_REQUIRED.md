# API Changes Required for Admin Management

## Summary

The frontend now requires the following changes to the backend API for the Admin Management module:

1. **Password Validation** - Already implemented (backend returns validation errors)
2. **Country Code Field** - Required field in Create/Update Admin
3. **Role Assignment** - Must be done separately after admin creation
4. **Permission Assignment** - Must be done separately after admin creation
5. **Validation Rule** - Either role OR individual permissions must be assigned (at least one)

---

## 1. Create Admin API - Add `countryCode` Field

### Current Request:
```json
{
  "username": "jane_doe",
  "email": "jane@example.com",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "admin",
  "phone": "1234567890",
  "location": "Los Angeles, USA",
  "bio": "New administrator",
  "permissions": ["admin_management", "role_management"],
  "isActive": true
}
```

### Updated Request (Add `countryCode`):
```json
{
  "username": "jane_doe",
  "email": "jane@example.com",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "admin",
  "phone": "1234567890",
  "countryCode": "+1",  // ← NEW REQUIRED FIELD
  "location": "Los Angeles, USA",
  "bio": "New administrator",
  "permissions": ["admin_management", "role_management"],
  "isActive": true
}
```

**Validation:**
- `countryCode` is **required**
- Format: Must start with `+` followed by digits (e.g., `+1`, `+91`, `+44`)
- Examples: `+1`, `+91`, `+44`, `+33`

---

## 2. Update Admin API - Add `countryCode` Field

### Current Request:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "9876543210",
  "location": "San Francisco, USA",
  "bio": "Updated bio",
  "permissions": ["admin_management", "role_management", "permission_management"],
  "isActive": true
}
```

### Updated Request (Add `countryCode`):
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "9876543210",
  "countryCode": "+1",  // ← NEW OPTIONAL FIELD
  "location": "San Francisco, USA",
  "bio": "Updated bio",
  "permissions": ["admin_management", "role_management", "permission_management"],
  "isActive": true
}
```

**Note:** `countryCode` is optional in update (can be omitted if not changing)

---

## 3. Admin Response - Include `countryCode` Field

### Current Response:
```json
{
  "id": "uuid",
  "username": "jane_doe",
  "email": "jane@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "admin",
  "phone": "1234567890",
  "location": "Los Angeles, USA",
  "bio": "New administrator",
  "profilePic": null,
  "isActive": true,
  "twoFactorEnabled": false,
  "permissions": ["admin_management", "role_management"],
  "roles": [],
  "lastLogin": null,
  "createdAt": "2024-12-17T10:30:00.000Z",
  "updatedAt": "2024-12-17T10:30:00.000Z"
}
```

### Updated Response (Add `countryCode`):
```json
{
  "id": "uuid",
  "username": "jane_doe",
  "email": "jane@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "admin",
  "phone": "1234567890",
  "countryCode": "+1",  // ← NEW FIELD
  "location": "Los Angeles, USA",
  "bio": "New administrator",
  "profilePic": null,
  "isActive": true,
  "twoFactorEnabled": false,
  "permissions": ["admin_management", "role_management"],
  "roles": [],
  "lastLogin": null,
  "createdAt": "2024-12-17T10:30:00.000Z",
  "updatedAt": "2024-12-17T10:30:00.000Z"
}
```

---

## 4. Role and Permission Assignment Flow

### Current Flow (What Frontend Does):
1. User creates admin via `POST /admin/admin-management`
2. **After successful creation**, frontend calls:
   - `POST /admin/roles/assign` (if role is selected)
   - `POST /admin/permissions/assign` (if permissions are selected)

### Backend Requirements:

#### Option A: Keep Separate Endpoints (Recommended)
- Keep `POST /admin/roles/assign` and `POST /admin/permissions/assign` as separate endpoints
- Frontend will call them sequentially after admin creation
- **No changes needed** - this is already implemented

#### Option B: Support Assignment in Create Request (Alternative)
- Allow `roleId` and `permissionIds` in the create request
- Backend assigns them after creating the admin
- **This would require API changes**

**Recommendation:** Use Option A (separate endpoints) as it's already implemented and more flexible.

---

## 5. Validation Rule: Role OR Permissions Required

### New Business Rule:
**When creating an admin, at least ONE of the following must be assigned:**
- A role (via `POST /admin/roles/assign`)
- Individual permissions (via `POST /admin/permissions/assign`)

### Implementation Options:

#### Option 1: Frontend Validation Only (Current)
- Frontend validates before submission
- Backend doesn't enforce this rule
- **Status:** Already implemented in frontend

#### Option 2: Backend Validation (Recommended)
- Backend validates after admin creation
- If no role AND no permissions assigned, return warning/error
- **Requires:** Backend to check after admin creation or during a validation endpoint

**Recommendation:** Implement Option 2 for data integrity, but Option 1 is acceptable for now.

---

## 6. Password Validation Error Format

### Current Error Response:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "origin": "string",
      "code": "invalid_format",
      "format": "regex",
      "pattern": "/[A-Z]/",
      "path": ["password"],
      "message": "Password must contain at least one uppercase letter"
    },
    {
      "origin": "string",
      "code": "invalid_format",
      "format": "regex",
      "pattern": "/[0-9]/",
      "path": ["password"],
      "message": "Password must contain at least one number"
    },
    {
      "origin": "string",
      "code": "invalid_format",
      "format": "regex",
      "pattern": "/[!@#$%^&*]/",
      "path": ["password"],
      "message": "Password must contain at least one special character (!@#$%^&*)"
    },
    {
      "expected": "string",
      "code": "invalid_type",
      "path": ["countryCode"],
      "message": "Invalid input: expected string, received undefined"
    }
  ]
}
```

**Status:** ✅ Already implemented correctly

---

## 7. Summary of Required Changes

### Must Implement:
1. ✅ **Add `countryCode` field to Create Admin request** (required)
2. ✅ **Add `countryCode` field to Update Admin request** (optional)
3. ✅ **Include `countryCode` in Admin response** (all endpoints)
4. ✅ **Validate `countryCode` format** (must start with `+`)

### Already Implemented (No Changes Needed):
1. ✅ Password validation with detailed error messages
2. ✅ Role assignment endpoint (`POST /admin/roles/assign`)
3. ✅ Permission assignment endpoint (`POST /admin/permissions/assign`)

### Optional (Recommended):
1. ⚠️ **Backend validation for role/permission requirement** (at least one must be assigned)
2. ⚠️ **Support `roleId` and `permissionIds` in create request** (alternative to separate endpoints)

---

## 8. Database Schema Changes

### Add `countryCode` Column to Admin Table:

```sql
ALTER TABLE admin_users 
ADD COLUMN country_code VARCHAR(10) NOT NULL DEFAULT '+1';

-- Or if you want it nullable:
ALTER TABLE admin_users 
ADD COLUMN country_code VARCHAR(10);

-- Add validation constraint
ALTER TABLE admin_users 
ADD CONSTRAINT check_country_code_format 
CHECK (country_code ~ '^\+[0-9]+$');
```

---

## 9. Testing Checklist

- [ ] Create admin with `countryCode` field
- [ ] Create admin without `countryCode` (should fail validation)
- [ ] Create admin with invalid `countryCode` format (should fail validation)
- [ ] Update admin with `countryCode` field
- [ ] Get admin list includes `countryCode` in response
- [ ] Get admin details includes `countryCode` in response
- [ ] Role assignment works after admin creation
- [ ] Permission assignment works after admin creation
- [ ] Password validation errors are returned correctly
- [ ] All existing functionality still works

---

## 10. Example API Calls

### Create Admin with Country Code:
```bash
curl -X POST http://localhost:8000/admin/admin-management \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "username": "jane_doe",
    "email": "jane@example.com",
    "password": "SecurePass123!",
    "firstName": "Jane",
    "lastName": "Doe",
    "role": "admin",
    "phone": "1234567890",
    "countryCode": "+1",
    "location": "Los Angeles, USA",
    "bio": "New administrator",
    "isActive": true
  }'
```

### Assign Role After Creation:
```bash
curl -X POST http://localhost:8000/admin/roles/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "adminId": "created-admin-uuid",
    "roleId": 1
  }'
```

### Assign Permissions After Creation:
```bash
curl -X POST http://localhost:8000/admin/permissions/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "adminId": "created-admin-uuid",
    "permissionIds": [1, 2, 3]
  }'
```

---

## Questions?

If you have any questions about these requirements, please refer to:
- `ADMIN_MANAGEMENT_BACKEND_REQUIREMENTS.md` - Full API documentation
- Frontend code in `src/pages/admin/AdminManagement.tsx`

