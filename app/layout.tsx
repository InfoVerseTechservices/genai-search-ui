import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';
import LeftSidebar from '@/components/LeftSidebar'; // Ensure this path is correct
import { Toaster } from 'sonner';
import ThemeProvider from '@/components/theme/Provider';
import NewSidebar from '@/components/NewSidebar';

// CONTEXT
import UserProfileContextProvider from '@/app/context/user';

const montserrat = Montserrat({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'Perplexica - Chat with the internet',
  description:
    'Perplexica is an AI-powered chatbot that is connected to the internet.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="h-full" lang="en" suppressHydrationWarning>
      <body className={cn('h-full', montserrat.className)}>
        <ThemeProvider>
          {/* Wrapping all children with UserProfileContext (Context) */}
          <UserProfileContextProvider>
            <div className="flex h-full">
              <aside className="fixed left-0 top-0 h-full w-[4%] bg-gray-100 dark:bg-white">
                <LeftSidebar />
              </aside>
              <main className="flex-1 w-[4%] flex flex-col ">
                {/* <Sidebar>{children}</Sidebar> */}

                <NewSidebar>{children} </NewSidebar>
              </main>
            </div>
          </UserProfileContextProvider>

          <Toaster
            toastOptions={{
              unstyled: true,
              classNames: {
                toast:
                  'bg-light-primary dark:bg-dark-secondary dark:text-white/70 text-black-70 rounded-lg p-4 flex flex-row items-center space-x-2',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
