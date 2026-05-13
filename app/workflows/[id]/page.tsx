"use client";

import { use, useEffect, useState } from "react";
import { notFound, useSearchParams } from "next/navigation";
import { DEMO_LOADED_WORKFLOWS } from "@/data/workflows";
import { FlowView } from "@/components/flow-view";
import { useDemoLoaded } from "@/lib/demo";

export default function FlowTabPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const demoLoaded = useDemoLoaded();
  const sp = useSearchParams();

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated) return null;

  const workflow = demoLoaded
    ? DEMO_LOADED_WORKFLOWS.find((w) => w.id === id)
    : undefined;
  if (!workflow) notFound();

  return (
    <FlowView
      workflow={workflow}
      initialView={sp.get("view") ?? undefined}
      initialRunStatus={sp.get("status") ?? undefined}
    />
  );
}
