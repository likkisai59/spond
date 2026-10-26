import type { FeatureToggles, GroupRolePermissions, SportsGroup } from "@/types/sports";

export const DEFAULT_FEATURE_TOGGLES: FeatureToggles = {
  events: true,
  polls: true,
  payments: true,
  files: true,
  chat: true,
  attendance: true,
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

export function getUserRoleInGroup(group: SportsGroup, currentUser: any): string {
  if (!currentUser) return "member";
  const currentUserId = currentUser.id || (currentUser as any)._id;
  const currentUserEmail = currentUser.email?.toLowerCase().trim();

  if (group.createdBy && group.createdBy === currentUserId) return "owner";
  if (group.created_by && group.created_by === currentUserId) return "owner";

  const member = (group.members ?? []).find((m: any) => {
    if (m.userId && m.userId === currentUserId) return true;
    if (m.user_id && m.user_id === currentUserId) return true;
    if (m.id && m.id === currentUserId) return true;
    if (m.email && currentUserEmail && m.email.toLowerCase().trim() === currentUserEmail) return true;
    return false;
  });

  if (member?.role) {
    return member.role.toLowerCase().trim();
  }

  if (currentUser.role === "admin" && (group.createdBy === currentUserId || group.created_by === currentUserId)) {
    return "owner";
  }

  return "member";
}

export function canUserAccessFeatureInGroups(
  groups: SportsGroup[],
  currentUser: any,
  feature: keyof FeatureToggles
): boolean {
  if (!currentUser) return true;
  if (currentUser.role === "admin" || currentUser.role === "member") return true;

  const memberGroups = groups.filter((g) => {
    if (currentUser.role === "player" && (g.createdBy === currentUser.id || g.created_by === currentUser.id)) {
      return false;
    }
    return true;
  });
  const activeGroups = memberGroups.length > 0 ? memberGroups : groups;
  if (activeGroups.length === 0) return true;

  return activeGroups.some((g) => canAccessFeature(g, getUserRoleInGroup(g, currentUser), feature));
}
