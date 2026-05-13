import {
  Bell,
  Hash,
  Mail,
  MessageSquare,
  Phone,
  Plug,
  Plus,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { PLATFORM_LABEL } from "@/data/workflows";
import {
  ALERT_DESTINATIONS,
  SOURCES,
  type AlertChannel,
  type AlertDestination,
  type AlertStatus,
  type ConnectionStatus,
  type SourceConnection,
} from "@/data/connections";
import { relativeFromNow } from "@/lib/time";
import { SectionHeading } from "@/components/section-label";
import { cn } from "@/lib/utils";

const SOURCE_STATUS_META: Record<
  ConnectionStatus,
  { label: string; tone: string }
> = {
  connected: { label: "Connected", tone: "text-ok" },
  "needs-reauth": { label: "Needs reauth", tone: "text-warning" },
  disconnected: { label: "Not connected", tone: "text-subtle" },
};

const ALERT_STATUS_META: Record<
  AlertStatus,
  { label: string; tone: string }
> = {
  active: { label: "Active", tone: "text-ok" },
  "needs-setup": { label: "Needs setup", tone: "text-warning" },
  inactive: { label: "Not connected", tone: "text-subtle" },
};

const ALERT_ICON: Record<AlertChannel, LucideIcon> = {
  slack: Hash,
  teams: MessageSquare,
  email: Mail,
  pagerduty: Bell,
  sms: Phone,
};

function sourceActionLabel(s: ConnectionStatus): string {
  if (s === "connected") return "Manage";
  if (s === "needs-reauth") return "Reconnect";
  return "Connect";
}

function alertActionLabel(s: AlertStatus): string {
  if (s === "active") return "Manage";
  if (s === "needs-setup") return "Finish setup";
  return "Connect";
}

export default function ConnectionsPage() {
  const connectedSources = SOURCES.filter((s) => s.status === "connected").length;
  const totalWorkflowsImported = SOURCES.reduce(
    (acc, s) => acc + s.workflowsImported,
    0,
  );
  const activeDestinations = ALERT_DESTINATIONS.filter(
    (a) => a.status === "active",
  ).length;

  return (
    <div className="min-h-screen px-8 pt-8 pb-16">
      {/* Eyebrow */}
      <div className="text-[12px] font-medium uppercase tracking-[0.1em] text-muted">
        Connections
      </div>

      {/* Header */}
      <div className="mt-3 border-b border-border pb-6">
        <h1 className="text-[28px] font-medium leading-[1.2] tracking-tightish text-fg">
          Sources and destinations
        </h1>
        <p className="mt-2 max-w-[680px] text-[12px] leading-[1.55] text-muted">
          {connectedSources}{" "}
          {connectedSources === 1 ? "source" : "sources"} connected ·{" "}
          {totalWorkflowsImported} workflows pulled in ·{" "}
          {activeDestinations} alert{" "}
          {activeDestinations === 1 ? "destination" : "destinations"} active.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        {/* Source platforms */}
        <section>
          <SectionHeading
            icon={Plug}
            trailing={
              <span className="tabular-nums">{SOURCES.length} platforms</span>
            }
          >
            Source platforms
          </SectionHeading>

          <div className="mt-3 overflow-hidden rounded-[6px] border border-border bg-panel">
            <div className="grid grid-cols-[minmax(0,1.4fr)_140px_120px_140px_120px] items-center gap-4 border-b border-border bg-panel-2 px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
              <div>Platform</div>
              <div>Status</div>
              <div>Workflows</div>
              <div>Last sync</div>
              <div className="text-right">Action</div>
            </div>
            <ul className="divide-y divide-border">
              {SOURCES.map((s) => (
                <SourceRow key={s.id} source={s} />
              ))}
            </ul>
          </div>
        </section>

        {/* Alert destinations */}
        <section>
          <SectionHeading
            icon={Bell}
            trailing={
              <span className="tabular-nums">
                {ALERT_DESTINATIONS.length} destinations
              </span>
            }
          >
            Alert destinations
          </SectionHeading>

          <div className="mt-3 overflow-hidden rounded-[6px] border border-border bg-panel">
            <div className="grid grid-cols-[minmax(0,1.4fr)_140px_minmax(0,1.2fr)_140px_120px] items-center gap-4 border-b border-border bg-panel-2 px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
              <div>Destination</div>
              <div>Status</div>
              <div>Target</div>
              <div>Last notified</div>
              <div className="text-right">Action</div>
            </div>
            <ul className="divide-y divide-border">
              {ALERT_DESTINATIONS.map((a) => (
                <AlertRow key={a.id} dest={a} />
              ))}
            </ul>
          </div>
        </section>

        {/* Manual import */}
        <section>
          <SectionHeading icon={Upload}>Manual import</SectionHeading>

          <div className="mt-3 rounded-[6px] border border-dashed border-border-strong bg-panel p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-panel-2 text-muted">
                <Upload className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[16px] font-medium tracking-tightish text-fg">
                  Import a workflow from YAML or JSON
                </h3>
                <p className="mt-1.5 max-w-[560px] text-[12px] leading-[1.55] text-muted">
                  Drop a file here or paste the definition. Useful for
                  one-off imports from platforms that don&apos;t support a live
                  connection yet.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-md bg-info-solid px-3 py-1.5 text-[12px] font-medium text-fg transition-colors hover:bg-info-solid/85"
                  >
                    <Plus className="h-3 w-3" strokeWidth={2} />
                    Add file
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-md bg-panel-2 px-3 py-1.5 text-[12px] font-medium text-muted transition-colors hover:bg-border-strong hover:text-fg"
                  >
                    Paste definition
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

function SourceRow({ source }: { source: SourceConnection }) {
  const meta = SOURCE_STATUS_META[source.status];
  return (
    <li className="grid grid-cols-[minmax(0,1.4fr)_140px_120px_140px_120px] items-center gap-4 px-5 py-3 text-[12px]">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-panel-2 text-muted">
          <Plug className="h-3.5 w-3.5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <div className="truncate text-fg">
            {PLATFORM_LABEL[source.platform]}
          </div>
          {source.detail && (
            <div className="mt-0.5 truncate text-[12px] text-subtle">
              {source.detail}
            </div>
          )}
        </div>
      </div>
      <div className={cn("text-[12px] font-medium", meta.tone)}>
        {meta.label}
      </div>
      <div className="tabular-nums text-muted">
        {source.workflowsImported > 0 ? source.workflowsImported : "—"}
      </div>
      <div className="tabular-nums text-muted">
        {source.lastSyncAt ? relativeFromNow(source.lastSyncAt) : "—"}
      </div>
      <div className="flex justify-end">
        <SourceActionButton status={source.status}>
          {sourceActionLabel(source.status)}
        </SourceActionButton>
      </div>
    </li>
  );
}

function AlertRow({ dest }: { dest: AlertDestination }) {
  const meta = ALERT_STATUS_META[dest.status];
  const Icon = ALERT_ICON[dest.channel];
  return (
    <li className="grid grid-cols-[minmax(0,1.4fr)_140px_minmax(0,1.2fr)_140px_120px] items-center gap-4 px-5 py-3 text-[12px]">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-panel-2 text-muted">
          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        </div>
        <div className="truncate text-fg">{dest.name}</div>
      </div>
      <div className={cn("text-[12px] font-medium", meta.tone)}>
        {meta.label}
      </div>
      <div className="truncate text-muted">{dest.detail ?? "—"}</div>
      <div className="tabular-nums text-muted">
        {dest.lastNotifiedAt ? relativeFromNow(dest.lastNotifiedAt) : "—"}
      </div>
      <div className="flex justify-end">
        <AlertActionButton status={dest.status}>
          {alertActionLabel(dest.status)}
        </AlertActionButton>
      </div>
    </li>
  );
}

function SourceActionButton({
  status,
  children,
}: {
  status: ConnectionStatus;
  children: React.ReactNode;
}) {
  if (status === "connected") {
    return (
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-md bg-panel-2 px-3 py-1.5 text-[12px] font-medium text-fg transition-colors hover:bg-border-strong"
      >
        {children}
      </button>
    );
  }
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-md bg-info-solid px-3 py-1.5 text-[12px] font-medium text-fg transition-colors hover:bg-info-solid/85"
    >
      {children}
    </button>
  );
}

function AlertActionButton({
  status,
  children,
}: {
  status: AlertStatus;
  children: React.ReactNode;
}) {
  if (status === "active") {
    return (
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-md bg-panel-2 px-3 py-1.5 text-[12px] font-medium text-fg transition-colors hover:bg-border-strong"
      >
        {children}
      </button>
    );
  }
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-md bg-info-solid px-3 py-1.5 text-[12px] font-medium text-fg transition-colors hover:bg-info-solid/85"
    >
      {children}
    </button>
  );
}
