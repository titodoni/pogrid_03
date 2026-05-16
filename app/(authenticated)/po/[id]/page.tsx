"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  differenceInDays,
  format,
  isPast,
  isToday,
  isTomorrow,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  MoreVertical,
} from "lucide-react";

const STAGE_ABBR: Record<string, string> = {
  DRAFTING: "DRF1",
  PURCHASING: "PURCH",
  PRODUCTION: "MACH",
  FABRICATION: "FABR",
  QC: "QC",
  DELIVERY: "DELIV",
  DONE: "DONE",
};

const STAGE_DOT: Record<string, string> = {
  DRAFTING: "bg-blue-400",
  PURCHASING: "bg-green-400",
  PRODUCTION: "bg-orange-400",
  FABRICATION: "bg-indigo-400",
  QC: "bg-purple-400",
  DELIVERY: "bg-teal-400",
  DONE: "bg-gray-300",
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

function aggregateProgress(items: any[]) {
  if (!items.length) return 0;
  const sum = items.reduce((acc: number, item: any) => {
    const prog = item.progress?.[0]?.progressValue ?? (item.status === "DONE" ? 100 : 0);
    return acc + prog;
  }, 0);
  return Math.round(sum / items.length);
}

function ItemCard({ item }: { item: any }) {
  const [logOpen, setLogOpen] = useState(false);
  const activeProblems = (item.problems ?? []).filter((p: any) => !p.isResolved);
  const progress = item.progress ?? [];
  const allDepts = [...new Set([
    ...(item.requiredDepartments ?? []).map((d: any) => d.name),
    ...progress.map((p: any) => p.department?.name).filter(Boolean),
  ])] as string[];

  // Active department = one with progress < 100 and highest stageOrder
  const activeDepProg = progress
    .filter((p: any) => p.progressValue < 100 && p.progressValue > 0)
    .sort((a: any, b: any) => (b.department?.stageOrder ?? 0) - (a.department?.stageOrder ?? 0))[0];

  const activePercent = activeDepProg?.progressValue ?? 0;
  const activeDeptName = activeDepProg?.department?.name ?? "";

  // Stage dots: DRAFTING PURCHASING PRODUCTION FABRICATION QC DELIVERY
  const stagePipeline = ["DRAFTING", "PURCHASING", "PRODUCTION", "FABRICATION", "QC", "DELIVERY"];

  const getDeptStatus = (stageName: string) => {
    const match = progress.find((p: any) => p.department?.name?.toUpperCase() === stageName);
    if (!match) return "pending";
    if (match.progressValue === 100) return "done";
    if (match.progressValue > 0) return "active";
    return "waiting";
  };

  const overallPct = aggregateProgress([item]);
  const isOverdue = item.dueDate && isPast(new Date(item.dueDate)) && !isToday(new Date(item.dueDate));
  const barColor = isOverdue ? "bg-red-500" : item.status === "DONE" ? "bg-green-500" : "bg-blue-500";

  // Progress label from active dept
  const activeDeptLabel = activeDeptName
    ? `${activeDeptName.charAt(0).toUpperCase()}${activeDeptName.slice(1).toLowerCase()} ${activePercent}%`
    : "";

  // Sub-type
  const subType = [item.itemType, item.quantity && `${item.quantity} pcs`, item.deliveredQty != null && `Terkirim ${item.deliveredQty}/${item.quantity}`]
    .filter(Boolean).join(" · ");

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Item header */}
      <div className="px-4 pt-4 pb-2 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-[15px] leading-snug">{item.name}</p>
          <span className="text-sm font-bold text-blue-500 shrink-0">{overallPct}%</span>
        </div>
        {subType && <p className="text-xs text-muted-foreground">{subType}</p>}

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${overallPct}%` }} />
        </div>
      </div>

      {/* Log aktivitas toggle */}
      <button
        type="button"
        onClick={() => setLogOpen((o) => !o)}
        className="w-full flex items-center gap-1.5 px-4 py-2 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
      >
        {logOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        log aktivitas
      </button>

      {/* Stage dot pills */}
      <div className="px-4 pb-3 flex flex-wrap gap-x-3 gap-y-1.5">
        {stagePipeline.map((stage) => {
          const st = getDeptStatus(stage);
          const dotClass =
            st === "done"
              ? "bg-green-400"
              : st === "active"
              ? STAGE_DOT[stage] ?? "bg-gray-400"
              : "bg-gray-200";
          const textClass = st === "pending" ? "text-muted-foreground/40" : "text-muted-foreground";
          const prog = progress.find((p: any) => p.department?.name?.toUpperCase() === stage);
          const pct = prog?.progressValue ?? 0;
          const label =
            st === "active" && pct > 0
              ? `${STAGE_ABBR[stage] ?? stage} ${pct}%`
              : STAGE_ABBR[stage] ?? stage;
          return (
            <span key={stage} className={`flex items-center gap-1 text-[11px] font-medium ${textClass}`}>
              <span className={`h-2 w-2 rounded-full shrink-0 ${dotClass}`} />
              {label}
            </span>
          );
        })}
      </div>

      {/* Log detail (expanded) */}
      {logOpen && (
        <div className="border-t px-4 py-3 space-y-2 bg-muted/30">
          {progress.length === 0 ? (
            <p className="text-xs text-muted-foreground">Belum ada log aktivitas</p>
          ) : (
            progress
              .sort((a: any, b: any) => new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime())
              .map((p: any) => (
                <div key={p.id} className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium">{p.department?.name}</p>
                    {p.note && <p className="text-[11px] text-muted-foreground truncate">{p.note}</p>}
                  </div>
                  <span className="text-xs font-bold shrink-0 text-blue-500">{p.progressValue}%</span>
                </div>
              ))
          )}
        </div>
      )}

      {/* Problem warning */}
      {activeProblems.length > 0 && (
        <div className="border-t flex items-center gap-2 bg-yellow-50 px-4 py-2.5">
          <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
          <span className="text-xs font-medium text-yellow-700">
            {activeProblems.length} masalah terbuka
          </span>
        </div>
      )}
    </div>
  );
}

export default function PODetailPage() {
  const params = useParams();
  const router = useRouter();
  const [po, setPo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/po/${params.id}`)
      .then((r) => r.json())
      .then((j) => { if (j.ok) setPo(j.data); })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 rounded-xl bg-muted animate-pulse" />
        <div className="h-40 rounded-xl bg-muted animate-pulse" />
        <div className="h-24 rounded-xl bg-muted animate-pulse" />
        {[1, 2].map((i) => <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />)}
      </div>
    );
  }

  if (!po) {
    return <div className="py-16 text-center text-sm text-muted-foreground">PO tidak ditemukan.</div>;
  }

  const rootItems = (po.items ?? []).filter((i: any) => !i.parentItemId);
  const allProblems = (po.items ?? []).flatMap((i: any) => i.problems ?? []);
  const activeProblems = allProblems.filter((p: any) => !p.isResolved);
  const totalQty = rootItems.reduce((acc: number, i: any) => acc + (i.quantity ?? 0), 0);
  const deliveredQty = rootItems.reduce((acc: number, i: any) => acc + (i.deliveredQty ?? 0), 0);
  const overallProgress = aggregateProgress(rootItems);

  const dueDate = po.dueDate ? new Date(po.dueDate) : null;
  const now = new Date();
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate);
  const daysLate = isOverdue ? Math.abs(differenceInDays(dueDate!, now)) : null;
  const dueDaysLeft = dueDate && !isOverdue ? differenceInDays(dueDate, now) : null;

  const isDone = rootItems.every((i: any) => i.status === "DONE");
  const statusLabel = isDone ? "SELESAI" : isOverdue ? "TERLAMBAT" : "AKTIF";
  const statusClass = isDone
    ? "bg-green-100 text-green-700"
    : isOverdue
    ? "bg-red-100 text-red-600"
    : "bg-blue-100 text-blue-600";

  const dueDateFormatted = dueDate
    ? format(dueDate, "EEEE, d MMMM yyyy", { locale: idLocale })
    : "—";
  // Capitalize
  const dueDateDisplay = dueDate
    ? format(dueDate, "EEEE, d", { locale: idLocale }).replace(/^./, (c) => c.toUpperCase()) +
      "\n" +
      format(dueDate, "MMMM yyyy", { locale: idLocale }).replace(/^./, (c) => c.toUpperCase())
    : "—";

  return (
    <div className="space-y-4 pb-8">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-medium text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Detail PO
        </button>
        <button type="button" className="text-muted-foreground">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      {/* PO Hero Card */}
      <div className="rounded-2xl border border-border bg-card px-4 pt-4 pb-5 space-y-4">
        {/* Label + badge */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Purchase Order</p>
            <h1 className="text-2xl font-bold leading-tight mt-0.5">{po.internalPoNumber}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{po.client?.name}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${statusClass}`}>{statusLabel}</span>
        </div>

        {/* Data matrix: Deadline | Item | Progress */}
        <div className="grid grid-cols-3 divide-x divide-border border-t border-b py-3">
          {/* Deadline */}
          <div className="pr-3 space-y-0.5">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Deadline</p>
            {dueDate ? (
              <>
                <p className="text-sm font-semibold leading-tight">
                  {format(dueDate, "EEEE, d", { locale: idLocale }).replace(/^./, (c) => c.toUpperCase())}
                </p>
                <p className="text-sm font-semibold leading-tight">
                  {format(dueDate, "MMMM yyyy", { locale: idLocale }).replace(/^./, (c) => c.toUpperCase())}
                </p>
                {isOverdue ? (
                  <p className="text-[11px] font-semibold text-red-500 mt-0.5">{daysLate} hari terlambat</p>
                ) : dueDaysLeft !== null && dueDaysLeft <= 3 ? (
                  <p className="text-[11px] font-medium text-orange-500 mt-0.5">{dueDaysLeft === 0 ? "Hari ini" : `${dueDaysLeft} hari lagi`}</p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </div>

          {/* Item */}
          <div className="px-3 space-y-0.5">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Item</p>
            <p className="text-2xl font-bold leading-none">{rootItems.length}</p>
            <p className="text-[11px] text-muted-foreground">item total</p>
          </div>

          {/* Progress */}
          <div className="pl-3 space-y-0.5">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Progress</p>
            <p className={`text-2xl font-bold leading-none ${isOverdue ? "text-red-500" : "text-blue-500"}`}>{overallProgress}%</p>
            <p className="text-[11px] text-muted-foreground">keseluruhan</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isOverdue ? "bg-red-500" : isDone ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Finance section */}
      <div className="rounded-2xl border border-border bg-card px-4 py-3 space-y-2">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Finance</p>
        <div className="divide-y">
          <div className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-muted-foreground">Invoice</span>
            <span className={`font-medium ${
              po.invoiceStatus === "INVOICED" ? "text-green-600" : "text-muted-foreground"
            }`}>
              {po.invoiceStatus === "INVOICED" ? "Sudah Di-Invoice" : "Belum Di-Invoice"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-muted-foreground">Pembayaran</span>
            <span className={`font-medium ${
              po.paymentStatus === "PAID" ? "text-green-600" : "text-muted-foreground"
            }`}>
              {po.paymentStatus === "PAID" ? "Sudah Dibayar" : "Belum Dibayar"}
            </span>
          </div>
        </div>
      </div>

      {/* Pengiriman section */}
      <div className="rounded-2xl border border-border bg-card px-4 py-3 space-y-2">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Pengiriman</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold leading-none">
              {deliveredQty}
              <span className="text-base font-normal text-muted-foreground"> dari {totalQty} pcs</span>
            </p>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-teal-500"
            style={{ width: `${totalQty ? (deliveredQty / totalQty) * 100 : 0}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {deliveredQty === 0 ? "Belum Dikirim" : deliveredQty < totalQty ? `${totalQty - deliveredQty} pcs belum terkirim` : "Semua Terkirim"}
        </p>
      </div>

      {/* Items list */}
      <div className="space-y-3">
        <p className="text-sm font-semibold">ITEMS ({rootItems.length})</p>
        {rootItems.map((item: any) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
