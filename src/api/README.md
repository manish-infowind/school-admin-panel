# API Integration Documentation

This directory contains the API integration layer for the admin panel, including services, hooks, and types for communicating with the backend.

## Services

### EnquiryService

The `EnquiryService` provides methods for managing enquiries through the API.

#### Methods

- `getEnquiries(params?)` - Fetch enquiries with pagination, search, and filters
- `getEnquiry(id)` - Get a single enquiry by ID
- `createEnquiry(data)` - Create a new enquiry
- `updateEnquiry(id, data)` - Update an enquiry
- `updateEnquiryStatus(id, status)` - Update enquiry status
- `toggleEnquiryStar(id, isStarred)` - Star/unstar an enquiry
- `updateAdminNotes(id, adminNotes)` - Update admin notes
- `deleteEnquiry(id)` - Delete an enquiry

#### Example Usage

```typescript
import { EnquiryService } from '@/api';

// Fetch enquiries with filters
const response = await EnquiryService.getEnquiries({
  page: 1,
  limit: 10,
  search: "Sarah",
  status: "new",
  category: "Product Inquiry"
});

// Update enquiry status
await EnquiryService.updateEnquiryStatus("enquiry-id", "replied");

// Toggle star
await EnquiryService.toggleEnquiryStar("enquiry-id", true);
```

## Hooks

### useEnquiries

The `useEnquiries` hook provides React state management for enquiries with built-in API integration.

#### Features

- Automatic data fetching
- Loading states
- Error handling
- Real-time updates
- Search and filtering
- Pagination support

#### Example Usage

```typescript
import { useEnquiries } from '@/api/hooks/useEnquiries';

function EnquiriesPage() {
  const {
    enquiries,
    selectedEnquiry,
    pagination,
    isLoading,
    isUpdating,
    error,
    fetchEnquiries,
    updateStatus,
    toggleStar,
    deleteEnquiry,
    setSelectedEnquiry,
  } = useEnquiries({
    autoFetch: true,
    limit: 10,
  });

  const handleStatusChange = async (id: string, status: string) => {
    await updateStatus(id, status);
  };

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        enquiries.map(enquiry => (
          <div key={enquiry.id}>
            {enquiry.fullName} - {enquiry.status}
            <button onClick={() => handleStatusChange(enquiry.id, "replied")}>
              Mark as Replied
            </button>
          </div>
        ))
      )}
    </div>
  );
}
```

## API Endpoints

The enquiries API supports the following endpoints:

- `GET /admin/enquiries` - List enquiries with query parameters
- `GET /admin/enquiries/:id` - Get single enquiry
- `PUT /admin/enquiries/:id` - Update enquiry
- `DELETE /admin/enquiries/:id` - Delete enquiry

### Query Parameters

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term for name, email, subject, or category
- `status` - Filter by status (new, replied, in-progress, closed)
- `category` - Filter by inquiry category

### Request/Response Examples

#### List Enquiries
```bash
curl -X GET "http://localhost:3000/admin/enquiries?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "success": true,
  "message": "Enquiries retrieved successfully",
  "data": {
    "enquiries": [...],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

#### Update Enquiry Status
```bash
curl -X PUT http://localhost:3000/admin/enquiries/65f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "replied"}'
```

## Types

The API types are defined in `types.ts` and include:

- `Enquiry` - Enquiry data structure
- `EnquiriesResponse` - Paginated response structure
- `CreateEnquiryRequest` - Request for creating enquiries
- `UpdateEnquiryRequest` - Request for updating enquiries

## Error Handling

All API calls include comprehensive error handling:

- Network errors
- Authentication errors
- Validation errors
- Server errors

Errors are automatically displayed as toast notifications and can be handled programmatically through the hook's error state.

## Loading States

The `useEnquiries` hook provides multiple loading states:

- `isLoading` - Initial data loading
- `isCreating` - Creating new enquiry
- `isUpdating` - Updating enquiry
- `isDeleting` - Deleting enquiry

These states can be used to show loading indicators and disable actions during API calls. 