"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type PendingMutation<TInput> = {
  input: TInput;
  committed: boolean;
  cancelled: boolean;
};

type ValidateResult =
  | { valid: true }
  | { valid: false; error: string };

type UseOptimisticMutationOptions<TInput, TOutput> = {
  mutationFn: (input: TInput) => Promise<TOutput>;
  onSuccess?: (data: TOutput, input: TInput) => void;
  onError?: (error: Error, input: TInput) => void;
  onSettled?: () => void;
  undoTimeoutMs?: number;
  validateInput?: (input: TInput) => ValidateResult;
};

type UseOptimisticMutationReturn<TInput> = {
  mutate: (input: TInput) => void;
  cancel: () => void;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  pendingInput: TInput | null;
  retry: () => void;
};

function useLatestRef<T>(value: T): { readonly current: T } {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

export function useOptimisticMutation<TInput, TOutput = unknown>(
  options: UseOptimisticMutationOptions<TInput, TOutput>,
): UseOptimisticMutationReturn<TInput> {
  const optionsRef = useLatestRef(options);
  const undoTimeoutMs = options.undoTimeoutMs ?? 5000;

  const pendingRef = useRef<PendingMutation<TInput> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestInputRef = useRef<TInput | null>(null);

  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pendingInput, setPendingInput] = useState<TInput | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const commitMutation = useRef(async (input: TInput) => {
    if (pendingRef.current?.cancelled) return;

    const opts = optionsRef.current;

    pendingRef.current = { input, committed: true, cancelled: false };
    setIsPending(true);
    setIsError(false);
    setError(null);

    try {
      const result = await opts.mutationFn(input);
      pendingRef.current = null;
      setIsPending(false);
      setPendingInput(null);
      opts.onSuccess?.(result, input);
    } catch (err) {
      const mutationError = err instanceof Error ? err : new Error("Terjadi kesalahan server. Coba lagi.");
      pendingRef.current = null;
      setIsPending(false);
      setIsError(true);
      setError(mutationError);
      setPendingInput(input);
      opts.onError?.(mutationError, input);
      toast.error("Progress gagal disimpan. Coba lagi.", {
        action: {
          label: "Coba lagi",
          onClick: () => {
            commitMutation(input);
          },
        },
      });
    } finally {
      opts.onSettled?.();
    }
  }).current;

  const mutate = useCallback(
    (input: TInput) => {
      clearTimer();

      const opts = optionsRef.current;
      if (opts.validateInput) {
        const validation = opts.validateInput(input);
        if (!validation.valid) {
          setIsError(true);
          setError(new Error(validation.error));
          toast.error(validation.error);
          return;
        }
      }

      pendingRef.current = { input, committed: false, cancelled: false };
      latestInputRef.current = input;
      setPendingInput(input);

      toast(`Progress tersimpan ✓`, {
        description: "Batalkan dalam 5 detik",
        duration: undoTimeoutMs,
        action: {
          label: "Batalkan",
          onClick: () => {
            clearTimer();
            pendingRef.current = { input, committed: false, cancelled: true };
            setPendingInput(null);
            setIsPending(false);
            setIsError(false);
            setError(null);
            toast.dismiss();
          },
        },
      });

      timerRef.current = setTimeout(() => {
        commitMutation(input);
      }, undoTimeoutMs);
    },
    [clearTimer, commitMutation, undoTimeoutMs, optionsRef],
  );

  const cancel = useCallback(() => {
    clearTimer();
    if (pendingRef.current) {
      pendingRef.current.cancelled = true;
    }
    setPendingInput(null);
    setIsPending(false);
    setIsError(false);
    setError(null);
    toast.dismiss();
  }, [clearTimer]);

  const retry = useCallback(() => {
    if (latestInputRef.current) {
      commitMutation(latestInputRef.current);
    }
  }, [commitMutation]);

  return {
    mutate,
    cancel,
    isPending,
    isError,
    error,
    pendingInput,
    retry,
  };
}
