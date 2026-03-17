/**
 * Task request workflow API (staff): list/create/update task requests, documents, attachments, mark sent, accept/reject.
 * Smart Work backend: /api/task-requests/*
 */

import { apiRequest } from "@/api/client";
import { store } from "@/store";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64 ?? "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

interface ApiSuccess<T> {
  data: T;
  success: true;
}

export type TaskRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface TaskRequest {
  id: string;
  status: TaskRequestStatus;
  firmId: string | null;
  taskId: string;
  subtaskId: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhoneCountryCode: string | null;
  contactPhoneNumber: string | null;
  contactPhone2CountryCode: string | null;
  contactPhone2Number: string | null;
  clientId: string | null;
  assignmentTerms: string | null;
  paymentTerms: string | null;
  paymentCost: string | null;
  emailedAt: string | null;
  whatsappSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRequestAttachmentMeta {
  id: string;
  fileName: string;
  mimeType: string;
  createdAt: string;
}

export interface TaskRequestWithDocuments extends TaskRequest {
  documentIds: string[];
  attachments: TaskRequestAttachmentMeta[];
}

export interface DocumentForTaskRequest {
  id: string;
  name: string;
  description: string | null;
}

export interface CreateTaskRequestDto {
  firmId?: string | null;
  taskId: string;
  subtaskId?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhoneCountryCode?: string | null;
  contactPhoneNumber?: string | null;
  contactPhone2CountryCode?: string | null;
  contactPhone2Number?: string | null;
  assignmentTerms?: string | null;
  paymentTerms?: string | null;
  paymentCost?: string | null;
}

export interface UpdateTaskRequestDto {
  firmId?: string | null;
  taskId?: string;
  subtaskId?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhoneCountryCode?: string | null;
  contactPhoneNumber?: string | null;
  contactPhone2CountryCode?: string | null;
  contactPhone2Number?: string | null;
  assignmentTerms?: string | null;
  paymentTerms?: string | null;
  paymentCost?: string | null;
  emailedAt?: string | null;
  whatsappSentAt?: string | null;
}

// Re-export staff-readable config types (staff use /api/task-requests/... endpoints)
export interface TaskType {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentMaster {
  id: string;
  name: string;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubtaskWithTask {
  id: string;
  name: string;
  taskId: string;
  taskName: string;
}

export const taskRequestsApi = {
  listTaskRequests: (status?: TaskRequestStatus) => {
    const q = status ? `?status=${status}` : "";
    return apiRequest<ApiSuccess<TaskRequest[]>>(`/api/task-requests${q}`).then((r) => r.data);
  },

  getTaskRequest: (id: string) =>
    apiRequest<ApiSuccess<TaskRequestWithDocuments>>(`/api/task-requests/${id}`).then((r) => r.data),

  createTaskRequest: (body: CreateTaskRequestDto) =>
    apiRequest<ApiSuccess<TaskRequest>>("/api/task-requests", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((r) => r.data),

  updateTaskRequest: (id: string, body: UpdateTaskRequestDto) =>
    apiRequest<ApiSuccess<TaskRequest>>(`/api/task-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((r) => r.data),

  setTaskRequestDocuments: (taskRequestId: string, documentMasterIds: string[]) =>
    apiRequest<ApiSuccess<TaskRequestWithDocuments>>(`/api/task-requests/${taskRequestId}/documents`, {
      method: "POST",
      body: JSON.stringify({ documentMasterIds }),
    }).then((r) => r.data),

  getTaskRequestDocuments: (taskRequestId: string) =>
    apiRequest<ApiSuccess<DocumentForTaskRequest[]>>(`/api/task-requests/${taskRequestId}/documents`).then((r) => r.data),

  uploadAttachment: async (taskRequestId: string, file: File): Promise<TaskRequestAttachmentMeta> => {
    const base64 = await fileToBase64(file);
    const baseUrl = import.meta.env.VITE_API_URL ?? "";
    const url = `${baseUrl}/api/task-requests/${taskRequestId}/attachments`;
    const token = store.getState().auth.accessToken;
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type,
        content: base64,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error ?? "Upload failed");
    return json.data;
  },

  getAttachmentFileUrl: (taskRequestId: string, attachmentId: string): string => {
    const baseUrl = import.meta.env.VITE_API_URL ?? "";
    return `${baseUrl}/api/task-requests/${taskRequestId}/attachments/${attachmentId}/file`;
  },

  deleteAttachment: async (taskRequestId: string, attachmentId: string): Promise<void> => {
    const baseUrl = import.meta.env.VITE_API_URL ?? "";
    const url = `${baseUrl}/api/task-requests/${taskRequestId}/attachments/${attachmentId}`;
    const token = store.getState().auth.accessToken;
    const res = await fetch(url, {
      method: "DELETE",
      credentials: "include",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.error ?? "Delete failed");
    }
  },

  markSent: (taskRequestId: string, opts: { emailed?: boolean; whatsapp?: boolean }) =>
    apiRequest<ApiSuccess<TaskRequest>>(`/api/task-requests/${taskRequestId}/send`, {
      method: "POST",
      body: JSON.stringify(opts),
    }).then((r) => r.data),

  acceptTaskRequest: (taskRequestId: string) =>
    apiRequest<ApiSuccess<TaskRequest>>(`/api/task-requests/${taskRequestId}/accept`, {
      method: "POST",
    }).then((r) => r.data),

  rejectTaskRequest: (taskRequestId: string) =>
    apiRequest<ApiSuccess<TaskRequest>>(`/api/task-requests/${taskRequestId}/reject`, {
      method: "POST",
    }).then((r) => r.data),

  // Staff read-only config (no super-admin)
  listTaskTypes: () =>
    apiRequest<ApiSuccess<TaskType[]>>("/api/task-requests/task-types").then((r) => r.data),

  listSubtasksWithTask: () =>
    apiRequest<ApiSuccess<SubtaskWithTask[]>>("/api/task-requests/subtasks-with-task").then((r) => r.data),

  listDocuments: () =>
    apiRequest<ApiSuccess<DocumentMaster[]>>("/api/task-requests/documents").then((r) => r.data),
};
