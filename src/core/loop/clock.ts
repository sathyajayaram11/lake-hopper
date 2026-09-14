const IST_OFFSET_MINUTES = 5 * 60 + 30;

export function now(): number {
  return Date.now();
}

export function getIstHour(atMs: number = now()): number {
  const istMs = atMs + IST_OFFSET_MINUTES * 60_000;
  return new Date(istMs).getUTCHours();
}
