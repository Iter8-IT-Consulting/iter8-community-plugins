"use client";

import { useEffect, useState } from "react";

// Shows a token's current value as the browser sees it, so the style guide
// always matches the skin (including dark mode, if the device uses it).
export function TokenValue({ name }: { name: string }) {
  const [value, setValue] = useState("");
  useEffect(() => {
    const read = () => setValue(getComputedStyle(document.documentElement).getPropertyValue(name).trim());
    read();
    const dark = window.matchMedia("(prefers-color-scheme: dark)");
    dark.addEventListener("change", read);
    return () => dark.removeEventListener("change", read);
  }, [name]);
  return <code className="font-mono text-xs text-brand-muted">{value || "…"}</code>;
}
