// src/app/admin/analytics-client.tsx
'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  BarChart as ReBarChart,
  XAxis,
  YAxis,
  Bar,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  MousePointerClick,
  Activity,
  Mail,
  ExternalLink,
  Trash2,
  Loader2,
  Gift,
  Search,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState, useMemo } from 'react';
import {
  collection,
  doc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
  query,
  orderBy,
  getDoc,
  collectionGroup,
  updateDoc,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { format } from 'date-fns';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
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
import { useAuthState } from 'react-firebase-hooks/auth';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type AnalyticsEvent = {
  id: string;
  userId: string;
  eventType: string;
  timestamp: {
    seconds: number;
    nanoseconds: number;
  };
};

type UserProfile = {
  id: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
};

type Review = {
  id: string;
  userId: string;
  review: string;
  timestamp: {
    seconds: number;
    nanoseconds: number;
  };
  userProfile?: UserProfile;
};

type Post = {
  id: string;
  userId: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
};

type Purchase = {
    id: string;
    userId: string;
    credits: number;
    amount: number;
    timestamp: {
        seconds: number;
        nanoseconds: number;
    };
    userProfile?: UserProfile;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/80 backdrop-blur-sm p-3 border rounded-lg shadow-lg">
        <p className="text-sm font-bold mb-1">{label}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: pld.fill }}>
            {`${pld.name}: ${pld.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsClient() {
  const [user] = useAuthState(auth);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [grantingId, setGrantingId] = useState<string | null>(null);
  const [creditAmounts, setCreditAmounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;

    const unsubscribes: Unsubscribe[] = [];
    const userProfiles: { [key: string]: UserProfile } = {};

    const fetchUserProfiles = async (userIds: string[]) => {
        const newProfiles: { [key: string]: UserProfile } = {};
        const idsToFetch = userIds.filter(id => !userProfiles[id]);
        if (idsToFetch.length === 0) return newProfiles;

        await Promise.all(
            idsToFetch.map(async (id) => {
                const userDocRef = doc(db, 'users', id);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    newProfiles[id] = { id: userDocSnap.id, ...userDocSnap.data() } as UserProfile;
                }
            })
        );
        Object.assign(userProfiles, newProfiles);
        return newProfiles;
    };

    const usersRef = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    unsubscribes.push(onSnapshot(usersRef, (snapshot) => {
      const usersData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as UserProfile)
      );
      setUsers(usersData);
      usersData.forEach(u => userProfiles[u.id] = u);
      setLoading(false);
    }, (error) => console.error("Error fetching users:", error)));

    const eventsRef = collection(db, 'analyticsEvents');
    unsubscribes.push(onSnapshot(eventsRef, (snapshot) => {
      const eventsData = snapshot.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id } as AnalyticsEvent)
      );
      setEvents(eventsData);
    }, (error) => console.error("Error fetching events:", error)));

    const reviewsRef = query(collection(db, 'reviews'), orderBy('timestamp', 'desc'));
    unsubscribes.push(onSnapshot(reviewsRef, async (snapshot) => {
      const reviewsData = snapshot.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id } as Review)
      );
      await fetchUserProfiles(reviewsData.map(r => r.userId));
      const reviewsWithUsers = reviewsData.map(review => ({...review, userProfile: userProfiles[review.userId]}));
      setReviews(reviewsWithUsers);
    }, (error) => console.error("Error fetching reviews:", error)));
    
    const postsQuery = query(collectionGroup(db, 'posts'));
    unsubscribes.push(onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id } as Post)
      );
      setPosts(postsData);
    }, (error) => console.error("Error fetching posts:", error)));

    const purchasesRef = query(collection(db, 'purchases'), orderBy('timestamp', 'desc'));
    unsubscribes.push(onSnapshot(purchasesRef, async (snapshot) => {
        const purchasesData = snapshot.docs.map(
            (doc) => ({ ...doc.data(), id: doc.id } as Purchase)
        );
        await fetchUserProfiles(purchasesData.map(p => p.userId));
        const purchasesWithUsers = purchasesData.map(purchase => ({...purchase, userProfile: userProfiles[purchase.userId]}));
        setPurchases(purchasesWithUsers);
    }, (error) => console.error("Error fetching purchases:", error)));


    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [user]);

  const analyticsData = useMemo(() => {
    const totalUsers = users.length;
    const totalClicks = events.filter(e => e.eventType === 'autoFormatClick').length;

    const dailyActiveUsers = new Set(
      events
        .filter(
          (e) =>
            e.timestamp &&
            new Date(e.timestamp.seconds * 1000).toDateString() === new Date().toDateString()
        )
        .map((e) => e.userId)
    ).size;
    
    const usersByDate = users.reduce((acc, user) => {
        if (user.createdAt && user.createdAt.seconds) {
          const date = format(new Date(user.createdAt.seconds * 1000), 'MMM d');
          acc[date] = (acc[date] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
    const newUserGrowth = Object.entries(usersByDate).map(([date, count]) => ({ date, 'New Users': count }));

    return {
      totalUsers,
      totalClicks,
      totalPosts: posts.length,
      dailyActiveUsers,
      newUserGrowth,
      totalReviews: reviews.length,
    };
  }, [events, posts, users, reviews]);

  const handleDeleteReview = async (reviewId: string) => {
    setDeletingId(reviewId);
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      toast({
        title: 'Review Deleted',
        description: 'The review has been successfully removed.',
        variant: 'success',
      });
    } catch (error: any) {
      console.error('Error deleting review: ', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not delete the review.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleGrantCredits = async (userIdToGrant: string, amount: number) => {
    if (!amount || amount <= 0) {
        toast({
            title: 'Invalid Amount',
            description: 'Please enter a positive number of credits to grant.',
            variant: 'destructive',
        });
        return;
    }
    setGrantingId(userIdToGrant);
    try {
      const userMetaRef = doc(db, 'user_metadata', userIdToGrant);
      const usageHistoryRef = collection(db, 'user_metadata', userIdToGrant, 'usage_history');
      
      const batch = writeBatch(db);
      
      batch.update(userMetaRef, { credits: increment(amount) });
      
      const usageDoc = doc(usageHistoryRef);
      batch.set(usageDoc, {
        action: 'adminGrant',
        timestamp: new Date(),
        creditsSpent: -amount, // Negative because it's a credit gain
      });

      await batch.commit();
      
      toast({
        title: 'Credits Granted',
        description: `${amount} credits have been added to the user account.`,
        variant: 'success'
      });
      setCreditAmounts(prev => ({...prev, [userIdToGrant]: 0}));
    } catch (error: any) {
        console.error('Error granting credits: ', error);
        toast({
            title: 'Error',
            description: error.message || 'Could not grant credits. The user may not have a credits document yet.',
            variant: 'destructive',
        });
    } finally {
        setGrantingId(null);
    }
  }

  const handleCreditAmountChange = (userId: string, value: string) => {
    const amount = parseInt(value, 10);
    setCreditAmounts(prev => ({
        ...prev,
        [userId]: isNaN(amount) ? 0 : amount
    }));
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [users, searchTerm]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading analytics...</p>
      </div>
    );
  }

  const geminiConsoleUrl = `https://aistudio.google.com/app/u/0/usage?timeRange=last-hour&project=format-iq`;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="mb-2">
        <h1 className="text-3xl font-bold">PostAI Analytics</h1>
        <p className="text-muted-foreground">
          Visualizing user engagement data and feedback.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.totalClicks}
            </div>
            <p className="text-xs text-muted-foreground">
              "Auto Format" clicks all time
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Number of registered users
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Daily Active Users
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.dailyActiveUsers}
            </div>
            <p className="text-xs text-muted-foreground">Users active today</p>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Posts Formatted
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              Total posts saved by users
            </p>
          </CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card>
          <CardHeader>
            <CardTitle>New User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <ReBarChart data={analyticsData.newUserGrowth}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="New Users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Purchase History</CardTitle>
            <CardDescription>A log of all successful credit purchases.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px] -mr-4 pr-4">
              {purchases.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">Credits</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map(purchase => (
                      <TableRow key={purchase.id}>
                        <TableCell>
                           <div className="flex items-center gap-2">
                             <Avatar className="h-8 w-8 border">
                                <AvatarImage src={purchase.userProfile?.photoURL} alt={purchase.userProfile?.displayName} />
                                <AvatarFallback>{purchase.userProfile?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                             </Avatar>
                             <span className="font-medium truncate">{purchase.userProfile?.displayName || `User ${purchase.userId.slice(0, 6)}`}</span>
                           </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-500">+{purchase.credits}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {format(new Date(purchase.timestamp.seconds * 1000), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No purchases yet.</div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Grant credits to users.</CardDescription>
                <div className="relative pt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <Input
                        placeholder="Search by email..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent>
                 <ScrollArea className="h-[250px] -mr-4 pr-4">
                    <div className="space-y-4">
                        {filteredUsers.map(u => (
                            <div key={u.id} className="flex items-center gap-2">
                               <Avatar className="h-8 w-8 border mr-1">
                                  <AvatarImage src={u.photoURL} alt={u.displayName} />
                                  <AvatarFallback>{u.displayName?.charAt(0) || 'U'}</AvatarFallback>
                               </Avatar>
                               <div className="flex-1 overflow-hidden">
                                  <p className="font-semibold truncate text-sm">{u.displayName}</p>
                                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                               </div>
                               <Input
                                  type="number"
                                  placeholder="Amt"
                                  className="w-16 h-8"
                                  value={creditAmounts[u.id] || ''}
                                  onChange={(e) => handleCreditAmountChange(u.id, e.target.value)}
                                  min="0"
                                />
                               <Button size="sm" variant="outline" onClick={() => handleGrantCredits(u.id, creditAmounts[u.id] || 0)} disabled={grantingId === u.id}>
                                   {grantingId === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
                               </Button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>User Reviews</CardTitle>
            <CardDescription>
              Latest feedback from users. You can delete reviews here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[330px] -mr-4 pr-4">
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review: Review) => (
                    <div
                      key={review.id}
                      className="flex items-start gap-4 group"
                    >
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage
                          src={review.userProfile?.photoURL}
                          alt={review.userProfile?.displayName}
                        />
                        <AvatarFallback>
                          {review.userProfile?.displayName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1 flex-1">
                        <p className="text-sm font-medium leading-none">
                          {review.userProfile?.displayName ||
                            `User ${review.userId.slice(0, 6)}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {review.review}
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={deletingId === review.id}
                          >
                            {deletingId === review.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete this review.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteReview(review.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    No reviews yet.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <a
        href={geminiConsoleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:scale-[1.01] transition-transform"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Monitor API Usage</CardTitle>
              <CardDescription>
                Check your Gemini API limits and billing status in AI Studio.
              </CardDescription>
            </div>
            <ExternalLink className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
        </Card>
      </a>
    </div>
  );
}
