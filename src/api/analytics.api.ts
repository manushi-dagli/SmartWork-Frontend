/**
 * Analytics API: summary (by client, by firm).
 * Backend: GET /api/analytics/summary
 */

import { apiRequest } from "@/api/client";

interface ApiSuccess<T> {
  data: T;
  success: true;
}

export interface AssignmentAnalyticsRow {
  assignmentId: string;
  taskId: string;
  taskName: string;
  financialYear: string | null;
  status: string | null;
  estimatedFees: string | null;
  estimatedFeesNumeric: number;
  charged: number;
  revenue: number;
}

export interface ClientAnalyticsRow {
  clientId: string;
  clientName: string;
  firmId: string | null;
  firmName: string | null;
  assignmentCount: number;
  assignments: AssignmentAnalyticsRow[];
  totalEstimatedFees: number;
  totalCharged: number;
  totalRevenue: number;
}

export interface FirmAnalyticsRow {
  firmId: string;
  firmName: string;
  clientCount: number;
  totalCharged: number;
  totalRevenue: number;
  clients: ClientAnalyticsRow[];
}

export interface AnalyticsSummary {
  byClient: ClientAnalyticsRow[];
  byFirm: FirmAnalyticsRow[];
}

export const analyticsApi = {
  getSummary: () =>
    apiRequest<ApiSuccess<AnalyticsSummary>>("/api/analytics/summary").then(
      (r) => r.data
    ),
};
