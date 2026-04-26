import SolutionDetail from "@/modules/admin/components/SolutionDetail";

export default async function SolutionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SolutionDetail id={id} />;
}
