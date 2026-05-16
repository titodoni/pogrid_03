"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { differenceInDays, format, isPast, isToday, isTomorrow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_LABEL: Record<string, string> = {
  DRAFTING: "Gambar",
  PURCHASING: "Pembelian",
  PRODUCTION: "Produksi",
  QC: "QC",
  DELIVERY: "Pengiriman",
  DONE: "Selesai",
};

const STATUS_COLOR: Record<string, string> = {
  DRAFTING: "bg-blue-100 text-blue-700",
  PURCHASING: "bg-yellow-100 text-yellow-700",
  PRODUCTION: "bg-orange-100 text-orange-700",
  QC: "bg-purple-100 text-purple-700",
  DELIVERY: "bg-teal-100 text-teal-700",
  DONE: "bg-green-100 text-green-700",
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

function DueStatus({ dueDate }: { dueDate: string | null }) {
  if (!dueDate) return <span className="text-muted-foreground text-sm">—</span>;
  const d = new Date(dueDate);
  const days = differenceInDays(d, new Date());

  let label = "", cls = "text-muted-foreground";
  if (isPast(d) && !isToday(d)) { label = `Terlambat ${Math.abs(days)} hari`; cls = "text-red-500 font-semibold"; }
  else if (isToday(d)) { label = "Jatuh tempo hari ini"; cls = "text-red-500 font-semibold"; }
  else if (isTomorrow(d)) { label = "Besok"; cls = "text-orange-500 font-medium"; }
  else { label = `${days} hari lagi`; }

  return (
    <span className={`flex items-center gap-1 text-sm ${cls}`}>
      <Clock className="h-3.5 w-3.5" />
      {label} ({format(d, "d MMM yyyy", { locale: idLocale })})
    </span>
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
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>;
  }
  if (!po) {
    return <div className="py-16 text-center text-sm text-muted-foreground">PO tidak ditemukan.</div>;
  }

  const rootItems = po.items?.filter((i: any) => !i.parentItemId) ?? [];
  const allProblems = po.items?.flatMap((i: any) => i.problems ?? []) ?? [];
  const activeProblems = allProblems.filter((p: any) => !p.isResolved);
  const totalItems = rootItems.length;
  const doneItems = rootItems.filter((i: any) => i.status === "DONE").length;

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <h2 className="text-base font-semibold truncate">{po.internalPoNumber}</h2>
          <p className="text-xs text-muted-foreground">{po.client?.name}</p>
        </div>
      </div>

      {/* PO Info */}
      <Card className="p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tenggat</span>
          <DueStatus dueDate={po.dueDate} />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress PO</span>
          <span>{doneItems} dari {totalItems} item selesai</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${totalItems ? (doneItems / totalItems) * 100 : 0}%` }}
          />
        </div>
        {po.notes && (
          <p className="text-xs text-muted-foreground border-t pt-2">{po.notes}</p>
        )}
      </Card>

      {/* Active problems summary */}
      {activeProblems.length > 0 && (
        <Card className="p-4 space-y-2 border-red-200 bg-red-50/50">
          <h3 className="text-sm font-semibold flex items-center gap-1.5 text-red-600">
            <AlertCircle className="h-4 w-4" />{activeProblems.length} Masalah Aktif
          </h3>
          {activeProblems.map((p: any) => (
            <p key={p.id} className="text-xs text-red-600">
              {PROBLEM_LABEL[p.category] || p.category}{p.note ? ` — ${p.note}` : ""}
            </p>
          ))}
        </Card>
      )}

      {/* Items */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Item ({rootItems.length})</h3>

        {rootItems.map((item: any) => {
          const itemProblems = (item.problems ?? []).filter((p: any) => !p.isResolved);
          const depts = [...(item.requiredDepartments ?? [])].sort(
            (a: any, b: any) => a.stageOrder - b.stageOrder
          );

          return (
            <Card key={item.id} className="p-4 space-y-3">
              {/* Item header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.quantity} {item.unit}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_COLOR[item.status] || "bg-muted text-muted-foreground"}`}>
                  {STATUS_LABEL[item.status] || item.status}
                </span>
              </div>

              {/* Department progress */}
              {depts.length > 0 && (
                <div className="space-y-2">
                  {depts.map((dept: any) => {
                    const prog = item.progress?.find((p: any) => p.departmentId === dept.id);
                    const val = prog?.progressValue ?? 0;
                    const done = val === 100;
                    return (
                      <div key={dept.id} className="flex items-center gap-2">
                        {done
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                          : <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30 shrink-0" />}
                        <span className="text-xs text-muted-foreground w-24 truncate">{dept.name}</span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${done ? "bg-green-500" : "bg-primary"}`}
                            style={{ width: `${val}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right shrink-0">{val}%</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Item problems */}
              {itemProblems.length > 0 && (
                <div className="space-y-1 pt-1 border-t">
                  {itemProblems.map((p: any) => (
                    <div key={p.id} className="flex items-start gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-600">
                        {PROBLEM_LABEL[p.category] || p.category}{p.note ? ` — ${p.note}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Rework/return children */}
              {item.childItems?.length > 0 && (
                <div className="pt-1 border-t space-y-1.5">
                  <p className="text-xs text-muted-foreground font-medium">Rework / Return</p>
                  {item.childItems.map((child: any) => (
                    <div key={child.id} className="flex items-center justify-between gap-2">
                      <span className="text-xs truncate">{child.name} ×{child.quantity}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${STATUS_COLOR[child.status] || "bg-muted text-muted-foreground"}`}>
                        {STATUS_LABEL[child.status] || child.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
