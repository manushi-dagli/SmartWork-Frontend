/**
 * CASL ability built from Smart Work backend permissions (roleId, permissions, descendantRoleIds).
 * Mirrors backend defineAbilityFromRolePermissions logic for UI gating.
 */
import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import type { AuthPermission } from "@/types/auth";

export type Actions = "create" | "read" | "update" | "delete" | "manage";
export type Subjects =
  | "Firm"
  | "Role"
  | "Client"
  | "Family"
  | "Employee"
  | "User"
  | "Report"
  | "Settings"
  | "all";

/** Subject instance for conditional checks (Employee). */
export type EmployeeSubject = {
  type: "Employee";
  roleId?: string | null;
  assignRoleId?: string | null;
};

export type AppAbility = ReturnType<typeof createAppAbility>;

function createAppAbility() {
  return createMongoAbility<[Actions, Subjects]>();
}

export function defineAbilityFromAuth(
  roleId: string | null,
  permissions: AuthPermission[],
  descendantRoleIds: string[]
): AppAbility {
  const { can, build } = new AbilityBuilder(createAppAbility);
  const sameOrBelowIds = roleId ? [roleId, ...descendantRoleIds] : [];
  const cond = (c: Record<string, unknown>) => c as Parameters<typeof can>[2];

  for (const p of permissions) {
    const action = p.action as Actions;
    const subject = (p.subject === "all" ? "all" : p.subject) as Subjects;
    if (action === "manage" && subject === "all") {
      can("manage", "all");
      continue;
    }
    if (!p.scope || p.scope === "all") {
      can(action, subject);
      continue;
    }
    const allowedIds = p.scope === "below" ? descendantRoleIds : sameOrBelowIds;
    const roleIdCond = { roleId: { $in: allowedIds } };
    const assignRoleIdCond = { assignRoleId: { $in: allowedIds } };
    if (action === "read") {
      can("read", subject);
      can("read", subject, cond(roleIdCond));
    } else if (action === "create") {
      can(action, subject, cond(assignRoleIdCond));
    } else {
      can(action, subject, cond(roleIdCond));
    }
  }

  return build({
    detectSubjectType: (subject) =>
      typeof subject === "object" && subject !== null && "type" in subject
        ? (subject as { type: Subjects }).type
        : (subject as Subjects),
  });
}
