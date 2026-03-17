/**
 * Task config API (super admin only): tasks, subtasks, document master, assignment & payment term templates.
 * Smart Work backend: /api/task-config/*
 */

import { apiRequest } from "@/api/client";

interface ApiSuccess<T> {
  data: T;
  success: true;
}

export interface Task {
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
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export const taskConfigApi = {
  listSubtasks: (taskId?: string) => {
    const q = taskId ? `?taskId=${taskId}` : "";
    return apiRequest<ApiSuccess<Subtask[]>>(`/api/task-config/subtasks${q}`).then((r) => r.data);
  },
  getSubtask: (id: string) =>
    apiRequest<ApiSuccess<Subtask>>(`/api/task-config/subtasks/${id}`).then((r) => r.data),
  createSubtask: (body: { taskId: string; name: string; description?: string | null }) =>
    apiRequest<ApiSuccess<Subtask>>("/api/task-config/subtasks", { method: "POST", body: JSON.stringify(body) }).then((r) => r.data),
  updateSubtask: (id: string, body: { name?: string; description?: string | null }) =>
    apiRequest<ApiSuccess<Subtask>>(`/api/task-config/subtasks/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then((r) => r.data),
  deleteSubtask: (id: string) =>
    apiRequest<ApiSuccess<{ deleted: boolean }>>(`/api/task-config/subtasks/${id}`, { method: "DELETE" }).then((r) => r.data),
  listTasks: () => apiRequest<ApiSuccess<Task[]>>("/api/task-config/tasks").then((r) => r.data),
  getTask: (id: string) => apiRequest<ApiSuccess<Task>>(`/api/task-config/tasks/${id}`).then((r) => r.data),
  createTask: (body: { name: string; description?: string | null }) =>
    apiRequest<ApiSuccess<Task>>("/api/task-config/tasks", { method: "POST", body: JSON.stringify(body) }).then((r) => r.data),
  updateTask: (id: string, body: { name?: string; description?: string | null }) =>
    apiRequest<ApiSuccess<Task>>(`/api/task-config/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then((r) => r.data),
  deleteTask: (id: string) =>
    apiRequest<ApiSuccess<{ deleted: boolean }>>(`/api/task-config/tasks/${id}`, { method: "DELETE" }).then((r) => r.data),
  listDocuments: () => apiRequest<ApiSuccess<DocumentMaster[]>>("/api/task-config/documents").then((r) => r.data),
  getDocument: (id: string) => apiRequest<ApiSuccess<DocumentMaster>>(`/api/task-config/documents/${id}`).then((r) => r.data),
  createDocument: (body: { name: string; description?: string | null }) =>
    apiRequest<ApiSuccess<DocumentMaster>>("/api/task-config/documents", { method: "POST", body: JSON.stringify(body) }).then((r) => r.data),
  updateDocument: (id: string, body: { name?: string; description?: string | null }) =>
    apiRequest<ApiSuccess<DocumentMaster>>(`/api/task-config/documents/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then((r) => r.data),
  deleteDocument: (id: string) =>
    apiRequest<ApiSuccess<{ deleted: boolean }>>(`/api/task-config/documents/${id}`, { method: "DELETE" }).then((r) => r.data),
};
