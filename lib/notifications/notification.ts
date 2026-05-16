import { prisma } from "@/lib/db/prisma";

type CreateNotificationInput = {
  workspaceId: string;
  targetUserId?: string;
  targetRoleKey?: string;
  type: string;
  title: string;
  body: string;
  poId?: string;
  itemId?: string;
  problemId?: string;
};

export async function createNotification(input: CreateNotificationInput): Promise<string> {
  const record = await prisma.notification.create({
    data: {
      workspaceId: input.workspaceId,
      targetUserId: input.targetUserId ?? null,
      targetRoleKey: input.targetRoleKey ?? null,
      type: input.type,
      title: input.title,
      body: input.body,
      poId: input.poId ?? null,
      itemId: input.itemId ?? null,
      problemId: input.problemId ?? null,
    },
  });

  return record.id;
}

export async function createNotifications(
  inputs: CreateNotificationInput[],
): Promise<string[]> {
  const records = await prisma.notification.createManyAndReturn({
    data: inputs.map((i) => ({
      workspaceId: i.workspaceId,
      targetUserId: i.targetUserId ?? null,
      targetRoleKey: i.targetRoleKey ?? null,
      type: i.type,
      title: i.title,
      body: i.body,
      poId: i.poId ?? null,
      itemId: i.itemId ?? null,
      problemId: i.problemId ?? null,
    })),
  });

  return records.map((r) => r.id);
}
