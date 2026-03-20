import Entry from '@/components/ui/home/Entry'
import { Suspense } from 'react'

export default function page() {
  return (
    <Suspense>
      <Entry />
    </Suspense>
  )
}
