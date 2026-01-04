'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Chrome } from 'lucide-react';
import { useEffect } from 'react';
import { useUser } from '@/firebase';

export default function LoginPage() {
  const auth = useAuth();
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Redirect if user is already logged in
    if (!loading && user) {
      router.push('/admin-imam');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // On successful sign-in, the useEffect will trigger the redirect.
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  if (loading || user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Admin Access</CardTitle>
          <CardDescription>Sign in to view the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGoogleSignIn} className="w-full">
            <Chrome className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
