
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { SiteHeader } from '@/components/app/site-header';
import { SiteFooter } from '@/components/app/site-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Loader2, DollarSign, LocateFixed } from 'lucide-react';
import { usePaystackPayment, PaystackProps } from 'react-paystack';
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { useUserCredits } from '@/hooks/use-user-credits';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';

const creditTiers = [
    { credits: 3, priceNGN: 300, priceUSD: 2 },
    { credits: 10, priceNGN: 1000, priceUSD: 5 },
    { credits: 20, priceNGN: 1800, priceUSD: 9 },
    { credits: 50, priceNGN: 4000, priceUSD: 20 },
    { credits: 100, priceNGN: 7500, priceUSD: 35 },
];

const NairaIcon = () => (
    <span className="font-sans font-bold">&#8358;</span>
);

export default function PricingPage() {
    const [user, authLoading] = useAuthState(auth);
    const { credits, loading: creditsLoading } = useUserCredits(user?.uid);
    const [selectedTierIndex, setSelectedTierIndex] = useState(1);
    const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const selectedTier = creditTiers[selectedTierIndex];
    const amount = currency === 'NGN' ? selectedTier.priceNGN : selectedTier.priceUSD;
    const currencySymbol = currency === 'NGN' ? <NairaIcon /> : '$';

    const [config, setConfig] = useState<PaystackProps>({
        reference: (new Date()).getTime().toString(),
        email: "guest@postai.com",
        amount: amount * 100,
        publicKey: PAYSTACK_PUBLIC_KEY,
        currency: currency,
    });
    
    useEffect(() => {
        const newConfig = {
            reference: (new Date()).getTime().toString(),
            email: user?.isAnonymous ? "guest@postai.com" : (user?.email || "guest@postai.com"),
            amount: amount * 100,
            publicKey: PAYSTACK_PUBLIC_KEY,
            currency: currency,
        };
        setConfig(newConfig);
    }, [amount, currency, user]);


    const addCredits = useCallback(async () => {
        if (!user) {
            toast({ title: "You must be logged in to purchase.", variant: "destructive" });
            return;
        }
        setIsProcessing(true);
        try {
            const userMetaRef = doc(db, 'user_metadata', user.uid);
            await updateDoc(userMetaRef, {
                credits: increment(selectedTier.credits)
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
                description: "Could not add credits. Please try again or contact support.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    }, [user, selectedTier.credits, toast, router]);

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
        if (!PAYSTACK_PUBLIC_KEY) {
            toast({
                title: "Configuration Error",
                description: "Payment gateway is not configured. Please contact support.",
                variant: "destructive",
            });
            return;
        }
        if (user) {
            initializePayment({onSuccess, onClose});
        } else {
            toast({ title: "Please wait", description: "User session is loading, please try again in a moment.", variant: "default" });
        }
    };

    return (
        <div className="flex min-h-dvh w-full flex-col font-inter">
            <SiteHeader user={user} credits={credits} creditsLoading={creditsLoading || authLoading} />
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
                                    <div className="flex justify-center mb-4">
                                        <Tabs value={currency} onValueChange={(value) => setCurrency(value as 'NGN' | 'USD')}>
                                            <TabsList>
                                                <TabsTrigger value="NGN">NGN</TabsTrigger>
                                                <TabsTrigger value="USD">USD</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-5xl font-bold tracking-tighter">
                                            <span className="flex items-center justify-center gap-2">
                                                {selectedTier.credits}
                                                <Image src="/coin.png" alt="Credit Coin" width={32} height={32} />
                                            </span>
                                        </div>
                                        <p className="text-2xl font-semibold text-muted-foreground flex items-center justify-center">
                                            for {currencySymbol}{amount}
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
                                        Pay {currencySymbol}{amount} Securely
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
                                Each "Auto Format" action costs 3 credits. Credits never expire.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <SiteFooter reviewText="" setReviewText={() => {}} isSubmittingReview={false} userLoading={false} handleSubmitReview={() => {}} />
        </div>
    );
}
