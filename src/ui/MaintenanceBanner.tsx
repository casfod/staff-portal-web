import { AlertTriangle } from "lucide-react";
import Button from "./Button";

interface MaintenanceBannerProps {
  title?: string;
  message?: string;
  expectedCompletion?: string;
}

export function MaintenanceBanner({
  title = "Page Under Maintenance",
  message = "We're currently working on improving this page. Please check back later.",
  expectedCompletion = "Estimated completion: Soon",
}: MaintenanceBannerProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="flex justify-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">{message}</p>
        <p className="text-sm text-muted-foreground">{expectedCompletion}</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Check Again
        </Button>
      </div>
    </div>
  );
}
