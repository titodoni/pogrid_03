"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  differenceInHours,
  differenceInDays,
  isPast,
  isToday,
  isTomorrow,
  format,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Plus, AlertTriangle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_LABEL: Record<string, string> = {
  DRAFTING: "Gambar",
  PURCHASING: "Pembelian",
  PRODUCTION: "Produksi",
  QC: "QC",
  DELIVERY: "Pengiriman",
  DONE: "Selesai",
};

const PROBLEM_LABEL: Record<string, string> = {
  MATERIAL_NOT_ARRIVED: "Material belum tiba",
  MATERIAL_MISMATCH: "Material tidak sesuai",
  MACHINE_TOOL_FAILURE: "Mesin/alat rusak",
  OPERATOR_UNAVAILABLE: "Operator tidak ada",
  DRAWING_SPEC_UNCLEAR: "Gambar kurang jelas",
  DRAWING_REDRAW: "Gambar perlu diulang",
  PRODUCTION_BEFORE_PURCHASING_COMPLETE: "Produksi sebelum purchasing selesai",
  OTHER: "Lainnya",
};

// Derive the "representative" item for the card heading
// (first non-DONE item, or last item if all done)
function leadItem(items: any[]) {
  return items.find((i) => i.status !== "DONE") ?? items[items.length - 1];
}

// Aggregate progress across all items (average of item progress values)
function aggregateProgress(items: any[]) {
  if (!items.length) return 0;
  const sum = items.reduce((acc: number, item: any) => {
    const prog = item.progress?.[0]?.progressValue ?? (item.status === "DONE" ? 100 : 0);
    return acc + prog;
  }, 0);
  return Math.round(sum / items.length);
}

function POCard({ po }: { po: any }) {
  const items: any[] = po.items ?? [];
  const lead = leadItem(items);
  const extraCount = items.length - 1;
  const progress = aggregateProgress(items);

  // Active problems across all items
  const activeProblems = items.flatMap((i: any) =>
    (i.problems ?? []).filter((p: any) => !p.isResolved)
  );
  const firstProblem = activeProblems[0];

  // Last note (latest progressLog note across items)
  const allNotes = items
    .flatMap((i: any) => i.progressLogs ?? [])
    .filter((l: any) => l.note)
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  const lastNote = allNotes[0]?.note ?? null;

  // Due / overdue calculation
  const dueDate = po.dueDate ? new Date(po.dueDate) : null;
  const now = new Date();
  const hoursLate = dueDate && isPast(dueDate) && !isToday(dueDate)
    ? Math.abs(differenceInHours(now, dueDate))
    : null;

  const isUrgent =
    po.isUrgent ||
    (dueDate && (isPast(dueDate) || isToday(dueDate) || isTomorrow(dueDate)));
  const hasIssue = activeProblems.length > 0 || hoursLate !== null;

  // Bar color: red if overdue/problem, blue otherwise
  const barColor = hasIssue ? "bg-orange-500" : "bg-blue-500";

  // Date label (left side of date row)
  const dateLabel = dueDate
    ? format(dueDate, "d MMM yyyy", { locale: idLocale })
    : null;

  // Stage of lead item
  const stageLabel = lead ? STATUS_LABEL[lead.status] ?? lead.status : "";

  return (
    <Link href={`/po/${po.id}`} className="block">
      <div
        className={`relative rounded-xl bg-card border transition-shadow hover:shadow-md ${
          hasIssue
            ? "border-l-[3px] border-l-red-400 border-border"
            : "border-border"
        }`}
      >
        <div className="px-4 pt-4 pb-3 space-y-2.5">
          {/* — Title row — */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="font-semibold text-[15px] leading-tight truncate">
                {lead?.name ?? po.internalPoNumber}
              </span>
              {extraCount > 0 && (
                <span className="shrink-0 text-[11px] font-medium text-muted-foreground border border-border rounded-full px-1.5 py-0.5 leading-none">
                  +{extraCount} lagi
                </span>
              )}
              {isUrgent && (
                <span className="shrink-0 text-[10px] font-bold bg-red-100 text-red-600 rounded px-1.5 py-0.5 leading-none uppercase tracking-wide">
                  URGENT
                </span>
              )}
            </div>
          </div>

          {/* — Client · PO number — */}
          <p className="text-xs text-muted-foreground -mt-1">
            {po.client?.name}
            {po.client?.name && po.internalPoNumber && " · "}
            {po.internalPoNumber}
          </p>

          {/* — Progress — */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span
                className={`text-xs font-semibold ${
                  hasIssue ? "text-orange-500" : "text-blue-500"
                }`}
              >
                {progress}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* — Date row — */}
          {(dateLabel || hoursLate !== null) && (
            <div className="flex items-center justify-between">
              {dateLabel && (
                <span className="text-xs text-muted-foreground">{dateLabel}</span>
              )}
              {hoursLate !== null && (
                <span className="text-xs font-semibold text-red-500">
                  {hoursLate}h terlambat
                </span>
              )}
            </div>
          )}

          {/* — Active problem line — */}
          {firstProblem && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-orange-400 shrink-0" />
              <span className="text-xs text-orange-500 font-medium">
                {PROBLEM_LABEL[firstProblem.category] ?? firstProblem.category}
                {firstProblem.stoppedDays
                  ? ` terhenti ${firstProblem.stoppedDays} hari`
                  : ""}
              </span>
            </div>
          )}

          {/* — Last note — */}
          {lastNote && (
            <div className="flex items-start gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
              <span className="text-xs text-muted-foreground italic truncate">
                &ldquo;{lastNote}&rdquo;
              </span>
            </div>
          )}

          {/* — Est. selesai — */}
          {dueDate && (
            <p className="text-xs text-muted-foreground/70">
              Est. selesai:{" "}
              {format(dueDate, "dd MMM yyyy", { locale: idLocale })}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function POPage() {
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/po")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setPos(j.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[148px] rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!pos.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <p className="text-muted-foreground text-sm">Belum ada PO</p>
        <Button asChild>
          <Link href="/po/new">
            <Plus className="h-4 w-4 mr-1" />Buat PO Baru
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-8">
      <div className="flex items-center justify-between pb-1">
        <h2 className="text-base font-semibold">
          Production Orders ({pos.length})
        </h2>
        <Button asChild size="sm">
          <Link href="/po/new">
            <Plus className="h-4 w-4 mr-1" />Baru
          </Link>
        </Button>
      </div>

      {pos.map((po: any) => (
        <POCard key={po.id} po={po} />
      ))}
    </div>
  );
}
