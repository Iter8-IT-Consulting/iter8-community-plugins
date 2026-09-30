import Image from "next/image";

// Iter8 Community starter credit. Safe to delete - remove this file
// and its <Iter8Credit /> in src/app/layout.tsx.
export function Iter8Credit() {
  return (
    <footer className="flex justify-center py-6 text-xs text-brand-muted">
      <a
        href="https://www.iter8.community"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 hover:text-brand hover:underline"
      >
        <Image src="/brand/iter8-mark.png" alt="" width={16} height={16} aria-hidden />
        <span>Started with tools from the Iter8 Community</span>
      </a>
    </footer>
  );
}
