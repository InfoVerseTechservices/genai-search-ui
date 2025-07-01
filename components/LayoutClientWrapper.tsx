'use client';

import { useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import LeftSidebar from '@/components/LeftSidebar';

import { useLayout } from '@/app/context/LayoutContext';
import RelatedImages from './GetOneImage';
import SearchImages from './SearchImages';
import SearchVideos from './SearchVideos';
import SideTopAdComponent from './Ads/SideAdTop';
import SideBottomAdComponent from './Ads/SideAdBottom';
import MainNavBar from './MainNavBar'; 
import Layout from './MainNavBar';

const RightSidebar = () => {
  const { rightSidebarContent } = useLayout();
  const [isImageSearchVisible, setIsImageSearchVisible] = useState(true);
  const [isVideoSearchVisible, setIsVideoSearchVisible] = useState(true);
  
  const handleImageSearchCompletion = (success: boolean) => { /* ... */ };
  const handleVideoSearchCompletion = (success: boolean) => { /* ... */ };

  if (!rightSidebarContent) return null;
  const { query, history } = rightSidebarContent;

  return (
    <aside className="hidden xl:block w-[300px] flex-shrink-0">
      <div className="sticky top-6 flex flex-col space-y-4">
        <RelatedImages chat_history={history} query={query} />
        {isImageSearchVisible && <SearchImages query={query} chat_history={history} complete={handleImageSearchCompletion} visible={true} />}
        {isVideoSearchVisible && <SearchVideos query={query} chat_history={history} complete={handleVideoSearchCompletion} visible={true} />}
        <SideTopAdComponent divid={`top-ad-sidebar`} />
        <SideBottomAdComponent divid={`bottom-ad-sidebar`} />
      </div>
    </aside>
  );
};


export default function LayoutClientWrapper({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const router = useRouter();
  const pathname = usePathname();

  const handleNewChat = () => {
    router.push('/');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      <aside
        className={cn(
          'hidden md:flex h-full fixed left-0 top-0 bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out z-20 border-r border-gray-200 dark:border-gray-700',
          isSidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <LeftSidebar onNewChat={handleNewChat} isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      </aside>

      
      <div className={cn('flex-1 flex flex-col transition-all duration-300 ease-in-out', isSidebarOpen ? 'md:ml-64' : 'md:ml-20')}>
          
          <Layout >

          

          <div className="relative flex-1 w-full max-w-screen-xl mx-auto overflow-y-auto p-4 md:p-6">
              <div className="flex w-full gap-x-12">
                  <main key={pathname} className="flex-1 flex flex-col min-w-0 relative ">
                      {children}
                  </main>

                  <RightSidebar />
              </div>
          </div>
</Layout>
      </div>

    </div>
  );
}