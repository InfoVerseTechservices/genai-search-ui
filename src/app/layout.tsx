import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';
import ThemeProvider from '@/components/theme/Provider';
import LayoutClientWrapper from '@/components/LayoutClientWrapper';
import UserProfileContextProvider from '@/context/UserContext';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ColomboAI',
  description: 'ColomboAI - AI-Powered Search Engine',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ColomboAI',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="h-full w-full" lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ColomboAI" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#24A0ED" />
        <meta name="msapplication-TileColor" content="#24A0ED" />
      </head>
      <body className={cn('h-full bg-gray-50 dark:bg-gray-900 overflow-x-hidden', inter.className)} suppressHydrationWarning>
        <ThemeProvider>
          <UserProfileContextProvider>
            <LayoutClientWrapper>
              {children}
            </LayoutClientWrapper>
            <Toaster
              position="top-center"
              toastOptions={{
                unstyled: true,
                classNames: {
                  toast: 'bg-white dark:bg-gray-800 dark:text-white/80 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 flex flex-row items-center space-x-2 shadow-lg max-w-[calc(100vw-2rem)] sm:max-w-md',
                },
              }}
            />
          </UserProfileContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
