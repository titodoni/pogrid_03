"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Delete, ArrowLeft } from "lucide-react";

interface PinPadProps {
  pinLength: 4 | 6;
  onComplete: (pin: string) => Promise<void>;
  onBack?: () => void;
  error: string | null;
  setError: (error: string | null) => void;
  disabled?: boolean;
}

export function PinPad({
  pinLength,
  onComplete,
  onBack,
  error,
  setError,
  disabled = false,
}: PinPadProps) {
  const [pin, setPin] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerShake = useCallback(() => {
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    setIsShaking(true);
    shakeTimerRef.current = setTimeout(() => {
      setIsShaking(false);
      shakeTimerRef.current = null;
    }, 2000);
  }, []);

  const addDigit = useCallback(
    (digit: string) => {
      if (disabled || isSubmitting) return;
      setError(null);
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === pinLength) {
        setIsSubmitting(true);
        onComplete(nextPin)
          .catch(() => {
            triggerShake();
          })
          .finally(() => {
            setIsSubmitting(false);
            setPin("");
          });
      }
    },
    [pin, pinLength, disabled, isSubmitting, onComplete, setError, triggerShake],
  );

  const removeDigit = useCallback(() => {
    if (disabled || isSubmitting) return;
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  }, [disabled, isSubmitting, setError]);

  const dots = Array.from({ length: pinLength }, (_, i) => (
    <div
      key={i}
      className={cn(
        "h-3 w-3 rounded-full border-2 transition-all duration-150",
        i < pin.length
          ? "border-primary bg-primary"
          : "border-muted-foreground/30",
      )}
    />
  ));

  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "back"],
  ];

  return (
    <div className="flex flex-col items-center gap-6">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="self-start flex items-center gap-1 text-sm text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>
      )}

      <div
        className={cn(
          "flex items-center gap-3 py-4 transition-transform duration-150",
          isShaking && "animate-shake",
        )}
        aria-live="polite"
      >
        {dots}
      </div>

      <input
        ref={inputRef}
        type="text"
        inputMode="none"
        autoComplete="off"
        value={pin}
        readOnly
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      {error && (
        <p className="text-sm text-destructive font-medium text-center">
          {error}
        </p>
      )}

      <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
        {keys.flat().map((key, i) => {
          if (key === "") {
            return <div key={`empty-${i}`} />;
          }
          if (key === "back") {
            return (
              <Button
                key="back"
                type="button"
                variant="outline"
                size="lg"
                disabled={disabled || isSubmitting || pin.length === 0}
                onClick={removeDigit}
                className="h-16 text-xl rounded-xl"
                aria-label="Hapus digit"
              >
                <Delete className="h-5 w-5" />
              </Button>
            );
          }
          return (
            <Button
              key={key}
              type="button"
              variant="outline"
              size="lg"
              disabled={disabled || isSubmitting}
              onClick={() => addDigit(key)}
              className="h-16 text-2xl font-semibold rounded-xl"
            >
              {key}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
