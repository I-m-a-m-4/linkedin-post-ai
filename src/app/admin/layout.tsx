// src/app/admin-imam/layout.tsx
'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { LoaderCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

// Hardcoded list of admin emails
const ADMIN_EMAILS = ['belloimam431@gmail.com'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If auth state is still loading, do nothing.
    if (loading) {
      return;
    }

    const isLoginPage = pathname === '/admin-imam/login';
    const isAuthorizedAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

    // If user is not an authorized admin and not on the login page, redirect to login.
    if (!isAuthorizedAdmin && !isLoginPage) {
      router.replace('/admin-imam/login');
    }

    // If user is an authorized admin and on the login page, redirect to the dashboard.
    if (isAuthorizedAdmin && isLoginPage) {
      router.replace('/admin-imam');
    }
  }, [user, loading, router, pathname]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/admin-imam/login');
  };

  // While checking authentication, show a loading screen.
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle className="size-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  // If on the login page, just render the login component without the layout.
  if (pathname === '/admin-imam/login') {
    return <>{children}</>;
  }
  
  const isAuthorizedAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

  // If user is an authorized admin, show the full admin layout with content.
  if (isAuthorizedAdmin) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
            <a href="#" className="flex items-center gap-2 text-lg font-semibold md:text-base">
              <span>PostAI Analytics</span>
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

  // Fallback for unauthorized access if redirection hasn't happened yet.
  return null;
}
