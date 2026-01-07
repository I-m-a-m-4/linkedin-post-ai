'use client';

// src/app/privacy-policy/page.tsx
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


export default function PrivacyPolicyPage() {
    const [user, authLoading] = useAuthState(auth);
    const { credits, loading: creditsLoading } = useUserCredits(user?.uid);
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const { toast } = useToast();

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
              <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-base leading-relaxed">
                Welcome to PostAI. We are committed to protecting your privacy. This Privacy Policy explains how we
                collect, use, and share information about you when you use our service.
              </p>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold mt-6">Information We Collect</h2>
                <p className="text-base leading-relaxed">We collect information in the following ways:</p>
                <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed">
                  <li>
                    <strong>Information you provide us:</strong> This includes your Google account information (email address,
                    name, profile picture) when you sign up and log in. We also collect any feedback or reviews you submit.
                  </li>
                  <li>
                    <strong>Information we collect automatically:</strong> When you use our service, we may log usage data,
                    such as when you use the "Auto Format" feature. We do not save or store the content of the posts you
                    format.
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold mt-6">How We Use Your Information</h2>
                <p className="text-base leading-relaxed">We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed">
                  <li>Provide, maintain, and improve our service.</li>
                  <li>Manage your account and credit balance.</li>
                  <li>Communicate with you, including responding to your comments and questions.</li>
                  <li>Monitor and analyze trends, usage, and activities in connection with our service.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold mt-6">Information Sharing</h2>
                <p className="text-base leading-relaxed">
                  We do not sell your personal information. We may share information as follows:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed">
                  <li>With your consent.</li>
                  <li>For legal reasons, such as to comply with a law, regulation, or legal process.</li>
                  <li>
                    With third-party service providers who perform services on our behalf, such as payment processing (<strong>Paystack</strong>)
                    and AI model providers (<strong>Google Gemini</strong>), subject to confidentiality obligations.
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold mt-6">Data Storage and Security</h2>
                <p className="text-base leading-relaxed">
                  Your user profile, credit balance, and transaction history are stored securely in <strong>Google Firebase</strong>. We do not
                  store the text of the LinkedIn posts you format. We take reasonable measures to help protect information
                  about you from loss, theft, misuse, and unauthorized access.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold mt-6">Your Choices</h2>
                <p className="text-base leading-relaxed">
                  You have the right to access, update, or delete your personal information. You can delete your account from
                  your profile page. Please note that deleting your account will remove your authentication record and reviews, and
                  your credit balance will be reset to zero to prevent abuse of the free credit system.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold mt-6">Changes to This Policy</h2>
                <p className="text-base leading-relaxed">
                  We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the
                  date at the top of the policy and, in some cases, we may provide you with additional notice.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold mt-6">Contact Us</h2>
                <p className="text-base leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at <strong>belloimam431@gmail.com</strong>.
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
                <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.86 2.17-4.82 2.17-5.78 0-10.4-4.88-10.4-10.92S6.7 1.48 12.48 1.48c3.24 0 5.32 1.3 6.55 2.4l2.2-2.2C19.03 1.18 16.25 0 12.48 0 5.6 0 0 5.6 0 12.48s5.6 12.48 12.48 12.48c7.28 0 12.1-5.15 12.1-12.48 0-.8-.08-1.55-.2-2.32H12.48z"></path></svg>
                Continue with Google
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}