/**
 * Report Types
 * 
 * Type definitions for the Reports Management API
 * Following the updated API response structure with comprehensive user and category details
 */

// Category Description JSONB structure
export interface CategoryDescription {
  points?: number;
  action?: string;
  [key: string]: any; // Allow additional fields in JSONB
}

// Category Details JSONB structure (from category_details field)
export interface CategoryDetails {
  reason?: string;
  category_id?: number;
  category_name?: string;
  severity?: string;
  points?: number;
  [key: string]: any; // Allow additional fields in JSONB
}

// Report Category interface
export interface ReportCategory {
  id: number | null;
  name: string | null;
  parent: string | null; // Legacy field for backward compatibility
  parentId: number | null;
  description: CategoryDescription | null;
  status: boolean | null;
  details: CategoryDetails | null; // Full category_details JSONB from report
}

// Sub Category interface
export interface ReportSubCategory {
  id: number | null;
  name: string | null;
  parentId: number | null;
  description: CategoryDescription | null;
  status: boolean | null;
}

// Reporter/Reported User interface
export interface ReportUser {
  id: number;
  uuid: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  countryCode: string | null;
  profilePic: string | null;
  accountStatus: number | null;
}

// All types are already exported above as interfaces

// Report Status types
export type ReportStatus = 
  | 'new' 
  | 'in-progress' 
  | 'resolved' 
  | 'closed' 
  | 'pending' 
  | 'reviewed' 
  | 'dismissed';

// Report Severity types
export type ReportSeverity = 'low' | 'medium' | 'high' | 'critical';

// Report Type
export type ReportType = 
  | 'spam' 
  | 'harassment' 
  | 'inappropriate_content' 
  | 'fake_profile' 
  | 'scam' 
  | 'other';

// Main Report interface
export interface Report {
  id: string;
  category: ReportCategory;
  subCategory: ReportSubCategory | null;
  severity: ReportSeverity | null;
  reason: string | null;
  status: ReportStatus;
  reportType: ReportType | null;
  createdAt: string | null;
  updatedAt: string | null;
  reportedAt: string | null;
  description: string | null;
  reportedBy: string | null; // Legacy field
  assignedTo: string | null;
  notes: string | null;
  reportedByIp: string | null;
  reporter: ReportUser | null;
  reported: ReportUser | null;
}

// Pagination interface
export interface ReportPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Report List Response
export interface ReportListResponse {
  reports: Report[];
  pagination: ReportPagination;
}

// Create Report Request
export interface CreateReportRequest {
  category: {
    name: string;
    parent?: string;
  };
  severity: ReportSeverity;
  reason: string;
  description?: string;
  reportedBy?: string;
}

// Update Report Request
export interface UpdateReportRequest {
  category?: {
    name: string;
    parent?: string;
  };
  severity?: ReportSeverity;
  reason?: string;
  status?: ReportStatus;
  description?: string;
  assignedTo?: string;
  notes?: string;
}

// Report Statistics
export interface ReportStats {
  total: number;
  byStatus: {
    new: number;
    'in-progress': number;
    resolved: number;
    closed: number;
    pending?: number;
    reviewed?: number;
    dismissed?: number;
  };
  bySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  byCategory: Record<string, number>;
}

// Filter Options
export interface ReportFilterOptions {
  statuses: string[];
  severities: string[];
  categories: Array<{
    name: string;
    parent?: string;
  }>;
}
