# API Requirements: User Growth Analytics

## Overview
This document outlines the API requirements for the User Growth Analytics feature in the Admin Dashboard. This API will provide user growth data (total users and new users) for different time ranges and date selections.

---

## 1. Endpoint Details

### Base URL
```
GET /api/dashboard/analytics/user-growth
```

### Authentication
- **Required**: Yes
- **Method**: Bearer Token (JWT)
- **Header**: `Authorization: Bearer <token>`

---

## 2. Request Parameters

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `timeRange` | string | Yes | Time aggregation type | `daily`, `weekly`, `monthly`, `custom` |
| `startDate` | string (ISO 8601) | Conditional* | Start date for data range | `2024-01-01T00:00:00.000Z` |
| `endDate` | string (ISO 8601) | Conditional* | End date for data range | `2024-01-31T23:59:59.999Z` |
| `month` | number | Conditional** | Month index (0-11) for daily/weekly | `0` (January) |
| `year` | number | Conditional** | Year for daily/weekly | `2024` |
| `years` | number[] | Conditional*** | Array of years for monthly comparison | `[2023, 2024, 2025]` |

**Conditional Requirements:**
- *Required when `timeRange` is `custom`
- **Required when `timeRange` is `daily` or `weekly`
- ***Required when `timeRange` is `monthly` (can be single or multiple years)

---

## 3. Request Examples

### Example 1: Daily View (Specific Month/Year)
```http
GET /api/dashboard/analytics/user-growth?timeRange=daily&month=0&year=2024
```

**Description**: Get daily user growth data for January 2024

---

### Example 2: Weekly View (Specific Month/Year)
```http
GET /api/dashboard/analytics/user-growth?timeRange=weekly&month=0&year=2024
```

**Description**: Get weekly user growth data for January 2024

---

### Example 3: Monthly View (Single Year)
```http
GET /api/dashboard/analytics/user-growth?timeRange=monthly&years=2024
```

**Description**: Get monthly user growth data for the entire year 2024

---

### Example 4: Monthly View (Multiple Years Comparison)
```http
GET /api/dashboard/analytics/user-growth?timeRange=monthly&years=2023&years=2024&years=2025
```

**Description**: Get monthly user growth data comparing 2023, 2024, and 2025

**Note**: For multiple years, repeat the `years` parameter or send as array in POST body

---

### Example 5: Custom Date Range
```http
GET /api/dashboard/analytics/user-growth?timeRange=custom&startDate=2024-01-01T00:00:00.000Z&endDate=2024-03-31T23:59:59.999Z
```

**Description**: Get user growth data for custom date range (Q1 2024)

---

## 4. Response Structure

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "userGrowth": [
      {
        "date": "Jan 01, 2024",
        "users": 1250,
        "newUsers": 45
      },
      {
        "date": "Jan 02, 2024",
        "users": 1295,
        "newUsers": 38
      }
    ],
    "metadata": {
      "totalRecords": 31,
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z",
      "timeRange": "daily"
    }
  },
  "message": "User growth data retrieved successfully"
}
```

### Response Fields

#### `userGrowth` Array
| Field | Type | Description | Format |
|-------|------|-------------|--------|
| `date` | string | Date identifier | See Date Format section below |
| `users` | number | Total cumulative users up to this date | Integer ≥ 0 |
| `newUsers` | number | New users added on this date/period | Integer ≥ 0 |

#### `metadata` Object
| Field | Type | Description |
|-------|------|-------------|
| `totalRecords` | number | Total number of data points returned |
| `startDate` | string (ISO 8601) | Actual start date of data |
| `endDate` | string (ISO 8601) | Actual end date of data |
| `timeRange` | string | Time range type used |

---

## 5. Date Format Requirements

The `date` field in the response should follow these formats based on `timeRange`:

| Time Range | Date Format | Example |
|------------|-------------|---------|
| `daily` | `"MMM dd, yyyy"` | `"Jan 15, 2024"` |
| `weekly` | `"Week X (MMM yyyy)"` or `"MMM dd, yyyy"` | `"Week 2 (Jan 2024)"` or `"Jan 08, 2024"` |
| `monthly` | `"MMM yyyy"` | `"Jan 2024"` |
| `custom` | `"MMM dd, yyyy"` | `"Jan 15, 2024"` |

**Important**: For monthly multi-year comparisons, the date format should remain `"MMM yyyy"` (e.g., `"Jan 2024"`, `"Jan 2025"`) so the frontend can group by month and compare across years.

---

## 6. Data Aggregation Rules

### Daily View
- **Aggregation**: One data point per day
- **Date Range**: All days in the selected month/year (up to current date if current month)
- **Users**: Cumulative total users as of end of day
- **New Users**: Users registered on that specific day

### Weekly View
- **Aggregation**: One data point per week (Monday to Sunday, or configurable week start)
- **Date Range**: All weeks in the selected month/year
- **Users**: Cumulative total users as of end of week
- **New Users**: Users registered during that week

### Monthly View
- **Aggregation**: One data point per month
- **Date Range**: All months in selected year(s), excluding future months in current year
- **Users**: Cumulative total users as of end of month
- **New Users**: Users registered during that month
- **Multi-Year**: When multiple years are selected, return data for each year-month combination

### Custom View
- **Aggregation**: Based on date range length:
  - ≤ 31 days: Daily aggregation
  - 32-90 days: Weekly aggregation
  - > 90 days: Monthly aggregation
- **Date Range**: From startDate to endDate (inclusive)
- **Users**: Cumulative total users as of end of period
- **New Users**: Users registered during that period

---

## 7. Business Rules

### 1. Future Date Validation
- **Rule**: Do not return data for future dates
- **Implementation**: If current month/year is selected, only return data up to current date
- **Example**: If today is Jan 15, 2024, and user selects Jan 2024, return data only for Jan 1-15

### 2. Month Validation
- **Rule**: For daily/weekly views, if current month is selected, only return data up to current date
- **Implementation**: Validate `month` and `year` against current date

### 3. Year Validation
- **Rule**: Do not allow future years
- **Implementation**: Reject requests with `year > currentYear`

### 4. Date Range Validation
- **Rule**: `startDate` must be ≤ `endDate`
- **Rule**: Both dates must be in the past (not future)
- **Rule**: Maximum date range: 5 years (for performance)

### 5. Empty Data Handling
- **Rule**: Return empty array if no data exists for the selected period
- **Response**: `{ "userGrowth": [], "metadata": {...} }`

---

## 8. Error Responses

### 400 Bad Request - Missing Required Parameters
```json
{
  "success": false,
  "error": {
    "code": "MISSING_PARAMETERS",
    "message": "Missing required parameter: timeRange",
    "details": {
      "required": ["timeRange"],
      "provided": []
    }
  }
}
```

### 400 Bad Request - Invalid Time Range
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TIME_RANGE",
    "message": "Invalid timeRange value. Must be one of: daily, weekly, monthly, custom",
    "details": {
      "provided": "invalid",
      "valid": ["daily", "weekly", "monthly", "custom"]
    }
  }
}
```

### 400 Bad Request - Invalid Date Range
```json
{
  "success": false,
  "error": {
    "code": "INVALID_DATE_RANGE",
    "message": "startDate must be before or equal to endDate",
    "details": {
      "startDate": "2024-03-01T00:00:00.000Z",
      "endDate": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 400 Bad Request - Future Date
```json
{
  "success": false,
  "error": {
    "code": "FUTURE_DATE_NOT_ALLOWED",
    "message": "Cannot request data for future dates",
    "details": {
      "requestedDate": "2025-12-31T23:59:59.999Z",
      "currentDate": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 400 Bad Request - Invalid Month/Year
```json
{
  "success": false,
  "error": {
    "code": "INVALID_MONTH_YEAR",
    "message": "Invalid month or year combination",
    "details": {
      "month": 12,
      "year": 2024,
      "issue": "Month must be between 0-11"
    }
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required. Please provide a valid token."
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this resource."
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred while processing your request."
  }
}
```

---

## 9. Complete Request/Response Examples

### Example 1: Daily View - January 2024
**Request:**
```http
GET /api/dashboard/analytics/user-growth?timeRange=daily&month=0&year=2024
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userGrowth": [
      {
        "date": "Jan 01, 2024",
        "users": 1250,
        "newUsers": 45
      },
      {
        "date": "Jan 02, 2024",
        "users": 1295,
        "newUsers": 38
      },
      {
        "date": "Jan 03, 2024",
        "users": 1333,
        "newUsers": 42
      }
    ],
    "metadata": {
      "totalRecords": 31,
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z",
      "timeRange": "daily"
    }
  },
  "message": "User growth data retrieved successfully"
}
```

---

### Example 2: Weekly View - January 2024
**Request:**
```http
GET /api/dashboard/analytics/user-growth?timeRange=weekly&month=0&year=2024
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userGrowth": [
      {
        "date": "Week 0 (Jan 2024)",
        "users": 1250,
        "newUsers": 280
      },
      {
        "date": "Week 1 (Jan 2024)",
        "users": 1530,
        "newUsers": 295
      },
      {
        "date": "Week 2 (Jan 2024)",
        "users": 1825,
        "newUsers": 310
      }
    ],
    "metadata": {
      "totalRecords": 5,
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z",
      "timeRange": "weekly"
    }
  },
  "message": "User growth data retrieved successfully"
}
```

---

### Example 3: Monthly View - Single Year (2024)
**Request:**
```http
GET /api/dashboard/analytics/user-growth?timeRange=monthly&years=2024
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userGrowth": [
      {
        "date": "Jan 2024",
        "users": 1250,
        "newUsers": 1250
      },
      {
        "date": "Feb 2024",
        "users": 2450,
        "newUsers": 1200
      },
      {
        "date": "Mar 2024",
        "users": 3650,
        "newUsers": 1200
      }
    ],
    "metadata": {
      "totalRecords": 12,
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.999Z",
      "timeRange": "monthly"
    }
  },
  "message": "User growth data retrieved successfully"
}
```

---

### Example 4: Monthly View - Multi-Year Comparison (2023, 2024, 2025)
**Request:**
```http
GET /api/dashboard/analytics/user-growth?timeRange=monthly&years=2023&years=2024&years=2025
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userGrowth": [
      {
        "date": "Jan 2023",
        "users": 850,
        "newUsers": 850
      },
      {
        "date": "Jan 2024",
        "users": 1250,
        "newUsers": 1250
      },
      {
        "date": "Jan 2025",
        "users": 1650,
        "newUsers": 1650
      },
      {
        "date": "Feb 2023",
        "users": 1700,
        "newUsers": 850
      },
      {
        "date": "Feb 2024",
        "users": 2450,
        "newUsers": 1200
      },
      {
        "date": "Feb 2025",
        "users": 3200,
        "newUsers": 1550
      }
    ],
    "metadata": {
      "totalRecords": 36,
      "startDate": "2023-01-01T00:00:00.000Z",
      "endDate": "2025-12-31T23:59:59.999Z",
      "timeRange": "monthly",
      "selectedYears": [2023, 2024, 2025]
    }
  },
  "message": "User growth data retrieved successfully"
}
```

**Note**: For multi-year monthly, the frontend expects data in this format so it can group by month and create year-specific keys like `"2023 - Total Users"`, `"2024 - Total Users"`, etc.

---

### Example 5: Custom Date Range
**Request:**
```http
GET /api/dashboard/analytics/user-growth?timeRange=custom&startDate=2024-01-01T00:00:00.000Z&endDate=2024-03-31T23:59:59.999Z
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userGrowth": [
      {
        "date": "Jan 01, 2024",
        "users": 1250,
        "newUsers": 45
      },
      {
        "date": "Jan 02, 2024",
        "users": 1295,
        "newUsers": 38
      }
    ],
    "metadata": {
      "totalRecords": 91,
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-03-31T23:59:59.999Z",
      "timeRange": "custom"
    }
  },
  "message": "User growth data retrieved successfully"
}
```

---

## 10. Performance Requirements

### Response Time
- **Target**: < 500ms for date ranges ≤ 1 year
- **Target**: < 2s for date ranges > 1 year
- **Maximum**: 5s timeout

### Data Limits
- **Maximum Date Range**: 5 years
- **Maximum Records**: 10,000 data points per request
- **Pagination**: Not required (data is aggregated)

### Caching
- **Recommendation**: Cache daily/weekly/monthly aggregations
- **Cache Duration**: 
  - Daily: 1 hour
  - Weekly: 6 hours
  - Monthly: 24 hours
  - Custom: No cache (always fresh)

---

## 11. Database Considerations

### Required Fields
The API should query user data with the following fields:
- `userId` (unique identifier)
- `createdAt` (registration timestamp)
- `lastActiveAt` (for active user calculations)
- `status` (active, inactive, deleted)

### Aggregation Strategy
1. **Daily**: Count users where `createdAt` falls on that date, and calculate cumulative total
2. **Weekly**: Count users where `createdAt` falls within that week
3. **Monthly**: Count users where `createdAt` falls within that month
4. **Custom**: Aggregate based on date range

### Indexing Recommendations
- Index on `createdAt` for efficient date range queries
- Index on `status` for filtering active users
- Composite index on `(createdAt, status)` for optimized queries

---

## 12. Testing Scenarios

### Test Case 1: Daily View - Current Month
- **Input**: `timeRange=daily&month=0&year=2024` (if current month is January 2024)
- **Expected**: Return data only up to current date, not future dates

### Test Case 2: Monthly View - Multiple Years
- **Input**: `timeRange=monthly&years=2023&years=2024&years=2025`
- **Expected**: Return all months for all selected years, excluding future months in current year

### Test Case 3: Custom Range - Future Dates
- **Input**: `timeRange=custom&startDate=2025-01-01&endDate=2025-12-31`
- **Expected**: Return 400 error (future dates not allowed)

### Test Case 4: Invalid Month
- **Input**: `timeRange=daily&month=12&year=2024`
- **Expected**: Return 400 error (month must be 0-11)

### Test Case 5: Empty Data
- **Input**: `timeRange=daily&month=0&year=2020` (if no data exists)
- **Expected**: Return empty array with metadata

---

## 13. Additional Notes

### Timezone Handling
- **Recommendation**: Store all dates in UTC
- **Display**: Frontend will handle timezone conversion for display
- **API**: Always return dates in ISO 8601 format (UTC)

### Data Consistency
- **Users Count**: Should be cumulative (total users up to that date)
- **New Users**: Should be incremental (users added during that period)
- **Validation**: Ensure `users` ≥ sum of all previous `newUsers`

### Multi-Year Monthly Format
When multiple years are selected for monthly view, the API should return data in a flat array where each entry has:
- `date`: `"MMM YYYY"` format (e.g., `"Jan 2023"`, `"Jan 2024"`)
- The frontend will group these by month and create year-specific keys

---

## 14. API Versioning

### Current Version
- **Version**: `v1`
- **Endpoint**: `/api/v1/dashboard/analytics/user-growth`

### Future Considerations
- Consider adding pagination for very large date ranges
- Consider adding filters for user segments (e.g., verified users, premium users)
- Consider adding export functionality (CSV, Excel)

---

## 15. Integration Checklist

- [ ] Endpoint implemented with all query parameters
- [ ] Authentication and authorization checks
- [ ] Date validation (no future dates)
- [ ] Month/year validation
- [ ] Date format matches requirements for each timeRange
- [ ] Multi-year monthly data format correct
- [ ] Error handling for all scenarios
- [ ] Performance optimization (indexing, caching)
- [ ] Unit tests for all time ranges
- [ ] Integration tests with frontend
- [ ] Documentation updated

---

## Contact & Support

For questions or clarifications regarding this API specification, please contact the development team.

**Last Updated**: January 2024
**Version**: 1.0

