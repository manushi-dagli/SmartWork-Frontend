/**
 * Inquiry workflow API (staff): list/create/update inquiries, documents, mark sent, accept/reject.
 * Staff read-only config: inquiry types, documents by type, assignment & payment term templates.
 * Smart Work backend: /api/inquiries/*
 */

import { apiRequest } from "@/api/client";

interface ApiSuccess<T> {
  data: T;
  success: true;
}

export type InquiryStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface Inquiry {
  id: string;
  status: InquiryStatus;
  assignmentTypeId: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhoneCountryCode: string | null;
  contactPhoneNumber: string | null;
  contactPhone2CountryCode: string | null;
  contactPhone2Number: string | null;
  clientId: string | null;
  assignmentTermsSnapshot: unknown;
  paymentTermsSnapshot: unknown;
  assignmentTermTemplateId: string | null;
  paymentTermTemplateId: string | null;
  emailedAt: string | null;
  whatsappSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryWithDocuments extends Inquiry {
  documentIds: string[];
}

export interface DocumentForInquiry {
  id: string;
  name: string;
  description: string | null;
}

export interface CreateInquiryDto {
  assignmentTypeId: string;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhoneCountryCode?: string | null;
  contactPhoneNumber?: string | null;
  contactPhone2CountryCode?: string | null;
  contactPhone2Number?: string | null;
}

export interface UpdateInquiryDto {
  assignmentTypeId?: string;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhoneCountryCode?: string | null;
  contactPhoneNumber?: string | null;
  contactPhone2CountryCode?: string | null;
  contactPhone2Number?: string | null;
  assignmentTermsSnapshot?: unknown;
  paymentTermsSnapshot?: unknown;
  assignmentTermTemplateId?: string | null;
  paymentTermTemplateId?: string | null;
  emailedAt?: string | null;
  whatsappSentAt?: string | null;
}

// Re-export staff-readable config types (same shape as inquiryConfig; staff use /api/inquiries/... endpoints)
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
  assignmentTypeId?: string | null;
  createdAt?: string;
  updatedAt?: string;
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

export const inquiriesApi = {
  listInquiries: (status?: InquiryStatus) => {
    const q = status ? `?status=${status}` : "";
    return apiRequest<ApiSuccess<Inquiry[]>>(`/api/inquiries${q}`).then((r) => r.data);
  },

  getInquiry: (id: string) =>
    apiRequest<ApiSuccess<InquiryWithDocuments>>(`/api/inquiries/${id}`).then((r) => r.data),

  createInquiry: (body: CreateInquiryDto) =>
    apiRequest<ApiSuccess<Inquiry>>("/api/inquiries", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((r) => r.data),

  updateInquiry: (id: string, body: UpdateInquiryDto) =>
    apiRequest<ApiSuccess<Inquiry>>(`/api/inquiries/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((r) => r.data),

  setInquiryDocuments: (inquiryId: string, documentMasterIds: string[]) =>
    apiRequest<ApiSuccess<InquiryWithDocuments>>(`/api/inquiries/${inquiryId}/documents`, {
      method: "POST",
      body: JSON.stringify({ documentMasterIds }),
    }).then((r) => r.data),

  getInquiryDocuments: (inquiryId: string) =>
    apiRequest<ApiSuccess<DocumentForInquiry[]>>(`/api/inquiries/${inquiryId}/documents`).then((r) => r.data),

  getDocumentsByInquiryType: (inquiryTypeId: string) =>
    apiRequest<ApiSuccess<DocumentForInquiry[]>>(
      `/api/inquiries/documents-by-type/${inquiryTypeId}`
    ).then((r) => r.data),

  markSent: (inquiryId: string, opts: { emailed?: boolean; whatsapp?: boolean }) =>
    apiRequest<ApiSuccess<Inquiry>>(`/api/inquiries/${inquiryId}/send`, {
      method: "POST",
      body: JSON.stringify(opts),
    }).then((r) => r.data),

  acceptInquiry: (inquiryId: string) =>
    apiRequest<ApiSuccess<Inquiry>>(`/api/inquiries/${inquiryId}/accept`, {
      method: "POST",
    }).then((r) => r.data),

  rejectInquiry: (inquiryId: string) =>
    apiRequest<ApiSuccess<Inquiry>>(`/api/inquiries/${inquiryId}/reject`, {
      method: "POST",
    }).then((r) => r.data),

  // Staff read-only config (no super-admin)
  listInquiryTypes: () =>
    apiRequest<ApiSuccess<InquiryType[]>>("/api/inquiries/inquiry-types").then((r) => r.data),

  listDocuments: () =>
    apiRequest<ApiSuccess<DocumentMaster[]>>("/api/inquiries/documents").then((r) => r.data),

  listAssignmentTermTemplates: () =>
    apiRequest<ApiSuccess<AssignmentTermTemplate[]>>("/api/inquiries/assignment-term-templates").then(
      (r) => r.data
    ),

  listPaymentTermTemplates: () =>
    apiRequest<ApiSuccess<PaymentTermTemplate[]>>("/api/inquiries/payment-term-templates").then((r) => r.data),
};
