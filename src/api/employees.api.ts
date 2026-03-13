/**
 * Smart Work backend: GET /api/employees (list with optional roleId filter).
 */

import { apiRequest } from "@/api/client";
import type { PaginatedEmployees } from "@/types/team";

export interface ListEmployeesParams {
  page?: number;
  limit?: number;
  roleId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ListEmployeesResponse {
  data: PaginatedEmployees;
  success: true;
}

export async function listEmployees(params: ListEmployeesParams = {}): Promise<PaginatedEmployees> {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.roleId) search.set("roleId", params.roleId);
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.sortOrder) search.set("sortOrder", params.sortOrder);
  const qs = search.toString();
  const path = qs ? `/api/employees?${qs}` : "/api/employees";
  const res = await apiRequest<ListEmployeesResponse>(path);
  return res.data;
}
