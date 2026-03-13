/**
 * Inquiry workflow config API (super admin only): inquiry types, document master, assignment & payment term templates.
 * Smart Work backend: /api/inquiry-config/*
 */

import { apiRequest } from "@/api/client";

interface ApiSuccess<T> {
  data: T;
  success: true;
}

export interface InquiryType {
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
  assignmentTypeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentTermTemplate {
  id: string;
  name: string;
  content: unknown;
  assignmentTypeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTermTemplate {
  id: string;
  name: string;
  content: unknown;
  assignmentTypeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export const inquiryConfigApi = {
  listInquiryTypes: () =>
    apiRequest<ApiSuccess<InquiryType[]>>("/api/inquiry-config/inquiry-types").then((r) => r.data),
  getInquiryType: (id: string) =>
    apiRequest<ApiSuccess<InquiryType>>(`/api/inquiry-config/inquiry-types/${id}`).then((r) => r.data),
  createInquiryType: (body: { name: string; description?: string | null }) =>
    apiRequest<ApiSuccess<InquiryType>>("/api/inquiry-config/inquiry-types", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((r) => r.data),
  updateInquiryType: (id: string, body: { name?: string; description?: string | null }) =>
    apiRequest<ApiSuccess<InquiryType>>(`/api/inquiry-config/inquiry-types/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((r) => r.data),
  deleteInquiryType: (id: string) =>
    apiRequest<ApiSuccess<{ deleted: boolean }>>(`/api/inquiry-config/inquiry-types/${id}`, {
      method: "DELETE",
    }).then((r) => r.data),

  listDocuments: () =>
    apiRequest<ApiSuccess<DocumentMaster[]>>("/api/inquiry-config/documents").then((r) => r.data),
  getDocument: (id: string) =>
    apiRequest<ApiSuccess<DocumentMaster>>(`/api/inquiry-config/documents/${id}`).then((r) => r.data),
  createDocument: (body: { name: string; description?: string | null; assignmentTypeId?: string | null }) =>
    apiRequest<ApiSuccess<DocumentMaster>>("/api/inquiry-config/documents", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((r) => r.data),
  updateDocument: (
    id: string,
    body: { name?: string; description?: string | null; assignmentTypeId?: string | null }
  ) =>
    apiRequest<ApiSuccess<DocumentMaster>>(`/api/inquiry-config/documents/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((r) => r.data),
  deleteDocument: (id: string) =>
    apiRequest<ApiSuccess<{ deleted: boolean }>>(`/api/inquiry-config/documents/${id}`, {
      method: "DELETE",
    }).then((r) => r.data),

  listAssignmentTermTemplates: () =>
    apiRequest<ApiSuccess<AssignmentTermTemplate[]>>("/api/inquiry-config/assignment-term-templates").then(
      (r) => r.data
    ),
  createAssignmentTermTemplate: (body: {
    name: string;
    content?: unknown;
    assignmentTypeId?: string | null;
  }) =>
    apiRequest<ApiSuccess<AssignmentTermTemplate>>("/api/inquiry-config/assignment-term-templates", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((r) => r.data),
  updateAssignmentTermTemplate: (
    id: string,
    body: { name?: string; content?: unknown; assignmentTypeId?: string | null }
  ) =>
    apiRequest<ApiSuccess<AssignmentTermTemplate>>(`/api/inquiry-config/assignment-term-templates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((r) => r.data),
  deleteAssignmentTermTemplate: (id: string) =>
    apiRequest<ApiSuccess<{ deleted: boolean }>>(`/api/inquiry-config/assignment-term-templates/${id}`, {
      method: "DELETE",
    }).then((r) => r.data),

  listPaymentTermTemplates: () =>
    apiRequest<ApiSuccess<PaymentTermTemplate[]>>("/api/inquiry-config/payment-term-templates").then((r) => r.data),
  createPaymentTermTemplate: (body: {
    name: string;
    content?: unknown;
    assignmentTypeId?: string | null;
  }) =>
    apiRequest<ApiSuccess<PaymentTermTemplate>>("/api/inquiry-config/payment-term-templates", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((r) => r.data),
  updatePaymentTermTemplate: (
    id: string,
    body: { name?: string; content?: unknown; assignmentTypeId?: string | null }
  ) =>
    apiRequest<ApiSuccess<PaymentTermTemplate>>(`/api/inquiry-config/payment-term-templates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((r) => r.data),
  deletePaymentTermTemplate: (id: string) =>
    apiRequest<ApiSuccess<{ deleted: boolean }>>(`/api/inquiry-config/payment-term-templates/${id}`, {
      method: "DELETE",
    }).then((r) => r.data),
};
