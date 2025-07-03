
import React, { ReactNode } from 'react';
import Image from 'next/image';

export const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export const getCookie = (name: string): string => `dummy-token-for-${name}`;

export const ChatSkeleton = ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
  <Image
    src={src}
    alt={alt}
    className={cn(className, 'bg-gray-300 dark:bg-gray-600')}
    width={40}
    height={40}
    unoptimized
/>
);

export const LeftSidebar = ({ isOpen, onToggle, onNewChat }: { isOpen: boolean; onToggle: () => void; onNewChat: () => void; }) => (
  <div className="flex flex-col items-center w-full p-2 space-y-4 bg-gray-100 dark:bg-gray-800 h-full">
    <button onClick={onToggle} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">{isOpen ? '<' : '>'}</button>
    <button onClick={onNewChat} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">New</button>
  </div>
);

export const useLayout = () => ({
  rightSidebarContent: {
    query: 'modern architecture',
    history: [{ role: 'user', content: 'Show me ideas for a new building' }] as Message[],
  },
});

export const MainNavBar = ({ children }: { children: ReactNode }) => (
  <>
    <header className="h-16 flex-shrink-0 border-b border-gray-200 dark:border-gray-700 flex items-center px-6">
      <h1 className="text-lg font-semibold">My App</h1>
    </header>
    {children}
  </>
);
export const Layout = MainNavBar;