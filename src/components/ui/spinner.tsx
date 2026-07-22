import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
} as const;

interface SpinnerProps {
  size?: keyof typeof sizeMap;
  className?: string;
}

function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <Loader2
      data-slot="spinner"
      className={cn("animate-spin text-muted-foreground", sizeMap[size], className)}
    />
  );
}

export { Spinner };
