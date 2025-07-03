// components/Navbar.tsx
'use client'; // Add 'use client' if using hooks like useRouter

import { Clock, Edit, Share, Trash, ArrowLeft } from 'lucide-react'; // Added ArrowLeft
import { Message } from './ChatWindow';
import { useEffect, useState } from 'react';
import { formatTimeDifference } from '@/lib/utils';
import { useRouter } from 'next/navigation'; // Import useRouter

const Navbar = ({ messages }: { messages: Message[] }) => {
  const [title, setTitle] = useState<string>('');
  const [timeAgo, setTimeAgo] = useState<string>('');
  const router = useRouter(); // Initialize router

  useEffect(() => {
    if (messages.length > 0) {
      const newTitle =
        messages[0].content.length > 20
          ? `${messages[0].content.substring(0, 20).trim()}...`
          : messages[0].content;
      setTitle(newTitle);
      const newTimeAgo = formatTimeDifference(
        new Date(),
        messages[0].createdAt,
      );
      setTimeAgo(newTimeAgo);
    } else {
      // Clear title and timeAgo if there are no messages (e.g., new chat after clearing)
      setTitle('');
      setTimeAgo('');
    }
  }, [messages]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (messages.length > 0) {
        const newTimeAgo = formatTimeDifference(
          new Date(),
          messages[0].createdAt,
        );
        setTimeAgo(newTimeAgo);
      }
    }, 1000); // Update time ago every second

    return () => clearInterval(intervalId);
  }, [messages]); // Rerun if messages array changes (e.g. new chat)


  

  return (
    <div className="fixed z-30 top-0 left-0 right-0 px-4 lg:pl-[calc(5%+1rem)] xl:pl-[calc(5%+1rem)] flex flex-row items-center justify-between w-full py-3 h-[50px] text-sm text-black dark:text-white/70 border-b bg-light-primary dark:bg-dark-primary border-light-100 dark:border-dark-200">
      {/* Left side: Back button (mobile only) and potentially chat title (desktop) */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => router.back()}
          title="Go back"
          className="p-2 text-black dark:text-white/70 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 md:hidden" // Visible only on mobile (screens smaller than md)
        >
          <ArrowLeft size={20} />
        </button>
        {/* Desktop: Show chat title and time ago. Mobile: This will be hidden by ChatWindow's top-right icons area or needs coordination */}
        {title && (
          <div className="hidden md:flex flex-row items-center justify-center space-x-2">
            <Clock size={17} />
            <p className="text-xs">{timeAgo} ago</p>
            <p className="hidden lg:flex text-base font-medium">{title}</p>
          </div>
        )}
      </div>

    
      <div className="flex flex-row items-center space-x-4">
       
      </div>
    </div>
  );
};

export default Navbar;
