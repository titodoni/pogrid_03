"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { differenceInDays, isPast, isToday, isTomorrow } from "date-fns";
import { Plus, AlertCircle, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATUS_LABEL: Record<string, string> = {
  DRAFTING: "Gambar",
  PURCHASING: "Pembelian",
  PRODUCTION: "Produksi",
  QC: "QC",
  DELIVERY: "Pengiriman",
  DONE: "Selesai",
};

function dueBadge(dueDate: string | null) {
  if (!dueDate) return null;
  const d = new Date(dueDate);
  const days = differenceInDays(d, new Date());
  let label = "";
  let urgent = false;

  if (isPast(d) && !isToday(d)) {
    label = `Terlambat ${Math.abs(days)} hari`;
    urgent = true;
  } else if (isToday(d)) {
    label = "Jatuh tempo hari ini";
    urgent = true;
  } else if (isTomorrow(d)) {
    label = "Besok";
    urgent = true;
  } else {
    label = `${days} hari lagi`;
  }

  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${urgent ? "text-red-500" : "text-muted-foreground"}`}>
      <Clock className="h-3 w-3" />{label}
    </span>
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
          <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!pos.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <p className="text-muted-foreground text-sm">Belum ada PO</p>
        <Button asChild>
          <Link href="/po/new"><Plus className="h-4 w-4 mr-1" />Buat PO Baru</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <h2 className="text-base font-semibold">Production Orders ({pos.length})</h2>
        <Button asChild size="sm">
          <Link href="/po/new"><Plus className="h-4 w-4 mr-1" />Baru</Link>
        </Button>
      </div>

      {pos.map((po: any) => {
        const activeProblems = po.items.flatMap((i: any) => i.problems ?? []);
        const totalItems = po.items.length;
        const doneItems = po.items.filter((i: any) => i.status === "DONE").length;

        // Stage summary: group items by current status
        const stageSummary: Record<string, number> = {};
        for (const item of po.items) {
          if (item.status !== "DONE") {
            const label = STATUS_LABEL[item.status] || item.status;
            stageSummary[label] = (stageSummary[label] || 0) + 1;
          }
        }

        return (
          <Link key={po.id} href={`/po/${po.id}`}>
            <Card className="p-4 space-y-2.5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">{po.internalPoNumber}</p>
                  <p className="text-xs text-muted-foreground">{po.client?.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  {activeProblems.length > 0 && (
                    <Badge variant="destructive" className="gap-1 text-xs px-1.5">
                      <AlertCircle className="h-3 w-3" />{activeProblems.length} masalah
                    </Badge>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </div>

              {dueBadge(po.dueDate)}

              {Object.keys(stageSummary).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(stageSummary).map(([stage, count]) => (
                    <span key={stage} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      {stage}: {count}
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-0.5">
                {po.items.slice(0, 3).map((item: any) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground flex-1 truncate">
                      {item.name} <span className="text-muted-foreground/60">×{item.quantity}</span>
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">{STATUS_LABEL[item.status] || item.status}</span>
                  </div>
                ))}
                {po.items.length > 3 && (
                  <p className="text-xs text-muted-foreground/60">+{po.items.length - 3} item lainnya</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Progress PO: {doneItems} dari {totalItems} item selesai</span>
                  <span className="text-xs text-muted-foreground">{totalItems ? Math.round((doneItems / totalItems) * 100) : 0}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${totalItems ? (doneItems / totalItems) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
