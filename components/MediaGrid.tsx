'use client';

import React from 'react';
import { cn } from '@/components/SharedPlaceholder'; 

interface MediaGridProps {
  query: string;
  chat_history: any;
}

const MediaGrid: React.FC<MediaGridProps> = ({ query, chat_history }) => {
 
  const mediaItems = [
    { id: 'img-1', type: 'image' },
    { id: 'img-2', type: 'image' },
   
    { id: 'vid-1', type: 'video' },
    { id: 'vid-2', type: 'video' },
   
  ];

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
        Related Media
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {mediaItems.map(item => (
          <div
            key={item.id}
            className={cn(
              'flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700 cursor-pointer hover:opacity-80',
              item.type === 'video' ? 'aspect-video' : 'aspect-square'
            )}
          >
            {item.type === 'video' ? (
              // Video Icon
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.55a1 1 0 011.45.89v6.22a1 1 0 01-1.45.89L15 15M4 6h10a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" /></svg>
            ) : (
              // Image Icon
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1-1m6-3l-2 2"></path></svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaGrid;