
'use client';

import React, { useEffect, useState, FunctionComponent as FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUserProfile } from '@/app/context/user';

import ProfilePicture from '@/components/LeftSidebar/ProfilePicture';
import Dropdown from './LeftSidebar/Dropdown';
import HistoryPanel from '@/components/HistoryPanel';
import ThemeToggle from './theme/Switcher';
import ColomboAISymbol from '@/public/images/ColomboAi-Symb.png';

import {
  FeedIcon,
  VibesIcon,
  GenAiIcon,
  ShopIcon,
  NewsIcon,
  StarIcon,
  NewGenSearchIcon,
} from './Icons';

import { PanelRightOpen } from 'lucide-react';

interface IconProps { w: number; h: number; fill: string; }
type IconComponent = FC<IconProps>;
interface IconLinkProps { href?: string; Icon: IconComponent; label: string; isOpen: boolean; onClick?: () => void; }
const IconLink: FC<IconLinkProps> = ({ href, Icon, label, isOpen, onClick }) => {
  const pathname = usePathname();
  const isActive = href ? pathname.startsWith(href) : false;
  const content = (
    <div
      className={cn(
        'group relative flex items-center p-3 my-2 rounded-lg gap-x-4 cursor-pointer transition-colors duration-150 dark:hover:text-blue-400 hover:text-blue-400',
        {
          'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400': isActive,
          'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700': !isActive,
          'justify-center': !isOpen,
        }
      )}
    >
      <div className="w-6 h-6 flex-shrink-0"> <Icon w={24} h={24} fill="currentColor" /> </div>
      {!isOpen && (
        <div className="absolute left-full ml-2 px-2 py-1 text-xs font-medium bg-black text-white rounded-md shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50"> {label} </div>
      )}
      {isOpen && <p className="text-sm font-medium whitespace-nowrap">{label}</p>}
    </div>
  );
  return href ? (<a href={href}>{content}</a>) : (<button onClick={onClick} className="w-full text-left">{content}</button>);
};


interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
}

const LeftSidebar: FC<LeftSidebarProps> = ({ isOpen, onToggle, onNewChat }) => {
  const { userDetails } = useUserProfile();
  const [profilePic, setProfilePic] = useState<string | undefined>(undefined);

  useEffect(() => {
    setProfilePic(userDetails.profile_picture || undefined);
  }, [userDetails.profile_picture]);

  return (
    <div className="flex flex-col h-full w-full p-3 border-r border-[#487ed5]">
      {/* --- No changes needed in Profile Section --- */}
      <div className={cn('mb-10 h-12 flex items-center', isOpen ? 'self-start' : 'self-center')}>
        <Dropdown offset={[0, 10]} placement="bottom-start" btnClassName="flex z-[150] justify-center items-center rounded-full" button={<ProfilePicture image={profilePic} />}>
          <ul className="min-w-[160px] rounded-lg bg-white dark:bg-gray-900 shadow-md dark:border dark:border-gray-700 text-gray-800 dark:text-gray-200">
            <a href="https://colomboai.com/profile">
              <li className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-gray-800 cursor-pointer font-semibold text-blue-600 dark:text-blue-400"> {userDetails.name} </li>
            </a>
            <li className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-gray-800 cursor-pointer"> Log out </li>
          </ul>
        </Dropdown>
      </div>

      <nav>
        
          <button
    onClick={onNewChat}
    className={cn(
      'relative group p-3 py-4  rounded-full transition hover:bg-gray-100 dark:hover:bg-gray-700',
      isOpen ? 'self-start ml-2' : 'self-center'
    )}
    aria-label="New Chat"
  >
    <Image
      src={ColomboAISymbol}
      alt="ColomboAI Symbol"
      width={35}
      height={35}
      className="object-contain"
    />
    {!isOpen && (
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 text-xs font-medium bg-black text-white rounded-md shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
        New Chat
      </div>
    )}
  </button>
        <button onClick={onToggle} className={cn('group relative flex items-center w-full p-3 py-4 rounded-lg gap-x-4 cursor-pointer transition-colors duration-200', 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700', !isOpen && 'justify-center')}>
          <PanelRightOpen className={cn('w-6 h-6 transition-transform duration-300 hover:text-blue-400 dark:hover:text-blue-400', !isOpen && 'rotate-180')} />
          {!isOpen && (
            <div className="absolute left-full ml-2 px-2 py-1 text-xs font-medium bg-black text-white rounded-md shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
              {isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
            </div>
          )}
        </button>

        
        
        <IconLink href="https://colomboai.com/genai-search" Icon={GenAiIcon as IconComponent} label="Gen AI" isOpen={isOpen} />
        <IconLink href="https://colomboai.com/vibes" Icon={VibesIcon as IconComponent} label="Vibes" isOpen={isOpen} />
        <IconLink href="https://colomboai.com/feed" Icon={FeedIcon as IconComponent} label="Feed" isOpen={isOpen} />
        <IconLink href="https://colomboai.com/shop" Icon={ShopIcon as IconComponent} label="Shop" isOpen={isOpen} />
        <IconLink href="https://colomboai.com/news" Icon={NewsIcon as IconComponent} label="News" isOpen={isOpen} />
        <IconLink href="https://colomboai.com/favorites" Icon={StarIcon as IconComponent} label="Favorites" isOpen={isOpen} /> 
        <hr className="my-4 border-gray-200 dark:border-gray-600" />
        
        {/* New Chat Button - This remains a button and is perfectly fine. */}
        <button onClick={onNewChat} className={cn('group relative flex items-center w-full p-3 my-2 rounded-lg gap-x-4 cursor-pointer transition-colors duration-150 dark:hover:text-blue-400 hover:text-blue-400', 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700', !isOpen && 'justify-center')}>
          <div className="w-6 h-6 flex-shrink-0"> <NewGenSearchIcon w={24} h={24} fill="currentColor" /> </div>
          {!isOpen && (
            <div className="absolute left-full ml-2 px-2 py-1 text-xs font-medium bg-black text-white rounded-md shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50"> New Chat </div>
          )}
          {isOpen && <p className="text-sm font-medium whitespace-nowrap">New Chat</p>}
        </button>
      </nav>

      {isOpen && (
        <div className="flex flex-col min-h-0 my-4">
          <hr className="mb-4 border-gray-200 dark:border-gray-600" />
          <h3 className="px-3 mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase"> History </h3>
          <div className="overflow-y-auto pr-2"> <HistoryPanel /> </div>
        </div>
      )}

      <div className="mt-auto pt-4 flex flex-col items-center gap-y-4 relative">
        <hr className="mt-4 border-gray-200 dark:border-gray-600 w-full" />
        <ThemeToggle />

       
      </div>
    </div>
  );
};

export default LeftSidebar;
