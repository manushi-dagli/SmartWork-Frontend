/**
 * Smart Work backend: GET /api/employees (list), POST /api/employees (create), check-username.
 */

import { apiRequest } from "@/api/client";
import type { PaginatedEmployees } from "@/types/team";

interface ApiSuccess<T> {
  data: T;
  success: true;
}

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

/** Employee returned by POST /api/employees (create). */
export interface CreateEmployeeResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  roleId: string | null;
  [key: string]: unknown;
}

export interface CreateEmployeeBody {
  username?: string | null;
  password?: string | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email?: string | null;
  roleId?: string | null;
}

export async function createEmployee(body: CreateEmployeeBody): Promise<CreateEmployeeResponse> {
  const res = await apiRequest<ApiSuccess<CreateEmployeeResponse>>("/api/employees", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function checkUsernameAvailable(
  username: string,
  excludeId?: string
): Promise<{ available: boolean }> {
  const params = new URLSearchParams({ username: username.trim() });
  if (excludeId) params.set("excludeId", excludeId);
  const res = await apiRequest<ApiSuccess<{ available: boolean }>>(
    `/api/employees/check-username?${params.toString()}`
  );
  return res.data;
}
