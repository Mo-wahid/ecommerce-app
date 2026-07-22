import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-40 flex-1" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-7 w-20 rounded-full" />
      <Skeleton className="h-8 w-16 rounded-lg" />
    </div>
  );
}

export default function AdminUsersLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Skeleton className="h-9 w-40 mb-2" />
        <Skeleton className="h-5 w-56" />
      </div>

      {/* Search */}
      <Skeleton className="h-10 w-full sm:w-72" />

      {/* Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-muted/50">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24 flex-1" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-14" />
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
