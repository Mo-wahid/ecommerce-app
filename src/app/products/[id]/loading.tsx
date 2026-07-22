import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function ProductDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto pt-24 pb-16 px-4 sm:px-6 lg:px-8 w-full">
      {/* Back link skeleton */}
      <Skeleton className="h-5 w-36 mb-6" />

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors w-full">
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left: Image placeholder */}
          <Skeleton className="h-96 md:h-[500px] w-full rounded-none" />

          {/* Right: Product details */}
          <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
            {/* Category */}
            <Skeleton className="h-4 w-24" />
            
            {/* Product name */}
            <Skeleton className="h-9 w-[80%]" />
            
            {/* Price */}
            <Skeleton className="h-8 w-28" />
            
            {/* Description lines */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[70%]" />
            </div>

            <Separator className="my-8" />

            {/* Add to cart area */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-10 w-32 rounded-lg" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
