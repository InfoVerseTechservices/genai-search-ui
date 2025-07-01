import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';

import ThemeProvider from '@/components/theme/Provider';
import UserProfileContextProvider from '@/app/context/user';
import { LayoutProvider } from '@/app/context/LayoutContext';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ColomboAI',
  description: 'ColomboAI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      className={cn(
        'h-full w-full',
        inter.variable 
      )} 
      lang="en" 
      suppressHydrationWarning
    >
      <body className={cn(
        'h-full bg-gray-50 dark:bg-gray-900',
        'font-sans' 
      )}>
        <ThemeProvider>
          <UserProfileContextProvider>
            <LayoutProvider>
              {children}
            </LayoutProvider>
          </UserProfileContextProvider>

          <Toaster
            toastOptions={{
              unstyled: true,
              classNames: {
                toast: 'bg-white dark:bg-gray-800 dark:text-white/80 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-row items-center space-x-2 shadow-lg',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
