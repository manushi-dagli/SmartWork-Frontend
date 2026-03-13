/** Permission shape for CASL (from Smart Work backend). */
export interface AuthPermission {
  action: string;
  subject: string;
  scope: string | null;
}

/** Current user from Smart Work POST /api/auth/login or GET /api/auth/me (employee or super admin). */
export interface AuthUser {
  id: string;
  username: string | null;
  email: string | null;
  firstName: string;
  lastName: string;
  roleValue: string;
  isSuperAdmin?: boolean;
  roleId?: string | null;
  permissions?: AuthPermission[];
  descendantRoleIds?: string[];
}
