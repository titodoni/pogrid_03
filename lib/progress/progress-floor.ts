export type ProgressFloorResult =
  | {
      ok: true
      value: number
      serverConfirmedValue: number
    }
  | {
      ok: false
      error: "PROGRESS_BELOW_SERVER_CONFIRMED" | "INVALID_INPUT"
      requestedValue: number
      serverConfirmedValue: number
    };

type ApplyProgressFloorInput = {
  serverConfirmedValue: number;
  requestedValue: number;
  min?: number;
  max?: number;
};

/**
 * Client-side progress floor protection is UX protection only.
 * Server-side business mutations must still enforce no-decrease
 * before writing to database.
 */
export function applyProgressFloor(input: ApplyProgressFloorInput): ProgressFloorResult {
  const { serverConfirmedValue, requestedValue, max = 100 } = input;
  const min = input.min ?? 0;

  if (
    typeof serverConfirmedValue !== "number" ||
    typeof requestedValue !== "number" ||
    Number.isNaN(serverConfirmedValue) ||
    Number.isNaN(requestedValue) ||
    !Number.isFinite(serverConfirmedValue) ||
    !Number.isFinite(requestedValue)
  ) {
    return {
      ok: false,
      error: "INVALID_INPUT",
      requestedValue: Number.isFinite(requestedValue) ? requestedValue : 0,
      serverConfirmedValue: Number.isFinite(serverConfirmedValue) ? serverConfirmedValue : 0,
    };
  }

  if (requestedValue < serverConfirmedValue) {
    return {
      ok: false,
      error: "PROGRESS_BELOW_SERVER_CONFIRMED",
      requestedValue,
      serverConfirmedValue,
    };
  }

  const clamped = Math.min(Math.max(requestedValue, min), max);

  return {
    ok: true,
    value: clamped,
    serverConfirmedValue,
  };
}
