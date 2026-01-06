
import type { Metadata } from 'next';
import { Inter, Poppins, Bricolage_Grotesque, Playfair_Display } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/app/theme-provider';
import NextTopLoader from 'nextjs-toploader';
import React from 'react';
import { FirebaseClientProvider } from '@/firebase/client-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-poppins' });
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage' });
const playfair = Playfair_Display({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-playfair' });


export const metadata: Metadata = {
  title: 'PostAI - AI-Powered LinkedIn Content Formatting',
  description: 'Instantly format your LinkedIn posts for maximum readability and engagement. Our AI adds smart line breaks, highlights key phrases, and analyzes your content for tone and clarity.',
  keywords: "LinkedIn formatting, AI content formatter, social media tool, content marketing, post optimizer, text formatter",
  openGraph: {
    title: 'PostAI - AI-Powered LinkedIn Content Formatting',
    description: 'Instantly format your LinkedIn posts for maximum readability and engagement. Our AI adds smart line breaks, highlights key phrases, and analyzes your content for tone and clarity.',
    url: 'https://linkedin-post-ai.vercel.app', // Replace with your actual URL
    siteName: 'PostAI',
    images: [
      {
        url: 'https://i.ibb.co/x9V4H82/20251208-0847-Linked-In-Post-Design-remix-01kbyesaq2emfrkznsprtzrcwf.png', // Must be an absolute URL
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PostAI - AI-Powered LinkedIn Content Formatting',
    description: 'Instantly format your LinkedIn posts for maximum readability and engagement. Our AI adds smart line breaks, highlights key phrases, and analyzes your content for tone and clarity.',
    images: ['https://i.ibb.co/x9V4H82/20251208-0847-Linked-In-Post-Design-remix-01kbyesaq2emfrkznsprtzrcwf.png'], // Must be an absolute URL
  },
  verification: {
    google: 'WGdoPB1C5sq9ITs96lwQAtR1DRpLwcKfDCN9-taB9e8',
  },
  icons: {
    icon: '/icon.png',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${poppins.variable} ${inter.variable} ${bricolage.variable} ${playfair.variable}`}>
      <head/>
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
          <FirebaseClientProvider>
            {children}
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
