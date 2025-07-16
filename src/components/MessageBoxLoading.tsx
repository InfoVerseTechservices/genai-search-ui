'use client';

import { BookCopy, Disc3 } from 'lucide-react';

const SkeletonLine = ({ className }: { className?: string }) => {
  return (
    <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse ${className}`} />
  );
};

const MessageBoxLoading = () => {
  return (
    <div className='dark:text-white px-2 sm:px-4 py-5 flex flex-col'>
      {/* Skeleton for an assistant message */}
      <div className="w-full flex flex-col space-y-6">
        {/* Skeleton for Sources */}
        <div className="flex flex-col space-y-2">
          <div className="flex flex-row items-center space-x-2">
            <BookCopy className="text-gray-400 dark:text-gray-600" size={20} />
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
        
        {/* Skeleton for Answer */}
        <div className="flex flex-col space-y-3">
          <div className="flex flex-row items-center space-x-2">
            <Disc3 className="text-gray-400 dark:text-gray-600 animate-spin" size={20} />
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          </div>
          
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-[90%]" />
          <SkeletonLine className="w-[95%]" />
          <div className="pt-4" /> {/* Spacer */}
          <SkeletonLine className="w-[85%]" />
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-[70%]" />
        </div>
      </div>
    </div>
  );
};

export default MessageBoxLoading;