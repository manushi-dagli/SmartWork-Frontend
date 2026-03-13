import { useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { defineAbilityFromAuth } from "@/lib/ability";

export function useAbility() {
  const user = useSelector((state: RootState) => state.auth.user);
  return useMemo(() => {
    if (!user?.permissions?.length && !user?.isSuperAdmin) {
      return defineAbilityFromAuth(null, [], []);
    }
    if (user?.isSuperAdmin) {
      return defineAbilityFromAuth(null, [{ action: "manage", subject: "all", scope: null }], []);
    }
    return defineAbilityFromAuth(
      user?.roleId ?? null,
      user?.permissions ?? [],
      user?.descendantRoleIds ?? []
    );
  }, [user?.roleId, user?.permissions, user?.descendantRoleIds, user?.isSuperAdmin]);
}
