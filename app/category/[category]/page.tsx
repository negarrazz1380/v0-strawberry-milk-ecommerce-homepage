import { Suspense } from 'react'
import { CategoryContent } from '@/components/category-content'

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params

  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-20">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/50 rounded-3xl h-80 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <CategoryContent category={category} />
    </Suspense>
  )
}
