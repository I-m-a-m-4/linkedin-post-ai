
'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Zap, Gem } from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

export function PurchaseCreditsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void; }) {
  const router = useRouter();

  const handleGoToPricing = () => {
    router.push('/pricing');
    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto mb-4">
              <Gem className="h-6 w-6 text-primary" />
          </div>
          <AlertDialogTitle className="text-center text-xl">You're Out of Credits!</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            You've used all your free formatting credits. Purchase more to continue creating amazing content.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4">
            <Button 
              className="w-full h-12 text-lg" 
              onClick={handleGoToPricing}
            >
              <Zap className="mr-2 h-5 w-5" />
              View Pricing
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">You'll be redirected to our secure pricing page.</p>
        </div>
        <AlertDialogFooter className='sm:justify-center flex-col-reverse sm:flex-col-reverse gap-2'>
           <Button variant="ghost" onClick={() => onOpenChange(false)}>Maybe Later</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
