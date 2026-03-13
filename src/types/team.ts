/** Role from Smart Work GET /api/roles. */
export type RoleValue = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | "ARTICLE";

export interface AppRole {
  id: string;
  name: string;
  value: RoleValue;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

/** List item from Smart Work GET /api/employees. */
export interface EmployeeListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  roleId: string | null;
  profilePicture: string | null;
}

export interface PaginatedEmployees {
  data: EmployeeListItem[];
  total: number;
  page: number;
  limit: number;
}
