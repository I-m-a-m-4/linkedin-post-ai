'use client';

// src/app/terms-and-conditions/page.tsx
import { SiteHeader } from '@/components/app/site-header';
import { SiteFooter } from '@/components/app/site-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { useUserCredits } from '@/hooks/use-user-credits';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import Image from 'next/image';

export default function TermsAndConditionsPage() {
    const [user, authLoading] = useAuthState(auth);
    const { credits, loading: creditsLoading } = useUserCredits(user?.uid);
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const { toast } = useToast();

    const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });

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
        description: 'You are now logged in.',
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
      <main className="flex-1 bg-muted/20 py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Terms and Conditions</CardTitle>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-base leading-relaxed">
                Please read these Terms and Conditions ("Terms") carefully before using the PostAI service (the "Service")
                operated by Imam Bello ("us", "we", or "our").
              </p>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold mt-6">1. Acceptance of Terms</h2>
                <p className="text-base leading-relaxed">
                  By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of
                  the terms, then you may not access the Service.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold mt-6">2. Description of Service</h2>
                <p className="text-base leading-relaxed">
                  PostAI is an AI-powered tool designed to format text for social media platforms like LinkedIn. The Service
                  uses credits for certain features, such as "Auto Format".
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold mt-6">3. User Accounts</h2>
                <p className="text-base leading-relaxed">
                  To access most features of the Service, you must register for an account using Google Authentication. You
                  are responsible for safeguarding your account and for any activities or actions under your account.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold mt-6">4. Credits and Payments</h2>
                <p className="text-base leading-relaxed">
                  The Service operates on a credit system. You may receive free credits upon signup and may be granted
                  additional free credits under certain conditions (e.g., monthly grants). Additional credits can be
                  purchased through our third-party payment processor, Paystack. All purchases are final and
                  non-refundable. Credits are non-transferable and have no cash value.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold mt-6">5. User Conduct</h2>
                <p className="text-base leading-relaxed">You agree not to use the Service to:</p>
                <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed">
                  <li>Submit any content that is unlawful, harmful, threatening, or otherwise objectionable.</li>
                  <li>Impersonate any person or entity.</li>
                  <li>Attempt to gain unauthorized access to the Service or its related systems.</li>
                  <li>Abuse the free credit system by repeatedly creating and deleting accounts.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold mt-6">6. Privacy</h2>
                <p className="text-base leading-relaxed">
                  Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal
                  information. By using our Service, you agree to the collection and use of information in accordance with our
                  Privacy Policy. We do not store, save, or claim any ownership over the content you format using our Service.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold mt-6">7. Termination</h2>
                <p className="text-base leading-relaxed">
                  We may terminate or suspend your access to our Service immediately, without prior notice or liability, for
                  any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right
                  to use the Service will immediately cease. If you wish to terminate your account, you may do so from your
                  profile page.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold mt-6">8. Disclaimer of Warranties</h2>
                <p className="text-base leading-relaxed">
                  The Service is provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis. We make no warranties, express or
                  implied, that the Service will be uninterrupted, timely, secure, or error-free.
                </p>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mt-6">9. Limitation of Liability</h2>
                <p className="text-base leading-relaxed">
                  In no event shall Imam Bello be liable for any indirect, incidental, special, consequential or punitive
                  damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses,
                  resulting from your access to or use of or inability to access or use the Service.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold mt-6">10. Governing Law</h2>
                <p className="text-base leading-relaxed">
                  These Terms shall be governed and construed in accordance with the laws of <strong>Nigeria</strong>, without regard to its
                  conflict of law provisions.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold mt-6">11. Changes to Terms</h2> 
                <p className="text-base leading-relaxed">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide
                  notice of any changes by posting the new Terms on this page.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold mt-6">Contact Us</h2>
                <p className="text-base leading-relaxed">
                  If you have any questions about these Terms, please contact us at <strong>belloimam431@gmail.com</strong>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter reviewText="" setReviewText={() => {}} isSubmittingReview={false} userLoading={false} handleSubmitReview={() => {}} />

       <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Please Log In</AlertDialogTitle>
              <AlertDialogDescription>
                To continue, please sign in with your Google account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleGoogleSignIn}>
                              <Image src="/google.png" alt="Google" width={16} height={16} className="mr-2" />

                Continue with Google
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}