import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DemoModeBanner() {
  return (
    <Alert className="mb-4 border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800 dark:text-yellow-200">
        <strong>Demo Mode:</strong> Firebase configuration is incomplete. 
        The app is running in demo mode with simulated authentication and features.
      </AlertDescription>
    </Alert>
  );
}