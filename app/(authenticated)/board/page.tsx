"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { differenceInDays, isPast, isToday } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export default function BoardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/board")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setData(j.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>;
  }
  if (!data) {
    return <div className="py-16 text-center text-sm text-muted-foreground">Gagal memuat board.</div>;
  }

  const { orders, overdue, active, problems, bottleneck } = data;
  const totalOrders = orders.length;

  // Delivery risk: POs due in ≤3 days that are not done
  const riskPos = active.filter((o: any) => {
    if (!o.dueDate) return false;
    const d = new Date(o.dueDate);
    const days = differenceInDays(d, new Date());
    return days >= 0 && days <= 3;
  });

  const bottleneckEntries = Object.entries(bottleneck as Record<string, { name: string; count: number }>)
    .sort((a, b) => b[1].count - a[1].count);

  return (
    <div className="space-y-5 pb-8">
      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold">{active.length}</p>
          <p className="text-xs text-muted-foreground">PO Aktif</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-red-500">{overdue.length}</p>
          <p className="text-xs text-muted-foreground">Terlambat</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-orange-500">{problems.length}</p>
          <p className="text-xs text-muted-foreground">Masalah</p>
        </Card>
      </div>

      {/* Delivery risk */}
      {riskPos.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-orange-500" />Risiko Pengiriman ({riskPos.length})
          </h3>
          {riskPos.map((po: any) => {
            const d = new Date(po.dueDate);
            const days = differenceInDays(d, new Date());
            return (
              <Link key={po.id} href={`/po/${po.id}`}>
                <Card className="p-3 flex items-center justify-between hover:shadow-md transition-shadow border-orange-200">
                  <div>
                    <p className="font-medium text-sm">{po.internalPoNumber}</p>
                    <p className="text-xs text-muted-foreground">{po.client?.name}</p>
                  </div>
                  <span className="text-xs text-orange-500 font-medium">
                    {isToday(d) ? "Hari ini" : `${days} hari lagi`}
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Overdue */}
      {overdue.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-red-500" />PO Terlambat ({overdue.length})
          </h3>
          {overdue.map((po: any) => (
            <Link key={po.id} href={`/po/${po.id}`}>
              <Card className="p-3 flex items-center justify-between hover:shadow-md transition-shadow border-red-200">
                <div>
                  <p className="font-medium text-sm">{po.internalPoNumber}</p>
                  <p className="text-xs text-muted-foreground">{po.client?.name}</p>
                </div>
                <span className="text-xs text-red-500 font-medium">
                  {formatDistanceToNow(new Date(po.dueDate), { locale: idLocale, addSuffix: false })} lalu
                </span>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Bottleneck */}
      {bottleneckEntries.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Bottleneck Departemen</h3>
          <Card className="divide-y">
            {bottleneckEntries.map(([id, { name, count }]) => (
              <div key={id} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm">{name}</span>
                <Badge variant="secondary" className="text-xs">{count} item aktif</Badge>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* Active problems */}
      {problems.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-orange-500" />Masalah Aktif ({problems.length})
          </h3>
          {problems.map((p: any) => (
            <Link key={p.id} href={`/po/${p.item?.productionOrder ? "" : ""}`}>
              <Card className="p-3 space-y-1 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">{p.item?.name}</p>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {p.item?.productionOrder?.internalPoNumber}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{PROBLEM_LABEL[p.category] || p.category}</p>
                {p.note && <p className="text-xs text-muted-foreground/70 italic">{p.note}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* All active POs */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4" />Semua PO Aktif ({active.length})
        </h3>
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Tidak ada PO aktif.</p>
        ) : (
          active.map((po: any) => {
            const dueDate = po.dueDate ? new Date(po.dueDate) : null;
            const overduePo = dueDate && isPast(dueDate);
            const totalItems = po.items.length;
            const doneItems = po.items.filter((i: any) => i.status === "DONE").length;
            const itemProblems = po.items.flatMap((i: any) => i.problems ?? []);

            return (
              <Link key={po.id} href={`/po/${po.id}`}>
                <Card className="p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{po.internalPoNumber}</p>
                      <p className="text-xs text-muted-foreground">{po.client?.name}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {itemProblems.length > 0 && (
                        <Badge variant="destructive" className="text-xs gap-1">
                          <AlertCircle className="h-3 w-3" />{itemProblems.length}
                        </Badge>
                      )}
                      {dueDate && (
                        <span className={`text-xs ${overduePo ? "text-red-500" : "text-muted-foreground"}`}>
                          {overduePo
                            ? formatDistanceToNow(dueDate, { locale: idLocale, addSuffix: false }) + " lalu"
                            : differenceInDays(dueDate, new Date()) + " hari"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${totalItems ? (doneItems / totalItems) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{doneItems}/{totalItems} item selesai</p>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
