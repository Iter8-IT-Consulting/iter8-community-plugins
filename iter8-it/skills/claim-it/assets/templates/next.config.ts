import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Let other devices try the app while it runs on this computer
  // (`npm run dev` -> http://<this computer's network address>:3000), e.g.
  // a phone on the same Wi-Fi. Without this, Next.js quietly refuses their
  // requests: the page loads but buttons and forms don't work. Covers the
  // usual home and office network ranges, and 127.0.0.1 (where local
  // Supabase's email links land). Only affects `npm run dev`.
  allowedDevOrigins: ["127.0.0.1", "192.168.*.*", "10.*.*.*", "172.*.*.*"],
};

export default nextConfig;
