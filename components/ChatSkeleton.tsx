'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react'; 
import Image from 'next/image';

interface ChatSkeletonProps extends React.ComponentPropsWithoutRef<'img'> {
}

const ChatSkeleton = ({ src, alt, className, width, height, ...props }: ChatSkeletonProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const parsedWidth = typeof width === 'string' ? parseInt(width, 10) : width;
  const parsedHeight = typeof height === 'string' ? parseInt(height, 10) : height;

  return (
    <div className={cn('relative bg-gray-200 dark:bg-gray-700 overflow-hidden', className)}>
      {isLoading && (
        <div className="absolute inset-0 w-full h-full animate-pulse" />
      )}

      {hasError && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <Image
        src={src as string}
        alt={alt ?? ''}
        fill
        width={parsedWidth}
        height={parsedHeight}
        className={cn(
          'object-cover transition-opacity duration-300',
          {
            'opacity-0': isLoading || hasError, 
            'opacity-100': !isLoading && !hasError, 
          }
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      
    </div>
  );
};

export default ChatSkeleton;