import { validateSession } from "@/lib/auth/session";
import { checkRole } from "@/lib/auth/role-guard";
import { createAuditLog } from "@/lib/audit/audit-log";
import { createNotification } from "@/lib/notifications/notification";
import { broadcastEvent } from "@/lib/realtime/pusher-server";
import { successResult, failureResult, type MutationResult } from "./mutation-result";
import { MutationError } from "./errors";

type AuditEntry = {
  action: string;
  entityType: string;
  entityId: string;
  fromValue?: Record<string, unknown> | null;
  toValue?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
};

type NotificationEntry = {
  targetUserId?: string;
  targetRoleKey?: string;
  type: string;
  title: string;
  body: string;
  poId?: string;
  itemId?: string;
  problemId?: string;
};

type PusherEntry = {
  event: string;
  payload: Record<string, unknown>;
};

type MutationContext<TInput> = {
  input: TInput;
  session: {
    userId: string;
    role: string;
    roleKey: string;
    departmentId?: string;
    workspaceId: string;
  };
};

type MutationHandler<TInput, TOutput> = (
  ctx: MutationContext<TInput>,
) => Promise<{
  data: TOutput;
  auditLogs?: AuditEntry[];
  notifications?: NotificationEntry[];
  pusherEvents?: PusherEntry[];
}>;

type MutationOptions = {
  allowedRoles?: string[];
  requireDepartment?: boolean;
};

export async function executeMutation<TInput, TOutput>(
  input: TInput,
  handler: MutationHandler<TInput, TOutput>,
  options: MutationOptions = {},
): Promise<MutationResult<TOutput>> {
  try {
    const session = await validateSession();
    if (!session) {
      return failureResult({
        code: "AUTH_ERROR",
        message: "Sesi tidak valid. Silakan login ulang.",
      });
    }

    const guardResult = checkRole(session, options);
    if (!guardResult.allowed) {
      return failureResult({
        code: "FORBIDDEN",
        message: guardResult.reason,
      });
    }

    const ctx: MutationContext<TInput> = {
      input,
      session: {
        userId: session.userId,
        role: session.role,
        roleKey: session.roleKey,
        departmentId: session.departmentId,
        workspaceId: session.workspaceId,
      },
    };

    const result = await handler(ctx);

    const auditIds: string[] = [];
    if (result.auditLogs) {
      for (const audit of result.auditLogs) {
        const id = await createAuditLog({
          workspaceId: ctx.session.workspaceId,
          actorUserId: ctx.session.userId,
          actorType: "USER",
          action: audit.action,
          entityType: audit.entityType,
          entityId: audit.entityId,
          fromValue: audit.fromValue,
          toValue: audit.toValue,
          metadata: audit.metadata,
        });
        auditIds.push(id);
      }
    }

    if (result.notifications) {
      for (const notif of result.notifications) {
        await createNotification({
          workspaceId: ctx.session.workspaceId,
          ...notif,
        });
      }
    }

    if (result.pusherEvents) {
      for (const event of result.pusherEvents) {
        await broadcastEvent(
          event.event as never,
          event.payload as never,
        );
      }
    }

    return successResult(result.data, {
      auditId: auditIds[0],
    });
  } catch (error) {
    if (error instanceof MutationError) {
      return failureResult({
        code: error.code,
        message: error.message,
      });
    }

    console.error("Unexpected mutation error:", error);
    return failureResult({
      code: "SERVER_ERROR",
      message: "Terjadi kesalahan server. Coba lagi.",
    });
  }
}
