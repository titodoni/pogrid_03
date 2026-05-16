import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";

type InvalidateFn = (queryClient: QueryClient, payload: Record<string, unknown>) => Promise<void>;

type InvalidationMap = Record<string, InvalidateFn[]>;

export async function invalidateByEvent(
  queryClient: QueryClient,
  event: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const handlers = invalidationMap[event];
  if (!handlers) return;

  await Promise.all(handlers.map((fn) => fn(queryClient, payload)));
}

const invalidationMap: InvalidationMap = {
  PO_CREATED: [
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.poList() }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.board() }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.dashboard() }),
    (qc) => qc.invalidateQueries({ queryKey: ["tasks"] }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.notifications("") }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.notificationCount("") }),
  ],

  PO_UPDATED: [
    (qc, p) => qc.invalidateQueries({ queryKey: queryKeys.po(p["poId"] as string) }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.poList() }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.board() }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.dashboard() }),
  ],

  PO_DELETED: [
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.poList() }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.board() }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.dashboard() }),
    (qc) => qc.invalidateQueries({ queryKey: ["tasks"] }),
  ],

  ITEM_PROGRESS_UPDATED: [
    (qc, p) => qc.invalidateQueries({ queryKey: queryKeys.item(p["itemId"] as string) }),
    (qc, p) => qc.invalidateQueries({ queryKey: queryKeys.itemProgress(p["itemId"] as string) }),
    (qc) => qc.invalidateQueries({ queryKey: ["tasks"] }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.board() }),
    (qc, p) => qc.invalidateQueries({ queryKey: queryKeys.po(p["poId"] as string) }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.dashboard() }),
  ],

  ITEM_STAGE_ADVANCED: [
    (qc, p) => qc.invalidateQueries({ queryKey: queryKeys.item(p["itemId"] as string) }),
    (qc) => qc.invalidateQueries({ queryKey: ["tasks"] }),
    (qc) => qc.invalidateQueries({ queryKey: ["taskArchive"] }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.board() }),
    (qc, p) => qc.invalidateQueries({ queryKey: queryKeys.po(p["poId"] as string) }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.dashboard() }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.notifications("") }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.notificationCount("") }),
  ],

  ITEM_QC_PASSED: [
    (qc, p) => qc.invalidateQueries({ queryKey: queryKeys.item(p["itemId"] as string) }),
    (qc) => qc.invalidateQueries({ queryKey: ["tasks"] }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.board() }),
    (qc, p) => qc.invalidateQueries({ queryKey: queryKeys.po(p["poId"] as string) }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.dashboard() }),
  ],

  ITEM_QC_FAILED: [
    (qc, p) => qc.invalidateQueries({ queryKey: queryKeys.item(p["itemId"] as string) }),
    (qc) => qc.invalidateQueries({ queryKey: ["tasks"] }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.board() }),
    (qc, p) => qc.invalidateQueries({ queryKey: queryKeys.po(p["poId"] as string) }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.dashboard() }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.problems() }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.notifications("") }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.notificationCount("") }),
  ],

  ITEM_DELIVERED: [
    (qc, p) => qc.invalidateQueries({ queryKey: queryKeys.item(p["itemId"] as string) }),
    (qc) => qc.invalidateQueries({ queryKey: ["tasks"] }),
    (qc) => qc.invalidateQueries({ queryKey: ["taskArchive"] }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.board() }),
    (qc, p) => qc.invalidateQueries({ queryKey: queryKeys.po(p["poId"] as string) }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.finance() }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.financeCounts() }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.dashboard() }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.notifications("") }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.notificationCount("") }),
  ],

  ITEM_RETURN_SPAWNED: [
    (qc, p) => qc.invalidateQueries({ queryKey: queryKeys.item(p["parentItemId"] as string) }),
    (qc, p) => qc.invalidateQueries({ queryKey: queryKeys.item(p["childItemId"] as string) }),
    (qc) => qc.invalidateQueries({ queryKey: ["tasks"] }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.board() }),
    (qc, p) => qc.invalidateQueries({ queryKey: queryKeys.po(p["poId"] as string) }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.finance() }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.dashboard() }),
  ],

  PROBLEM_REPORTED: [
    (qc, p) => qc.invalidateQueries({ queryKey: queryKeys.item(p["itemId"] as string) }),
    (qc, p) => qc.invalidateQueries({ queryKey: queryKeys.itemProblems(p["itemId"] as string) }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.problems() }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.board() }),
    (qc, p) => qc.invalidateQueries({ queryKey: queryKeys.po(p["poId"] as string) }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.dashboard() }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.notifications("") }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.notificationCount("") }),
  ],

  PROBLEM_RESOLVED: [
    (qc, p) => qc.invalidateQueries({ queryKey: queryKeys.item(p["itemId"] as string) }),
    (qc, p) => qc.invalidateQueries({ queryKey: queryKeys.itemProblems(p["itemId"] as string) }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.problems() }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.board() }),
    (qc, p) => qc.invalidateQueries({ queryKey: queryKeys.po(p["poId"] as string) }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.dashboard() }),
  ],

  INVOICE_STATUS_UPDATED: [
    (qc, p) => qc.invalidateQueries({ queryKey: queryKeys.item(p["itemId"] as string) }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.finance() }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.financeCounts() }),
    (qc, p) => qc.invalidateQueries({ queryKey: queryKeys.po(p["poId"] as string) }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.dashboard() }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.notifications("") }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.notificationCount("") }),
  ],

  NOTIFICATION_CREATED: [
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.notifications("") }),
    (qc) => qc.invalidateQueries({ queryKey: queryKeys.notificationCount("") }),
  ],
};
