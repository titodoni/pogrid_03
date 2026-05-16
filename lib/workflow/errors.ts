export class MutationError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "MutationError";
    this.code = code;
  }
}

export class AuthError extends MutationError {
  constructor(message = "Sesi tidak valid") {
    super("AUTH_ERROR", message);
    this.name = "AuthError";
  }
}

export class PermissionError extends MutationError {
  constructor(message = "Aksi ini tidak tersedia untuk role Anda") {
    super("FORBIDDEN", message);
    this.name = "PermissionError";
  }
}

export class ValidationError extends MutationError {
  constructor(message = "Periksa data yang ditandai") {
    super("VALIDATION_ERROR", message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends MutationError {
  constructor(entity = "Data") {
    super("NOT_FOUND", `${entity} tidak ditemukan.`);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends MutationError {
  constructor(message = "Data sudah berubah. Data terbaru dimuat ulang.") {
    super("CONFLICT", message);
    this.name = "ConflictError";
  }
}

export class ProgressDecreaseError extends MutationError {
  constructor() {
    super("PROGRESS_DECREASE", "Progress tidak bisa turun.");
    this.name = "ProgressDecreaseError";
  }
}

export const ERROR_MESSAGES: Record<string, string> = {
  AUTH_ERROR: "Sesi tidak valid. Silakan login ulang.",
  FORBIDDEN: "Aksi ini tidak tersedia untuk role Anda.",
  VALIDATION_ERROR: "Periksa data yang ditandai.",
  NOT_FOUND: "Data tidak ditemukan.",
  CONFLICT: "Data sudah berubah. Data terbaru dimuat ulang.",
  PROGRESS_DECREASE: "Progress tidak bisa turun.",
  NETWORK_ERROR: "Koneksi bermasalah. Periksa internet lalu coba lagi.",
  SERVER_ERROR: "Terjadi kesalahan server. Coba lagi.",
};
