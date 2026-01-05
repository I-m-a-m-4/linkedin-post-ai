
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AnalyticsClient from './analytics-client';
import { firestore } from '@/firebase';

export default function AdminPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Wait until the authentication state is fully determined.
    if (loading) {
      return; // Do nothing while loading.
    }

    // If loading is done and there is no user, they must log in.
    if (!user) {
      router.push('/login');
      return;
    }

    // If a user is logged in, check if they are the admin.
    if (user.email === 'belloimam431@gmail.com') {
      setIsAuthorized(true);
    } else {
      // If not the admin, they have no access here. Redirect to home.
      router.push('/');
    }
  }, [user, loading, router]);

  // Render a loading state until authorization is confirmed.
  // This prevents any flash of content before redirects can happen.
  if (loading || !isAuthorized) {
    return <div className="flex h-screen items-center justify-center">Loading admin dashboard...</div>;
  }

  // Only render the dashboard if the user is authorized.
  return <AnalyticsClient firestore={firestore} />;
}
