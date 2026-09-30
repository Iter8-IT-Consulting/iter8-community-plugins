import { site } from "./site";

// Starter page - replace with the app's real home page.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="font-headline text-4xl font-bold text-brand-ink">{site.name}</h1>
      <div className="h-px w-16 bg-brand" aria-hidden />
      <p className="max-w-md text-brand-muted">{site.purpose}</p>
    </main>
  );
}
