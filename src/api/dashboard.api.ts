/**
 * Dashboard stats API.
 * Backend: GET /api/dashboard
 */

import { apiRequest } from "@/api/client";

interface ApiSuccess<T> {
  data: T;
  success: true;
}

export interface DashboardStats {
  pendingTaskRequests: number;
  assignmentsInProgress: number;
  assignmentsCompleted: number;
  openQueries: number;
  unpaidInvoices: number;
  allocatedTasksWithoutReview: number;
}

export const dashboardApi = {
  getStats: () =>
    apiRequest<ApiSuccess<DashboardStats>>("/api/dashboard").then((r) => r.data),
};
