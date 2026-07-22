import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors">

      {/* Banner Header Skeleton */}
      <div className="bg-zinc-900 text-white dark:bg-zinc-950 pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-border">
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <Skeleton className="h-12 w-80 mx-auto mb-4 bg-white/20" />
          <Skeleton className="h-5 w-[500px] max-w-full mx-auto bg-white/10" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* Filters Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <Skeleton className="h-10 w-full sm:w-72" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card overflow-hidden">
              <Skeleton className="h-56 w-full rounded-none" />
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="px-5 pb-5 pt-4 border-t border-border/50 bg-muted/20 flex justify-between items-center">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
