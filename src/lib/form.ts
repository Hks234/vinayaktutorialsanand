export function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function optional(formData: FormData, key: string) {
  const value = str(formData, key);
  return value.length ? value : null;
}

export function many(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

export function checked(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "");
  return value === "on" || value === "true" || value === "1";
}

export function passwordError(password: string) {
  if (password.length < 8) return "Use at least 8 characters.";
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return "Include both letters and numbers.";
  return null;
}
