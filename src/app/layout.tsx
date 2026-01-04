import type {Metadata} from 'next';
import { Inter, Poppins } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/app/theme-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-poppins' });

export const metadata: Metadata = {
  title: 'FormatAI - AI-Powered LinkedIn Content Formatting',
  description: 'Instantly format your LinkedIn posts for maximum readability and engagement. Our AI adds smart line breaks, highlights key phrases, and analyzes your content for tone and clarity.',
  keywords: ['LinkedIn formatting', 'AI content formatter', 'social media tool', 'content marketing', 'post optimizer', 'text formatter'],
  icons: {
    icon: 'https://i.ibb.co/tPC17k0F/free-linkedin-logo-3d-icon-png-download-12257269.webp',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${poppins.variable} ${inter.variable}`}>
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
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            {children}
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
