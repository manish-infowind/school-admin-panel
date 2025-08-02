# Campaign API CURL Commands

This document contains all the CURL commands for the Campaign Management API endpoints.

## Base URL
```
http://localhost:3000
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 1. Get All Campaigns

### Get all campaigns with pagination
```bash
curl -X GET "http://localhost:3000/admin/campaigns?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Get campaigns by status
```bash
curl -X GET "http://localhost:3000/admin/campaigns?status=scheduled" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Available statuses:** `draft`, `scheduled`, `running`, `completed`, `failed`, `cancelled`

### Get campaigns by type
```bash
curl -X GET "http://localhost:3000/admin/campaigns?type=email" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Available types:** `email`, `sms`, `push`

### Search campaigns
```bash
curl -X GET "http://localhost:3000/admin/campaigns?search=welcome" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Get campaigns with date range
```bash
curl -X GET "http://localhost:3000/admin/campaigns?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 2. Get Campaign Statistics

```bash
curl -X GET "http://localhost:3000/admin/campaigns/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response includes:**
- Total campaigns count
- Campaigns by status
- Total emails sent/failed
- Average open/click rates

---

## 3. Get Single Campaign

```bash
curl -X GET "http://localhost:3000/admin/campaigns/CAMPAIGN_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 4. Create New Campaign

### Basic campaign (draft)
```bash
curl -X POST "http://localhost:3000/admin/campaigns" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Welcome Campaign",
    "subject": "Welcome to Our Platform!",
    "content": "<h1>Welcome!</h1><p>Thank you for joining our platform. We are excited to have you on board!</p>",
    "type": "email",
    "sendInterval": 2,
    "maxRetries": 3,
    "includeUnsubscribed": false,
    "notes": "Welcome campaign for new users"
  }'
```

### Scheduled campaign
```bash
curl -X POST "http://localhost:3000/admin/campaigns" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Holiday Promotion",
    "subject": "Special Holiday Offers!",
    "content": "<h1>Holiday Special!</h1><p>Get amazing discounts this holiday season!</p>",
    "type": "email",
    "scheduledAt": "2024-12-25T10:00:00.000Z",
    "sendInterval": 3,
    "maxRetries": 3,
    "includeUnsubscribed": false,
    "notes": "Holiday promotion campaign"
  }'
```

### SMS campaign
```bash
curl -X POST "http://localhost:3000/admin/campaigns" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SMS Notification",
    "subject": "Important Update",
    "content": "Your order has been shipped and will arrive tomorrow!",
    "type": "sms",
    "sendInterval": 1,
    "maxRetries": 2,
    "includeUnsubscribed": false,
    "notes": "Order shipping notification"
  }'
```

### Push notification campaign
```bash
curl -X POST "http://localhost:3000/admin/campaigns" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "App Update",
    "subject": "New Features Available",
    "content": "Check out our latest app update with exciting new features!",
    "type": "push",
    "sendInterval": 1,
    "maxRetries": 1,
    "includeUnsubscribed": false,
    "notes": "App update notification"
  }'
```

---

## 5. Update Campaign

```bash
curl -X PUT "http://localhost:3000/admin/campaigns/CAMPAIGN_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Campaign Name",
    "subject": "Updated Subject",
    "content": "<h1>Updated Content</h1><p>This is the updated campaign content.</p>",
    "scheduledAt": "2024-12-26T15:00:00.000Z",
    "sendInterval": 5,
    "notes": "Updated campaign notes"
  }'
```

---

## 6. Delete Campaign

```bash
curl -X DELETE "http://localhost:3000/admin/campaigns/CAMPAIGN_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 7. Run Campaign Immediately

### Run with enquiry emails (default)
```bash
curl -X POST "http://localhost:3000/admin/campaigns/CAMPAIGN_ID/run" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Run with custom emails
```bash
curl -X POST "http://localhost:3000/admin/campaigns/CAMPAIGN_ID/run" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customEmails": [
      "user1@example.com",
      "user2@example.com",
      "user3@example.com"
    ]
  }'
```

---

## 8. Cancel Campaign

```bash
curl -X POST "http://localhost:3000/admin/campaigns/CAMPAIGN_ID/cancel" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 9. Update Campaign Status

```bash
curl -X PATCH "http://localhost:3000/admin/campaigns/CAMPAIGN_ID/status" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "scheduled"
  }'
```

**Available statuses:** `draft`, `scheduled`, `running`, `completed`, `failed`, `cancelled`

---

## Complete Example Workflow

### 1. Create a campaign
```bash
curl -X POST "http://localhost:3000/admin/campaigns" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product Launch",
    "subject": "New Product Available!",
    "content": "<h1>Exciting News!</h1><p>Our new product is now available. Check it out!</p>",
    "type": "email",
    "scheduledAt": "2024-12-20T09:00:00.000Z",
    "sendInterval": 2,
    "maxRetries": 3,
    "notes": "Product launch announcement"
  }'
```

### 2. Get the campaign ID from response and run it immediately
```bash
curl -X POST "http://localhost:3000/admin/campaigns/CAMPAIGN_ID_FROM_RESPONSE/run" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 3. Check campaign status
```bash
curl -X GET "http://localhost:3000/admin/campaigns/CAMPAIGN_ID_FROM_RESPONSE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 4. View campaign statistics
```bash
curl -X GET "http://localhost:3000/admin/campaigns/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Campaign Status Flow

1. **Draft** → Campaign created but not ready to run
2. **Scheduled** → Campaign scheduled for future execution
3. **Running** → Campaign is currently sending emails
4. **Completed** → Campaign finished successfully
5. **Failed** → Campaign failed during execution
6. **Cancelled** → Campaign was cancelled

---

## Email Sending Behavior

- **Rate Limiting**: Emails are sent every 2 seconds by default (configurable)
- **Retry Logic**: Failed emails are retried up to 3 times by default
- **Recipient Source**: By default, emails are sent to all unique emails from the enquiry table
- **Custom Recipients**: You can override with custom email list when running
- **Background Processing**: Email sending runs in background, doesn't block the API

---

## Error Handling

All endpoints return consistent error responses:
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

Common error scenarios:
- Campaign not found
- Invalid campaign status transitions
- No recipient emails found
- Campaign already running/completed
- Invalid scheduled date

---

## Response Examples

### Successful Campaign Creation
```json
{
  "success": true,
  "data": {
    "id": "camp_123456789",
    "name": "Welcome Campaign",
    "subject": "Welcome to Our Platform!",
    "content": "<h1>Welcome!</h1><p>Thank you for joining our platform!</p>",
    "type": "email",
    "status": "draft",
    "sendInterval": 2,
    "maxRetries": 3,
    "includeUnsubscribed": false,
    "notes": "Welcome campaign for new users",
    "stats": {
      "totalRecipients": 0,
      "sent": 0,
      "failed": 0,
      "opened": 0,
      "clicked": 0,
      "unsubscribed": 0
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "createdBy": "admin_123"
  },
  "message": "Campaign created successfully"
}
```

### Campaign Statistics Response
```json
{
  "success": true,
  "data": {
    "total": 25,
    "draft": 5,
    "scheduled": 8,
    "running": 2,
    "completed": 8,
    "failed": 1,
    "cancelled": 1,
    "totalEmailsSent": 15420,
    "totalEmailsFailed": 156,
    "averageOpenRate": 23.5,
    "averageClickRate": 4.2
  }
}
```

### Campaign List Response
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": "camp_123456789",
        "name": "Welcome Campaign",
        "subject": "Welcome to Our Platform!",
        "type": "email",
        "status": "completed",
        "stats": {
          "totalRecipients": 1250,
          "sent": 1245,
          "failed": 5,
          "opened": 293,
          "clicked": 52,
          "unsubscribed": 3
        },
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Testing with Sample Data

### Create a test campaign
```bash
curl -X POST "http://localhost:3000/admin/campaigns" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Campaign",
    "subject": "Test Email Subject",
    "content": "<h1>Test Email</h1><p>This is a test email campaign.</p><p>Click <a href=\"https://example.com\">here</a> to visit our website.</p>",
    "type": "email",
    "sendInterval": 1,
    "maxRetries": 2,
    "includeUnsubscribed": false,
    "notes": "Test campaign for development"
  }'
```

### Run the test campaign immediately
```bash
curl -X POST "http://localhost:3000/admin/campaigns/CAMPAIGN_ID/run" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customEmails": [
      "test1@example.com",
      "test2@example.com"
    ]
  }'
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Email content supports HTML formatting
- Campaigns can be scheduled for future execution
- The system automatically handles rate limiting and retries
- Failed emails are logged and can be retried
- Campaign statistics are updated in real-time
- The system uses enquiry emails as the default recipient list
- Custom email lists can be provided when running campaigns 