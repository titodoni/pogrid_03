import type { SessionPayload } from "./session";

type RoleGuardOptions = {
  allowedRoles?: string[];
  requireDepartment?: boolean;
  allowSuperadmin?: boolean;
};

export function checkRole(
  session: SessionPayload,
  options: RoleGuardOptions,
): { allowed: true } | { allowed: false; reason: string } {
  const { allowedRoles, requireDepartment, allowSuperadmin } = options;

  if (allowSuperadmin !== false && session.role === "SUPERADMIN") {
    return { allowed: true };
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(session.role) && !allowedRoles.includes(session.roleKey)) {
      return { allowed: false, reason: "Aksi ini tidak tersedia untuk role Anda." };
    }
  }

  if (requireDepartment && !session.departmentId) {
    return { allowed: false, reason: "User tidak memiliki departemen." };
  }

  return { allowed: true };
}

export function assertRole(
  session: SessionPayload,
  options: RoleGuardOptions,
): asserts session is SessionPayload {
  const result = checkRole(session, options);
  if (!result.allowed) {
    throw new Error(result.reason);
  }
}
