'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trash2, Share2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUserId } from '@/lib/cookies';

// Types
interface HistoryItem {
  id: string;
  title: string;
  created_at: string;
  updatedAt?: string;
}

// Reusable hooks
const useClickOutside = (ref: React.RefObject<HTMLElement>, callback: () => void) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, callback]);
};

// Modal Component
const Modal = ({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, onClose);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full animate-in fade-in-0 zoom-in-95"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{title}</h3>
        {children}
      </div>
    </div>
  );
};

// Main HistoryPanel Component
const HistoryPanel = ({ preloadedData, onDataChange }: { preloadedData?: any[]; onDataChange?: () => void }) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [modalType, setModalType] = useState<'delete' | 'share' | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  useClickOutside(menuRef, () => setActiveMenu(null));

  // Fetch history from API
  const fetchHistory = useCallback(async () => {
    if (preloadedData && preloadedData.length >= 0) {
      const formattedHistory = preloadedData.map((chat: any) => {
        let displayTitle = chat.title || 'New Chat';
        if (displayTitle === 'Untitled Chat') {
          displayTitle = 'New Chat';
        } else if (displayTitle !== 'New Chat') {
          // Limit title to 3-5 words for display
          const words = displayTitle.trim().split(/\s+/);
          displayTitle = words.slice(0, Math.min(5, words.length)).join(' ');
        }
        return {
          id: chat.id || chat._id,
          title: displayTitle,
          created_at: chat.createdAt,
          updatedAt: chat.updatedAt || chat.createdAt,
        };
      }).sort((a, b) => new Date(b.updatedAt || b.created_at).getTime() - new Date(a.updatedAt || a.created_at).getTime());
      setHistoryItems(formattedHistory);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const userId = getUserId();
      const url = userId ? `/api/chats?userId=${userId}&limit=20` : '/api/chats?limit=20';
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data.chats?.length > 0) {
          const formattedHistory = data.chats.map((chat: any) => {
            let displayTitle = chat.title || 'New Chat';
            if (displayTitle === 'Untitled Chat') {
              displayTitle = 'New Chat';
            } else if (displayTitle !== 'New Chat') {
              // Limit title to 3-5 words for display
              const words = displayTitle.trim().split(/\s+/);
              displayTitle = words.slice(0, Math.min(5, words.length)).join(' ');
            }
            return {
              id: chat.id || chat._id,
              title: displayTitle,
              created_at: chat.createdAt,
              updatedAt: chat.updatedAt || chat.createdAt,
            };
          }).sort((a: HistoryItem, b: HistoryItem) => new Date(b.updatedAt || b.created_at).getTime() - new Date(a.updatedAt || a.created_at).getTime());
          setHistoryItems(formattedHistory);
        } else {
          setHistoryItems([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setHistoryItems([]);
    } finally {
      setLoading(false);
    }
  }, [preloadedData]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, preloadedData]);

  const openModal = (item: HistoryItem, type: 'delete' | 'share') => {
    setSelectedItem(item);
    setModalType(type);
    setActiveMenu(null);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setModalType(null);
  };

  const confirmDelete = useCallback(async () => {
    if (!selectedItem || !selectedItem.id) {
      console.error('No item selected or missing ID');
      closeModal();
      return;
    }
    
    try {
      const response = await fetch(`/api/chats/${selectedItem.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchHistory(); // Refresh the history
        onDataChange?.(); // Notify parent to refresh
        console.log(`Deleted "${selectedItem.title}"`);
      } else {
        const errorData = await response.text();
        console.error('Failed to delete chat:', response.status, errorData);
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
    
    closeModal();
  }, [selectedItem, fetchHistory]);

  const copyShareLink = useCallback(async () => {
    if (!selectedItem) return;
    
    try {
      const link = `${window.location.origin}/c/${selectedItem.id}`;
      await navigator.clipboard.writeText(link);
      // You can add toast notification here
      console.log('Link copied!');
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
    closeModal();
  }, [selectedItem]);

  if (loading) {
    return <div className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">Loading history...</div>;
  }

  if (!historyItems.length) {
    return <div className="text-left text-gray-500 dark:text-gray-400 py-4 text-sm pl-6">No history yet</div>;
  }
  
  return (
    <div className="overflow-y-auto py-1 pr-1">
      <ul className="space-y-1">
        {historyItems.map((item, index) => {
          const isActive = pathname === `/c/${item.id}`;
          return (
            <li
              key={`${item.id}-${index}`}
              className={cn(
                "group flex items-center justify-between px-2 py-1 rounded-md transition-colors",
                isActive
                  ? "bg-blue-100 dark:bg-blue-900/50"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <Link
                href={`/c/${item.id}`}
                className={cn(
                  "flex-grow text-xs truncate py-1",
                   isActive
                    ? "text-blue-600 dark:text-blue-400 font-medium"
                    : "text-gray-600 dark:text-gray-400"
                )}
                title={item.title || "Untitled Chat"}
              >
                {item.title || "Untitled Chat"}
              </Link>

              <div className="relative flex-shrink-0" ref={activeMenu === item.id ? menuRef : null}>
                <button
                  onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                  className="p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                  aria-label="More options"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                </button>

                {activeMenu === item.id && (
                  <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700 animate-in fade-in-0 zoom-in-95">
                    <button onClick={() => openModal(item, 'share')} className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Share2 size={14} /> Share
                    </button>
                    <button onClick={() => openModal(item, 'delete')} className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Delete Modal */}
      {modalType === 'delete' && selectedItem && (
        <Modal title="Delete Chat" onClose={closeModal}>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Are you sure you want to delete &quot;<span className="font-medium">{selectedItem.title || 'this chat'}</span>&quot;? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button onClick={closeModal} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button onClick={confirmDelete} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Delete</button>
          </div>
        </Modal>
      )}

      {/* Share Modal */}
      {modalType === 'share' && selectedItem && (
        <Modal title="Share Chat" onClose={closeModal}>
           <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">Anyone with the link can view this conversation.</p>
           <div className="flex justify-end gap-2">
              <button onClick={closeModal} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={copyShareLink} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Copy Link</button>
           </div>
        </Modal>
      )}
    </div>
  );
};

export default HistoryPanel;