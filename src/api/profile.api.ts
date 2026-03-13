/**
 * Smart Work backend: GET /api/profile, PATCH /api/profile.
 */

import { apiRequest } from "@/api/client";
import type { GetProfileResponse, UpdateProfileDto } from "@/types/profile";

export async function getProfile(): Promise<GetProfileResponse> {
  const res = await apiRequest<{ data: GetProfileResponse; success: true }>("/api/profile");
  return res.data;
}

export async function updateProfile(dto: UpdateProfileDto): Promise<GetProfileResponse["employee"]> {
  const res = await apiRequest<{ data: GetProfileResponse["employee"]; success: true }>("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
  return res.data;
}
