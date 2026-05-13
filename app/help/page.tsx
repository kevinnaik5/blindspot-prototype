import {
  BookOpen,
  Compass,
  HelpCircle,
  LifeBuoy,
  ListChecks,
  MessageCircle,
  Telescope,
} from "lucide-react";
import { FAQS, KEY_TERMS, LENSES } from "@/data/help";
import { SectionHeading } from "@/components/section-label";
import { HelpFAQ } from "@/components/help-faq";

const LENS_ICON = {
  see: Compass,
  sense: Telescope,
  steer: ListChecks,
  intent: BookOpen,
} as const;

export default function HelpPage() {
  return (
    <div className="min-h-screen px-8 pt-8 pb-16">
      {/* Eyebrow */}
      <div className="text-[12px] font-medium uppercase tracking-[0.1em] text-muted">
        Help
      </div>

      {/* Header */}
      <div className="mt-3 border-b border-border pb-6">
        <h1 className="text-[28px] font-medium leading-[1.2] tracking-tightish text-fg">
          How Blindspot works
        </h1>
        <p className="mt-2 max-w-[680px] text-[12px] leading-[1.55] text-muted">
          A short guide to the four lenses, the terms Blindspot uses, and the
          questions most people ask in the first week.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        {/* The four lenses */}
        <section>
          <SectionHeading icon={Compass}>The four lenses</SectionHeading>
          <ul className="mt-3 overflow-hidden rounded-[6px] border border-border bg-panel">
            {LENSES.map((lens) => {
              const Icon = LENS_ICON[lens.key];
              return (
                <li
                  key={lens.key}
                  className="grid grid-cols-[40px_140px_minmax(0,1fr)_minmax(0,1fr)] items-start gap-4 border-b border-border px-5 py-4 last:border-b-0"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-panel-2 text-muted">
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </div>
                  <div className="text-[12px] font-medium uppercase tracking-[0.1em] text-fg">
                    {lens.name}
                  </div>
                  <p className="text-[12px] leading-[1.6] text-muted">
                    {lens.description}
                  </p>
                  <p className="text-[12px] leading-[1.55] text-subtle">
                    {lens.location}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Key terms */}
        <section>
          <SectionHeading icon={BookOpen}>Key terms</SectionHeading>
          <ul className="mt-3 overflow-hidden rounded-[6px] border border-border bg-panel">
            {KEY_TERMS.map((t) => (
              <li
                key={t.term}
                className="grid grid-cols-[180px_minmax(0,1fr)] items-start gap-4 border-b border-border px-5 py-3.5 last:border-b-0"
              >
                <div className="text-[12px] font-medium text-fg">
                  {t.term}
                </div>
                <p className="text-[12px] leading-[1.6] text-muted">
                  {t.definition}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section>
          <SectionHeading icon={HelpCircle}>FAQ</SectionHeading>
          <div className="mt-3">
            <HelpFAQ faqs={FAQS} />
          </div>
        </section>

        {/* Contact */}
        <section>
          <SectionHeading icon={LifeBuoy}>Still stuck</SectionHeading>
          <div className="mt-3 rounded-[6px] border border-border bg-panel p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-panel-2 text-muted">
                <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[16px] font-medium tracking-tightish text-fg">
                  Talk to a human
                </h3>
                <p className="mt-1.5 max-w-[560px] text-[12px] leading-[1.55] text-muted">
                  If a workflow isn&apos;t behaving the way the docs say, send a
                  note to support@blindspot.dev. Include the workflow ID and a
                  rough timeline; the team usually replies within a few hours.
                </p>
                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-md bg-info-solid px-3 py-1.5 text-[12px] font-medium text-fg transition-colors hover:bg-info-solid/85"
                  >
                    Send message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
