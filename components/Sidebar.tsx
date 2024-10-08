'use client';

import { cn } from '@/lib/utils';
import { History, Home, Search, SquarePen, Settings } from 'lucide-react';
import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';
import React, { useState, type ReactNode } from 'react';
import Layout from './Layout';
import SettingsDialog from './SettingsDialog';

// USER PROFILE Context
import { useUserProfile } from '@/app/context/user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const VerticalIconContainer = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col items-center gap-y-3 w-full">{children}</div>
  );
};

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const segments = useSelectedLayoutSegments();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // NOT SURE IF THIS IS NEEDED FOR SIDEBAR
  // // USER PROFILE Context
  // const { userDetails, isLoggedIn } = useUserProfile();
  // const router = useRouter();

  // // CHECK IF USER IS LOGGED IN
  // useEffect(() => {
  //   if (!isLoggedIn) {
  //     router.push('/login'); // Redirect to the login page if not logged in
  //   }
  // }, [isLoggedIn, router]);

  const navLinks = [
    // {
    //   icon: Home,
    //   href: '/',
    //   active: segments.length === 0 || segments.includes('c'),
    //   label: 'Home',
    // },
    // {
    //   icon: Search,
    //   href: '/',
    //   active: segments.includes('discover'),
    //   label: 'Discover',
    // },
    {
      icon: History,
      href: '/library',
      active: segments.includes('library'),
      label: 'History',
    },
  ];

  return (
    <div className="">
      <div className="hidden  lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-18 lg:flex-col">
        <div className="flex grow w-16  flex-col items-center justify-between gap-y-5 overflow-y-auto bg-[#D2E3FD]  border-[0.5px] border-[#1E71F2] dark:bg-dark-secondary px-2 py-8">
          <a href="/">
            <SquarePen className="cursor-pointer" />
          </a>
          <VerticalIconContainer>
            {navLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                color="black"
                className={cn(
                  'relative flex flex-row items-center justify-center cursor-pointer text-black duration-150 transition w-full py-2 rounded-lg',
                  link.active
                    ? 'text-black dark:text-white'
                    : 'text-black/70 dark:text-white/70',
                )}
              >
                {link.active ? (
                  <link.icon color="black" />
                ) : (
                  <link.icon color="#646464" />
                )}
                {/* {link.active && (
                  <div className="absolute right-0 -mr-2 h-full w-1 rounded-l-lg bg-black dark:bg-white" />
                )} */}
              </Link>
            ))}
          </VerticalIconContainer>

          <Settings
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="cursor-pointer"
            // color='#646464'
            color="transparent"
          />

          <SettingsDialog
            isOpen={isSettingsOpen}
            setIsOpen={setIsSettingsOpen}
          />
        </div>
      </div>

      <div className="fixed bottom-0 w-full z-50 flex flex-row items-center gap-x-6 bg-light-primary dark:bg-dark-primary px-4 py-4 shadow-sm lg:hidden">
        {navLinks.map((link, i) => (
          <Link
            href={link.href}
            key={i}
            className={cn(
              'relative flex flex-col items-center space-y-1 text-center w-full',
              link.active
                ? 'text-black dark:text-white'
                : 'text-black dark:text-white/70',
            )}
          >
            {link.active && (
              <div className="absolute top-0 -mt-4 h-1 w-full rounded-b-lg bg-black dark:bg-white" />
            )}
            <link.icon />
            <p className="text-xs">{link.label}</p>
          </Link>
        ))}
      </div>

      <Layout>{children}</Layout>
    </div>
  );
};

export default Sidebar;
