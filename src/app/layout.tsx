
'use client';

import type { Metadata } from 'next';
import { Inter, Poppins, Bricolage_Grotesque, Playfair_Display } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/app/theme-provider';
import NextTopLoader from 'nextjs-toploader';
import React, { useEffect, useState } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-poppins' });
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage' });
const playfair = Playfair_Display({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-playfair' });


// We can't add metadata here because it's a client component. 
// We'll move it to a parent layout if needed, but for now this is the simplest fix.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [firebaseInstances, setFirebaseInstances] = useState<{
    app: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
  } | null>(null);

  useEffect(() => {
    let app: FirebaseApp;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    setFirebaseInstances({ app, auth, firestore });
  }, []);

  // Pass the instances to children that are React components
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // Cloning the element and adding the props.
      // Note: This assumes the direct child component can accept these props.
      // This is a common pattern for passing down "global" instances.
      return React.cloneElement(child as React.ReactElement<any>, { ...firebaseInstances, ...child.props });
    }
    return child;
  });
  
  const siteTitle = 'PostAI - AI-Powered LinkedIn Content Formatting';
  const siteDescription = 'Instantly format your LinkedIn posts for maximum readability and engagement. Our AI adds smart line breaks, highlights key phrases, and analyzes your content for tone and clarity.';
  const shareImageUrl = 'https://i.ibb.co/x9V4H82/20251208-0847-Linked-In-Post-Design-remix-01kbyesaq2emfrkznsprtzrcwf.png';
  const siteUrl = 'https://linkedin-post-ai.vercel.app/'; // Replace with your actual URL

  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${poppins.variable} ${inter.variable} ${bricolage.variable} ${playfair.variable}`}>
      <head>
        {/* Standard SEO */}
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
        <meta name="keywords" content="LinkedIn formatting, AI content formatter, social media tool, content marketing, post optimizer, text formatter" />
        <link rel="icon" href="/icon.webp" />
        
        {/* Google Site Verification */}
        <meta name="google-site-verification" content="WGdoPB1C5sq9ITs96lwQAtR1DRpLwcKfDCN9-taB9e8" />
        
        {/* Open Graph (Facebook, LinkedIn, etc.) */}
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:image" content={shareImageUrl} />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDescription} />
        <meta name="twitter:image" content={shareImageUrl} />
      </head>
      <body className={`font-inter antialiased`} data-background="grid">
        <NextTopLoader
          color="hsl(var(--primary))"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px hsl(var(--primary)),0 0 5px hsl(var(--primary))"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {firebaseInstances ? childrenWithProps : <div className="h-screen w-full" />}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
