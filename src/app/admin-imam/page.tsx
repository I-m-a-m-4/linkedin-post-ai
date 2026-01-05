
'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AnalyticsClient from './analytics-client';
import { Auth, Firestore } from 'firebase/auth';

interface AdminPageProps {
  auth: Auth | null;
  firestore: Firestore | null;
}

export default function AdminPage({ auth, firestore }: AdminPageProps) {
  const { user, loading } = useUser(auth);
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) {
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
  }, [user, loading, router]);

  if (loading || !isAuthorized || !firestore) {
    return <div className="flex h-screen items-center justify-center">Loading admin dashboard...</div>;
  }

  return <AnalyticsClient firestore={firestore} />;
}
