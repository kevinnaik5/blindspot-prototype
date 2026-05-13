"use client";

import { useEffect, useState } from "react";

// In-memory only. Resets on every full page refresh, persists across
// client-side navigation within the same load. No localStorage / cookie
// so the first-time-user empty state always shows again on reload.
let demoLoaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function useDemoLoaded(): boolean {
  const [val, setVal] = useState(demoLoaded);
  useEffect(() => {
    const sync = () => setVal(demoLoaded);
    listeners.add(sync);
    sync();
    return () => {
      listeners.delete(sync);
    };
  }, []);
  return val;
}

export function setDemoLoaded(value: boolean) {
  if (demoLoaded === value) return;
  demoLoaded = value;
  emit();
}
