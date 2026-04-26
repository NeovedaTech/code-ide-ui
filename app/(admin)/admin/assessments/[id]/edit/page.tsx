import AssessmentEditForm from "@/modules/admin/components/AssessmentEditForm";

export default async function EditAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AssessmentEditForm id={id} />;
}
