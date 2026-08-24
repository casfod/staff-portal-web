// NetworkErrorUI.tsx - Rewritten with Radix UI
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { WifiOff } from 'lucide-react';

interface NetworkErrorUIProps {
  error?: any;
}

const NetworkErrorUI = ({ error }: NetworkErrorUIProps) => {
  console.log(error);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 backdrop-blur-sm">
      <AlertDialog open={true}>
        <AlertDialogContent className="max-w-md text-center">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-red-50">
                <WifiOff className="h-12 w-12 text-red-500" />
              </div>
            </div>
            <AlertDialogTitle className="text-2xl text-red-600">Network Error</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Please check your internet connection and try again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center sm:justify-center">
            <AlertDialogAction asChild>
              <Button onClick={() => window.location.reload()} className="min-w-[120px]">
                Retry
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NetworkErrorUI;
