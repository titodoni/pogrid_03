"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield,
  Briefcase,
  TrendingUp,
  PencilRuler,
  ShoppingCart,
  Wrench,
  CheckCircle,
  Truck,
  Receipt,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PinPad } from "@/components/pin-pad";

type RoleGroup = {
  roleKey: string;
  label: string;
  icon: React.ElementType;
  departmentId?: string;
  users: { id: string; name: string }[];
};

type LoginStep = "roles" | "users" | "pin";

const ROLE_GROUP_CONFIG: Record<string, { label: string; icon: React.ElementType }> = {
  ADMIN: { label: "Admin", icon: Shield },
  OWNER: { label: "Owner", icon: Briefcase },
  MANAGER: { label: "Manager", icon: Briefcase },
  SALES: { label: "Sales", icon: TrendingUp },
  DRAFTER: { label: "Drafter", icon: PencilRuler },
  PURCHASING: { label: "Purchasing", icon: ShoppingCart },
  QC: { label: "QC", icon: CheckCircle },
  DELIVERY: { label: "Delivery", icon: Truck },
  FINANCE: { label: "Finance", icon: Receipt },
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || undefined;

  const [step, setStep] = useState<LoginStep>("roles");
  const [roleGroups, setRoleGroups] = useState<RoleGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<RoleGroup | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRoles() {
      try {
        const res = await fetch("/api/users");
        const json = await res.json();
        if (!json.ok) throw new Error("Gagal memuat data");

        const grouped: Record<string, RoleGroup> = {};
        for (const user of json.data) {
          const key = user.roleKey;
          if (key === "SUPERADMIN") continue;

          if (!grouped[key]) {
            const config = ROLE_GROUP_CONFIG[user.role] ?? ROLE_GROUP_CONFIG[key] ?? {
              label: user.department?.name || key,
              icon: Wrench,
            };
            grouped[key] = {
              roleKey: key,
              label: config.label,
              icon: config.icon,
              departmentId: user.departmentId,
              users: [],
            };
          }
          grouped[key].users.push({ id: user.id, name: user.name });
        }

        setRoleGroups(Object.values(grouped));
      } catch {
        setError("Gagal memuat data login.");
      } finally {
        setLoading(false);
      }
    }
    loadRoles();
  }, []);

  const handleSelectGroup = useCallback((group: RoleGroup) => {
    setSelectedGroup(group);
    setStep("users");
    setError(null);
  }, []);

  const handleSelectUser = useCallback(
    (userId: string) => {
      setSelectedUserId(userId);
      setStep("pin");
      setError(null);
    },
    [],
  );

  const handlePinComplete = useCallback(
    async (pin: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId, pin }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError("PIN salah. Coba lagi.");
        throw new Error("Wrong PIN");
      }
      router.push(redirectTo || json.data.redirect);
    },
    [selectedUserId, redirectTo, router],
  );

  const handleBack = useCallback(() => {
    if (step === "pin") {
      setStep("users");
      setSelectedUserId(null);
      setError(null);
    } else if (step === "users") {
      setStep("roles");
      setSelectedGroup(null);
      setError(null);
    }
  }, [step]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-background to-muted/30">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">POgrid</h1>
          <p className="text-sm text-muted-foreground">
            Produksi Tracking untuk Fabrikasi
          </p>
        </div>

        {(step === "roles" || step === "users") && (
          <Card className="p-4 space-y-3">
            {step === "roles" && (
              <>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Pilih Role / Departemen
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {roleGroups.map((group) => {
                    const Icon = group.icon;
                    return (
                      <Button
                        key={group.roleKey}
                        variant="outline"
                        className="flex flex-col items-center gap-1.5 h-auto py-4 px-2"
                        onClick={() => handleSelectGroup(group)}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-xs font-medium truncate w-full text-center">
                          {group.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {group.users.length}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </>
            )}

            {step === "users" && selectedGroup && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1 text-sm text-muted-foreground"
                >
                  <span className="text-xs">&larr;</span> Kembali
                </button>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Pilih User &mdash; {selectedGroup.label}
                </h2>
                <div className="space-y-2">
                  {selectedGroup.users.map((user) => (
                    <Button
                      key={user.id}
                      variant="outline"
                      className="w-full justify-start h-12 text-sm"
                      onClick={() => handleSelectUser(user.id)}
                    >
                      {user.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {step === "pin" && selectedGroup && selectedUserId && (
          <Card className="p-6">
            <PinPad
              pinLength={4}
              onComplete={handlePinComplete}
              onBack={handleBack}
              error={error}
              setError={setError}
            />
          </Card>
        )}

        <div className="text-center">
          <a
            href="https://wa.me/6281234567890?text=Saya%20lupa%20PIN%20POgrid.%20Tolong%20reset%20PIN%20saya."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Lupa PIN?
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
