'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Share2, MoreHorizontal } from 'lucide-react';

interface HistoryItem {
  id: string;
  title: string;
  created_at: string;
}

const useClickOutside = (ref: React.RefObject<HTMLElement>, callback: () => void) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};

const useEscapeKey = (callback: () => void) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [callback]);
};

const useFocusTrap = (ref: React.RefObject<HTMLElement>, isOpen: boolean) => {
  useEffect(() => {
    if (!isOpen || !ref.current) return;

    const focusableElements = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    };

    firstElement?.focus();
    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen, ref]);
};

const DeleteModal = ({
  item,
  onClose,
  onConfirm,
}: {
  item: HistoryItem;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, onClose);
  useEscapeKey(onClose);
  useFocusTrap(modalRef, true);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        <h3 id="delete-modal-title" className="text-lg font-medium mb-4">
          Delete History Item
        </h3>
        <p className="mb-6">Are you sure you want to delete "{item.title}"?</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ShareModal = ({
  item,
  onClose,
}: {
  item: HistoryItem;
  onClose: () => void;
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useClickOutside(modalRef, onClose);
  useEscapeKey(onClose);
  useFocusTrap(modalRef, true);

  const handleCopy = () => {
    if (inputRef.current) {
      navigator.clipboard.writeText(inputRef.current.value)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          // Handle copy error
        });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
      >
        <h3 id="share-modal-title" className="text-lg font-medium mb-4">
          Share History Item
        </h3>
        <p className="mb-2">Share "{item.title}"</p>
        <div className="flex items-center mt-4 mb-6">
          <input
            ref={inputRef}
            type="text"
            readOnly
            value={`https://colomboai.com/genai-search/library/${item.id}`}
            className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md text-sm bg-gray-50 dark:bg-gray-700"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            onClick={handleCopy}
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-r-md hover:bg-blue-700 min-w-16"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const HistoryPanel = () => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([
    { id: '1', title: 'Chat about React components', created_at: '2023-05-15T10:30:00Z' },
    { id: '2', title: 'Image generation prompt', created_at: '2023-05-14T15:45:00Z' },
    { id: '3', title: 'Document analysis results', created_at: '2023-05-13T09:20:00Z' }
  ]);

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setActiveMenu(null));

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  const handleDelete = (item: HistoryItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
    setActiveMenu(null);
  };

  const handleShare = (item: HistoryItem) => {
    setSelectedItem(item);
    setShowShareModal(true);
    setActiveMenu(null);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      setHistoryItems(historyItems.filter(item => item.id !== selectedItem.id));
    }
    setShowDeleteModal(false);
  };

  if (historyItems.length === 0) {
    return (
      <div className="py-4 text-center text-gray-500 dark:text-gray-400">
        No history items found
      </div>
    );
  }

  return (
    <div className="max-h-64 overflow-y-auto py-1">
      <ul className="space-y-1">
        {historyItems.map((item) => (
          <li 
            key={item.id} 
            className="group flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2"
          >
            <a
              href={`https://colomboai.com/genai-search/library/${item.id}`}
              className="flex-grow text-sm text-gray-600 dark:text-gray-300 p-2 rounded-md transition-colors truncate hover:text-blue-600 dark:hover:text-blue-400"
            >
              <div className="flex items-center">
                <span className="truncate">{item.title}</span>
              </div>
            </a>

            <div className="relative flex-shrink-0" ref={menuRef}>
              <button
                onClick={(e) => toggleMenu(item.id, e)}
                aria-haspopup="true"
                aria-expanded={activeMenu === item.id}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                aria-label="More options"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>

              {activeMenu === item.id && (
                <div 
                  className="fixed left-60 z-20 w-40 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  tabIndex={-1}
                >
                  <div className="py-1">
                    <button
                      onClick={() => handleShare(item)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {showDeleteModal && selectedItem && (
        <DeleteModal
          item={selectedItem}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
        />
      )}

      {showShareModal && selectedItem && (
        <ShareModal
          item={selectedItem}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default HistoryPanel;