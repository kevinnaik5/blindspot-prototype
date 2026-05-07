import { notFound } from "next/navigation";
import { getWorkflow } from "@/data/workflows";
import { IntentView } from "@/components/views/intent-view";

export default async function IntentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workflow = getWorkflow(id);
  if (!workflow) notFound();
  return <IntentView workflow={workflow} />;
}
