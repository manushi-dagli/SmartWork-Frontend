/** Full employee from Smart Work GET /api/profile (includes roleName from API). */
export interface ProfileEmployee {
  id: string;
  username: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  address: string | null;
  phoneNumber: string | null;
  email: string | null;
  roleId: string | null;
  roleName: string | null;
  roleValue: string | null;
  profilePicture: string | null;
  [key: string]: unknown;
}

/** Super admin profile (limited fields). */
export interface SuperAdminProfile {
  id: string;
  username: string | null;
  email: string | null;
  firstName: string;
  lastName: string;
  [key: string]: unknown;
}

export type ProfileKind = "super_admin" | "employee";

export interface GetProfileResponse {
  kind: ProfileKind;
  employee: ProfileEmployee | SuperAdminProfile;
}

/** Fields the user can update via PATCH /api/profile (employees only). */
export interface UpdateProfileDto {
  username?: string | null;
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  email?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  /** Data URL (e.g. data:image/jpeg;base64,...) or URL string. */
  profilePicture?: string | null;
}
