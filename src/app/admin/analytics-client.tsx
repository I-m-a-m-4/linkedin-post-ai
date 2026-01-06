
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AreaChart as ReAreaChart,
  BarChart as ReBarChart,
  XAxis,
  YAxis,
  Area,
  Bar,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Users, MousePointerClick, UserCheck, MessageSquare, BatteryCharging, Trash2, Loader2, BarChart, TrendingUp, Users2, Activity, Mail } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState, useMemo } from "react";
import { collection, doc, deleteDoc, onSnapshot, Unsubscribe, query, orderBy, getDocs } from "firebase/firestore";
import { format, startOfDay, isSameDay } from "date-fns";
import { auth, db } from "@/lib/firebase"; 
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuthState } from "react-firebase-hooks/auth";


type AnalyticsEvent = {
  id: string;
  userId: string;
  eventType: string;
  timestamp: {
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
};

type Post = {
  id: string;
  userId: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
};

// Custom Tooltip for Charts
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
  const [user, loading] = useAuthState(auth);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const API_QUOTA = 1000;

  useEffect(() => {
    if (!user) return; // Wait for user to be authenticated

    const eventsRef = collection(db, 'analyticsEvents');
    const reviewsRef = collection(db, 'reviews');
    
    const unsubscribeEvents = onSnapshot(eventsRef, (snapshot) => {
        const eventsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AnalyticsEvent));
        setEvents(eventsData);
    }, (error) => {
      console.error("Error fetching analytics events:", error);
      toast({ title: "Error", description: "Could not fetch analytics data.", variant: "destructive" });
    });
    
    const reviewsQuery = query(reviewsRef, orderBy('timestamp', 'desc'));
    const unsubscribeReviews = onSnapshot(reviewsQuery, (snapshot) => {
        const reviewsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Review));
        setReviews(reviewsData);
    }, (error) => {
      console.error("Error fetching reviews:", error);
      toast({ title: "Error", description: "Could not fetch reviews.", variant: "destructive" });
    });
    
    const postsRef = collection(db, 'users');
    const unsubscribePosts = onSnapshot(postsRef, async (usersSnapshot) => {
        let allPosts: Post[] = [];
        for (const userDoc of usersSnapshot.docs) {
            const postsSnapshot = await getDocs(collection(db, 'users', userDoc.id, 'posts'));
            const userPosts = postsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, userId: userDoc.id } as Post));
            allPosts = [...allPosts, ...userPosts];
        }
        setPosts(allPosts);
    }, (error) => {
        console.error("Error fetching posts:", error);
        toast({ title: "Error", description: "Could not fetch post data.", variant: "destructive" });
    });


    return () => {
      unsubscribeEvents();
      unsubscribeReviews();
      unsubscribePosts();
    }
  }, [user, toast]);

  const analyticsData = useMemo(() => {
    const totalClicks = events.length;
    const uniqueUsersSet = new Set(events.map(e => e.userId));
    const uniqueUsers = uniqueUsersSet.size;
    const avgClicksPerUser = uniqueUsers > 0 ? (totalClicks / uniqueUsers).toFixed(1) : "0";

    const now = new Date();
    const dailyActiveUsers = new Set(events.filter(e => e.timestamp && isSameDay(new Date(e.timestamp.seconds * 1000), now)).map(e => e.userId)).size;

    const clicksByDate = events.reduce((acc, event) => {
      if (event.timestamp) {
        const date = format(new Date(event.timestamp.seconds * 1000), 'MMM d');
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    const clicksOverTime = Object.entries(clicksByDate).map(([date, count]) => ({ date, count }));

    const userFirstSeen = new Map<string, Date>();
    events.forEach(event => {
      if (event.timestamp) {
        const date = new Date(event.timestamp.seconds * 1000);
        if (!userFirstSeen.has(event.userId) || date < userFirstSeen.get(event.userId)!) {
            userFirstSeen.set(event.userId, date);
        }
      }
    });

    const newUsersByDate = Array.from(userFirstSeen.entries()).reduce((acc, [, date]) => {
        const dateKey = format(startOfDay(date), 'MMM d');
        acc[dateKey] = (acc[dateKey] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const newUsersOverTime = Object.entries(newUsersByDate).map(([date, count]) => ({ date, count }));

    const userClicks = events.reduce((acc, event) => {
        acc[event.userId] = (acc[event.userId] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topUsers = Object.entries(userClicks)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, Clicks]) => ({ name: `...@${name.slice(-4)}`, Clicks }));

    return {
        totalClicks,
        uniqueUsers,
        clicksOverTime,
        topUsers,
        totalPosts: posts.length,
        avgClicksPerUser,
        dailyActiveUsers,
        newUsersOverTime
    };
  }, [events, posts]);

  const handleDeleteReview = async (reviewId: string) => {
    setDeletingId(reviewId);
    try {
        await deleteDoc(doc(db, "reviews", reviewId));
        toast({
            title: "Review Deleted",
            description: "The review has been successfully removed.",
        });
    } catch (error: any) {
        console.error("Error deleting review: ", error);
        toast({
            title: "Error",
            description: error.message || "Could not delete the review. Please try again.",
            variant: "destructive",
        });
    } finally {
        setDeletingId(null);
    }
  };

  if (loading || !analyticsData) {
    return <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading analytics...</p>
    </div>;
  }

  const apiUsagePercentage = Math.min(((analyticsData.totalClicks || 0) / API_QUOTA) * 100, 100);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <div className="mb-2">
            <h1 className="text-3xl font-bold">PostAI Analytics</h1>
            <p className="text-muted-foreground">Visualizing user engagement data and feedback.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <Card className="col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                    <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.totalClicks}</div>
                    <p className="text-xs text-muted-foreground">"Auto Format" clicks all time</p>
                </CardContent>
            </Card>
            <Card className="col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Unique Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.uniqueUsers}</div>
                    <p className="text-xs text-muted-foreground">Number of unique users</p>
                </CardContent>
            </Card>
            <Card className="col-span-2">
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.dailyActiveUsers}</div>
                    <p className="text-xs text-muted-foreground">Users active today</p>
                </CardContent>
            </Card>
            <Card className="col-span-2">
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Posts Formatted</CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.totalPosts}</div>
                    <p className="text-xs text-muted-foreground">Total posts saved by users</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Clicks Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <ReAreaChart data={analyticsData.clicksOverTime} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="Clicks" />
                </ReAreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>New User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <ReAreaChart data={analyticsData.newUsersOverTime} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.3} name="New Users" />
                </ReAreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{reviews.length}</div>
                        <p className="text-xs text-muted-foreground">Total feedback submitted</p>
                    </CardContent>
                </Card>
                 <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Clicks / User</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.avgClicksPerUser}</div>
                        <p className="text-xs text-muted-foreground">Average user engagement</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">API Credits</CardTitle>
                        <BatteryCharging className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.totalClicks}<span className="text-sm text-muted-foreground">/{API_QUOTA}</span></div>
                         <Progress value={apiUsagePercentage} className="mt-2 h-2" />
                    </CardContent>
                </Card>
            </div>
            <Card className="lg:col-span-2">
              <CardHeader>
                  <CardTitle>Top 5 Active Users</CardTitle>
                  <CardDescription>Users with the most "Auto Format" clicks.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={120}>
                    <ReBarChart data={analyticsData.topUsers} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1}/>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={60} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'hsl(var(--muted))'}} />
                        <Bar dataKey="Clicks" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={15} />
                    </ReBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>User Reviews</CardTitle>
                <CardDescription>Latest feedback from users. You can delete reviews here.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px] -mr-4 pr-4">
                    <div className="space-y-4">
                        {reviews.length > 0 ? reviews.map((review: Review) => (
                            <div key={review.id} className="flex items-start gap-4 group">
                                <Avatar className="h-9 w-9 border">
                                    <AvatarFallback>{review.userId.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1 flex-1">
                                    <p className="text-xs font-medium leading-none text-muted-foreground">
                                        User: {review.userId.slice(0, 8)}...
                                    </p>
                                    <p className="text-sm text-foreground">{review.review}</p>
                                </div>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" disabled={deletingId === review.id}>
                                      {deletingId === review.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this review.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteReview(review.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )) : (
                           <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                             No reviews yet.
                           </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    </div>
  );
}

