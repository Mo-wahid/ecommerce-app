import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function Loading({ message = "Loading...", fullScreen = false, className = "" }: LoadingProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center space-y-4 p-8 ${className}`}>
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      {message && <p className="text-muted-foreground font-medium animate-pulse">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        {content}
      </div>
    );
  }

  return content;
}
