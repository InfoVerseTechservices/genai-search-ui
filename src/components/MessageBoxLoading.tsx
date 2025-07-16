'use client';

import { BookCopy, Disc3 } from 'lucide-react';

const SkeletonLine = ({ className }: { className?: string }) => {
  return (
    <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse ${className}`} />
  );
};

const MessageBoxLoading = ({ focusMode }: { focusMode?: string }) => {
  const isWebSearch = focusMode === 'webSearch';
  
  return (
    <div className={`flex flex-col space-y-6 sm:space-y-9 ${isWebSearch ? 'lg:space-y-0 lg:flex-row lg:justify-between lg:space-x-9' : ''} px-2 sm:px-0`}>
      <div className={`flex flex-col space-y-4 sm:space-y-6 w-full ${isWebSearch ? 'lg:w-9/12' : ''} min-w-0`}>
        {isWebSearch && (
          <div className="flex flex-col space-y-2">
            <div className="flex flex-row items-center space-x-2">
              <BookCopy className="text-gray-400 dark:text-gray-600" size={18} />
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col space-y-3">
          <div className="flex flex-row items-center space-x-2">
            <Disc3 className="text-gray-400 dark:text-gray-600 animate-spin" size={18} />
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          </div>
          
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-[90%]" />
          <SkeletonLine className="w-[95%]" />
          <div className="pt-4" />
          <SkeletonLine className="w-[85%]" />
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-[70%]" />
        </div>
      </div>
      
      {isWebSearch && (
        <div className="lg:sticky lg:top-20 flex flex-col items-center space-y-3 w-full lg:w-3/12 z-30 h-full pb-4 px-2 sm:px-0">
          <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default MessageBoxLoading;