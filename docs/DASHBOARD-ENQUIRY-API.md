# Dashboard Enquiry API – Backend Requirements

The admin dashboard shows **enquiry stats** and **one chart: Enquiries over time**. The frontend expects the following from the backend.

**Base path:** `/api/admin`  
**Auth:** All endpoints require `Authorization: Bearer <token>`.

---

## 1. Dashboard summary (existing)

**Purpose:** Provide total and pending enquiry counts for the stats cards.

- **Method:** `GET`
- **Path:** `/api/admin/dashboard`
- **Auth:** Required

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "colleges": { "total": 10, "active": 8 },
    "enquiries": {
      "total": 45,
      "pending": 12
    },
    "applications": { "total": 0 }
  }
}
```

**Required for dashboard:**

- `data.enquiries.total` – number (total enquiries).
- `data.enquiries.pending` – number (enquiries with status `pending`).

If your dashboard endpoint already returns these from the same Enquiry collection used by `GET /api/admin/enquiries`, no change is needed. Otherwise, ensure the dashboard response includes at least `enquiries.total` and `enquiries.pending`.

---

## 2. Enquiry analytics (new – for the chart)

**Purpose:** Return enquiry counts grouped by time period so the dashboard can show “Enquiries over time” (bar/line chart).

- **Method:** `GET`
- **Path:** `/api/admin/dashboard/enquiries/analytics`
- **Auth:** Required

### Query parameters

| Parameter   | Type   | Required | Description |
|------------|--------|----------|-------------|
| `timeRange` | string | Yes     | One of: `daily`, `weekly`, `monthly`, `custom`. |
| `month`    | number | No       | 0–11. Used when `timeRange` is `daily` or `weekly`. |
| `year`     | number | No       | e.g. 2024. Used when `timeRange` is `daily` or `weekly`. |
| `years`    | number[]| No      | e.g. 2023, 2024. Used when `timeRange` is `monthly` (can repeat: `years=2023&years=2024`). |
| `startDate`| string | No       | ISO 8601 date. Used when `timeRange` is `custom`. |
| `endDate`  | string | No       | ISO 8601 date. Used when `timeRange` is `custom`. |

- **daily:** Count enquiries per day. Use `month` + `year` to limit to that month.
- **weekly:** Count enquiries per week (e.g. Week 1, Week 2) in the given `month` + `year`.
- **monthly:** Count enquiries per month. Use `years` to limit to those years.
- **custom:** Count enquiries in buckets (e.g. by day or week) between `startDate` and `endDate`.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "enquiries": [
      { "label": "Jan 2024", "date": "2024-01-01T00:00:00.000Z", "count": 8 },
      { "label": "Feb 2024", "date": "2024-02-01T00:00:00.000Z", "count": 12 },
      { "label": "Mar 2024", "date": "2024-03-01T00:00:00.000Z", "count": 5 }
    ]
  }
}
```

**Per item:**

| Field   | Type   | Description |
|--------|--------|-------------|
| `label` | string | Display label on the chart (e.g. `"Jan 2024"`, `"Week 1 (Jan 2024)"`, `"Jan 15, 2024"`). |
| `date`  | string | Optional. ISO 8601. Used by frontend for sorting; can be start of period. |
| `count` | number | Number of enquiries in that period (by `createdAt` or your chosen field). |

- **Order:** Return ascending by time (oldest first), or rely on `date` for frontend sort.
- **Aggregation:** Count enquiries whose `createdAt` (or equivalent) falls in each bucket. Use the same Enquiry model as `GET /api/admin/enquiries`.

### Example requests

- Monthly for 2024:  
  `GET /api/admin/dashboard/enquiries/analytics?timeRange=monthly&years=2024`
- Daily for January 2024:  
  `GET /api/admin/dashboard/enquiries/analytics?timeRange=daily&month=0&year=2024`
- Custom range:  
  `GET /api/admin/dashboard/enquiries/analytics?timeRange=custom&startDate=2024-01-01T00:00:00.000Z&endDate=2024-03-31T23:59:59.999Z`

### Errors

- **400** – Invalid or missing query params (e.g. `timeRange=custom` but no `startDate`/`endDate`).
- **401** – Unauthorized (same as other admin endpoints).

---

## 3. Quick reference

| Purpose              | Method | Path                                           |
|----------------------|--------|------------------------------------------------|
| Dashboard summary    | GET    | `/api/admin/dashboard`                         |
| Enquiry analytics    | GET    | `/api/admin/dashboard/enquiries/analytics`     |

**Dashboard summary:** must include `data.enquiries.total` and `data.enquiries.pending`.  
**Enquiry analytics:** returns `data.enquiries` as an array of `{ label, date?, count }` for the “Enquiries over time” chart.
