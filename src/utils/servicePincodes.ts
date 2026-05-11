export type ServicePincodeEntry = { pincode: string; label: string };

const PIN_RE = /^\d{6}$/;

export function normalizePincode(raw: string | null | undefined): string {
  return String(raw ?? '')
    .replace(/\D/g, '')
    .slice(0, 6);
}

export function isValidIndianPincode(digits: string): boolean {
  return PIN_RE.test(digits);
}

/** Parse API / admin JSON into a clean list */
export function parseServicePincodesJson(raw: unknown): ServicePincodeEntry[] {
  if (raw == null) return [];
  let data = raw;
  if (typeof data === 'string') {
    const t = data.trim();
    if (!t) return [];
    try {
      data = JSON.parse(t);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(data)) return [];
  const out: ServicePincodeEntry[] = [];
  for (const row of data) {
    if (row == null || typeof row !== 'object') continue;
    const p = normalizePincode(String((row as { pincode?: string }).pincode ?? ''));
    if (!isValidIndianPincode(p)) continue;
    const label = String((row as { label?: string }).label ?? '').trim();
    out.push({ pincode: p, label: label || p });
  }
  return out;
}

/** Admin textarea: one per line — `394101` or `394101, Area name` */
export function servicePincodesToText(entries: ServicePincodeEntry[]): string {
  if (!entries.length) return '';
  return entries.map((e) => (e.label && e.label !== e.pincode ? `${e.pincode}, ${e.label}` : e.pincode)).join('\n');
}

export function parseServicePincodesText(text: string): ServicePincodeEntry[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const seen = new Set<string>();
  const out: ServicePincodeEntry[] = [];
  for (const line of lines) {
    const comma = line.indexOf(',');
    const pinPart = comma >= 0 ? line.slice(0, comma).trim() : line;
    const labelPart = comma >= 0 ? line.slice(comma + 1).trim() : '';
    const pincode = normalizePincode(pinPart);
    if (!isValidIndianPincode(pincode) || seen.has(pincode)) continue;
    seen.add(pincode);
    out.push({ pincode, label: labelPart || pincode });
  }
  return out;
}
