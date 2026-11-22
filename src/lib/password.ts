import { randomBytes, timingSafeEqual } from "crypto";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export function generatePassword(length = 10) {
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export function generateCode(prefix: string, count: number) {
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

export function randomKey(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
