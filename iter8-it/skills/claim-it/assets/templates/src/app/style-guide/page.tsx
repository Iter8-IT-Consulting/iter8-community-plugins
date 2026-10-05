import type { Metadata } from "next";
import { site } from "@/app/site";
import { TokenValue } from "./TokenValue";

// The app's style guide: its colours, fonts and common pieces, drawn from
// the same tokens the app uses (src/app/brand.css), so it's always current.
// Public on purpose, so anyone working on the app can look things up.
// When a story adds a reusable piece (a card, a badge), add it here too.
export const metadata: Metadata = {
  title: `Style guide · ${site.name}`,
  robots: { index: false },
};

const colours = [
  { token: "--brand-primary", name: "Primary", use: "Buttons, links, highlights", className: "bg-brand" },
  { token: "--brand-on-primary", name: "On primary", use: "Text on primary", className: "bg-brand-on" },
  { token: "--brand-accent", name: "Accent", use: "Sparingly, for emphasis", className: "bg-brand-accent" },
  { token: "--brand-ink", name: "Ink", use: "Text", className: "bg-brand-ink" },
  { token: "--brand-muted", name: "Muted", use: "Secondary text", className: "bg-brand-muted" },
  { token: "--brand-surface", name: "Surface", use: "Page background", className: "bg-brand-surface" },
  { token: "--brand-raised", name: "Raised", use: "Cards, inputs, panels", className: "bg-brand-raised" },
  { token: "--brand-border", name: "Border", use: "Lines and outlines", className: "bg-brand-border" },
  { token: "--status-ok", name: "OK", use: "Success", className: "bg-status-ok" },
  { token: "--status-warn", name: "Warning", use: "Needs attention", className: "bg-status-warn" },
  { token: "--status-error", name: "Error", use: "Something went wrong", className: "bg-status-error" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-headline text-2xl font-bold text-brand-ink">{title}</h2>
      {children}
    </section>
  );
}

export default function StyleGuidePage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-12 px-6 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="font-headline text-4xl font-bold text-brand-ink">{site.name} style guide</h1>
        <p className="text-brand-muted">
          The colours, fonts and pieces this app is made of. Values come from <code>src/app/brand.css</code>.
        </p>
      </header>

      <Section title="Colours">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {colours.map((c) => (
            <li key={c.token} className="overflow-hidden rounded-brand border border-brand-border bg-brand-raised">
              <div className={`h-16 border-b border-brand-border ${c.className}`} />
              <div className="flex flex-col gap-1 p-3">
                <span className="font-semibold text-brand-ink">{c.name}</span>
                <span className="text-sm text-brand-muted">{c.use}</span>
                <TokenValue name={c.token} />
                <code className="font-mono text-xs text-brand-muted">{c.token}</code>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Type">
        <div className="flex flex-col gap-3 rounded-brand border border-brand-border bg-brand-raised p-6">
          <p className="font-headline text-4xl font-bold text-brand-ink">Headline: the quick brown fox</p>
          <p className="font-headline text-2xl font-bold text-brand-ink">Section heading</p>
          <p className="font-headline text-xl font-semibold text-brand-ink">Small heading</p>
          <p className="text-base text-brand-ink">
            Body text. The main reading text of the app, used for paragraphs, labels and descriptions.
          </p>
          <p className="text-sm text-brand-muted">Small, muted text for hints and secondary details.</p>
          <p className="font-mono text-sm text-brand-ink">Code: npm run dev</p>
          <div className="flex flex-wrap gap-6 text-sm text-brand-muted">
            <span>
              Headline font: <TokenValue name="--brand-font-headline" />
            </span>
            <span>Body font: set in src/app/layout.tsx</span>
          </div>
        </div>
      </Section>

      <Section title="Buttons and links">
        <div className="flex flex-wrap items-center gap-4 rounded-brand border border-brand-border bg-brand-raised p-6">
          <button className="rounded-brand bg-brand px-4 py-2 font-semibold text-brand-on">Primary action</button>
          <button className="rounded-brand border border-brand px-4 py-2 font-semibold text-brand">Secondary</button>
          <button className="rounded-brand px-4 py-2 font-semibold text-brand underline-offset-4 hover:underline">
            Quiet
          </button>
          <button disabled className="rounded-brand bg-brand px-4 py-2 font-semibold text-brand-on opacity-50">
            Disabled
          </button>
          <a href="#" className="text-brand underline underline-offset-4">
            A link
          </a>
        </div>
      </Section>

      <Section title="Forms">
        <form className="flex max-w-sm flex-col gap-4 rounded-brand border border-brand-border bg-brand-raised p-6">
          <label className="flex flex-col gap-1 text-sm text-brand-ink">
            Text field
            <input
              placeholder="Type here"
              className="rounded-brand border border-brand-border bg-brand-raised px-3 py-2 text-brand-ink"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-brand-ink">
            Bigger text
            <textarea
              rows={3}
              placeholder="Several lines"
              className="rounded-brand border border-brand-border bg-brand-raised px-3 py-2 text-brand-ink"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-brand-ink">
            <input type="checkbox" className="accent-[var(--brand-primary)]" /> A checkbox
          </label>
        </form>
      </Section>

      <Section title="Messages">
        <div className="flex flex-col gap-3">
          <p role="status" className="rounded-brand border border-brand/30 bg-brand-raised p-3 text-sm text-brand-ink">
            A neutral message, like &quot;Check your email&quot;.
          </p>
          <p className="rounded-brand border border-status-ok bg-brand-raised p-3 text-sm text-brand-ink">
            Saved. A success message.
          </p>
          <p className="rounded-brand border border-status-warn bg-brand-raised p-3 text-sm text-brand-ink">
            Heads up. A warning.
          </p>
          <p className="rounded-brand border border-status-error bg-brand-raised p-3 text-sm text-brand-ink">
            That didn&apos;t work. An error.
          </p>
        </div>
      </Section>

      <Section title="Cards and shape">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 rounded-brand border border-brand-border bg-brand-raised p-5">
            <span className="font-headline text-lg font-bold text-brand-ink">A card</span>
            <span className="text-sm text-brand-muted">Raised surface, border, the app&apos;s corner radius.</span>
          </div>
          <div className="flex flex-col gap-2 rounded-brand bg-brand p-5 text-brand-on">
            <span className="font-headline text-lg font-bold">A highlighted card</span>
            <span className="text-sm opacity-90">For the one thing that matters most on a screen.</span>
          </div>
        </div>
        <p className="text-sm text-brand-muted">
          Corner radius: <TokenValue name="--brand-radius" />
        </p>
      </Section>
    </main>
  );
}
