import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';
import GenAIImage from '../public/images/icons/sidebar/genai-pen.svg'
import VibesImage from '../public/images/icons/sidebar/vibes-icon.svg'
import FeedImage from '../public/images/icons/sidebar/feed.svg'
import ShopImage from '../public/images/icons/sidebar/shop.svg'
import NewsImage from '../public/images/icons/sidebar/news.svg'
import LeftSidebar from '@/components/LeftSidebar'; // Ensure this path is correct
import { Toaster } from 'sonner';
import { FeedIcon, GenAiIcon, NewsIcon, ShopIcon, VibesIcon } from '@/components/Icons';
import ThemeProvider from '@/components/theme/Provider';
import NewSidebar from '@/components/NewSidebar';
import Link from 'next/link';
import Image from 'next/image';
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
    <html className="h-full w-full" lang="en" suppressHydrationWarning>
      <body className={cn('h-full', montserrat.className)}>
        <ThemeProvider>
          {/* Wrapping all children with UserProfileContext (Context) */}
          <UserProfileContextProvider>
            <div className="flex h-full ">
              <aside className="hidden md:flex lg:flex xl:flex fixed left-0 top-0 h-full w-[4%] bg-gray-100 dark:bg-white">
                <LeftSidebar />
              </aside>
              <main className="flex-1 w-[4%] flex flex-col">
                {/* <Sidebar>{children}</Sidebar> */}
                <div className="md:hidden bg-white fixed w-full bottom-0 z-50 border-t-2 border-[#1E71F2] rounded-xl">
          <div className="shadow-[0px_2px_4px_0px_#0000001A]">
            <div className="py-1 flex flex-wrap items-center justify-evenly">
              <Link href="/genai-search">
                <div className="mx-4">
                  <div className="w-[29px] mx-auto">
                  {/* <GenAiIcon w={24} h={24} fill={'#8E8E93'} /> */}
                  <Image src={GenAIImage} alt="colombo" />
                  </div>
                  <p className='text-center text-[14px] mt-2'>
                    Gen AI
                  </p>
                </div>
              </Link>
              <Link href="/vibes">
                <div className="mx-4">
                  <div className="w-[29px] mx-auto">
                  <Image src={VibesImage} alt="Vibes" height={30} width={30} />
                  {/* {pathname === '/vibes' ? <Image src={blue_vibes_icon} alt="colombo"/> : <Image src={vibes_icon} alt="colombo"/>} */}
                  </div>
                  <p
                   className='text-center text-[14px] mt-2'
                  >
                    Vibes
                  </p>
                </div>
              </Link>

              <Link href="/feed">
                <div className="mx-4 ">
                  <div className="w-[29px] mx-auto">
                  <Image src={FeedImage} alt="feed" />
                    {/* <FeedIcon
                      w={30}
                      h={30}
                      fill={
                        feedSections.includes(`${pathname}`)
                          ? "#1E71F2"
                          : "#8E8E93"
                      }
                    /> */}
                  </div>
                  <p
                  className='text-center text-[14px] mt-2'
                  >
                    Feed
                  </p>
                </div>
              </Link>

              <Link href="/shop">
                <div className="mx-4">
                  <div className="w-[29px] mx-auto">
                  <Image src={ShopImage} alt="shop" />
                    {/* <ShopIcon
                      w={30}
                      h={30}
                      fill={pathname === "/shop" ? "#1E71F2" : "#8E8E93"}
                    /> */}
                  </div>
                  <p
                   className='text-center text-[14px] mt-2'
                  >
                    Shop
                  </p>
                </div>
              </Link>

              <Link href="/news">
                <div className="mx-4">
                  <div className="w-[29px] mx-auto">
                  <Image src={NewsImage} alt="colombo" />
                    {/* <NewsIcon
                      w={30}
                      h={30}
                      fill={pathname === "/news" ? "#1E71F2" : "#8E8E93"}
                    /> */}
                  </div>
                  <p
                  className='text-center text-[14px] mt-2'
                  >
                    News
                  </p>
                </div>
              </Link>
              </div>
              </div>
              </div>
              
      
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
