import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { FunctionComponent as FC, useState } from 'react';
import './globals.css';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import GenAIImage from '../public/images/icons/sidebar/genai-pen.svg';
import VibesImage from '../public/images/icons/sidebar/vibes-icon.svg';
import FeedImage from '../public/images/icons/sidebar/feed.svg';
import ShopImage from '../public/images/icons/sidebar/shop.svg';
import NewsImage from '../public/images/icons/sidebar/news.svg';
import LeftSidebar from '@/components/LeftSidebar'; // Ensure this path is correct
import { Toaster } from 'sonner';
import {
  ChatBubbleIcon,
  FeedIcon,
  GenAiIcon,
  HistoryIcon,
  NewGenSearchIcon,
  NewsIcon,
  NotificationIcon,
  SearchIcon,
  ShopIcon,
  VibesIcon,
} from '@/components/Icons';
import ThemeProvider from '@/components/theme/Provider';
import NewSidebar from '@/components/NewSidebar';
import Link from 'next/link';
import Image from 'next/image';
// CONTEXT

interface IconProps {
  w: number;
  h: number;
  fill: string;
}

type IconComponent = FC<IconProps>;

interface IconLinkProps {
  href: string;
  Icon: IconComponent;
  label: string;
}

const IconLink: FC<IconLinkProps> = ({ href, Icon, label }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href}>
      <div className="flex flex-col items-center">
        <div className="w-6 h-6 mb-1">
          <Icon w={24} h={24} fill={isActive ? '#1E71F2' : '#8E8E93'} />
        </div>
        <p
          className={`
          ${isActive ? 'text-[#1E71F2]' : 'text-[#8E8E93]'}
          text-center text-[10px]
        `}
        >
          {label}
        </p>
      </div>
    </Link>
  );
};
import UserProfileContextProvider from '@/app/context/user';
import ProfilePicture from '@/components/LeftSidebar/ProfilePicture';
import ProfileLoader from '@/components/ProfileLoader';

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
      <body className={cn('h-full', montserrat.className)}>
        <ThemeProvider>
          {/* Wrapping all children with UserProfileContext (Context) */}
          <UserProfileContextProvider>
            <div className="flex h-full ">
              <aside className="hidden md:flex lg:flex xl:flex fixed left-0 top-0 h-full w-[5%] bg-gray-100 dark:bg-white">
                <LeftSidebar />
              </aside>
              <main className="flex-1 w-[4%] flex flex-col">
                {/* <Sidebar>{children}</Sidebar> */}

                <div className="md:hidden bg-white fixed w-full bottom-0 z-50 border-t-2 border-[#1E71F2] rounded-xl">
                  <div className="shadow-[0px_2px_4px_0px_#0000001A]">
                    <div className="py-2 flex flex-wrap items-center justify-evenly">
                      <Link href="https://colomboai.com/genai-search">
                        <div className="mx-4">
                          <div className="w-[29px] mx-auto">
                            {/* <GenAiIcon w={24} h={24} fill={ "#8E8E93"} /> */}
                            <Image src={GenAIImage} alt="colombo" />
                          </div>
                          <p className="text-center text-[14px] mt-2">Gen AI</p>
                        </div>
                      </Link>
                      <Link href="https://colomboai.com/vibes">
                        <div className="mx-4">
                          <div className="w-[29px] mx-auto">
                            <Image
                              src={VibesImage}
                              alt="Vibes"
                              height={30}
                              width={30}
                            />
                            {/* {pathname === '/vibes' ? <Image src={blue_vibes_icon} alt="colombo"/> : <Image src={vibes_icon} alt="colombo"/>} */}
                          </div>
                          <p className="text-center text-[14px] mt-2">Vibes</p>
                        </div>
                      </Link>

                      <Link href="https://colomboai.com/feed">
                        <div className="mx-4 ">
                          <div className="w-[29px] mx-auto">
                            {/* <Image src={FeedImage} alt="feed" /> */}
                            <FeedIcon w={30} h={30} fill={'#8E8E93'} />
                          </div>
                          <p className="text-center text-[14px] mt-2">Feed</p>
                        </div>
                      </Link>

                      <Link href="https://colomboai.com/shop">
                        <div className="mx-4">
                          <div className="w-[29px] mx-auto">
                            {/* <Image src={ShopImage} alt="shop" /> */}
                            <ShopIcon w={30} h={30} fill={'#8E8E93'} />
                          </div>
                          <p className="text-center text-[14px] mt-2">Shop</p>
                        </div>
                      </Link>

                      <Link href="https://colomboai.com/news">
                        <div className="mx-4">
                          <div className="w-[29px] mx-auto">
                            {/* <Image src={NewsImage} alt="colombo" /> */}
                            <NewsIcon w={30} h={30} fill={'#8E8E93'} />
                          </div>
                          <p className="text-center text-[14px] mt-2">News</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>

                <NewSidebar>{children} </NewSidebar>
              </main>
              {/* <div className='flex flex-row w-full bg-white fixed top-[4.6rem] justify-between px-8 md:hidden '>
                <div className="flex space-x-4">
                  <div className="w-6 h-6 ">
                    <ProfileLoader />
                  </div>

                </div>
                <div className="flex space-x-4">
                  <Link href='https://caidev.colomboai.com/genai-search/'>
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 mb-1">
                        <NewGenSearchIcon w={24} h={24} fill={'#8E8E93'} />
                      </div>
 
                    </div>
                  </Link>
                  <Link href='https://caidev.colomboai.com/genai-search/library/'>
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 mb-1">
                        <HistoryIcon w={24} h={24} fill={'#8E8E93'} />
                      </div>
       
                    </div>
                  </Link>
                 
           
                </div>
              </div> */}
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
