/**
 * Clients API: list, get, create, update, delete.
 * Smart Work backend: /api/clients
 */

import { apiRequest } from "@/api/client";

interface ApiSuccess<T> {
  data: T;
  success: true;
}

export interface Client {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  address: string | null;
  phone1CountryCode: string | null;
  phone1Number: string | null;
  phone2CountryCode: string | null;
  phone2Number: string | null;
  email1: string | null;
  email2: string | null;
  pan: string | null;
  gst: string | null;
  bankDetails: unknown;
  dsc: string | null;
  otp: string | null;
  familyId: string | null;
  taskId: string | null;
  subtaskId: string | null;
  taskDueDate: string | null;
  subtaskDueDate: string | null;
  assignmentTerms: string | null;
  paymentTerms: string | null;
  paymentCost: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientBody {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  address?: string | null;
  phone1CountryCode?: string | null;
  phone1Number?: string | null;
  phone2CountryCode?: string | null;
  phone2Number?: string | null;
  email1?: string | null;
  email2?: string | null;
  pan?: string | null;
  gst?: string | null;
  familyId?: string | null;
  taskId?: string | null;
  subtaskId?: string | null;
  taskDueDate?: string | null;
  subtaskDueDate?: string | null;
  assignmentTerms?: string | null;
  paymentTerms?: string | null;
  paymentCost?: string | null;
}

export interface UpdateClientBody {
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  address?: string | null;
  phone1CountryCode?: string | null;
  phone1Number?: string | null;
  phone2CountryCode?: string | null;
  phone2Number?: string | null;
  email1?: string | null;
  email2?: string | null;
  pan?: string | null;
  gst?: string | null;
  familyId?: string | null;
  taskId?: string | null;
  subtaskId?: string | null;
  taskDueDate?: string | null;
  subtaskDueDate?: string | null;
  assignmentTerms?: string | null;
  paymentTerms?: string | null;
  paymentCost?: string | null;
}

export const clientsApi = {
  listClients: () =>
    apiRequest<ApiSuccess<Client[]>>("/api/clients").then((r) => r.data),

  getClient: (id: string) =>
    apiRequest<ApiSuccess<Client>>(`/api/clients/${id}`).then((r) => r.data),

  createClient: (body: CreateClientBody) =>
    apiRequest<ApiSuccess<Client>>("/api/clients", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((r) => r.data),

  updateClient: (id: string, body: UpdateClientBody) =>
    apiRequest<ApiSuccess<Client>>(`/api/clients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((r) => r.data),

  deleteClient: (id: string) =>
    apiRequest<ApiSuccess<{ deleted?: boolean }>>(`/api/clients/${id}`, {
      method: "DELETE",
    }).then((r) => r.data),
};
