/**
 * Allocated tasks API (assignment-level task allocation).
 * Backend: /api/assignments/:assignmentId/tasks, /api/allocated-tasks
 */

import { apiRequest } from "@/api/client";

interface ApiSuccess<T> {
  data: T;
  success: true;
}

export type AllocatedTaskPriority = "HIGH" | "MEDIUM" | "LOW";

export interface AllocatedTask {
  id: string;
  assignmentId: string;
  description: string | null;
  assignedToId: string | null;
  assignedById: string | null;
  startDate: string | null;
  dueDate: string | null;
  priority: AllocatedTaskPriority | null;
  checkingRequired: boolean | null;
  checkerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAllocatedTaskBody {
  assignmentId: string;
  description?: string | null;
  assignedToId?: string | null;
  assignedById?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  priority?: AllocatedTaskPriority | null;
  checkingRequired?: boolean | null;
  checkerId?: string | null;
}

export interface UpdateAllocatedTaskBody {
  assignmentId?: string;
  description?: string | null;
  assignedToId?: string | null;
  assignedById?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  priority?: AllocatedTaskPriority | null;
  checkingRequired?: boolean | null;
  checkerId?: string | null;
}

export const allocatedTasksApi = {
  listByAssignment: (assignmentId: string) =>
    apiRequest<ApiSuccess<AllocatedTask[]>>(
      `/api/assignments/${assignmentId}/tasks`
    ).then((r) => r.data),

  get: (id: string) =>
    apiRequest<ApiSuccess<AllocatedTask>>(`/api/allocated-tasks/${id}`).then(
      (r) => r.data
    ),

  create: (body: CreateAllocatedTaskBody) =>
    apiRequest<ApiSuccess<AllocatedTask>>("/api/allocated-tasks", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((r) => r.data),

  update: (id: string, body: UpdateAllocatedTaskBody) =>
    apiRequest<ApiSuccess<AllocatedTask>>(`/api/allocated-tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((r) => r.data),

  delete: (id: string) =>
    apiRequest<ApiSuccess<{ deleted?: boolean }>>(`/api/allocated-tasks/${id}`, {
      method: "DELETE",
    }).then((r) => r.data),
};
