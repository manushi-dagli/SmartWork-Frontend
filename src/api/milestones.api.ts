/**
 * Milestones API per assignment.
 * Backend: /api/assignments/:assignmentId/milestones, /api/milestones
 */

import { apiRequest } from "@/api/client";

interface ApiSuccess<T> {
  data: T;
  success: true;
}

export type MilestoneStatus = "PENDING" | "COMPLETED";

export interface Milestone {
  id: string;
  assignmentId: string;
  name: string;
  responsibleEmployeeId: string | null;
  dueDate: string | null;
  status: MilestoneStatus | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMilestoneBody {
  assignmentId: string;
  name: string;
  responsibleEmployeeId?: string | null;
  dueDate?: string | null;
  status?: MilestoneStatus | null;
}

export interface UpdateMilestoneBody {
  name?: string;
  responsibleEmployeeId?: string | null;
  dueDate?: string | null;
  status?: MilestoneStatus | null;
}

export const milestonesApi = {
  listByAssignment: (assignmentId: string) =>
    apiRequest<ApiSuccess<Milestone[]>>(
      `/api/assignments/${assignmentId}/milestones`
    ).then((r) => r.data),

  get: (id: string) =>
    apiRequest<ApiSuccess<Milestone>>(`/api/milestones/${id}`).then(
      (r) => r.data
    ),

  create: (body: CreateMilestoneBody) =>
    apiRequest<ApiSuccess<Milestone>>("/api/milestones", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((r) => r.data),

  update: (id: string, body: UpdateMilestoneBody) =>
    apiRequest<ApiSuccess<Milestone>>(`/api/milestones/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((r) => r.data),

  delete: (id: string) =>
    apiRequest<ApiSuccess<{ deleted?: boolean }>>(`/api/milestones/${id}`, {
      method: "DELETE",
    }).then((r) => r.data),
};
