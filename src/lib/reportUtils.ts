/**
 * Report Utility Functions
 * 
 * Helper functions for working with report data
 */

import { Report, ReportStatus, ReportSeverity, ReportUser } from '@/api/services/reportTypes';

/**
 * Get display name for a report user
 */
export function getReportUserName(user: ReportUser | null | undefined): string {
  if (!user) return 'Unknown';
  if (user.fullName) return user.fullName;
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Unknown';
  }
  if (user.email) return user.email;
  if (user.phone) return user.phone;
  return 'Unknown';
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: Report['category']): string {
  if (category?.name) return category.name;
  if (category?.details?.category_name) return category.details.category_name;
  return 'Unknown Category';
}

/**
 * Get parent category display name
 */
export function getParentCategoryDisplayName(category: Report['category']): string | null {
  if (category.parent) return category.parent;
  if (category.parentId) return `Parent ID: ${category.parentId}`;
  return null;
}

/**
 * Check if report has user information
 */
export function hasReporterInfo(report: Report): boolean {
  return report.reporter !== null && report.reporter !== undefined;
}

/**
 * Check if report has reported user information
 */
export function hasReportedUserInfo(report: Report): boolean {
  return report.reported !== null && report.reported !== undefined;
}

/**
 * Get report status badge variant
 */
export function getStatusBadgeVariant(status: ReportStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'new':
    case 'pending':
      return 'destructive';
    case 'in-progress':
    case 'reviewed':
      return 'secondary';
    case 'resolved':
      return 'default';
    case 'closed':
    case 'dismissed':
      return 'outline';
    default:
      return 'outline';
  }
}

/**
 * Get severity badge variant
 */
export function getSeverityBadgeVariant(severity: ReportSeverity | null): 'default' | 'secondary' | 'destructive' {
  switch (severity) {
    case 'low':
      return 'default';
    case 'medium':
      return 'secondary';
    case 'high':
    case 'critical':
      return 'destructive';
    default:
      return 'secondary';
  }
}

/**
 * Format report type for display
 */
export function formatReportType(reportType: string | null | undefined): string {
  if (!reportType) return 'Other';
  return reportType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
