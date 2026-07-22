import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <main className="min-h-screen flex flex-col bg-background transition-colors">

      {/* Hero Section Skeleton */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <Skeleton className="absolute inset-0 rounded-none" />
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <Skeleton className="h-16 w-[60%] mx-auto mb-8" />
          <Skeleton className="h-6 w-[80%] mx-auto mb-4" />
          <Skeleton className="h-6 w-[50%] mx-auto mb-10" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Skeleton className="h-12 w-44 rounded-full mx-auto sm:mx-0" />
            <Skeleton className="h-12 w-44 rounded-full mx-auto sm:mx-0" />
          </div>
        </div>
      </section>

      {/* Featured Collection Skeleton */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <Skeleton className="h-10 w-72 mx-auto mb-4" />
          <Skeleton className="h-1 w-24 mx-auto mb-4 rounded-full" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
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
      </section>

      {/* Categories Section Skeleton */}
      <section className="py-12 bg-muted/40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-1 w-24 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
