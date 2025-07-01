

// import type { Metadata } from 'next';
// import { Montserrat } from 'next/font/google';
// import './globals.css';
// import { cn } from '@/lib/utils';
// import { Toaster } from 'sonner';
// import ThemeProvider from '@/components/theme/Provider';
// import UserProfileContextProvider from '@/app/context/user';
// import LayoutClientWrapper from '@/components/LayoutClientWrapper'; // Import the new wrapper
// import NewSidebar from '@/components/NewSidebar';

// const montserrat = Montserrat({
//   weight: ['300', '400', '500', '700'],
//   subsets: ['latin'],
//   display: 'swap',
//   fallback: ['Arial', 'sans-serif'],
// });

// export const metadata: Metadata = {
//   title: 'ColomboAI',
//   description: 'ColomboAI',
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html className="h-full w-full" lang="en" suppressHydrationWarning>
//       <body className={cn('h-full bg-gray-50 dark:bg-gray-900', montserrat.className)}>
//         <ThemeProvider>
//           <UserProfileContextProvider>
//             <LayoutClientWrapper>
                                        
// <NewSidebar>
//  {children}
// </NewSidebar>
             

//             </LayoutClientWrapper>
//           </UserProfileContextProvider>

//           <Toaster
//             toastOptions={{
//               unstyled: true,
//               classNames: {
//                 toast: 'bg-white dark:bg-gray-800 dark:text-white/80 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-row items-center space-x-2 shadow-lg',
//               },
//             }}
//           />
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }



// import type { Metadata } from 'next';
// import { Montserrat } from 'next/font/google';
// import './globals.css';
// import { cn } from '@/lib/utils';
// import { Toaster } from 'sonner';

// // Import your providers and the main layout wrapper
// import ThemeProvider from '@/components/theme/Provider';
// import UserProfileContextProvider from '@/app/context/user';
// import { LayoutProvider } from '@/app/context/LayoutContext';
// import LayoutClientWrapper from '@/components/LayoutClientWrapper'; // This is your main layout now

// const montserrat = Montserrat({
//   weight: ['300', '400', '500', '700'],
//   subsets: ['latin'],
//   display: 'swap',
//   fallback: ['Arial', 'sans-serif'],
// });

// export const metadata: Metadata = {
//   title: 'ColomboAI',
//   description: 'ColomboAI',
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html className="h-full w-full" lang="en" suppressHydrationWarning>
//       <body className={cn('h-full bg-gray-50 dark:bg-gray-900', montserrat.className)}>
//         <ThemeProvider>
//           <UserProfileContextProvider>
//             <LayoutProvider>
//               {/* This is the correct, simplified structure */}
//               <LayoutClientWrapper>
//                 {children}
//               </LayoutClientWrapper>
//             </LayoutProvider>
//           </UserProfileContextProvider>

//           <Toaster
//             toastOptions={{
//               // ... your toaster options
//             }}
//           />
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }



import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';

// Import your providers and the ONE main layout wrapper
import ThemeProvider from '@/components/theme/Provider';
import UserProfileContextProvider from '@/app/context/user';
import { LayoutProvider } from '@/app/context/LayoutContext';
import LayoutClientWrapper from '@/components/LayoutClientWrapper'; // This is your only main layout now

const montserrat = Montserrat({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
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
    <html className="h-full w-full" lang="en" suppressHydrationWarning>
      <body className={cn('h-full bg-gray-50 dark:bg-gray-900', montserrat.className)}>
        <ThemeProvider>
          <UserProfileContextProvider>
            <LayoutProvider>
              {/* This is the correct structure. LayoutClientWrapper is the child */}
              {/* of all providers, and it wraps the page content. */}
              {/* <LayoutClientWrapper>
                {children}
              </LayoutClientWrapper> */}
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