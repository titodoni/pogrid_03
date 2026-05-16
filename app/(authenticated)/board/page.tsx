"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  differenceInHours,
  differenceInDays,
  isPast,
  isToday,
  isTomorrow,
  isAfter,
  subDays,
  startOfMonth,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ChevronRight, AlertTriangle, Clock, Plus, Search } from "lucide-react";

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

type Period = "month" | "7d" | "all";
type KpiKey = "overdue" | "deadline" | "problems" | "done";
type FilterTab = "all" | "active" | "done" | "urgent";

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}

function filterByPeriod(orders: any[], period: Period) {
  const now = new Date();
  if (period === "7d") return orders.filter((o) => isAfter(new Date(o.createdAt), subDays(now, 7)));
  if (period === "month") return orders.filter((o) => isAfter(new Date(o.createdAt), startOfMonth(now)));
  return orders;
}

function aggregateProgress(items: any[]) {
  if (!items.length) return 0;
  const sum = items.reduce((acc: number, item: any) => {
    const prog = item.progress?.[0]?.progressValue ?? (item.status === "DONE" ? 100 : 0);
    return acc + prog;
  }, 0);
  return Math.round(sum / items.length);
}

const BORDER_COLOR: Record<string, string> = {
  red: "border-t-red-400",
  orange: "border-t-orange-400",
  yellow: "border-t-yellow-400",
  green: "border-t-green-400",
};

function KpiCard({
  color, value, title, subtitle, kpiKey, active, onToggle, children,
}: {
  color: "red" | "orange" | "yellow" | "green";
  value: number;
  title: string;
  subtitle: string;
  kpiKey: KpiKey;
  active: KpiKey | null;
  onToggle: (k: KpiKey) => void;
  children: React.ReactNode;
}) {
  const isOpen = active === kpiKey;
  return (
    <div>
      <button
        type="button"
        onClick={() => onToggle(kpiKey)}
        className={`w-full text-left rounded-xl border border-t-[3px] bg-card ${
          BORDER_COLOR[color]
        } p-4 transition-shadow hover:shadow-md flex items-start justify-between gap-2`}
      >
        <div>
          <p className="text-3xl font-bold leading-none mb-1">{value}</p>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        <ChevronRight
          className={`h-4 w-4 text-muted-foreground shrink-0 mt-1 transition-transform ${
            isOpen ? "rotate-90" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="mt-1 rounded-xl border bg-card divide-y">
          {value === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Tidak ada data</p>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
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
  const hoursLate = isOverdue ? Math.abs(differenceInHours(now, dueDate!)) : null;
  const daysLate = isOverdue ? Math.abs(differenceInDays(now, dueDate!)) : null;

  const isDone = items.every((i: any) => i.status === "DONE");
  const statusLabel = isDone ? "SELESAI" : isOverdue ? "TERLAMBAT" : "AKTIF";
  const statusClass = isDone ? "text-green-600" : isOverdue ? "text-red-500" : "text-blue-500";

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
              <span className="font-semibold text-[15px] leading-tight">{leadItem?.name ?? po.internalPoNumber}</span>
              {extraCount > 0 && (
                <span className="text-xs text-muted-foreground">+ {extraCount} item lainnya</span>
              )}
            </div>
          </div>
          <span className={`text-xs font-bold shrink-0 ${statusClass}`}>{statusLabel}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-muted-foreground">{po.internalPoNumber}</span>
          {po.client?.name && <><span className="text-muted-foreground">·</span><span className="text-muted-foreground">{po.client.name}</span></>}
          {daysLate !== null && daysLate > 0 && <span className="font-semibold text-red-500">{daysLate} hari terlambat</span>}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className={`text-xs font-semibold ${isOverdue ? "text-red-500" : "text-blue-500"}`}>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${progress}%` }} />
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
            <span className="text-xs font-medium text-yellow-700">{activeProblems.length} masalah terbuka</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function BoardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("month");
  const [activeKpi, setActiveKpi] = useState<KpiKey | null>(null);
  const [userName, setUserName] = useState("Admin");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");

  useEffect(() => {
    fetch("/api/board")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setData(j.data); })
      .finally(() => setLoading(false));
    fetch("/api/me")
      .then((r) => r.json())
      .then((j) => { if (j.ok && j.data?.name) setUserName(j.data.name.split(" ")[0]); })
      .catch(() => {});
  }, []);

  const toggleKpi = useCallback((k: KpiKey) => {
    setActiveKpi((prev) => (prev === k ? null : k));
  }, []);

  const kpi = useMemo(() => {
    if (!data) return null;
    const { orders } = data;
    const fo = filterByPeriod(orders, period);
    const now = new Date();

    const overdue = fo.filter((o: any) => !o.items.every((i: any) => i.status === "DONE") && o.dueDate && isPast(new Date(o.dueDate)) && !isToday(new Date(o.dueDate)));
    const deadline = fo.filter((o: any) => {
      if (!o.dueDate || o.items.every((i: any) => i.status === "DONE")) return false;
      const d = new Date(o.dueDate);
      const days = differenceInDays(d, now);
      return !isPast(d) && days <= 3;
    });
    const allProblems = fo.flatMap((o: any) =>
      (o.items ?? []).flatMap((i: any) =>
        (i.problems ?? []).filter((p: any) => !p.isResolved).map((p: any) => ({ ...p, _poId: o.id, _poNum: o.internalPoNumber, _client: o.client?.name, _itemName: i.name }))
      )
    );
    const done = fo.filter((o: any) => o.items.every((i: any) => i.status === "DONE"));
    const completionRate = fo.length ? Math.round((done.length / fo.length) * 100) : 0;
    const overdueDelays = overdue.map((o: any) => Math.abs(differenceInDays(new Date(o.dueDate), now)));
    const avgDelay = overdueDelays.length ? Math.round(overdueDelays.reduce((a: number, b: number) => a + b, 0) / overdueDelays.length) : 0;
    const worstHours = overdue.length ? Math.max(...overdue.map((o: any) => Math.abs(differenceInHours(new Date(o.dueDate), now)))) : 0;

    return { overdue, deadline, allProblems, done, completionRate, avgDelay, worstHours };
  }, [data, period]);

  const filteredPOs = useMemo(() => {
    if (!data) return [];
    let list = data.orders ?? [];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((po: any) =>
        po.internalPoNumber?.toLowerCase().includes(q) ||
        po.client?.name?.toLowerCase().includes(q)
      );
    }
    if (tab === "active") list = list.filter((po: any) => !po.items.every((i: any) => i.status === "DONE"));
    if (tab === "done") list = list.filter((po: any) => po.items.every((i: any) => i.status === "DONE"));
    if (tab === "urgent") list = list.filter((po: any) => po.isUrgent || (po.dueDate && isPast(new Date(po.dueDate))));
    return list;
  }, [data, query, tab]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-16 rounded-xl bg-muted animate-pulse" />
        <div className="h-8 rounded-xl bg-muted animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
        </div>
        {[1, 2].map((i) => <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />)}
      </div>
    );
  }

  if (!data || !kpi) {
    return <div className="py-16 text-center text-sm text-muted-foreground">Gagal memuat board.</div>;
  }

  const { overdue, deadline, allProblems, done, completionRate, avgDelay, worstHours } = kpi;

  const PERIODS: { key: Period; label: string }[] = [
    { key: "month", label: "Bulan Ini" },
    { key: "7d", label: "7 Hari" },
    { key: "all", label: "Semua" },
  ];

  const TABS: { key: FilterTab; label: string }[] = [
    { key: "all", label: "Semua" },
    { key: "active", label: "Aktif" },
    { key: "done", label: "Selesai" },
    { key: "urgent", label: "Urgent" },
  ];

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{greeting()}, {userName}</p>
          <h1 className="text-2xl font-bold leading-tight">Dashboard</h1>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-red-500">{completionRate}%</p>
          <p className="text-[11px] text-muted-foreground">{completionRate}% vs periode lalu</p>
        </div>
      </div>

      {/* Period tabs */}
      <div className="flex rounded-xl bg-muted p-1 gap-1">
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setPeriod(key)}
            className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${
              period === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* KPI 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard color="red" value={overdue.length} title="Terlambat" subtitle="PO melewati deadline" kpiKey="overdue" active={activeKpi} onToggle={toggleKpi}>
          {overdue.map((po: any) => (
            <Link key={po.id} href={`/po/${po.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{po.internalPoNumber}</p>
                <p className="text-xs text-muted-foreground truncate">{po.client?.name}</p>
              </div>
              <span className="text-xs text-red-500 font-medium shrink-0 ml-2">
                {Math.abs(differenceInHours(new Date(po.dueDate), new Date()))}h
              </span>
            </Link>
          ))}
        </KpiCard>

        <KpiCard color="orange" value={deadline.length} title="Deadline Dekat" subtitle="≤ 3 hari lagi" kpiKey="deadline" active={activeKpi} onToggle={toggleKpi}>
          {deadline.map((po: any) => {
            const days = differenceInDays(new Date(po.dueDate), new Date());
            return (
              <Link key={po.id} href={`/po/${po.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{po.internalPoNumber}</p>
                  <p className="text-xs text-muted-foreground truncate">{po.client?.name}</p>
                </div>
                <span className="text-xs text-orange-500 font-medium shrink-0 ml-2">
                  {isToday(new Date(po.dueDate)) ? "Hari ini" : isTomorrow(new Date(po.dueDate)) ? "Besok" : `${days} hari`}
                </span>
              </Link>
            );
          })}
        </KpiCard>

        <KpiCard color="yellow" value={allProblems.length} title="Masalah Terbuka" subtitle="Belum terselesaikan" kpiKey="problems" active={activeKpi} onToggle={toggleKpi}>
          {allProblems.map((p: any) => (
            <Link key={p.id} href={`/po/${p._poId}`} className="flex items-start justify-between px-4 py-3 hover:bg-muted/50 transition-colors gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{p._itemName}</p>
                <p className="text-xs text-muted-foreground truncate">{p._poNum} · {p._client}</p>
                <p className="text-xs text-orange-500 mt-0.5">{PROBLEM_LABEL[p.category] || p.category}</p>
              </div>
              <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
            </Link>
          ))}
        </KpiCard>

        <KpiCard color="green" value={done.length} title="Selesai" subtitle={period === "month" ? "Bulan ini" : period === "7d" ? "7 hari ini" : "Semua waktu"} kpiKey="done" active={activeKpi} onToggle={toggleKpi}>
          {done.map((po: any) => (
            <Link key={po.id} href={`/po/${po.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{po.internalPoNumber}</p>
                <p className="text-xs text-muted-foreground truncate">{po.client?.name}</p>
              </div>
              <span className="text-xs text-green-500 font-medium shrink-0 ml-2">Selesai</span>
            </Link>
          ))}
        </KpiCard>
      </div>

      {/* Summary bar */}
      <div className="rounded-xl border bg-card px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Clock className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground leading-none mb-0.5">Rata-rata Keterlambatan</p>
            <p className="text-lg font-bold leading-none">{avgDelay} <span className="text-sm font-normal text-muted-foreground">hari</span></p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-[11px] text-muted-foreground mb-0.5">PO Terlambat</p>
          <p className="text-lg font-bold">{overdue.length}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-muted-foreground mb-0.5">Terburuk</p>
          <p className="text-lg font-bold text-red-500">{worstHours}h</p>
        </div>
      </div>

      {/* ---- PO List section ---- */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-semibold">Purchase Orders</h2>

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
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                tab === key
                  ? "bg-foreground text-background"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <Link href="/po/new" className="block">
          <button
            type="button"
            className="w-full h-12 rounded-xl bg-foreground text-background font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Buat PO Baru
          </button>
        </Link>

        {/* Cards */}
        {filteredPOs.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground text-sm">{query ? "Tidak ditemukan" : "Belum ada PO"}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPOs.map((po: any) => <POListCard key={po.id} po={po} />)}
          </div>
        )}
      </div>
    </div>
  );
}
