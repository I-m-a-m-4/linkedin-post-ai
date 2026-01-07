
// src/app/pricing/page.tsx
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { SiteHeader } from '@/components/app/site-header';
import { SiteFooter } from '@/components/app/site-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Loader2, Gem } from 'lucide-react';
import { usePaystackPayment, PaystackProps } from 'react-paystack';
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, increment, setDoc, serverTimestamp, collection, addDoc, getDoc, writeBatch } from 'firebase/firestore';
import { useUserCredits } from '@/hooks/use-user-credits';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';

const creditTiers = [
    { credits: 1, price: 100 },
    { credits: 10, price: 1000 },
    { credits: 25, price: 2250 },
    { credits: 50, price: 4000 },
    { credits: 100, price: 7500 },
    { credits: 200, price: 14000 },
];

const NairaIcon = () => (
    <span className="font-sans font-bold">&#8358;</span>
);

export default function PricingPage() {
    const [user, authLoading] = useAuthState(auth);
    const { credits, loading: creditsLoading } = useUserCredits(user?.uid);
    const [selectedTierIndex, setSelectedTierIndex] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    const selectedTier = creditTiers[selectedTierIndex];
    const amount = selectedTier.price;

    const [config, setConfig] = useState<PaystackProps>({
        reference: (new Date()).getTime().toString(),
        email: "guest@postai.com",
        amount: amount * 100,
        publicKey: PAYSTACK_PUBLIC_KEY,
        currency: 'NGN',
    });
    
    useEffect(() => {
        if (user) {
            const newConfig = {
                reference: (new Date()).getTime().toString(),
                email: user.email || "guest@postai.com",
                amount: amount * 100,
                publicKey: PAYSTACK_PUBLIC_KEY,
                currency: 'NGN',
            };
            setConfig(newConfig);
        }
    }, [amount, user]);


    const addCredits = useCallback(async () => {
        if (!user) {
            toast({ title: "You must be logged in to purchase.", variant: "destructive" });
            return;
        }
        setIsProcessing(true);
        try {
            const userMetaRef = doc(db, 'user_metadata', user.uid);
            const usageHistoryRef = collection(db, 'user_metadata', user.uid, 'usage_history');
            
            const batch = writeBatch(db);
            
            batch.update(userMetaRef, { credits: increment(selectedTier.credits) });
            
            const usageDoc = doc(usageHistoryRef);
            batch.set(usageDoc, {
              action: 'purchase',
              timestamp: new Date(),
              creditsSpent: -selectedTier.credits, // Negative for credit gain
            });

            await batch.commit();

            await addDoc(collection(db, 'purchases'), {
                userId: user.uid,
                credits: selectedTier.credits,
                amount: selectedTier.price,
                currency: 'NGN',
                timestamp: serverTimestamp()
            });

            toast({
                title: "Purchase Successful!",
                description: `${selectedTier.credits} credits have been added to your account.`,
                variant: "success",
            });
            router.push('/');
        } catch (error) {
            console.error("Error adding credits:", error);
            toast({
                title: "Error",
                description: "Could not add credits. Please contact support.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    }, [user, selectedTier, toast, router]);

    const onSuccess = useCallback(() => {
        addCredits();
    }, [addCredits]);

    const onClose = () => {
        // console.log('Paystack dialog closed');
    };

    const initializePayment = usePaystackPayment(config);

    const benefits = [
        "AI-Powered Post Formatting",
        "Readability & Tone Analysis",
        "Smart List & Emoji Suggestions",
        "Save & Manage Formatted Posts",
        "Priority Support",
    ];
    
    const handlePurchase = () => {
        if (!user) {
            setShowLoginDialog(true);
            return;
        }
        if (!PAYSTACK_PUBLIC_KEY) {
            toast({
                title: "Configuration Error",
                description: "Payment gateway is not configured. Please contact support.",
                variant: "destructive",
            });
            return;
        }
        initializePayment({onSuccess, onClose});
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
          const result = await signInWithPopup(auth, provider);
          const user = result.user;
          
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              createdAt: serverTimestamp(),
            });
          }
    
          setShowLoginDialog(false);
          toast({
            title: 'Login Successful',
            description: 'You can now complete your purchase.',
            variant: 'success'
          });
        } catch (error) {
          console.error("Google sign-in error:", error);
          toast({
            title: 'Login Failed',
            description: 'Could not sign in with Google. Please try again.',
            variant: 'destructive'
          });
        }
      };

    return (
        <div className="flex min-h-dvh w-full flex-col font-inter">
            <SiteHeader user={user} onLogin={() => setShowLoginDialog(true)} credits={credits} creditsLoading={creditsLoading || authLoading} userLoading={authLoading} />
            <main className="flex-1">
                <div className="container mx-auto max-w-4xl py-16 px-4">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Flexible Pricing for Every Creator</h1>
                        <p className="mt-4 text-lg text-muted-foreground">Choose the right amount of credits to supercharge your content creation. Pay as you go.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <Card className="bg-card/80 backdrop-blur-sm shadow-xl">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-2xl">Buy Credits</CardTitle>
                                    <Badge variant="outline" className="text-base">Pay As You Go</Badge>
                                </div>
                                <CardDescription>Select how many credits you need. More credits, bigger discount!</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <div className="text-5xl font-bold tracking-tighter">
                                            <span className="flex items-center justify-center gap-2">
                                                {selectedTier.credits}
                                                <Gem className="h-8 w-8 text-primary" />
                                            </span>
                                        </div>
                                        <p className="text-2xl font-semibold text-muted-foreground flex items-center justify-center">
                                            for <NairaIcon />{amount.toLocaleString()}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <Slider
                                            value={[selectedTierIndex]}
                                            onValueChange={(value) => setSelectedTierIndex(value[0])}
                                            max={creditTiers.length - 1}
                                            step={1}
                                            className="my-6"
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>{creditTiers[0].credits} credits</span>
                                            <span>{creditTiers[creditTiers.length - 1].credits} credits</span>
                                        </div>
                                    </div>
                                    
                                    <Button
                                        className="w-full h-12 text-lg"
                                        onClick={handlePurchase}
                                        disabled={isProcessing || authLoading}
                                    >
                                        {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5" />}
                                        Pay <NairaIcon />{amount.toLocaleString()} Securely
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold">What you get with credits:</h3>
                            <ul className="space-y-3">
                                {benefits.map((benefit, index) => (
                                    <li key={index} className="flex items-center gap-3">
                                        <Check className="h-5 w-5 text-green-500" />
                                        <span className="text-muted-foreground">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-sm text-muted-foreground pt-4 border-t">
                                Each "Auto Format" action costs 1 credit. Credits never expire.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <SiteFooter reviewText="" setReviewText={() => {}} isSubmittingReview={false} userLoading={false} handleSubmitReview={() => {}} />

            <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign up or Continue</AlertDialogTitle>
                  <AlertDialogDescription>
                    To buy credits, please sign in or create an account with Google.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleGoogleSignIn}>
                    <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.86 2.17-4.82 2.17-5.78 0-10.4-4.88-10.4-10.92S6.7 1.48 12.48 1.48c3.24 0 5.32 1.3 6.55 2.4l2.2-2.2C19.03 1.18 16.25 0 12.48 0 5.6 0 0 5.6 0 12.48s5.6 12.48 12.48 12.48c7.28 0 12.1-5.15 12.1-12.48 0-.8-.08-1.55-.2-2.32H12.48z"></path></svg>
                    Continue with Google
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
