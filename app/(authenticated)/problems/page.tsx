"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertCircle, CheckCircle2, Plus, X } from "lucide-react";
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

const PROBLEM_CATEGORIES = Object.entries(PROBLEM_LABEL);

type Problem = {
  id: string;
  category: string;
  note: string | null;
  isResolved: boolean;
  createdAt: string;
  item: { id: string; name: string; productionOrder: { internalPoNumber: string; client: { name: string } } };
};

type Item = { id: string; name: string; productionOrderId: string; productionOrder: { internalPoNumber: string } };

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState({ itemId: "", category: "", note: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/problems")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setProblems(j.data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadItems = useCallback(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setItems(j.data); });
  }, []);

  const openReport = useCallback(() => {
    loadItems();
    setForm({ itemId: "", category: "", note: "" });
    setShowReport(true);
  }, [loadItems]);

  const handleResolve = useCallback(async (id: string) => {
    setResolving(id);
    try {
      const res = await fetch(`/api/problems/${id}/resolve`, { method: "PATCH" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      toast.success("Masalah ditandai selesai.");
      load();
    } catch (e: any) {
      toast.error(e.message || "Gagal.");
    } finally {
      setResolving(null);
    }
  }, [load]);

  const handleReport = useCallback(async () => {
    if (!form.itemId) { toast.error("Pilih item terlebih dahulu."); return; }
    if (!form.category) { toast.error("Pilih kategori masalah."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      toast.success("Masalah dilaporkan.");
      setShowReport(false);
      load();
    } catch (e: any) {
      toast.error(e.message || "Gagal melaporkan masalah.");
    } finally {
      setSubmitting(false);
    }
  }, [form, load]);

  if (showReport) {
    return (
      <div className="space-y-4 pb-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowReport(false)}>
            <X className="h-4 w-4" />
          </Button>
          <h2 className="text-base font-semibold">Laporkan Masalah</h2>
        </div>

        <Card className="p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium">Item *</label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={form.itemId}
              onChange={(e) => setForm((f) => ({ ...f, itemId: e.target.value }))}
            >
              <option value="">Pilih item...</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.productionOrder?.internalPoNumber} — {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Kategori Masalah *</label>
            <div className="flex flex-col gap-2">
              {PROBLEM_CATEGORIES.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, category: key }))}
                  className={`text-left text-sm px-3 py-2 rounded-lg border transition-colors ${
                    form.category === key
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Catatan (opsional)</label>
            <textarea
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Detail tambahan..."
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            />
          </div>
        </Card>

        <Button className="w-full" size="lg" onClick={handleReport} disabled={submitting}>
          {submitting ? "Mengirim..." : "Laporkan Masalah"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          {loading ? "Masalah" : `Masalah (${problems.filter((p) => !p.isResolved).length})`}
        </h2>
        <Button size="sm" onClick={openReport}>
          <Plus className="h-4 w-4 mr-1" />Laporkan
        </Button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
        </div>
      )}

      {!loading && problems.filter((p) => !p.isResolved).length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
          <p className="text-muted-foreground text-sm">Tidak ada masalah aktif</p>
        </div>
      )}

      {!loading && problems.filter((p) => !p.isResolved).map((p) => (
        <Card key={p.id} className="p-4 space-y-2 border-red-200">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{p.item?.name}</p>
              <p className="text-xs text-muted-foreground">
                {p.item?.productionOrder?.internalPoNumber} · {p.item?.productionOrder?.client?.name}
              </p>
            </div>
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          </div>
          <p className="text-xs text-red-600 font-medium">{PROBLEM_LABEL[p.category] || p.category}</p>
          {p.note && <p className="text-xs text-muted-foreground italic">{p.note}</p>}
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7"
            disabled={resolving === p.id}
            onClick={() => handleResolve(p.id)}
          >
            {resolving === p.id ? "Memproses..." : "Tandai Selesai"}
          </Button>
        </Card>
      ))}
    </div>
  );
}
