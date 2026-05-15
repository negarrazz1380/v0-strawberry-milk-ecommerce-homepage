import { Suspense } from 'react'
import { SuccessContent } from '@/components/success-content'

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
