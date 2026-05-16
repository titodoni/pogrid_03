/**
 * Helper untuk summary card PO/item.
 * Semua label stage resmi didefinisikan di sini — satu sumber kebenaran.
 */

import type { ItemProgress, Department, Problem } from "@/app/generated/prisma/browser";

/** Map dari status DB → label tampil di UI */
export const STAGE_LABELS: Record<string, string> = {
  DRAFTING: "Gambar",
  PURCHASING: "Purchasing",
  MACHINING: "Machining",
  FABRIKASI: "Fabrikasi",
  ASSEMBLY: "Assembly",
  QC: "QC",
  DELIVERY: "Delivery",
  FINANCE: "Finance",
  DONE: "Selesai",
  PRODUCTION: "Produksi", // fallback saja — sebaiknya diganti stage spesifik
};

/** Ambil label display dari nama departemen atau status */
export function getStageLabelFromDeptName(name: string): string {
  const upper = name.toUpperCase();
  return STAGE_LABELS[upper] ?? name;
}

export type ProgressWithDept = ItemProgress & { department: Department };

/**
 * Kelompokkan items berdasarkan tahap aktif (progress < 100).
 * Return: { "Machining": 2, "Delivery": 1 }
 */
export function groupItemsByActiveStage(
  itemProgressList: ProgressWithDept[][]
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const progressList of itemProgressList) {
    // Cari departemen aktif = progress terendah yang belum 100
    const active = progressList
      .filter((p) => p.progressValue < 100)
      .sort((a, b) => (a.progressValue ?? 0) - (b.progressValue ?? 0))[0];

    if (active) {
      const label = getStageLabelFromDeptName(active.department.name);
      counts[label] = (counts[label] ?? 0) + 1;
    }
  }

  return counts;
}

/** Hitung total masalah aktif dari semua item */
export function countActiveProblems(problemsList: Problem[][]): number {
  return problemsList.reduce(
    (sum, problems) => sum + problems.filter((p) => !p.isResolved).length,
    0
  );
}

/** Ambil tahap aktif satu item (untuk detail card) */
export function getActiveStage(progress: ProgressWithDept[]): ProgressWithDept | null {
  const inProgress = progress
    .filter((p) => p.progressValue > 0 && p.progressValue < 100)
    .sort((a, b) => b.progressValue - a.progressValue);
  if (inProgress.length > 0) return inProgress[0];

  const notStarted = progress
    .filter((p) => p.progressValue === 0)
    .sort((a, b) => (a.department.stageOrder ?? 0) - (b.department.stageOrder ?? 0));
  return notStarted[0] ?? null;
}
