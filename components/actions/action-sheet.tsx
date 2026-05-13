"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  AlertTriangle,
  ChevronDown,
  Eye,
  ShieldCheck,
  SlidersHorizontal,
  ToggleRight,
  X,
} from "lucide-react";
import type {
  ActionFieldOption,
  ActionGuardrails,
  ActionInteractive,
  ActionRecommendation,
  ActionScopeField,
  ActionSwapSlot,
  GuardrailImpact,
} from "@/data/actions";
import { cn } from "@/lib/utils";

type Selections = Record<string, string>;

const IMPACT_TONE: Record<NonNullable<GuardrailImpact["tone"]>, string> = {
  critical: "bg-critical text-critical",
  warning: "bg-warning text-warning",
  muted: "bg-subtle text-subtle",
};

export function ActionSheet({
  open,
  action,
  onClose,
  onCommit,
}: {
  open: boolean;
  action: ActionRecommendation | null;
  onClose: () => void;
  onCommit: (selections: Record<string, string>) => void;
}) {
  // Hold the most recently opened action so the slide-out animation
  // still has content to render while closing.
  const [lastAction, setLastAction] = useState<ActionRecommendation | null>(
    action,
  );

  useEffect(() => {
    if (action) setLastAction(action);
  }, [action]);

  const interactive = lastAction?.interactive;

  // Field selections, keyed by field id. Reset when action changes.
  const [selections, setSelections] = useState<Selections>({});
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [typedValue, setTypedValue] = useState("");

  useEffect(() => {
    if (!action?.interactive) return;
    const init: Selections = {};
    for (const f of action.interactive.scope) init[f.id] = f.defaultKey;
    for (const s of action.interactive.swappable) init[s.id] = s.defaultKey;
    setSelections(init);
    setConfirmChecked(false);
    setTypedValue("");
  }, [action]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const canCommit = useMemo(() => {
    if (!interactive) return false;
    const tier = interactive.guardrails.riskTier;
    if (tier === "checkbox") return confirmChecked;
    if (tier === "typed")
      return (
        typedValue.trim() === (interactive.guardrails.confirmTypedValue ?? "")
      );
    return true;
  }, [interactive, confirmChecked, typedValue]);

  if (!lastAction || !interactive) {
    // No interactive content to render. The sheet still mounts (for
    // animation continuity) but the body is empty.
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-bg/60 backdrop-blur-[2px] transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Sheet */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={lastAction.title}
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-[560px] flex-col border-l border-border bg-bg shadow-[-12px_0_32px_-8px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-medium uppercase tracking-[0.1em] text-subtle">
              Configure action
            </div>
            <h2 className="mt-1.5 text-[16px] font-medium leading-[1.35] text-fg">
              {lastAction.title}
            </h2>
            <p className="mt-2 text-[12px] leading-[1.55] text-muted">
              {lastAction.rationale}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-subtle transition-colors hover:bg-panel-2 hover:text-fg"
          >
            <X className="h-4 w-4" strokeWidth={1.85} />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-7 px-6 py-6">
            {interactive.scope.length > 0 && (
              <Section
                icon={SlidersHorizontal}
                title="Scope"
                eyebrow="Fine-grained control"
              >
                <div className="space-y-5">
                  {interactive.scope.map((field) => (
                    <PickerField
                      key={field.id}
                      field={field}
                      selections={selections}
                      setSelections={setSelections}
                    />
                  ))}
                </div>
              </Section>
            )}

            {interactive.swappable.length > 0 && (
              <Section
                icon={ToggleRight}
                title="Components"
                eyebrow="Swappable components"
              >
                <div className="space-y-5">
                  {interactive.swappable.map((slot) => (
                    <PickerField
                      key={slot.id}
                      field={slot}
                      selections={selections}
                      setSelections={setSelections}
                      altsHint
                    />
                  ))}
                </div>
              </Section>
            )}

            <Section
              icon={ShieldCheck}
              title="Guardrails"
              eyebrow="Human guardrails"
            >
              <GuardrailsBody
                guardrails={interactive.guardrails}
                confirmChecked={confirmChecked}
                setConfirmChecked={setConfirmChecked}
                typedValue={typedValue}
                setTypedValue={setTypedValue}
              />
            </Section>
          </div>
        </div>

        {/* Footer commit bar */}
        <div className="shrink-0 border-t border-border bg-bg px-6 py-4">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-md bg-panel-2 px-3 py-1.5 text-[12px] font-medium text-muted transition-colors hover:bg-border-strong hover:text-fg"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canCommit}
              onClick={() => onCommit(selections)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
                canCommit
                  ? "bg-info-solid text-fg hover:bg-info-solid/85"
                  : "cursor-not-allowed bg-panel-2 text-subtle",
              )}
            >
              {interactive.commitLabel}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// --- Section wrapper ---

function Section({
  icon: Icon,
  title,
  eyebrow,
  children,
}: {
  icon: typeof SlidersHorizontal;
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 text-fg">
        <Icon className="h-3.5 w-3.5 text-muted" strokeWidth={1.85} />
        <span className="text-[12px] font-medium">{title}</span>
        <span className="text-[12px] font-medium uppercase tracking-[0.1em] text-subtle">
          · {eyebrow}
        </span>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

// --- Picker primitive ---

function PickerField({
  field,
  selections,
  setSelections,
  altsHint = false,
}: {
  field: ActionScopeField | ActionSwapSlot;
  selections: Selections;
  setSelections: Dispatch<SetStateAction<Selections>>;
  altsHint?: boolean;
}) {
  const selectedKey = selections[field.id] ?? field.defaultKey;
  const selected =
    field.options.find((o) => o.key === selectedKey) ?? field.options[0];
  const altCount = field.options.length - 1;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
          {field.label}
        </label>
        {altsHint && altCount > 0 && (
          <span className="text-[12px] uppercase tracking-[0.08em] text-subtle">
            {altCount} alternative{altCount === 1 ? "" : "s"}
          </span>
        )}
      </div>
      {field.hint && (
        <p className="mt-1 text-[12px] leading-[1.5] text-subtle">
          {field.hint}
        </p>
      )}
      <div className="mt-2">
        <Picker
          options={field.options}
          selectedKey={selectedKey}
          onChange={(key) =>
            setSelections((prev) => ({ ...prev, [field.id]: key }))
          }
        />
      </div>
      {selected.detail && (
        <p className="mt-2 text-[12px] leading-[1.55] text-muted">
          {selected.detail}
        </p>
      )}
    </div>
  );
}

function Picker({
  options,
  selectedKey,
  onChange,
}: {
  options: ActionFieldOption[];
  selectedKey: string;
  onChange: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = options.find((o) => o.key === selectedKey) ?? options[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between rounded-md border bg-panel px-3 py-2 text-left text-[12px] text-fg transition-colors",
          open
            ? "border-info/45 bg-panel-2"
            : "border-border hover:border-muted/40",
        )}
      >
        <span className="truncate">{selected.label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-subtle transition-transform",
            open && "rotate-180",
          )}
          strokeWidth={1.85}
        />
      </button>
      {open && (
        <div className="absolute left-0 right-0 z-10 mt-1.5 max-h-[300px] overflow-y-auto rounded-md border border-border bg-panel shadow-lg">
          {options.map((opt) => {
            const isActive = opt.key === selectedKey;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  onChange(opt.key);
                  setOpen(false);
                }}
                className={cn(
                  "block w-full border-b border-border/60 px-3 py-2.5 text-left transition-colors last:border-b-0",
                  isActive ? "bg-panel-2" : "hover:bg-panel-2/60",
                )}
              >
                <div
                  className={cn(
                    "text-[12px]",
                    isActive ? "font-medium text-fg" : "text-fg",
                  )}
                >
                  {opt.label}
                </div>
                {opt.detail && (
                  <div className="mt-0.5 text-[12px] leading-[1.5] text-muted">
                    {opt.detail}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Guardrails section body ---

function GuardrailsBody({
  guardrails,
  confirmChecked,
  setConfirmChecked,
  typedValue,
  setTypedValue,
}: {
  guardrails: ActionGuardrails;
  confirmChecked: boolean;
  setConfirmChecked: Dispatch<SetStateAction<boolean>>;
  typedValue: string;
  setTypedValue: Dispatch<SetStateAction<string>>;
}) {
  const tier = guardrails.riskTier;

  return (
    <div className="space-y-4">
      {/* Affected impact list */}
      {guardrails.affected.length > 0 && (
        <div className="rounded-[6px] border border-border bg-panel p-3.5">
          <div className="flex items-center gap-1.5">
            <AlertTriangle
              className="h-3 w-3 text-warning"
              strokeWidth={2}
            />
            <span className="text-[12px] font-medium uppercase tracking-[0.1em] text-muted">
              Before you confirm
            </span>
          </div>
          <ul className="mt-2 space-y-1.5">
            {guardrails.affected.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-[12px] leading-[1.5] text-fg"
              >
                <span
                  className={cn(
                    "mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full",
                    item.tone === "critical"
                      ? "bg-critical"
                      : item.tone === "warning"
                      ? "bg-warning"
                      : "bg-subtle",
                  )}
                />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reversibility note */}
      <p className="flex items-start gap-2 text-[12px] leading-[1.55] text-muted">
        <ShieldCheck
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ok"
          strokeWidth={1.85}
        />
        <span>{guardrails.reversibility}</span>
      </p>

      {/* Risk-tier gate */}
      {tier === "preview" && guardrails.previewBody && (
        <div>
          <div className="flex items-center gap-1.5">
            <Eye className="h-3 w-3 text-muted" strokeWidth={2} />
            <span className="text-[12px] font-medium uppercase tracking-[0.1em] text-muted">
              Preview
            </span>
          </div>
          <pre className="mt-2 whitespace-pre-wrap rounded-[6px] border border-border bg-panel p-3.5 font-sans text-[12px] leading-[1.6] text-fg">
            {guardrails.previewBody}
          </pre>
        </div>
      )}

      {tier === "checkbox" && guardrails.confirmCheckboxLabel && (
        <label className="flex cursor-pointer items-start gap-2.5 rounded-[6px] border border-border bg-panel p-3 text-[12px] leading-[1.5] text-fg transition-colors hover:bg-panel-2">
          <input
            type="checkbox"
            checked={confirmChecked}
            onChange={(e) => setConfirmChecked(e.target.checked)}
            className="mt-[3px] h-3.5 w-3.5 shrink-0 cursor-pointer accent-info"
          />
          <span>{guardrails.confirmCheckboxLabel}</span>
        </label>
      )}

      {tier === "typed" && guardrails.confirmTypedValue && (
        <div className="space-y-2">
          <label className="block text-[12px] leading-[1.5] text-muted">
            Type{" "}
            <code className="rounded-sm bg-panel-2 px-1 py-0.5 font-mono text-[12px] text-fg">
              {guardrails.confirmTypedValue}
            </code>{" "}
            to confirm.
          </label>
          <input
            type="text"
            value={typedValue}
            onChange={(e) => setTypedValue(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            className="w-full rounded-md border border-border bg-panel px-3 py-2 font-mono text-[12px] text-fg placeholder:text-subtle focus:border-info/55 focus:outline-none"
            placeholder={guardrails.confirmTypedValue}
          />
        </div>
      )}
    </div>
  );
}
