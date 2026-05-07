import { notFound } from "next/navigation";
import { getWorkflow } from "@/data/workflows";
import { ActionsView } from "@/components/views/actions-view";

export default async function ActionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workflow = getWorkflow(id);
  if (!workflow) notFound();
  return <ActionsView workflow={workflow} />;
}
