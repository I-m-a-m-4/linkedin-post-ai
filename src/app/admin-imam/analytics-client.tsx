'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AreaChart as ReAreaChart,
  BarChart as ReBarChart,
  XAxis,
  YAxis,
  Area,
  Bar,
  Cell,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Users, MousePointerClick, UserCheck, MessageSquare, BatteryCharging } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface AnalyticsClientProps {
  totalClicks: number;
  uniqueUsers: number;
  clicksOverTime: { date: string; count: number }[];
  topUser: string;
  reviews: { id: string, userId: string; review: string; timestamp: any }[];
  apiQuota: number;
}

export default function AnalyticsClient({
  totalClicks,
  uniqueUsers,
  clicksOverTime,
  topUser,
  reviews,
  apiQuota
}: AnalyticsClientProps) {

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

  const apiUsagePercentage = Math.min((totalClicks / apiQuota) * 100, 100);

  return (
    <div className="grid gap-6">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                  <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{totalClicks}</div>
                  <p className="text-xs text-muted-foreground">"Auto Format" clicks all time</p>
              </CardContent>
          </Card>
           <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{uniqueUsers}</div>
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
                    {topUser}
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
                  <div className="text-2xl font-bold">{totalClicks}<span className="text-sm text-muted-foreground">/{apiQuota}</span></div>
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
                data={clicksOverTime}
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
                    Latest feedback from users.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                        {reviews.length > 0 ? reviews.map((review) => (
                            <div key={review.id} className="flex items-start gap-4">
                                <Avatar className="h-9 w-9 border">
                                    <AvatarFallback>{review.userId.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                    <p className="text-xs font-medium leading-none text-muted-foreground">
                                        User: {review.userId.slice(0, 8)}...
                                    </p>
                                    <p className="text-sm text-foreground">{review.review}</p>
                                </div>
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
  );
}