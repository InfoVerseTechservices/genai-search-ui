'use client';

import { createContext, useState, useContext, ReactNode } from 'react';
import type { Message } from '@/components/ChatWindow'; // Adjust path if needed

// Define what the right sidebar needs to render
export interface RightSidebarContent {
  query: string;
  history: Message[];
}

// Define the shape of our context: a value and a function to update it
interface LayoutContextType {
  rightSidebarContent: RightSidebarContent | null;
  setRightSidebarContent: (content: RightSidebarContent | null) => void;
}

// Create the context
const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

// Create the Provider component that will wrap our app
export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [rightSidebarContent, setRightSidebarContent] = useState<RightSidebarContent | null>(null);

  const value = { rightSidebarContent, setRightSidebarContent };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

// Create a custom hook to easily use the context
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};