import { notFound } from "next/navigation";
import { getWorkflow } from "@/data/workflows";
import { HealthView } from "@/components/views/health-view";

export default async function HealthPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workflow = getWorkflow(id);
  if (!workflow) notFound();
  return <HealthView workflow={workflow} />;
}
