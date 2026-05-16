"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  differenceInDays,
  differenceInHours,
  isPast,
  isToday,
  isTomorrow,
  isAfter,
  subDays,
  startOfMonth,
  format,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ChevronRight, X, AlertTriangle, Clock } from "lucide-react";

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

type Period = "month" | "7d" | "all";

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}

function filterByPeriod(orders: any[], period: Period) {
  const now = new Date();
  if (period === "7d") {
    const cutoff = subDays(now, 7);
    return orders.filter((o) => isAfter(new Date(o.createdAt), cutoff));
  }
  if (period === "month") {
    const cutoff = startOfMonth(now);
    return orders.filter((o) => isAfter(new Date(o.createdAt), cutoff));
  }
  return orders;
}

type KpiKey = "overdue" | "deadline" | "problems" | "done";

interface KpiCardProps {
  color: "red" | "orange" | "yellow" | "green";
  value: number;
  title: string;
  subtitle: string;
  kpiKey: KpiKey;
  active: KpiKey | null;
  onToggle: (k: KpiKey) => void;
  children: React.ReactNode;
}

const BORDER_COLOR: Record<string, string> = {
  red: "border-t-red-400",
  orange: "border-t-orange-400",
  yellow: "border-t-yellow-400",
  green: "border-t-green-400",
};

const VALUE_COLOR: Record<string, string> = {
  red: "text-foreground",
  orange: "text-foreground",
  yellow: "text-foreground",
  green: "text-foreground",
};

function KpiCard({ color, value, title, subtitle, kpiKey, active, onToggle, children }: KpiCardProps) {
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
          <p className={`text-3xl font-bold leading-none mb-1 ${VALUE_COLOR[color]}`}>{value}</p>
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

export default function BoardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("month");
  const [activeKpi, setActiveKpi] = useState<KpiKey | null>(null);
  const [userName, setUserName] = useState("Admin");

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

  const filtered = useMemo(() => {
    if (!data) return null;
    const { orders } = data;
    const fo = filterByPeriod(orders, period);
    const now = new Date();

    const overdue = fo.filter((o: any) => {
      if (!o.dueDate || o.status === "DONE") return false;
      return isPast(new Date(o.dueDate)) && !isToday(new Date(o.dueDate));
    });

    const deadline = fo.filter((o: any) => {
      if (!o.dueDate || o.status === "DONE") return false;
      const d = new Date(o.dueDate);
      const days = differenceInDays(d, now);
      return !isPast(d) && days <= 3;
    });

    const allProblems = fo.flatMap((o: any) =>
      (o.items ?? []).flatMap((i: any) =>
        (i.problems ?? []).filter((p: any) => !p.isResolved).map((p: any) => ({ ...p, _poId: o.id, _poNum: o.internalPoNumber, _client: o.client?.name, _itemName: i.name }))
      )
    );

    const done = fo.filter((o: any) => o.status === "DONE");
    const total = fo.filter((o: any) => o.status !== "DONE");

    // Completion rate vs prev period (rough: done / total in period)
    const completionRate = fo.length ? Math.round((done.length / fo.length) * 100) : 0;

    // Avg overdue delay in days
    const overdueDelays = overdue.map((o: any) =>
      Math.abs(differenceInDays(new Date(o.dueDate), now))
    );
    const avgDelay = overdueDelays.length
      ? Math.round(overdueDelays.reduce((a: number, b: number) => a + b, 0) / overdueDelays.length)
      : 0;

    // Worst overdue in hours
    const worstHours = overdue.length
      ? Math.max(
          ...overdue.map((o: any) =>
            Math.abs(differenceInHours(new Date(o.dueDate), now))
          )
        )
      : 0;

    return { overdue, deadline, allProblems, done, total, completionRate, avgDelay, worstHours };
  }, [data, period]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-16 rounded-xl bg-muted animate-pulse" />
        <div className="h-8 rounded-xl bg-muted animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!data || !filtered) {
    return <div className="py-16 text-center text-sm text-muted-foreground">Gagal memuat board.</div>;
  }

  const { overdue, deadline, allProblems, done, completionRate, avgDelay, worstHours } = filtered;

  const PERIODS: { key: Period; label: string }[] = [
    { key: "month", label: "Bulan Ini" },
    { key: "7d", label: "7 Hari" },
    { key: "all", label: "Semua" },
  ];

  return (
    <div className="space-y-4 pb-8">
      {/* ---- Header ---- */}
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

      {/* ---- Period tabs ---- */}
      <div className="flex rounded-xl bg-muted p-1 gap-1">
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setPeriod(key)}
            className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${
              period === key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ---- KPI 2x2 grid ---- */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          color="red"
          value={overdue.length}
          title="Terlambat"
          subtitle="PO melewati deadline"
          kpiKey="overdue"
          active={activeKpi}
          onToggle={toggleKpi}
        >
          {overdue.map((po: any) => (
            <Link key={po.id} href={`/po/${po.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{po.internalPoNumber}</p>
                <p className="text-xs text-muted-foreground truncate">{po.client?.name}</p>
              </div>
              <span className="text-xs text-red-500 font-medium shrink-0 ml-2">
                {Math.abs(differenceInDays(new Date(po.dueDate), new Date()))}h terlambat
              </span>
            </Link>
          ))}
        </KpiCard>

        <KpiCard
          color="orange"
          value={deadline.length}
          title="Deadline Dekat"
          subtitle="≤ 3 hari lagi"
          kpiKey="deadline"
          active={activeKpi}
          onToggle={toggleKpi}
        >
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

        <KpiCard
          color="yellow"
          value={allProblems.length}
          title="Masalah Terbuka"
          subtitle="Belum terselesaikan"
          kpiKey="problems"
          active={activeKpi}
          onToggle={toggleKpi}
        >
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

        <KpiCard
          color="green"
          value={done.length}
          title="Selesai"
          subtitle={period === "month" ? "Bulan ini" : period === "7d" ? "7 hari ini" : "Semua waktu"}
          kpiKey="done"
          active={activeKpi}
          onToggle={toggleKpi}
        >
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

      {/* ---- Summary bar ---- */}
      <div className="rounded-xl border bg-card px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Clock className="h-4.5 w-4.5 text-red-500" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground leading-none mb-0.5">Rata-rata Keterlambatan</p>
            <p className="text-lg font-bold leading-none">
              {avgDelay} <span className="text-sm font-normal text-muted-foreground">hari</span>
            </p>
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
    </div>
  );
}
