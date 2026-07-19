import Skeleton from '../ui/Skeleton.jsx'

export default function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <Skeleton className="w-[140px] h-[140px] rounded-full" />
        <div className="flex-1 space-y-3 w-full">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-3/4 max-w-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}