'use client';

import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useCallback } from 'react';

export interface HistoryItem {
  id: string;
  title: string;
  created_at: string;
}

interface ChatContextType {
  currentChatId: string | null;
  setCurrentChatId: Dispatch<SetStateAction<string | null>>;
  history: HistoryItem[];
  setHistory: Dispatch<SetStateAction<HistoryItem[]>>;
  refreshHistory: () => void; 
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const refreshHistory = useCallback(() => setRefreshTrigger(t => t + 1), []);

  return (
    <ChatContext.Provider value={{ currentChatId, setCurrentChatId, history, setHistory, refreshHistory }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};