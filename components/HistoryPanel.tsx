// 'use client';

// import React, { useState, useRef, useEffect } from 'react';
// import { Trash2, Share2, MoreHorizontal } from 'lucide-react';
// import Link from 'next/link';
// import { toast } from 'sonner';

// interface HistoryItem {
//   id: string;
//   title: string;
//   created_at: string;
// }

// const useClickOutside = (ref: React.RefObject<HTMLElement>, callback: () => void) => {
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (ref.current && !ref.current.contains(event.target as Node)) {
//         callback();
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [ref, callback]);
// };

// const useEscapeKey = (callback: () => void) => {
//   useEffect(() => {
//     const handleEscape = (event: KeyboardEvent) => {
//       if (event.key === 'Escape') {
//         callback();
//       }
//     };

//     document.addEventListener('keydown', handleEscape);
//     return () => {
//       document.removeEventListener('keydown', handleEscape);
//     };
//   }, [callback]);
// };

// const useFocusTrap = (ref: React.RefObject<HTMLElement>, isOpen: boolean) => {
//   useEffect(() => {
//     if (!isOpen || !ref.current) return;

//     const focusableElements = ref.current.querySelectorAll(
//       'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
//     );
//     const firstElement = focusableElements[0] as HTMLElement;
//     const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

//     const handleTabKey = (event: KeyboardEvent) => {
//       if (event.key !== 'Tab') return;

//       if (event.shiftKey) {
//         if (document.activeElement === firstElement) {
//           lastElement.focus();
//           event.preventDefault();
//         }
//       } else {
//         if (document.activeElement === lastElement) {
//           firstElement.focus();
//           event.preventDefault();
//         }
//       }
//     };

//     firstElement?.focus();
//     document.addEventListener('keydown', handleTabKey);

//     return () => {
//       document.removeEventListener('keydown', handleTabKey);
//     };
//   }, [isOpen, ref]);
// };

// const DeleteModal = ({
//   item,
//   onClose,
//   onConfirm,
// }: {
//   item: HistoryItem;
//   onClose: () => void;
//   onConfirm: () => void;
// }) => {
//   const modalRef = useRef<HTMLDivElement>(null);
//   useClickOutside(modalRef, onClose);
//   useEscapeKey(onClose);
//   useFocusTrap(modalRef, true);

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div
//         ref={modalRef}
//         className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl"
//         role="dialog"
//         aria-modal="true"
//         aria-labelledby="delete-modal-title"
//       >
//         <h3 id="delete-modal-title" className="text-lg font-medium mb-4">
//           Delete History Item
//         </h3>
//         <p className="mb-6">Are you sure you want to delete "{item.title}"?</p>
//         <div className="flex justify-end space-x-3">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onConfirm}
//             className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
//           >
//             Delete
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const ShareModal = ({
//   item,
//   onClose,
// }: {
//   item: HistoryItem;
//   onClose: () => void;
// }) => {
//   const modalRef = useRef<HTMLDivElement>(null);
//   const [copied, setCopied] = useState(false);
//   const inputRef = useRef<HTMLInputElement>(null);
  
//   useClickOutside(modalRef, onClose);
//   useEscapeKey(onClose);
//   useFocusTrap(modalRef, true);

//   const handleCopy = () => {
//     if (inputRef.current) {
//       navigator.clipboard.writeText(inputRef.current.value)
//         .then(() => {
//           setCopied(true);
//           setTimeout(() => setCopied(false), 2000);
//         })
//         .catch(() => {
//           // Handle copy error
//         });
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div
//         ref={modalRef}
//         className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl"
//         role="dialog"
//         aria-modal="true"
//         aria-labelledby="share-modal-title"
//       >
//         <h3 id="share-modal-title" className="text-lg font-medium mb-4">
//           Share History Item
//         </h3>
//         <p className="mb-2">Share "{item.title}"</p>
//         <div className="flex items-center mt-4 mb-6">
//           <input
//             ref={inputRef}
//             type="text"
//             readOnly
//             value={`https://colomboai.com/genai-search/library/${item.id}`}
//             className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md text-sm bg-gray-50 dark:bg-gray-700"
//             onClick={(e) => (e.target as HTMLInputElement).select()}
//           />
//           <button
//             onClick={handleCopy}
//             className="px-3 py-2 bg-blue-600 text-white text-sm rounded-r-md hover:bg-blue-700 min-w-16"
//           >
//             {copied ? 'Copied!' : 'Copy'}
//           </button>
//         </div>
//         <div className="flex justify-end">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const HistoryPanel = () => {
//   const [historyItems, setHistoryItems] = useState<HistoryItem[]>([
//     { id: '1', title: 'Chat about React components', created_at: '2023-05-15T10:30:00Z' },
//     { id: '2', title: 'Image generation prompt', created_at: '2023-05-14T15:45:00Z' },
//     { id: '3', title: 'Document analysis results', created_at: '2023-05-13T09:20:00Z' }
//   ]);

//   const [activeMenu, setActiveMenu] = useState<string | null>(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [showShareModal, setShowShareModal] = useState(false);
//   const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
//   const menuRef = useRef<HTMLDivElement>(null);

//   useClickOutside(menuRef, () => setActiveMenu(null));

//   const toggleMenu = (id: string, e: React.MouseEvent) => {
//     e.stopPropagation();
//     setActiveMenu(activeMenu === id ? null : id);
//   };

//   const handleDelete = (item: HistoryItem) => {
//     setSelectedItem(item);
//     setShowDeleteModal(true);
//     setActiveMenu(null);
//   };

//   const handleShare = (item: HistoryItem) => {
//     setSelectedItem(item);
//     setShowShareModal(true);
//     setActiveMenu(null);
//   };

//   const confirmDelete = () => {
//     if (selectedItem) {
//       setHistoryItems(historyItems.filter(item => item.id !== selectedItem.id));
//     }
//     setShowDeleteModal(false);
//   };

//   if (historyItems.length === 0) {
//     return (
//       <div className="py-4 text-center text-gray-500 dark:text-gray-400">
//         No history items found
//       </div>
//     );
//   }

//   return (
//     <div className="max-h-64 overflow-y-auto py-1">
//       <ul className="space-y-1">
//         {historyItems.map((item) => (
//           <li 
//             key={item.id} 
//             className="group flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2"
//           >
//             <a
//               // href={`https://colomboai.com/genai-search/library/${item.id}`}
//               href="/genai-search/library"
//               className="flex-grow text-sm text-gray-600 dark:text-gray-300 p-2 rounded-md transition-colors truncate hover:text-blue-600 dark:hover:text-blue-400"
//             >
//               <div className="flex items-center">
//                 <span className="truncate">{item.title}</span>
//               </div>
//             </a>

//             <div className="relative flex-shrink-0" ref={menuRef}>
//               <button
//                 onClick={(e) => toggleMenu(item.id, e)}
//                 aria-haspopup="true"
//                 aria-expanded={activeMenu === item.id}
//                 className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
//                 aria-label="More options"
//               >
//                 <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
//               </button>

//               {activeMenu === item.id && (
//                 <div 
//                   className="fixed left-60 z-20 w-40 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
//                   tabIndex={-1}
//                 >
//                   <div className="py-1">
//                     <button
//                       onClick={() => handleShare(item)}
//                       className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
//                     >
//                       <Share2 className="w-4 h-4 mr-2" />
//                       Share
//                     </button>
//                     <button
//                       onClick={() => handleDelete(item)}
//                       className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
//                     >
//                       <Trash2 className="w-4 h-4 mr-2" />
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </li>
//         ))}
//       </ul>

//       {showDeleteModal && selectedItem && (
//         <DeleteModal
//           item={selectedItem}
//           onClose={() => setShowDeleteModal(false)}
//           onConfirm={confirmDelete}
//         />
//       )}

//       {showShareModal && selectedItem && (
//         <ShareModal
//           item={selectedItem}
//           onClose={() => setShowShareModal(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default HistoryPanel;



// 'use client';

// import React, { useState, useRef, useEffect } from 'react';
// import { Trash2, Share2, MoreHorizontal } from 'lucide-react';
// import { toast } from 'sonner';

// // Types
// interface HistoryItem {
//   id: string;
//   title: string;
//   created_at: string;
// }

// // Reusable hooks for modal and UX
// const useClickOutside = (ref: React.RefObject<HTMLElement>, callback: () => void) => {
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (ref.current && !ref.current.contains(event.target as Node)) {
//         callback();
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [ref, callback]);
// };

// const useEscapeKey = (callback: () => void) => {
//   useEffect(() => {
//     const handleEscape = (event: KeyboardEvent) => {
//       if (event.key === 'Escape') callback();
//     };
//     document.addEventListener('keydown', handleEscape);
//     return () => document.removeEventListener('keydown', handleEscape);
//   }, [callback]);
// };

// // Delete Modal
// const DeleteModal = ({
//   item,
//   onClose,
//   onConfirm,
// }: {
//   item: HistoryItem;
//   onClose: () => void;
//   onConfirm: () => void;
// }) => {
//   const modalRef = useRef<HTMLDivElement>(null);
//   useClickOutside(modalRef, onClose);
//   useEscapeKey(onClose);

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div ref={modalRef} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
//         <h3 className="text-lg font-semibold mb-2">Delete History Item</h3>
//         <p className="mb-4">Are you sure you want to delete “{item.title}”?</p>
//         <div className="flex justify-end gap-2">
//           <button onClick={onClose} className="border px-4 py-2 rounded-md">Cancel</button>
//           <button onClick={onConfirm} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Delete</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Share Modal
// const ShareModal = ({ item, onClose }: { item: HistoryItem; onClose: () => void }) => {
//   const modalRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const [copied, setCopied] = useState(false);

//   useClickOutside(modalRef, onClose);
//   useEscapeKey(onClose);

//   const handleCopy = () => {
//     const link = `https://colomboai.com/genai-search/library/${item.id}`;
//     navigator.clipboard.writeText(link)
//       .then(() => {
//         setCopied(true);
//         toast.success('Link copied!');
//         setTimeout(() => setCopied(false), 2000);
//       })
//       .catch(() => toast.error('Copy failed'));
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div ref={modalRef} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
//         <h3 className="text-lg font-semibold mb-2">Share History Item</h3>
//         <input
//           ref={inputRef}
//           readOnly
//           value={`https://colomboai.com/genai-search/library/${item.id}`}
//           className="w-full mb-4 p-2 border rounded-md dark:bg-gray-700"
//         />
//         <div className="flex justify-between">
//           <button onClick={handleCopy} className="bg-blue-600 text-white px-4 py-2 rounded-md">
//             {copied ? 'Copied!' : 'Copy Link'}
//           </button>
//           <button onClick={onClose} className="border px-4 py-2 rounded-md">Close</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const HistoryPanel = () => {
//   const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
//   const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [showShareModal, setShowShareModal] = useState(false);
//   const [activeMenu, setActiveMenu] = useState<string | null>(null);

//   const menuRef = useRef<HTMLDivElement>(null);
//   useClickOutside(menuRef, () => setActiveMenu(null));

//   // Load from localStorage
//   useEffect(() => {
//     const stored = localStorage.getItem('historyItems');
//     if (stored) {
//       setHistoryItems(JSON.parse(stored));
//     }
//   }, []);

//   // Save to localStorage
//   useEffect(() => {
//     localStorage.setItem('historyItems', JSON.stringify(historyItems));
//   }, [historyItems]);

//   const confirmDelete = () => {
//     if (selectedItem) {
//       const updated = historyItems.filter(item => item.id !== selectedItem.id);
//       setHistoryItems(updated);
//       setShowDeleteModal(false);
//     }
//   };

//   if (!historyItems.length) {
//     return <div className="text-center text-gray-500 dark:text-gray-400 py-4">No history yet</div>;
//   }

//   return (
//     <div className="max-h-64 overflow-y-auto py-1">
//       <ul className="space-y-1">
//         {historyItems.map((item) => (
//           <li key={item.id} className="group flex items-center justify-between px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
//             <a
//               href={`https://colomboai.com/genai-search/library/${item.id}`}
//               className="flex-grow text-sm truncate p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
//             >
//               {item.title}
//             </a>
//             <div className="relative" ref={menuRef}>
//               <button
//                 onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
//                 className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
//               >
//                 <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-300" />
//               </button>

//               {activeMenu === item.id && (
//                 <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
//                   <button
//                     onClick={() => {
//                       setSelectedItem(item);
//                       setShowShareModal(true);
//                       setActiveMenu(null);
//                     }}
//                     className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
//                   >
//                     <Share2 className="inline-block mr-2" /> Share
//                   </button>
//                   <button
//                     onClick={() => {
//                       setSelectedItem(item);
//                       setShowDeleteModal(true);
//                       setActiveMenu(null);
//                     }}
//                     className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
//                   >
//                     <Trash2 className="inline-block mr-2" /> Delete
//                   </button>
//                 </div>
//               )}
//             </div>
//           </li>
//         ))}
//       </ul>

//       {showDeleteModal && selectedItem && (
//         <DeleteModal item={selectedItem} onClose={() => setShowDeleteModal(false)} onConfirm={confirmDelete} />
//       )}

//       {showShareModal && selectedItem && (
//         <ShareModal item={selectedItem} onClose={() => setShowShareModal(false)} />
//       )}
//     </div>
//   );
// };

// export default HistoryPanel;



'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
// 1. Import Link and usePathname for proper navigation and active state
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trash2, Share2, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils'; // Assuming you have this utility for class names

// --- Types ---
interface HistoryItem {
  id: string; // This will now match the [chatId] in the URL
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
        // TODO: Replace this with your actual API call
        // const response = await fetch('/api/chats');
        // const data = await response.json();
        // setHistoryItems(data.chats);

        // For demonstration, we'll use a dummy delay and localStorage
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
    // TODO: Send DELETE request to your API
    // await fetch(`/api/chats/${selectedItem.id}`, { method: 'DELETE' });

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