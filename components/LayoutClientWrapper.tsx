'use client';

import { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import LeftSidebar from '@/components/LeftSidebar';

export default function LayoutClientWrapper({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
     
      <aside
        className={cn(
          'hidden md:flex h-full fixed left-0 top-0 bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out z-20 border-r border-gray-200 dark:border-gray-700',
          isSidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <LeftSidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      </aside>

    
      <main
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-y-auto',
          isSidebarOpen ? 'md:ml-64' : 'md:ml-20'
        )}
      >
        {children}
      </main>
    </div>
  );
}