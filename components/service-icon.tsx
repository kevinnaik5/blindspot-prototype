import {
  KeyRound,
  Code2,
  Mail,
  Database,
  Hash,
  CreditCard,
  Filter,
  FileText,
  BookOpen,
  Github,
  Square,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SERVICE_ICON: Record<string, LucideIcon> = {
  clerk: KeyRound,
  code: Code2,
  postmark: Mail,
  hubspot: Database,
  slack: Hash,
  stripe: CreditCard,
  filter: Filter,
  typeform: FileText,
  notion: BookOpen,
  gmail: Mail,
  github: Github,
  linear: Square,
  schedule: Clock,
};

const SERVICE_LABEL: Record<string, string> = {
  clerk: "Clerk",
  code: "Code",
  postmark: "Postmark",
  hubspot: "HubSpot",
  slack: "Slack",
  stripe: "Stripe",
  filter: "Filter",
  typeform: "Typeform",
  notion: "Notion",
  gmail: "Gmail",
  github: "GitHub",
  linear: "Linear",
  schedule: "Schedule",
};

export function serviceLabel(service: string): string {
  return SERVICE_LABEL[service] ?? service;
}

export function ServiceIcon({
  service,
  className,
  strokeWidth = 1.75,
}: {
  service: string;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = SERVICE_ICON[service] ?? Square;
  return <Icon className={cn(className)} strokeWidth={strokeWidth} />;
}
