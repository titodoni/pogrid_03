export type MutationErrorResponse = {
  code: string;
  message: string;
};

export type MutationResult<T = void> = {
  ok: boolean;
  data?: T;
  error?: MutationErrorResponse;
  auditId?: string;
  serverConfirmedAt?: string;
};

export function successResult<T>(data: T, meta?: { auditId?: string }): MutationResult<T> {
  return {
    ok: true,
    data,
    auditId: meta?.auditId,
    serverConfirmedAt: new Date().toISOString(),
  };
}

export function failureResult(error: MutationErrorResponse): MutationResult<never> {
  return {
    ok: false,
    error,
    serverConfirmedAt: new Date().toISOString(),
  };
}
