import bcrypt from "bcryptjs";

export function hashPin(pin: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(pin, salt);
}

export function verifyPin(pin: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(pin, hash);
  } catch {
    return false;
  }
}

export function generateStaffPin(): string {
  const patterns = [
    "1234", "2345", "3456", "4567", "5678", "6789",
    "2468", "1357", "1122", "1111", "2222", "3333",
    "4321", "1212", "1112", "1222",
  ];
  return patterns[Math.floor(Math.random() * patterns.length)];
}
