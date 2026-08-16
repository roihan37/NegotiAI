import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ResultSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      {/* Price cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="gap-0 p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-7 rounded-md" />
            </div>
            <Skeleton className="mt-4 h-7 w-32" />
            <Skeleton className="mt-2 h-3 w-20" />
          </Card>
        ))}
      </div>

      {/* Leverage */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="mt-4 h-1.5 w-full rounded-full" />
        <Skeleton className="mt-3 h-3 w-3/4" />
      </Card>

      {/* Strategy */}
      <Card className="p-5">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-5/6" />
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </Card>

      {/* Message */}
      <Card className="p-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-4 h-16 w-full rounded-lg" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-36" />
        </div>
      </Card>
    </div>
  )
}
