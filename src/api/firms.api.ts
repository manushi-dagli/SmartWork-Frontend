/**
 * Firms API: list and get.
 * Backend: /api/firms
 */

import { apiRequest } from "@/api/client";

interface ApiSuccess<T> {
  data: T;
  success: true;
}

export interface Firm {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phoneCountryCode: string | null;
  phoneNumber: string | null;
  email: string | null;
  pan: string | null;
  gst: string | null;
  bankDetails: unknown;
  upiId: string | null;
  qrCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export const firmsApi = {
  listFirms: () =>
    apiRequest<ApiSuccess<Firm[]>>("/api/firms").then((r) => r.data),

  getFirm: (id: string) =>
    apiRequest<ApiSuccess<Firm>>(`/api/firms/${id}`).then((r) => r.data),
};
