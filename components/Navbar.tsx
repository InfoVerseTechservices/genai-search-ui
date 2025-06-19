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


  // If there are no messages, perhaps don't render the navbar content related to a specific chat?
  // Or render a default state. For now, it will render with empty title/time.
  // The user wants top-right icons for New Chat / History on mobile (added in ChatWindow.tsx)
  // So this Navbar might be simpler or focus on context of current chat, if any.

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

      {/* Right side: Actions (currently commented out, but kept for structure if needed later) */}
      {/* The user requested New Chat and History icons in ChatWindow.tsx for mobile top-right, so this area might be empty or for other desktop actions */}
      <div className="flex flex-row items-center space-x-4">
        {/* Example: Edit icon previously for mobile, now back button is primary mobile-left action */}
        {/* <Edit
          size={17}
          className="active:scale-95 transition duration-100 cursor-pointer lg:hidden" // This was the old mobile edit
        /> */}
        {/* <Share
          size={17}
          className="active:scale-95 transition duration-100 cursor-pointer"
        /> */}
        {/* <Trash
          size={17}
          className="text-red-400 active:scale-95 transition duration-100 cursor-pointer"
        /> */}
      </div>
    </div>
  );
};

export default Navbar;
