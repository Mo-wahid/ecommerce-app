import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <Skeleton className="h-10 w-10 rounded-md" />
      <Skeleton className="h-4 w-40 flex-1" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded" />
      <Skeleton className="h-8 w-8 rounded" />
    </div>
  );
}

export default function AdminCategoriesLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Skeleton className="h-9 w-44 mb-2" />
          <Skeleton className="h-5 w-60" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-muted/50">
            <Skeleton className="h-4 w-10 rounded-md" />
            <Skeleton className="h-4 w-24 flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Table Rows */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i}>
              <SkeletonTableRow />
              {i < 9 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
