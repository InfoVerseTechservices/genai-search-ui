'use client';

import React, { useEffect, useState, useCallback, FunctionComponent as FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import ThemeToggle from './theme/Switcher';
import { HistoryIcon, NewGenSearchIcon, GenAiIcon, StarIcon, FeedIcon, VibesIcon, NewsIcon, ShopIcon } from './Icons';
import { PanelRightOpen, History, Plus, X, User, Heart } from 'lucide-react';
import ProfilePicture from './ProfilePicture';
import Dropdown from './Dropdown';
import HistoryPanel from './HistoryPanel';
import FavoritesPanel from './FavoritesPanel';
import { useUserProfile } from '@/context/UserContext';
import dynamic from 'next/dynamic';

const DynamicHistoryPanel = dynamic(() => import('./HistoryPanel'), {
  loading: () => <div className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm pl-6">Loading history...</div>,
  ssr: false
});

const DynamicFavoritesPanel = dynamic(() => import('./FavoritesPanel'), {
  loading: () => <div className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm pl-6">Loading favorites...</div>,
  ssr: false
});

interface IconProps { w: number; h: number; fill: string; }
type IconComponent = FC<IconProps>;

interface IconLinkProps { 
  href?: string; 
  Icon: IconComponent; 
  label: string; 
  isOpen: boolean; 
  onClick?: () => void; 
  isMobile?: boolean; 
}

const IconLink: FC<IconLinkProps> = ({ href, Icon, label, isOpen, onClick, isMobile = false }) => {
  const pathname = usePathname();
  const isActive = href ? pathname.startsWith(href) : false;
  
  const content = (
    <div
      className={cn(
        'group relative flex items-center w-full rounded-lg gap-x-3 cursor-pointer transition-colors duration-150 dark:hover:text-blue-400 hover:text-blue-400 touch-manipulation no-select',
        {
          'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400': isActive,
          'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700': !isActive,
          'justify-center': !isOpen,
        },
        isMobile ? 'min-h-touch p-3' : 'min-h-touch p-3'
      )}
    >
      <div className="w-5 h-5 flex-shrink-0">
        <Icon w={20} h={20} fill="currentColor" />
      </div>
      {!isOpen && (
        <div className="absolute left-full ml-2 px-2 py-1 text-xs font-medium bg-black text-white rounded-md shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
          {label}
        </div>
      )}
      {isOpen && <p className="text-sm font-medium whitespace-nowrap truncate">{label}</p>}
    </div>
  );
  
  return href ? (
    <Link href={href}>{content}</Link>
  ) : (
    <button onClick={onClick} className="w-full text-left">{content}</button>
  );
};

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onSaveToHistory?: () => void;
  isMobile?: boolean;
}

const LeftSidebar: FC<LeftSidebarProps> = ({ 
  isOpen, 
  onToggle, 
  onNewChat, 
  onSaveToHistory, 
  isMobile = false 
}) => {
  const { userDetails, isLoggedIn } = useUserProfile();
  const [profilePic, setProfilePic] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'history' | 'favorites'>('history');
  const [historyData, setHistoryData] = useState([]);
  const [favoritesData, setFavoritesData] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const refreshData = useCallback(async () => {
    setDataLoaded(false);
  }, []);


  const handleNewChat = () => {
    console.log('New chat clicked');
    if (onSaveToHistory) {
      onSaveToHistory();
    }
    onNewChat();
  };

  useEffect(() => {
    setProfilePic(userDetails?.profile_picture || undefined);
  }, [userDetails?.profile_picture]);

  // Preload history and favorites data
  useEffect(() => {
    const preloadData = async () => {
      if (!userDetails?.id && !userDetails?._id) return;
      
      try {
        const userId = userDetails.id || userDetails._id;
        
        // Load history and favorites in parallel
        const [historyRes, favoritesRes] = await Promise.all([
          fetch(`/api/chats?userId=${userId}&limit=20`),
          fetch(`/api/favourite?userId=${userId}`)
        ]);
        
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setHistoryData(historyData.chats || []);
        }
        
        if (favoritesRes.ok) {
          const favoritesData = await favoritesRes.json();
          setFavoritesData(favoritesData.favourites || []);
        }
        
        setDataLoaded(true);
      } catch (error) {
        console.error('Failed to preload data:', error);
        setDataLoaded(true);
      }
    };
    
    if (userDetails && !dataLoaded) {
      preloadData();
    }
  }, [userDetails, dataLoaded]);

  return (
    <div className="flex flex-col h-full w-full p-3 sm:p-4 border-r border-[#487ed5] overflow-y-auto">
      {/* Mobile Header - Profile + Close Button */}
      {isMobile ? (
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <Dropdown 
            offset={[0, 10]} 
            placement="bottom-start" 
            btnClassName="flex z-[150] justify-center items-center rounded-full min-h-touch min-w-touch" 
            button={<ProfilePicture image={profilePic} />}
          >
            <ul className="min-w-[160px] rounded-lg bg-white dark:bg-gray-900 shadow-md dark:border dark:border-gray-700 text-gray-800 dark:text-gray-200">
              {isLoggedIn ? (
                <>
                  <Link href="/settings">
                    <li className="px-4 py-3 hover:bg-neutral-100 dark:hover:bg-gray-800 cursor-pointer font-semibold text-blue-600 dark:text-blue-400 touch-manipulation">
                      {userDetails?.name || 'Profile'}
                    </li>
                  </Link>
                  <li className="px-4 py-3 hover:bg-neutral-100 dark:hover:bg-gray-800 cursor-pointer touch-manipulation">
                    Log out
                  </li>
                </>
              ) : (
                <li className="px-4 py-3 hover:bg-neutral-100 dark:hover:bg-gray-800 cursor-pointer text-blue-600 dark:text-blue-400 touch-manipulation">
                  Sign In
                </li>
              )}
            </ul>
          </Dropdown>
          <button
            onClick={onToggle}
            className="min-h-touch min-w-touch p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors touch-manipulation no-select"
            aria-label="Close menu"
          >
            <PanelRightOpen className="w-5 h-5" />
          </button>
        </div>
      ) : (
        /* Desktop Profile Section */
        <div className={cn('mb-6 h-12 flex items-center', isOpen ? 'justify-between w-full' : 'justify-center')}>
          <Dropdown 
            offset={[0, 10]} 
            placement="bottom-start" 
            btnClassName="flex z-[150] justify-center items-center rounded-full min-h-touch min-w-touch" 
            button={<ProfilePicture image={profilePic} />}
          >
            <ul className="min-w-[160px] rounded-lg bg-white dark:bg-gray-900 shadow-md dark:border dark:border-gray-700 text-gray-800 dark:text-gray-200">
              {isLoggedIn ? (
                <>
                  <Link href="/settings">
                    <li className="px-4 py-3 hover:bg-neutral-100 dark:hover:bg-gray-800 cursor-pointer font-semibold text-blue-600 dark:text-blue-400 touch-manipulation">
                      {userDetails?.name || 'Profile'}
                    </li>
                  </Link>
                  <li className="px-4 py-3 hover:bg-neutral-100 dark:hover:bg-gray-800 cursor-pointer touch-manipulation">
                    Log out
                  </li>
                </>
              ) : (
                <li className="px-4 py-3 hover:bg-neutral-100 dark:hover:bg-gray-800 cursor-pointer text-blue-600 dark:text-blue-400 touch-manipulation">
                  Sign In
                </li>
              )}
            </ul>
          </Dropdown>
          
          {/* Collapse button when expanded - positioned on the right */}
          {isOpen && (
            <button 
              onClick={onToggle} 
              className="min-h-touch min-w-touch p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors ml-auto touch-manipulation no-select"
              aria-label="Collapse sidebar"
            >
              <PanelRightOpen className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      <nav className="flex flex-col">
        {/* Expand Button - Only show when collapsed on desktop */}
        {!isMobile && !isOpen && (
          <button 
            onClick={onToggle} 
            className="group relative flex items-center justify-center w-full min-h-touch p-3 mb-4 rounded-lg cursor-pointer transition-colors duration-200 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 touch-manipulation no-select"
          >
            <PanelRightOpen className="w-5 h-5 rotate-180 transition-transform duration-300 hover:text-blue-400 dark:hover:text-blue-400" />
            <div className="absolute left-full ml-2 px-2 py-1 text-xs font-medium bg-black text-white rounded-md shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
              Expand Sidebar
            </div>
          </button>
        )}
        
        {/* Main Navigation Links */}
        <div className={cn("space-y-2 mb-6", isMobile && "space-y-2 mb-4")}>
          <IconLink 
            href="/" 
            Icon={GenAiIcon as IconComponent} 
            label="Gen AI" 
            isOpen={isOpen} 
            isMobile={isMobile} 
          />
          <IconLink 
            href="/discover" 
            Icon={VibesIcon as IconComponent} 
            label="Discover" 
            isOpen={isOpen} 
            isMobile={isMobile} 
          />
          <IconLink 
            href="/library" 
            Icon={FeedIcon as IconComponent} 
            label="Library" 
            isOpen={isOpen} 
            isMobile={isMobile} 
          />
          <IconLink 
            href="/tools" 
            Icon={NewsIcon as IconComponent} 
            label="Tools" 
            isOpen={isOpen} 
            isMobile={isMobile} 
          />
          <IconLink 
            href="/settings" 
            Icon={ShopIcon as IconComponent} 
            label="Settings" 
            isOpen={isOpen} 
            isMobile={isMobile} 
          />
        </div>
        
        {/* New Chat, Favorites, History - Vertical List */}
        <div className={cn("space-y-2 mb-6", isMobile && "space-y-2 mb-4")}>
          {/* New Chat Button */}
          <button 
            onClick={handleNewChat} 
            className={cn(
              'group relative flex items-center w-full rounded-lg gap-x-3 cursor-pointer transition-colors duration-150 dark:hover:text-blue-400 hover:text-blue-400 touch-manipulation no-select', 
              'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700', 
              !isOpen && 'justify-center',
              isMobile ? 'min-h-touch p-3' : 'min-h-touch p-3'
            )}
          >
            <div className="w-5 h-5 flex-shrink-0"> 
              <NewGenSearchIcon w={20} h={20} fill="currentColor" /> 
            </div>
            {!isOpen && (
              <div className="absolute left-full ml-2 px-2 py-1 text-xs font-medium bg-black text-white rounded-md shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                New Chat
              </div>
            )}
            {isOpen && <p className="text-sm font-medium whitespace-nowrap">New Chat</p>}
          </button>
          
          {/* Favorites Button */}
          <div>
            <button 
              onClick={() => setActiveTab('favorites')} 
              className={cn(
                'group relative flex items-center w-full rounded-lg gap-x-3 cursor-pointer transition-colors duration-150 dark:hover:text-red-400 hover:text-red-400 touch-manipulation no-select', 
                activeTab === 'favorites' 
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700', 
                !isOpen && 'justify-center',
                isMobile ? 'min-h-touch p-3' : 'min-h-touch p-3'
              )}
            >
              <div className="w-5 h-5 flex-shrink-0"> 
                <Heart size={20} fill={activeTab === 'favorites' ? 'currentColor' : 'none'} /> 
              </div>
              {!isOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 text-xs font-medium bg-black text-white rounded-md shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  Favorites
                </div>
              )}
              {isOpen && <p className="text-sm font-medium whitespace-nowrap">Favorites</p>}
            </button>
            
            {/* Favorites Content Panel */}
            {isOpen && activeTab === 'favorites' && (
              <div className="mt-2 ml-4 max-h-48 sm:max-h-64 overflow-y-auto pl-2 overflow-hidden-scrollable">
                <DynamicFavoritesPanel preloadedData={favoritesData} onDataChange={refreshData} />
              </div>
            )}
          </div>
          
          {/* History Button */}
          <div>
            <button 
              onClick={() => setActiveTab('history')} 
              className={cn(
                'group relative flex items-center w-full rounded-lg gap-x-3 cursor-pointer transition-colors duration-150 dark:hover:text-blue-400 hover:text-blue-400 touch-manipulation no-select', 
                activeTab === 'history' 
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700', 
                !isOpen && 'justify-center',
                isMobile ? 'min-h-touch p-3' : 'min-h-touch p-3'
              )}
            >
              <div className="w-5 h-5 flex-shrink-0"> 
                <HistoryIcon w={20} h={20} fill="currentColor" /> 
              </div>
              {!isOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 text-xs font-medium bg-black text-white rounded-md shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  History
                </div>
              )}
              {isOpen && <p className="text-sm font-medium whitespace-nowrap">History</p>}
            </button>
            
            {/* History Content Panel */}
            {isOpen && activeTab === 'history' && (
              <div className="mt-2 ml-4 max-h-48 sm:max-h-64 overflow-y-auto pl-2 overflow-hidden-scrollable">
                <DynamicHistoryPanel preloadedData={historyData} onDataChange={refreshData} />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Footer Section */}
      <div className="mt-auto pt-2 flex flex-col items-start relative">
        {/* Final Separator */}
        <hr className="border-gray-200 dark:border-gray-600 w-full mb-2" />
        <ThemeToggle isOpen={isOpen} />
      </div>
    </div>
  );
};

export default LeftSidebar;