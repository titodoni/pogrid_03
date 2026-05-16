"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { PinPad } from "@/components/pin-pad";
import { Shield } from "lucide-react";

export default function SuperadminPage() {
  const router = useRouter();
  const [step, setStep] = useState<"pin" | "done">("pin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePinComplete = useCallback(
    async (pin: string) => {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin }),
        });
        const json = await res.json();
        if (!json.ok) {
          setError("PIN salah.");
          throw new Error("Wrong PIN");
        }
        setStep("done");
        router.push("/superadmin");
      } catch {
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  if (step === "done") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/30">
        <Card className="w-full max-w-sm p-8 text-center space-y-4">
          <Shield className="h-12 w-12 mx-auto text-primary" />
          <h1 className="text-xl font-bold">Superadmin</h1>
          <p className="text-sm text-muted-foreground">
            Dashboard superadmin akan tersedia di sini.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/30">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <Shield className="h-10 w-10 mx-auto text-primary" />
          <h1 className="text-xl font-bold">Superadmin</h1>
          <p className="text-sm text-muted-foreground">
            Masukkan PIN superadmin 6 digit
          </p>
        </div>

        <Card className="p-6">
          <PinPad
            pinLength={6}
            onComplete={handlePinComplete}
            error={error}
            setError={setError}
            disabled={loading}
          />
        </Card>
      </div>
    </div>
  );
}
