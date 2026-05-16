"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PinPad } from "@/components/pin-pad";
import { toast } from "sonner";
import { LogOut, Key, User } from "lucide-react";

type SessionData = {
  userId: string;
  name: string;
  role: string;
  roleKey: string;
  departmentId: string | null;
  workspaceId: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [changePinMode, setChangePinMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/auth/session");
        const json = await res.json();
        if (!json.ok || !json.data) {
          router.push("/login");
          return;
        }
        setSession(json.data);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }, [router]);

  const handleChangePin = useCallback(
    async (pin: string) => {
      setSaving(true);
      setError(null);
      try {
        const res = await fetch("/api/auth/change-pin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPin: pin }),
        });
        const json = await res.json();
        if (!json.ok) {
          setError(json.error || "Gagal mengubah PIN.");
          throw new Error(json.error);
        }
        toast.success("PIN berhasil diubah.");
        setChangePinMode(false);
      } catch {
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (changePinMode) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => {
            setChangePinMode(false);
            setError(null);
          }}
          className="flex items-center gap-1 text-sm text-muted-foreground"
        >
          <span>&larr;</span> Kembali
        </button>
        <h2 className="text-lg font-semibold">Ubah PIN</h2>
        <Card className="p-4">
          <PinPad
            pinLength={4}
            onComplete={handleChangePin}
            onBack={() => {
              setChangePinMode(false);
              setError(null);
            }}
            error={error}
            setError={setError}
            disabled={saving}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Profil</h2>
        <p className="text-sm text-muted-foreground">
          Informasi akun dan pengaturan
        </p>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{session.name}</p>
            <p className="text-sm text-muted-foreground">{session.roleKey}</p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-12"
          onClick={() => setChangePinMode(true)}
        >
          <Key className="h-5 w-5" />
          Ubah PIN
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Keluar
        </Button>
      </div>
    </div>
  );
}
