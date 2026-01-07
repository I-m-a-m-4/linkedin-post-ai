'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { useUserCredits } from '@/hooks/use-user-credits';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  writeBatch,
  getDocs,
  where,
} from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Gem, Trash2, Loader2, LogOut, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FormattedTextRenderer } from '@/components/app/formatted-text-renderer';
import { SiteHeader } from '@/components/app/site-header';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

type Post = {
  id: string;
  formattedText: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
};

type UsageHistory = {
  id: string;
  action: 'purchase' | 'autoFormat' | 'adminGrant';
  creditsSpent: number;
  timestamp: {
    seconds: number;
    nanoseconds: number;
  };
};

export default function ProfilePage() {
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const { toast } = useToast();
  const { credits, loading: creditsLoading } = useUserCredits(user?.uid);

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [usageHistory, setUsageHistory] = useState<UsageHistory[]>([]);
  const [usageLoading, setUsageLoading] = useState(true);

  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/');
      return;
    }

    setPostsLoading(true);
    const postsRef = collection(db, 'users', user.uid, 'posts');
    const qPosts = query(postsRef, orderBy('createdAt', 'desc'));

    const unsubPosts = onSnapshot(qPosts, (snapshot) => {
      const userPosts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(userPosts);
      setPostsLoading(false);
    }, (error) => {
      console.error('Error fetching posts:', error);
      toast({ title: 'Error', description: 'Could not fetch your posts.', variant: 'destructive' });
      setPostsLoading(false);
    });

    setUsageLoading(true);
    const usageRef = collection(db, 'user_metadata', user.uid, 'usage_history');
    const qUsage = query(usageRef, orderBy('timestamp', 'desc'));
    
    const unsubUsage = onSnapshot(qUsage, (snapshot) => {
        const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UsageHistory));
        setUsageHistory(history);
        setUsageLoading(false);
    }, (error) => {
        console.error("Error fetching usage history:", error);
        setUsageLoading(false);
    });


    return () => {
        unsubPosts();
        unsubUsage();
    };
  }, [user, authLoading, router, toast]);

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    setDeletingPostId(postId);
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'posts', postId));
      toast({
        title: 'Post Deleted',
        description: 'Your post has been successfully removed.',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Could not delete post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeletingAccount(true);

    try {
        const batch = writeBatch(db);
        
        const postsRef = collection(db, 'users', user.uid, 'posts');
        const postsSnapshot = await getDocs(postsRef);
        postsSnapshot.forEach(doc => batch.delete(doc.ref));

        const metadataRef = doc(db, 'user_metadata', user.uid);
        batch.delete(metadataRef);
        
        const userDocRef = doc(db, 'users', user.uid);
        batch.delete(userDocRef);
        
        const reviewsRef = collection(db, 'reviews');
        const reviewsQuery = query(reviewsRef, where("userId", "==", user.uid));
        const reviewsSnapshot = await getDocs(reviewsQuery);
        reviewsSnapshot.forEach(doc => batch.delete(doc.ref));

        await batch.commit();

        await deleteUser(user);

        toast({
            title: 'Account Deleted',
            description: 'Your account and all associated data have been removed.',
            variant: 'success'
        });
        router.push('/');

    } catch (error: any) {
        console.error('Error deleting account:', error);
        toast({
            title: 'Deletion Failed',
            description: error.message || 'Could not delete your account. You may need to sign in again.',
            variant: 'destructive'
        });
        if (error.code === 'auth/requires-recent-login') {
            await auth.signOut();
            router.push('/');
        }
    } finally {
        setIsDeletingAccount(false);
        setShowDeleteAccountDialog(false);
    }
};


  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const renderUsageAction = (item: UsageHistory) => {
    switch (item.action) {
      case 'purchase':
        return `Purchased ${-item.creditsSpent} credits`;
      case 'autoFormat':
        return `Used "Auto Format"`;
      case 'adminGrant':
        return `Admin granted ${-item.creditsSpent} credits`;
      default:
        return 'Credit usage';
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
        <SiteHeader user={user} credits={credits} creditsLoading={creditsLoading} userLoading={authLoading} onLogin={()=>{}} />
        <main className="flex-1 bg-muted/20">
            <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
                <header className="flex flex-col sm:flex-row items-center gap-6">
                    <Avatar className="h-24 w-24 border-4 border-background">
                        <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                        <AvatarFallback className="text-3xl">
                            {user.displayName?.charAt(0) || user.email?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold">{user.displayName}</h1>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>
                    <Button variant="outline" onClick={() => auth.signOut()} className="sm:ml-auto">
                        <LogOut className="mr-2 h-4 w-4"/> Logout
                    </Button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card>
                      <CardHeader>
                          <CardTitle>Your Credits</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <Gem className="h-8 w-8 text-primary" />
                              {creditsLoading ? <Skeleton className="h-8 w-24" /> : <p className="text-3xl font-bold">{credits ?? 0}</p>}
                          </div>
                          <Button asChild>
                              <Link href="/pricing">
                                  Buy More Credits <ExternalLink className="ml-2 h-4 w-4" />
                              </Link>
                          </Button>
                      </CardContent>
                  </Card>
                   <Card>
                        <CardHeader>
                            <CardTitle>Transaction History</CardTitle>
                            <CardDescription>Your recent credit activity.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-48">
                                {usageLoading ? <Skeleton className="h-full w-full" /> : 
                                usageHistory.length > 0 ? (
                                    <Table>
                                        <TableBody>
                                            {usageHistory.map(item => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{renderUsageAction(item)}</TableCell>
                                                    <TableCell className={`text-right font-semibold ${item.creditsSpent > 0 ? 'text-destructive' : 'text-green-500'}`}>
                                                        {item.creditsSpent > 0 ? `-${item.creditsSpent}` : `+${-item.creditsSpent}`}
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs text-muted-foreground">
                                                        {format(new Date(item.timestamp.seconds * 1000), 'MMM d')}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-center text-muted-foreground py-4">No activity yet.</p>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>


                <section>
                    <h2 className="text-2xl font-bold mb-4">Your Formatted Posts</h2>
                    <div className="space-y-4">
                        {postsLoading ? (
                             [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
                        ) : posts.length > 0 ? (
                            posts.map(post => (
                                <Card key={post.id}>
                                    <CardContent className="p-4">
                                        <AnimatePresence>
                                            <motion.div
                                                className="text-sm overflow-hidden"
                                                initial={{ height: '8rem' }}
                                                animate={{ height: expandedPostId === post.id ? 'auto' : '8rem' }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <FormattedTextRenderer text={post.formattedText} />
                                            </motion.div>
                                        </AnimatePresence>
                                    </CardContent>
                                    <CardFooter className="p-4 flex justify-between items-center bg-muted/50">
                                        <p className="text-xs text-muted-foreground">
                                            Formatted on {new Date(post.createdAt.seconds * 1000).toLocaleDateString()}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                                            >
                                                {expandedPostId === post.id ? <ChevronUp className="mr-2 h-4 w-4"/> : <ChevronDown className="mr-2 h-4 w-4"/>}
                                                {expandedPostId === post.id ? 'Collapse' : 'Expand'}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeletePost(post.id)}
                                                disabled={deletingPostId === post.id}
                                            >
                                                {deletingPostId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-8">You haven't formatted any posts yet.</p>
                        )}
                    </div>
                </section>

                <section>
                    <Card className="border-destructive">
                        <CardHeader>
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                             <CardDescription>
                                This action is irreversible. Please proceed with caution.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Delete Your Account</p>
                                    <p className="text-sm text-muted-foreground">This will permanently delete your account, posts, and all associated data.</p>
                                </div>
                                <Button variant="destructive" onClick={() => setShowDeleteAccountDialog(true)}>
                                    Delete Account
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </main>
        
        <AlertDialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeletingAccount && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Yes, delete my account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
