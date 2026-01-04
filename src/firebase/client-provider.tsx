'use client';
import { ReactNode, useEffect } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { FirebaseProvider } from './provider';
import { useUser } from './auth/use-user';
import { initializeFirebase } from './index';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

// Initialize Firebase on the client
const { app, auth, firestore } = initializeFirebase();

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // We use a "provider" pattern to get the user, so we can use the hook
  return (
    <FirebaseProvider app={app} auth={auth} firestore={firestore}>
      <AuthHandler>{children}</AuthHandler>
    </FirebaseProvider>
  );
}

function AuthHandler({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();

  useEffect(() => {
    const handleAnonymousSignIn = async () => {
      if (!loading && !user) {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error('Anonymous sign-in failed:', error);
        }
      }
    };
    handleAnonymousSignIn();
  }, [user, loading]);

  return <>{children}</>;
}
