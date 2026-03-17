/**
 * Assignments API: list, get, create, update, delete.
 * Backend: /api/assignments
 */

import { apiRequest } from "@/api/client";

interface ApiSuccess<T> {
  data: T;
  success: true;
}

export type AssignmentStatus = "IN_PROGRESS" | "COMPLETED";

export interface Assignment {
  id: string;
  clientId: string;
  taskId: string;
  financialYear: string | null;
  startDate: string | null;
  dueDate: string | null;
  managerId: string | null;
  estimatedFees: string | null;
  taskRequestId: string | null;
  status: AssignmentStatus | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentWithDetails {
  assignment: Assignment;
  client: { id: string; firstName: string; lastName: string } | null;
  task: { id: string; name: string } | null;
  manager: { id: string; firstName: string; lastName: string } | null;
}

export interface CreateAssignmentBody {
  clientId: string;
  taskId: string;
  financialYear?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  managerId?: string | null;
  estimatedFees?: string | null;
  taskRequestId?: string | null;
}

export interface UpdateAssignmentBody {
  clientId?: string;
  taskId?: string;
  financialYear?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  managerId?: string | null;
  estimatedFees?: string | null;
  taskRequestId?: string | null;
  status?: AssignmentStatus | null;
}

export const assignmentsApi = {
  listAssignments: (params?: { clientId?: string; status?: string }) => {
    const search = new URLSearchParams();
    if (params?.clientId) search.set("clientId", params.clientId);
    if (params?.status) search.set("status", params.status);
    const q = search.toString();
    return apiRequest<ApiSuccess<Assignment[]>>(
      `/api/assignments${q ? `?${q}` : ""}`
    ).then((r) => r.data);
  },

  getAssignment: (id: string, details = false) =>
    apiRequest<ApiSuccess<Assignment | AssignmentWithDetails>>(
      `/api/assignments/${id}${details ? "?details=true" : ""}`
    ).then((r) => r.data),

  createAssignment: (body: CreateAssignmentBody) =>
    apiRequest<ApiSuccess<Assignment>>("/api/assignments", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((r) => r.data),

  updateAssignment: (id: string, body: UpdateAssignmentBody) =>
    apiRequest<ApiSuccess<Assignment>>(`/api/assignments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((r) => r.data),

  deleteAssignment: (id: string) =>
    apiRequest<ApiSuccess<{ deleted?: boolean }>>(`/api/assignments/${id}`, {
      method: "DELETE",
    }).then((r) => r.data),
};
