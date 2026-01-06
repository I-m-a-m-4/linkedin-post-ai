
'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Gem, Zap, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { usePaystackPayment } from 'react-paystack';

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_a715e7512224a78160a37c863e49e91775815617';

export function PurchaseCreditsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void; onPurchase?: () => void }) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const user = auth.currentUser;

  const config = {
      reference: (new Date()).getTime().toString(),
      email: user?.isAnonymous ? "guest@postai.com" : (user?.email || "guest@postai.com"),
      amount: 10000, // Amount in kobo (e.g., 10000 kobo = 100 NGN)
      publicKey: PAYSTACK_PUBLIC_KEY,
  };

  const addCredits = async () => {
      if (!user) {
          toast({ title: "You must be logged in to purchase.", variant: "destructive" });
          return;
      }
      setIsProcessing(true);
      try {
          const userMetaRef = doc(db, 'user_metadata', user.uid);
          await updateDoc(userMetaRef, {
              credits: increment(3)
          });
          toast({
              title: "Purchase Successful!",
              description: "3 credits have been added to your account.",
              variant: "success",
          });
          onOpenChange(false);
      } catch (error) {
          console.error("Error adding credits:", error);
          toast({
              title: "Error",
              description: "Could not add credits. Please try again or contact support.",
              variant: "destructive",
          });
      } finally {
        setIsProcessing(false);
      }
  };

  const onSuccess = (reference: any) => {
    console.log("Paystack success reference:", reference);
    addCredits();
  };

  const onClose = () => {
    console.log('Paystack dialog closed');
  };

  const initializePayment = usePaystackPayment(config);

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
              onClick={() => {
                if (user) {
                  initializePayment({onSuccess, onClose});
                } else {
                  toast({ title: "Please wait", description: "User session is loading, please try again in a moment.", variant: "default" });
                }
              }}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5" />}
              Buy 3 Credits (₦100)
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">You'll be prompted to complete your payment securely via Paystack.</p>
        </div>
        <AlertDialogFooter className='sm:justify-center flex-col-reverse sm:flex-col-reverse gap-2'>
           <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
