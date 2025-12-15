import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorCardProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetryButton?: boolean;
}

export function ErrorCard({
  title = "Something went wrong",
  message,
  onRetry,
  showRetryButton = true,
}: ErrorCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-muted to-background px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-red-200 dark:border-red-900">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-foreground text-center mb-3">
            {title}
          </h2>

          {/* Message */}
          <p className="text-sm text-muted-foreground text-center mb-6">
            {message}
          </p>

          {/* Retry Button */}
          {showRetryButton && onRetry && (
            <Button
              onClick={onRetry}
              className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}

          {/* Help Text */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            If this problem persists, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
