import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

type AuditLogInput = {
  workspaceId: string;
  actorUserId?: string;
  actorType: "USER" | "SYSTEM";
  action: string;
  entityType: string;
  entityId: string;
  fromValue?: Record<string, unknown> | null;
  toValue?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
};

const auditActionMap: Record<string, string> = {
  PROGRESS_UPDATE: "PROGRESS_UPDATE",
  STAGE_ADVANCE: "STAGE_ADVANCE",
  ADMIN_OVERRIDE: "ADMIN_OVERRIDE",
  QC_PASS: "QC_PASS",
  QC_MINOR_FAIL: "QC_MINOR_FAIL",
  QC_MAJOR_FAIL: "QC_MAJOR_FAIL",
  REWORK_SPAWNED: "REWORK_SPAWNED",
  RETURN_SPAWNED: "RETURN_SPAWNED",
  INVOICE_UPDATE: "INVOICE_UPDATE",
  EDIT_PO_FIELD: "EDIT_PO_FIELD",
  FLAG_ESCALATE: "FLAG_ESCALATE",
  DELETE_PO: "DELETE_PO",
  PROBLEM_REPORTED: "PROBLEM_REPORTED",
  PROBLEM_RESOLVED: "PROBLEM_RESOLVED",
  PIN_RESET: "PIN_RESET",
  SELF_PIN_CHANGE: "SELF_PIN_CHANGE",
  USER_CREATED: "USER_CREATED",
  USER_TOGGLED: "USER_TOGGLED",
};

export async function createAuditLog(input: AuditLogInput): Promise<string> {
  const auditAction = auditActionMap[input.action];
  if (!auditAction) {
    console.warn(`Unknown audit action: ${input.action}`);
  }

  const record = await prisma.auditLog.create({
    data: {
      workspaceId: input.workspaceId,
      actorUserId: input.actorUserId,
      actorType: input.actorType as "USER" | "SYSTEM",
      action: (auditAction ?? input.action) as never,
      entityType: input.entityType,
      entityId: input.entityId,
      fromValue: (input.fromValue ?? null) as Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue,
      toValue: (input.toValue ?? null) as Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue,
      metadata: (input.metadata ?? null) as Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue,
    },
  });

  return record.id;
}

export { auditActionMap };
