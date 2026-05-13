"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { DEMO_LOADED_WORKFLOWS } from "@/data/workflows";
import { IntentView } from "@/components/views/intent-view";
import { useDemoLoaded } from "@/lib/demo";

export default function IntentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const demoLoaded = useDemoLoaded();

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  if (!hydrated) return null;

  const workflow = demoLoaded
    ? DEMO_LOADED_WORKFLOWS.find((w) => w.id === id)
    : undefined;
  if (!workflow) notFound();

  return <IntentView workflow={workflow} />;
}
