"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Section Error:", error);
  }, [error]);

  return (
    <div className="p-8 flex flex-col items-center justify-center text-center min-h-[50vh]">
      <div className="w-14 h-14 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2">Admin Dashboard Error</h2>
      <p className="text-muted-foreground max-w-sm mb-6 text-sm">
        Failed to load administrative data. You can attempt to reload the dashboard section.
      </p>
      <Button onClick={() => reset()} variant="default" className="gap-2">
        <RefreshCw className="w-4 h-4" /> Retry Loading
      </Button>
    </div>
  );
}
