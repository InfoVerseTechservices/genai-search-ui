'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trash2, Share2, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils'; 

// --- Types ---
interface HistoryItem {
  id: string; 
  title: string;
  created_at: string;
}

// --- Reusable hooks (no changes needed) ---
const useClickOutside = (ref: React.RefObject<HTMLElement>, callback: () => void) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, callback]);
};

// --- Reusable Modal Component ---
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

// --- Main HistoryPanel Component ---
const HistoryPanel = () => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [modalType, setModalType] = useState<'delete' | 'share' | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 2. Get the current URL path to determine the active chat
  const pathname = usePathname();

  useClickOutside(menuRef, () => setActiveMenu(null));

  // --- Fetch history from API ---
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
      
        const stored = localStorage.getItem('historyItems');
        setTimeout(() => {
          if (stored) {
            setHistoryItems(JSON.parse(stored));
          } else {
             // Add dummy data if nothing is in localStorage
             const dummyData = [{id: 'abc-123', title: 'Example Chat', created_at: new Date().toISOString()}];
             setHistoryItems(dummyData);
             localStorage.setItem('historyItems', JSON.stringify(dummyData));
          }
          setLoading(false);
        }, 500);

      } catch (error) {
        console.error("Failed to fetch history:", error);
        toast.error("Could not load chat history.");
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // --- Handlers for modals ---
  const openModal = (item: HistoryItem, type: 'delete' | 'share') => {
    setSelectedItem(item);
    setModalType(type);
    setActiveMenu(null);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setModalType(null);
  };

  const confirmDelete = useCallback(() => {
    if (!selectedItem) return;
    

    setHistoryItems((prev) => prev.filter(item => item.id !== selectedItem.id));
    toast.success(`Deleted "${selectedItem.title}"`);
    closeModal();
  }, [selectedItem]);

  const copyShareLink = useCallback(() => {
    if (!selectedItem) return;
    const link = `${window.location.origin}/chat/${selectedItem.id}`;
    navigator.clipboard.writeText(link)
      .then(() => toast.success('Link copied!'))
      .catch(() => toast.error('Copy failed'));
  }, [selectedItem]);


  if (loading) {
    return <div className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">Loading history...</div>;
  }

  if (!historyItems.length) {
    return <div className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">No history yet</div>;
  }

  return (
    <div className="max-h-64 overflow-y-auto py-1 pr-1">
      <ul className="space-y-1">
        {historyItems.map((item) => {
          // 3. Check if the current item is the active one
          const isActive = pathname === `/chat/${item.id}`;
          return (
            <li
              key={item.id}
              className={cn(
                "group flex items-center justify-between px-2 rounded-md transition-colors",
                isActive
                  ? "bg-blue-100 dark:bg-blue-900/50"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              {/* 4. Use Next.js Link for client-side navigation */}
              <Link
                href={`/chat/${item.id}`}
                className={cn(
                  "flex-grow text-sm truncate p-2",
                   isActive
                    ? "text-blue-600 dark:text-blue-400 font-medium"
                    : "text-gray-700 dark:text-gray-300"
                )}
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

      {/* --- Reusable Modal Logic --- */}
      {modalType === 'delete' && selectedItem && (
        <Modal title="Delete Chat" onClose={closeModal}>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Are you sure you want to delete “<span className="font-medium">{selectedItem.title || 'this chat'}</span>”? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button onClick={closeModal} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button onClick={confirmDelete} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Delete</button>
          </div>
        </Modal>
      )}

      {modalType === 'share' && selectedItem && (
        <Modal title="Share Chat" onClose={closeModal}>
           <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">Anyone with the link can view this conversation.</p>
           <div className="flex items-center gap-2">
              <input
                  readOnly
                  value={`${window.location.origin}/chat/${selectedItem.id}`}
                  className="w-full p-2 text-sm border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
              />
              <button onClick={copyShareLink} className="bg-blue-600 text-white px-4 py-2 rounded-md whitespace-nowrap">Copy</button>
           </div>
        </Modal>
      )}
    </div>
  );
};

export default HistoryPanel;