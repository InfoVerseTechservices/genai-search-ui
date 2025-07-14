'use client';

import { useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import LeftSidebar from '@/components/LeftSidebar';
import MainNavBar from './MainNavBar';
import { getUserId } from '@/lib/cookies';
import crypto from 'crypto';

export default function LayoutClientWrapper({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);
  const router = useRouter();
  const pathname = usePathname();

  const handleNewChat = async () => {
    console.log('handleNewChat called');
    
    // Generate new chat ID
    const chatId = crypto.randomBytes(20).toString('hex');
    
    // Get userId from cookie
    const userId = getUserId();
    
    // Create new chat entry in database
    try {
      await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: chatId,
          title: 'Untitled Chat',
          focusMode: 'webSearch',
          files: [],
          userId: userId
        }),
      });
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
    
    router.push(`/c/${chatId}`);
  };

  const handleSaveToHistory = () => {
    console.log('handleSaveToHistory called');
  };

  return (
    <div className="flex h-screen min-h-screen-safe bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Desktop Sidebar - Only visible on desktop */}
      <aside
        className={cn(
          'hidden md:flex h-full fixed left-0 top-0 bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out z-20 border-r border-gray-200 dark:border-gray-700',
          'pt-safe-top pb-safe-bottom pl-safe-left',
          isSidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <LeftSidebar 
          onNewChat={handleNewChat} 
          onSaveToHistory={handleSaveToHistory}
          isOpen={isSidebarOpen} 
          onToggle={toggleSidebar} 
        />
      </aside>

      {/* Mobile Sidebar Overlay - Only shows when menu is clicked */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 animate-fade-in">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" 
            onClick={toggleMobileSidebar}
            onTouchStart={toggleMobileSidebar}
          />
          {/* Sidebar */}
          <aside className="relative w-80 max-w-[85vw] max-w-screen-safe h-full bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out animate-slide-up pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right">
            <LeftSidebar 
              onNewChat={() => { handleNewChat(); setIsMobileSidebarOpen(false); }} 
              onSaveToHistory={handleSaveToHistory}
              isOpen={true} 
              onToggle={toggleMobileSidebar}
              isMobile={true} 
            />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className={cn(
        'flex-1 flex flex-col transition-all duration-300 ease-in-out min-w-0',
        'pt-safe-top pb-safe-bottom pr-safe-right',
        isSidebarOpen ? 'md:ml-64' : 'md:ml-20'
      )}>
        <MainNavBar onMobileMenuToggle={toggleMobileSidebar} onMobileNewChat={handleNewChat}>
          <div className="flex-1 w-full max-w-screen-xl mx-auto overflow-y-auto p-3 sm:p-4 md:p-6">
            <div className="flex w-full gap-x-4 sm:gap-x-8 lg:gap-x-12 h-screen min-h-screen-safe">
              <main className="flex-1 flex flex-col min-w-0 relative h-full">
                {children}
              </main>
            </div>
          </div>
        </MainNavBar>
      </div>
    </div>
  );
}