
'use client';

import React, { useState, useEffect } from 'react';
import { Message } from './ChatWindow';
import { getCookie } from '@/components/LeftSidebar/cookies';
import SkeletonImage from "@/components/ChatSkeleton"

interface Image {
  img_src: string;
  title: string;
  url: string;
}

interface RelatedImagesProps {
  chat_history: Message[];
  query: string;
}

const ContainerSkeleton = () => {
  
  return (
    <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
  );
};

const RelatedImages: React.FC<RelatedImagesProps> = ({
  chat_history,
  query,
}) => {
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedImage = async () => {
      if (!query) {
        setIsLoading(false);
        setImages([]);
        return;
      }
      
      setIsLoading(true);
      setError(null);

      try {
        const chatModelProvider = localStorage.getItem('chatModelProvider');
        const chatModel = localStorage.getItem('chatModel');

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: getCookie('token'),
          },
          body: JSON.stringify({
            query: query,
            chat_history: chat_history,
            chat_model_provider: chatModelProvider,
            chat_model: chatModel,
          }),
        });

        if (!res.ok) {
          throw new Error(`API request failed with status ${res.status}`);
        }

        const data = await res.json();
        
        
        setImages(data.images && data.images.length > 0 ? [data.images[0]] : []);

      } catch (err) {
        console.error('Error fetching related image:', err);
        setError('Failed to load image.');
        setImages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedImage();
  }, [chat_history, query]); 
  if (isLoading) {
    return <ContainerSkeleton />;
  }

  
  if (error) {
    return null;
  }

  if (images.length === 0) {
    return null;
  }

  const image = images[0];
  
  return (
    <a href={image.url} target="_blank" rel="noopener noreferrer" className="block">
      <SkeletonImage
        src={image.img_src}
        alt={image.title}
        className="w-full aspect-video object-cover rounded-lg hover:scale-[1.02] cursor-pointer transition-transform duration-200"
      />
    </a>
  );
};

export default RelatedImages;