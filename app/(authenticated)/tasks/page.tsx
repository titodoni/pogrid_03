"use client";

import { useEffect, useState, useCallback } from "use client";
import { useEffect, useState, useCallback } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

const STATUS_LABEL: Record<string, string> = {
  DRAFTING: "Gambar", PURCHASING: "Pembelian", PRODUCTION: "Produksi",
  QC: "QC", DELIVERY: "Pengiriman", DONE: "Selesai",
};

function ProgressButton({ value, onClick }: { value: number; onClick: (v: number) => void }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {[25, 50, 75, 100].map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onClick(v)}
          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
            value >= v
              ? "bg-primary text-primary-foreground border-primary"
              : "text-muted-foreground border-border hover:border-primary/50"
          }`}
        >
          {v}%
        </button>
      ))}
    </div>
  );
}

export default function TasksPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setItems(j.data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleProgress = useCallback(async (poId: string, itemId: string, value: number, current: number) => {
    if (value < current) {
      toast.error("Progress tidak bisa mundur dari nilai yang sudah dikonfirmasi.");
      return;
    }
    setUpdating(itemId);
    try {
      const res = await fetch(`/api/po/${poId}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, progressValue: value }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      toast.success("Progress diperbarui.");
      load();
    } catch (e: any) {
      toast.error(e.message || "Gagal memperbarui progress.");
    } finally {
      setUpdating(null);
    }
  }, [load]);

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}</div>;
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <CheckCircle2 className="h-10 w-10 text-green-500" />
        <p className="text-muted-foreground text-sm">Tidak ada tugas aktif</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">Tugas ({items.length})</h2>

      {items.map((item: any) => {
        const prog = item.progress?.[0];
        const progressValue = prog?.progressValue ?? 0;
        const activeProblems = (item.problems ?? []).filter((p: any) => !p.isResolved);
        const poId = item.productionOrder?.id;
        const isUpdating = updating === item.id;

        return (
          <Card key={item.id} className={`p-4 space-y-3 ${isUpdating ? "opacity-60" : ""}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.productionOrder?.internalPoNumber} · {item.productionOrder?.client?.name}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {activeProblems.length > 0 && (
                  <Badge variant="destructive" className="gap-1 text-xs">
                    <AlertCircle className="h-3 w-3" />{activeProblems.length}
                  </Badge>
                )}
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {STATUS_LABEL[item.status] || item.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-20 shrink-0">{item.quantity} {item.unit}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progressValue}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right shrink-0">{progressValue}%</span>
            </div>

            <ProgressButton
              value={progressValue}
              onClick={(v) => handleProgress(poId, item.id, v, progressValue)}
            />

            {activeProblems.length > 0 && (
              <div className="space-y-1 pt-1 border-t">
                {activeProblems.map((p: any) => (
                  <div key={p.id} className="flex items-start gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-600">{PROBLEM_LABEL[p.category] || p.category}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
