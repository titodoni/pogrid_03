"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Client = { id: string; name: string };
type Dept = { id: string; name: string; roleKey: string };
type ItemRow = { name: string; quantity: string; unit: string; departments: string[] };

export default function PONewPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    internalPoNumber: "",
    clientId: "",
    clientPoNumber: "",
    dueDate: "",
    notes: "",
  });
  const [items, setItems] = useState<ItemRow[]>([
    { name: "", quantity: "1", unit: "pcs", departments: [] },
  ]);

  useEffect(() => {
    Promise.all([
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/departments").then((r) => r.json()),
    ]).then(([c, d]) => {
      if (c.ok) setClients(c.data);
      if (d.ok) setDepartments(d.data);
    });
  }, []);

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, { name: "", quantity: "1", unit: "pcs", departments: [] }]);
  }, []);

  const removeItem = useCallback((idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const updateItem = useCallback((idx: number, field: keyof ItemRow, value: string) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  }, []);

  const toggleDept = useCallback((idx: number, roleKey: string) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const has = item.departments.includes(roleKey);
        return {
          ...item,
          departments: has
            ? item.departments.filter((d) => d !== roleKey)
            : [...item.departments, roleKey],
        };
      })
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.internalPoNumber.trim()) { toast.error("Nomor PO wajib diisi."); return; }
    if (!form.clientId) { toast.error("Klien wajib dipilih."); return; }
    if (items.some((i) => !i.name.trim())) { toast.error("Semua nama item harus diisi."); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/po", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      toast.success("PO berhasil dibuat.");
      router.push(`/po/${json.data.id}`);
    } catch (e: any) {
      toast.error(e.message || "Gagal membuat PO.");
    } finally {
      setSaving(false);
    }
  }, [form, items, router]);

  return (
    <div className="space-y-5 pb-10">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-base font-semibold">Buat PO Baru</h2>
      </div>

      <Card className="p-4 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Info PO</h3>

        <div className="space-y-1">
          <Label className="text-xs">Nomor PO *</Label>
          <Input
            placeholder="PO-2026-001"
            value={form.internalPoNumber}
            onChange={(e) => setForm((f) => ({ ...f, internalPoNumber: e.target.value }))}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Klien *</Label>
          <select
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={form.clientId}
            onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
          >
            <option value="">Pilih klien...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">No. PO Klien</Label>
          <Input
            placeholder="CLIENT-PO-001"
            value={form.clientPoNumber}
            onChange={(e) => setForm((f) => ({ ...f, clientPoNumber: e.target.value }))}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Tenggat Pengiriman</Label>
          <Input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Catatan</Label>
          <Input
            placeholder="Catatan tambahan (opsional)"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </div>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Item</h3>
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />Tambah Item
          </Button>
        </div>

        {items.map((item, idx) => (
          <Card key={idx} className="p-4 space-y-3">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Nama Item *</Label>
                <Input
                  placeholder="Bracket Plate A"
                  value={item.name}
                  onChange={(e) => updateItem(idx, "name", e.target.value)}
                />
              </div>
              <div className="w-20 space-y-1">
                <Label className="text-xs">Qty</Label>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                />
              </div>
              <div className="w-16 space-y-1">
                <Label className="text-xs">Unit</Label>
                <Input
                  value={item.unit}
                  onChange={(e) => updateItem(idx, "unit", e.target.value)}
                />
              </div>
              {items.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-5 text-destructive hover:text-destructive shrink-0"
                  onClick={() => removeItem(idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Departemen yang mengerjakan</Label>
              <div className="flex flex-wrap gap-2">
                {departments.map((dept) => {
                  const active = item.departments.includes(dept.roleKey);
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => toggleDept(idx, dept.roleKey)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {dept.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button className="w-full" size="lg" onClick={handleSubmit} disabled={saving}>
        {saving ? "Menyimpan..." : "Buat PO"}
      </Button>
    </div>
  );
}
