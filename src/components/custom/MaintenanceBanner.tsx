// MaintenanceBanner.tsx - Rewritten with Radix UI
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface MaintenanceBannerProps {
  title?: string;
  message?: string;
  expectedCompletion?: string;
}

export function MaintenanceBanner({
  title = 'Page Under Maintenance',
  message = "We're currently working on improving this page. Please check back later.",
  expectedCompletion = 'Estimated completion: Soon',
}: MaintenanceBannerProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-yellow-50">
              <AlertTriangle className="w-12 h-12 text-yellow-500" />
            </div>
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-base mt-2">{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{expectedCompletion}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => window.location.reload()}>Check Again</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
