'use client';

import { createContext, useState, useContext, ReactNode } from 'react';
import type { Message } from '@/components/ChatWindow'; 

export interface RightSidebarContent {
  query: string;
  history: Message[];
}

interface LayoutContextType {
  rightSidebarContent: RightSidebarContent | null;
  setRightSidebarContent: (content: RightSidebarContent | null) => void;
}


const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [rightSidebarContent, setRightSidebarContent] = useState<RightSidebarContent | null>(null);

  const value = { rightSidebarContent, setRightSidebarContent };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};