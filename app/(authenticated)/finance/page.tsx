"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Receipt } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu",
  INVOICED: "Invoice",
  PAID: "Lunas",
};

type FinanceItem = {
  id: string;
  invoiceStatus: string;
  item: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    doneAt: string | null;
    productionOrder: { internalPoNumber: string; client: { name: string } };
  };
};

export default function FinancePage() {
  const [records, setRecords] = useState<FinanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/finance")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setRecords(j.data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleTransition = useCallback(async (itemId: string, newStatus: string) => {
    setUpdating(itemId);
    try {
      const res = await fetch(`/api/finance/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      toast.success("Status diperbarui.");
      load();
    } catch (e: any) {
      toast.error(e.message || "Gagal memperbarui status.");
    } finally {
      setUpdating(null);
    }
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
      </div>
    );
  }

  const pending = records.filter((r) => r.invoiceStatus === "PENDING");
  const invoiced = records.filter((r) => r.invoiceStatus === "INVOICED");
  const paid = records.filter((r) => r.invoiceStatus === "PAID");

  if (!records.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Receipt className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">Belum ada data finance</p>
        <p className="text-xs text-muted-foreground">Item yang selesai akan muncul di sini</p>
      </div>
    );
  }

  const renderGroup = (title: string, items: FinanceItem[], badgeClass: string) => {
    if (!items.length) return null;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>{items.length}</span>
        </div>
        {items.map((r) => (
          <Card key={r.id} className={`p-4 space-y-2.5 ${updating === r.id ? "opacity-60" : ""}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{r.item?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {r.item?.productionOrder?.internalPoNumber} · {r.item?.productionOrder?.client?.name}
                </p>
                <p className="text-xs text-muted-foreground">{r.item?.quantity} {r.item?.unit}</p>
              </div>
              <Badge
                variant={r.invoiceStatus === "PAID" ? "outline" : r.invoiceStatus === "INVOICED" ? "default" : "secondary"}
                className="shrink-0 text-xs"
              >
                {STATUS_LABEL[r.invoiceStatus] || r.invoiceStatus}
              </Badge>
            </div>
            <div className="flex gap-2">
              {r.invoiceStatus === "PENDING" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7"
                  disabled={updating === r.id}
                  onClick={() => handleTransition(r.id, "INVOICED")}
                >
                  Tandai Invoice
                </Button>
              )}
              {r.invoiceStatus === "INVOICED" && (
                <Button
                  size="sm"
                  className="text-xs h-7"
                  disabled={updating === r.id}
                  onClick={() => handleTransition(r.id, "PAID")}
                >
                  Tandai Lunas
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Finance ({records.length})</h2>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>{pending.length} menunggu</span>
          <span>·</span>
          <span>{invoiced.length} invoice</span>
          <span>·</span>
          <span>{paid.length} lunas</span>
        </div>
      </div>
      {renderGroup("Menunggu Invoice", pending, "bg-yellow-100 text-yellow-700")}
      {renderGroup("Sudah Invoice", invoiced, "bg-blue-100 text-blue-700")}
      {renderGroup("Lunas", paid, "bg-green-100 text-green-700")}
    </div>
  );
}
