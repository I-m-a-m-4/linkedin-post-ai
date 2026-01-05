
'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { LoaderCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Auth } from 'firebase/auth';

const ADMIN_EMAILS = ['belloimam431@gmail.com'];

interface AdminLayoutProps {
  children: React.ReactNode;
  auth: Auth | null;
}

export default function AdminLayout({ children, auth }: AdminLayoutProps) {
  // useAuthState requires a valid Auth instance. If it's null, we can't proceed.
  const [user, loading] = useAuthState(auth!);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && auth) {
      if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
        if (pathname !== '/login') {
          router.replace('/login');
        }
      } else if (user && user.email && ADMIN_EMAILS.includes(user.email) && pathname === '/login') {
        router.replace('/admin-imam');
      }
    }
  }, [user, loading, router, pathname, auth]);

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/login');
    }
  };

  if (loading || !auth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle className="size-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (user && user.email && ADMIN_EMAILS.includes(user.email)) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
            <a href="#" className="flex items-center gap-2 text-lg font-semibold md:text-base">
              <span className="">PostAI Analytics</span>
            </a>
          </nav>
          <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <div className="ml-auto flex-1 sm:flex-initial" />
              {user.photoURL ? (
                <Image src={user.photoURL} alt={user.displayName || 'admin'} width={36} height={36} className="rounded-full" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold border">
                  {user.email ? user.email.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
            <Button onClick={handleLogout} variant="outline" size="sm"><LogOut className="mr-2 h-4 w-4" />Logout</Button>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {children}
        </main>
      </div>
    );
  }

  return null;
}
