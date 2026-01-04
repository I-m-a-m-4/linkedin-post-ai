'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AnalyticsClient from './analytics-client';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { format } from 'date-fns';

type AnalyticsEvent = {
  id: string;
  userId: string;
  eventType: string;
  timestamp: {
    seconds: number;
    nanoseconds: number;
  } | null;
};

type Review = {
  id: string;
  userId: string;
  review: string;
  timestamp: {
    seconds: number;
    nanoseconds: number;
  };
};

function countOccurrences(arr: (string | string[])[]) {
    const counts: { [key: string]: number } = {};
    arr.flat().forEach(item => {
        counts[item] = (counts[item] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export default function AdminPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const API_QUOTA = 1000; // Placeholder for API credit quota
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) {
      // Still waiting for auth state to resolve, do nothing.
      return;
    }

    if (!user) {
      // If loading is finished and there's no user, redirect to login.
      router.push('/login');
      return;
    }

    if (user.email !== 'bimex4@gmail.com') {
      // If a user is logged in but is not the admin, redirect to home.
      router.push('/');
      return;
    }

    // If we reach here, the user is the authorized admin.
    setIsAuthorized(true);

  }, [user, loading, router]);
  
  useEffect(() => {
    async function getAnalyticsData() {
        if (!firestore || !isAuthorized) return;
        
        // Fetch Analytics Events
        const eventsRef = collection(firestore, 'analyticsEvents');
        const eventsSnapshot = await getDocs(eventsRef);
        const events = eventsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AnalyticsEvent));
        
        // Fetch Reviews
        const reviewsRef = collection(firestore, 'reviews');
        const reviewsQuery = query(reviewsRef, orderBy('timestamp', 'desc'));
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviews = reviewsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Review));

        const totalClicks = events.length;
        const uniqueUsers = new Set(events.map(e => e.userId)).size;

        const clicksByDate: { [key: string]: number } = {};
        events.forEach(event => {
            if (event.timestamp) {
                const date = format(new Date(event.timestamp.seconds * 1000), 'MMM d');
                clicksByDate[date] = (clicksByDate[date] || 0) + 1;
            }
        });
        const clicksOverTime = Object.entries(clicksByDate).map(([date, count]) => ({ date, count }));

        const topUsers = countOccurrences(events.map(e => e.userId));
        const topUser = topUsers.sort((a,b) => b.value - a.value)[0]?.name || 'N/A';

        setAnalyticsData({
            totalClicks,
            uniqueUsers,
            clicksOverTime,
            topUser,
            reviews,
        });
    }

    if(isAuthorized && firestore) {
        getAnalyticsData();
    }
  }, [isAuthorized, firestore]);

  if (loading || !isAuthorized || !analyticsData) {
    return <div className="flex h-screen items-center justify-center">Loading admin dashboard...</div>;
  }

  return (
    <div className='p-4 md:p-6 lg:p-8'>
        <div className="mb-8">
            <h1 className="text-3xl font-bold">PostAI Analytics</h1>
            <p className="text-muted-foreground">Visualizing user engagement data and feedback.</p>
        </div>
        <AnalyticsClient
            totalClicks={analyticsData.totalClicks}
            uniqueUsers={analyticsData.uniqueUsers}
            clicksOverTime={analyticsData.clicksOverTime}
            topUser={analyticsData.topUser}
            reviews={analyticsData.reviews}
            apiQuota={API_QUOTA}
        />
    </div>
  );
}
