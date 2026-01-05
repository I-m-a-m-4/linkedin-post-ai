
'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AnalyticsClient from './analytics-client';
import { Auth, Firestore } from 'firebase/auth';
import { LoaderCircle } from 'lucide-react';

interface AdminPageProps {
  auth: Auth | null;
  firestore: Firestore | null;
}

export default function AdminPage({ auth, firestore }: AdminPageProps) {
  const { user, loading } = useUser(auth);
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading || !auth) {
      return; 
    }

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.email === 'belloimam431@gmail.com') {
      setIsAuthorized(true);
    } else {
      router.push('/');
    }
  }, [user, loading, router, auth]);

  if (loading || !isAuthorized || !firestore || !auth) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <LoaderCircle className="size-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading Admin Dashboard...</p>
            </div>
        </div>
    );
  }

  return <AnalyticsClient firestore={firestore} />;
}
