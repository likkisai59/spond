import type { FeatureToggles, GroupRolePermissions, SportsGroup } from "@/types/sports";

export const DEFAULT_FEATURE_TOGGLES: FeatureToggles = {
  events: true,
  polls: true,
  payments: true,
  files: true,
  chat: true,
};

export const DEFAULT_ROLE_PERMISSIONS: GroupRolePermissions = {
  member: { ...DEFAULT_FEATURE_TOGGLES },
  coach: { ...DEFAULT_FEATURE_TOGGLES },
  treasurer: { ...DEFAULT_FEATURE_TOGGLES },
  admin: { ...DEFAULT_FEATURE_TOGGLES },
};

export function canAccessFeature(
  group: SportsGroup | null | undefined,
  role: string | null | undefined,
  feature: keyof FeatureToggles
): boolean {
  if (!group || !role) return true;

  const normalizedRole = role.toLowerCase().trim();
  // Owner always has full access to all features
  if (normalizedRole === "owner") return true;

  // Retrieve permissions handling both camelCase (from axios deepCamel) and snake_case
  const permissions: GroupRolePermissions | undefined =
    group.rolePermissions ||
    group.role_permissions ||
    (group as any)?.rolePermissions ||
    (group as any)?.role_permissions;

  if (!permissions) {
    return true;
  }

  const roleConfig = permissions[normalizedRole as keyof GroupRolePermissions];
  if (!roleConfig) {
    return true;
  }

  return roleConfig[feature] !== false;
}
