'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AreaChart as ReAreaChart,
  XAxis,
  YAxis,
  Area,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Users, MousePointerClick, UserCheck, MessageSquare, BatteryCharging, Trash2, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, orderBy, query, doc, deleteDoc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { format } from "date-fns";
import { db } from "@/lib/firebase"; 
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

export default function AnalyticsClient() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const API_QUOTA = 1000;

  useEffect(() => {
    let unsubscribeEvents: Unsubscribe | undefined;
    let unsubscribeReviews: Unsubscribe | undefined;

    async function getAnalyticsData() {
        const eventsRef = collection(db, 'analyticsEvents');
        unsubscribeEvents = onSnapshot(eventsRef, (snapshot) => {
            const events = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AnalyticsEvent));
            
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
            
            setAnalyticsData((prevData: any) => ({
                ...prevData,
                totalClicks,
                uniqueUsers,
                clicksOverTime,
                topUser,
            }));
        });
    }
    
    function getReviewsData() {
        const reviewsRef = collection(db, 'reviews');
        const reviewsQuery = query(reviewsRef, orderBy('timestamp', 'desc'));
        unsubscribeReviews = onSnapshot(reviewsQuery, (snapshot) => {
            const reviewsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Review));
            setReviews(reviewsData);
        });
    }

    getAnalyticsData();
    getReviewsData();

    return () => {
      if (unsubscribeEvents) unsubscribeEvents();
      if (unsubscribeReviews) unsubscribeReviews();
    }
  }, []);

  const handleDeleteReview = useCallback(async (reviewId: string) => {
    setDeletingId(reviewId);
    try {
        await deleteDoc(doc(db, "reviews", reviewId));
        toast({
            title: "Review Deleted",
            description: "The review has been successfully removed.",
            variant: "success",
        });
    } catch (error: any) {
        console.error("Error deleting review: ", error);
        toast({
            title: "Error",
            description: "Could not delete the review. Please try again.",
            variant: "destructive",
        });
    } finally {
        setDeletingId(null);
    }
  }, [toast]);


  const chartDataFormatter = (number: number) =>
    `${Intl.NumberFormat('us').format(number).toString()}`;

  const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/80 backdrop-blur-sm p-3 border rounded-lg shadow-lg" style={{ zIndex: 1000 }}>
          <p className="text-sm font-bold mb-1">{label}</p>
          {payload.map((pld: any, index: number) => (
             <p key={index} className="text-sm" style={{ color: pld.color || pld.fill }}>
                {`${pld.name}: ${formatter ? formatter(pld.value) : pld.value}`}
             </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  if (!analyticsData) {
    return <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading analytics...</p>
    </div>;
  }

  const apiUsagePercentage = Math.min(((analyticsData.totalClicks || 0) / API_QUOTA) * 100, 100);

  return (
    <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-8">
            <h1 className="text-3xl font-bold">PostAI Analytics</h1>
            <p className="text-muted-foreground">Visualizing user engagement data and feedback.</p>
        </div>
        <div className="grid gap-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                      <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{analyticsData.totalClicks || 0}</div>
                      <p className="text-xs text-muted-foreground">"Auto Format" clicks all time</p>
                  </CardContent>
              </Card>
               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{analyticsData.uniqueUsers || 0}</div>
                      <p className="text-xs text-muted-foreground">Number of unique users</p>
                  </CardContent>
              </Card>
              <Card>
                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Most Active User</CardTitle>
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-sm font-bold truncate">
                        {analyticsData.topUser}
                      </div>
                      <p className="text-xs text-muted-foreground">User with the most clicks</p>
                  </CardContent>
              </Card>
               <Card>
                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">
                        {reviews.length}
                      </div>
                      <p className="text-xs text-muted-foreground">Total user feedback submitted</p>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">API Credits Used</CardTitle>
                      <BatteryCharging className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{analyticsData.totalClicks || 0}<span className="text-sm text-muted-foreground">/{API_QUOTA}</span></div>
                       <Progress value={apiUsagePercentage} className="mt-2 h-2" />
                  </CardContent>
              </Card>
          </div>
    
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Clicks Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ReAreaChart
                    data={analyticsData.clicksOverTime || []}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis tickFormatter={chartDataFormatter} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip content={<CustomTooltip formatter={chartDataFormatter} />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      name="Clicks"
                    />
                  </ReAreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>User Reviews</CardTitle>
                    <CardDescription>
                        Latest feedback from users. You can delete reviews here.
                    </CardDescription>
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
        </div>
    </div>
  );
}
