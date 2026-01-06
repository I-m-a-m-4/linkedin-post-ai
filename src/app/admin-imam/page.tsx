
'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AnalyticsClient from './analytics-client';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '@/firebase';


export default function AdminPage() {
  const auth = useAuth();
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

  if (loading || !isAuthorized || !auth) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <LoaderCircle className="size-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading Admin Dashboard...</p>
            </div>
        </div>
    );
  }

  return <AnalyticsClient />;
}
