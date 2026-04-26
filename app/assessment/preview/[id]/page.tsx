import AssesmentPreview from '@/modules/assesment/components/pages/AssesmentPreview';
import React from 'react'

export default async function page({ params }: { params: { id: string } }) {
  const { id } = await params;
  return (
    <AssesmentPreview solutionId={id} />
  )
}
