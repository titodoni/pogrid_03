"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { differenceInDays, isPast, isToday } from "date-fns";
import { Search, AlertTriangle } from "lucide-react";

const STAGE_ABBR: Record<string, string> = {
  DRAFTING: "DRFT",
  PURCHASING: "PURCH",
  PRODUCTION: "MACH",
  QC: "QC",
  DELIVERY: "DELIV",
  DONE: "DONE",
};

const STAGE_DOT_COLOR: Record<string, string> = {
  DRAFTING: "bg-blue-400",
  PURCHASING: "bg-green-400",
  PRODUCTION: "bg-orange-400",
  QC: "bg-purple-400",
  DELIVERY: "bg-teal-400",
  DONE: "bg-gray-300",
};

type FilterTab = "all" | "active" | "done" | "urgent";

function aggregateProgress(items: any[]) {
  if (!items.length) return 0;
  const sum = items.reduce((acc: number, item: any) => {
    const prog = item.progress?.[0]?.progressValue ?? (item.status === "DONE" ? 100 : 0);
    return acc + prog;
  }, 0);
  return Math.round(sum / items.length);
}

function POListCard({ po }: { po: any }) {
  const items: any[] = po.items ?? [];
  const leadItem = items.find((i: any) => i.status !== "DONE") ?? items[0];
  const extraCount = items.length - 1;
  const progress = aggregateProgress(items);
  const activeProblems = items.flatMap((i: any) => (i.problems ?? []).filter((p: any) => !p.isResolved));

  const dueDate = po.dueDate ? new Date(po.dueDate) : null;
  const now = new Date();
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate);
  const daysLate = isOverdue ? Math.abs(differenceInDays(now, dueDate!)) : null;

  const isDone = items.every((i: any) => i.status === "DONE");
  const statusLabel = isDone ? "SELESAI" : isOverdue ? "TERLAMBAT" : "AKTIF";
  const statusClass = isDone
    ? "text-green-600"
    : isOverdue
    ? "text-red-500"
    : "text-blue-500";

  const activeStages = [...new Set(items.filter((i: any) => i.status !== "DONE").map((i: any) => i.status))];
  const allStages = ["DRAFTING", "PURCHASING", "PRODUCTION", "QC", "DELIVERY"];
  const stagesToShow = isDone ? [] : allStages.filter((s) => activeStages.includes(s));
  const barColor = isOverdue ? "bg-red-500" : isDone ? "bg-green-500" : "bg-blue-500";

  return (
    <Link href={`/po/${po.id}`} className="block">
      <div className="bg-card border border-border rounded-xl px-4 pt-4 pb-3 space-y-2 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[15px] leading-tight">
                {leadItem?.name ?? po.internalPoNumber}
              </span>
              {extraCount > 0 && (
                <span className="text-xs text-muted-foreground">+ {extraCount} item lainnya</span>
              )}
            </div>
          </div>
          <span className={`text-xs font-bold shrink-0 ${statusClass}`}>{statusLabel}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-muted-foreground">{po.internalPoNumber}</span>
          {po.client?.name && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{po.client.name}</span>
            </>
          )}
          {daysLate !== null && daysLate > 0 && (
            <span className="font-semibold text-red-500">{daysLate} hari terlambat</span>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className={`text-xs font-semibold ${isOverdue ? "text-red-500" : "text-blue-500"}`}>
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
        {stagesToShow.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {stagesToShow.map((s) => (
              <span key={s} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <span className={`h-2 w-2 rounded-full ${STAGE_DOT_COLOR[s]}`} />
                {STAGE_ABBR[s]}
              </span>
            ))}
          </div>
        )}
        {activeProblems.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
            <span className="text-xs font-medium text-yellow-700">
              {activeProblems.length} masalah terbuka
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function POPage() {
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");

  useEffect(() => {
    fetch("/api/po")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setPos(j.data); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = pos;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (po) =>
          po.internalPoNumber?.toLowerCase().includes(q) ||
          po.client?.name?.toLowerCase().includes(q)
      );
    }
    if (tab === "active") list = list.filter((po) => !po.items.every((i: any) => i.status === "DONE"));
    if (tab === "done") list = list.filter((po) => po.items.every((i: any) => i.status === "DONE"));
    if (tab === "urgent") list = list.filter((po) => po.isUrgent || (po.dueDate && isPast(new Date(po.dueDate))));
    return list;
  }, [pos, query, tab]);

  const TABS: { key: FilterTab; label: string }[] = [
    { key: "all", label: "Semua" },
    { key: "active", label: "Aktif" },
    { key: "done", label: "Selesai" },
    { key: "urgent", label: "Urgent" },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 rounded-xl bg-muted animate-pulse" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-8 w-16 rounded-full bg-muted animate-pulse" />)}
        </div>
        {[1, 2, 3].map((i) => <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-8">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari PO number, client..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-10 rounded-xl border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === key
                ? "bg-foreground text-background"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted-foreground text-sm">
            {query ? "Tidak ditemukan" : "Belum ada PO"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((po) => <POListCard key={po.id} po={po} />)}
        </div>
      )}
    </div>
  );
}
