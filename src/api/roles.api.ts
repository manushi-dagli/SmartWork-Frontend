/**
 * Smart Work backend: GET /api/roles (list all roles for filter).
 */

import { apiRequest } from "@/api/client";
import type { AppRole } from "@/types/team";

export interface ListRolesResponse {
  data: AppRole[];
  success: true;
}

export async function listRoles(): Promise<AppRole[]> {
  const res = await apiRequest<ListRolesResponse>("/api/roles");
  return res.data;
}
