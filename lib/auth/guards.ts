import type { SessionPayload } from "./session";
import { PermissionError } from "@/lib/workflow/errors";

export type GuardResult =
  | { allowed: true }
  | { allowed: false; reason: string };

function denied(reason: string): GuardResult {
  return { allowed: false, reason };
}

function ok(): GuardResult {
  return { allowed: true };
}

function assert(result: GuardResult): void {
  if (!result.allowed) {
    throw new PermissionError(result.reason);
  }
}

const STAFF_ROLES = [
  "ADMIN", "OWNER", "MANAGER", "SALES", "QC", "DELIVERY",
  "FINANCE", "DRAFTER", "PURCHASING", "OPERATOR",
];

export function requireRole(
  session: SessionPayload,
  allowedRoles: string[],
): GuardResult {
  if (session.role === "SUPERADMIN") return ok();
  if (allowedRoles.includes(session.role) || allowedRoles.includes(session.roleKey)) {
    return ok();
  }
  return denied("Aksi ini tidak tersedia untuk role Anda.");
}

export function requireAdmin(session: SessionPayload): GuardResult {
  return requireRole(session, ["ADMIN"]);
}

export function requireSuperadmin(session: SessionPayload): GuardResult {
  if (session.role === "SUPERADMIN") return ok();
  return denied("Hanya superadmin yang dapat mengakses ini.");
}

export function requireFinance(session: SessionPayload): GuardResult {
  return requireRole(session, ["FINANCE"]);
}

export function requireQC(session: SessionPayload): GuardResult {
  return requireRole(session, ["QC"]);
}

export function requireDelivery(session: SessionPayload): GuardResult {
  return requireRole(session, ["DELIVERY"]);
}

export function requireOperatorDepartment(
  session: SessionPayload,
  targetRoleKey?: string,
): GuardResult {
  if (session.role === "SUPERADMIN") return ok();
  if (session.role === "ADMIN") return ok();
  if (session.role !== "OPERATOR") {
    return denied("Hanya operator departemen yang dapat melakukan ini.");
  }
  if (targetRoleKey && session.roleKey !== targetRoleKey) {
    return denied("Anda hanya dapat memperbarui progress departemen Anda sendiri.");
  }
  return ok();
}

export function assertCanViewItem(session: SessionPayload): void {
  if (!session || !session.workspaceId) {
    throw new PermissionError("Sesi tidak valid.");
  }
  if (session.role === "SUPERADMIN") return;
  if (STAFF_ROLES.includes(session.role)) return;
  throw new PermissionError("Akses item tidak tersedia untuk role Anda.");
}

export function assertCanMutateItemStage(
  session: SessionPayload,
  itemStage: string,
): void {
  if (session.role === "SUPERADMIN") return;
  if (session.role === "ADMIN") return;

  const stageRoleMap: Record<string, string[]> = {
    DRAFTING: ["DRAFTER"],
    PURCHASING: ["PURCHASING"],
    PRODUCTION: ["OPERATOR"],
    QC: ["QC"],
    DELIVERY: ["DELIVERY"],
    DONE: [],
  };

  const allowed = stageRoleMap[itemStage];
  if (!allowed) {
    throw new PermissionError("Tahap item tidak dikenal.");
  }
  if (allowed.includes(session.role) || allowed.includes(session.roleKey)) {
    return;
  }
  throw new PermissionError("Anda tidak dapat mengubah item pada tahap ini.");
}

export function assertCanManageUsers(session: SessionPayload): void {
  assert(requireAdmin(session));
}

export function assertCanManageClients(session: SessionPayload): void {
  assert(requireAdmin(session));
}

export function assertCanViewAnalytics(session: SessionPayload): void {
  assert(requireRole(session, ["ADMIN", "OWNER", "MANAGER", "SALES"]));
}

export function assertCanResolveProblem(
  session: SessionPayload,
  problemReporterId?: string,
  problemItemDepartmentRoleKey?: string,
): void {
  if (session.role === "SUPERADMIN") return;
  if (session.role === "ADMIN") return;
  if (session.role === "MANAGER") return;
  if (problemReporterId && session.userId === problemReporterId) return;
  if (
    problemItemDepartmentRoleKey &&
    session.roleKey === problemItemDepartmentRoleKey
  ) {
    return;
  }
  throw new PermissionError("Anda tidak dapat menyelesaikan masalah ini.");
}

export { assert };
