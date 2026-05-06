// Fixed "now" so relative times stay deterministic across the prototype.
// All scenario timestamps are anchored to this moment.
export const NOW_ISO = "2026-04-26T14:30:00Z";
export const NOW = new Date(NOW_ISO);

export function relativeFromNow(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = NOW.getTime() - then;
  const sec = Math.round(diffMs / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function shortDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
