'use client';

import { useState, useEffect } from 'react';
import { Video as VideoIcon, PlayCircle } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { Message } from './ChatWindow';
import { getCookie } from '@/components/LeftSidebar/cookies';
import Image from 'next/image';

type VideoResult = {
  url: string;
  img_src: string; 
  title: string;
};

// --- Reusable, Styled Video Thumbnail Card ---
const VideoCard = ({ thumbnailUrl, link }: { thumbnailUrl: string; link: string; }) => (
  <a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    className="group relative block aspect-video w-full overflow-hidden rounded-lg cursor-pointer"
  >
    <Image
      src={thumbnailUrl}
      alt="Related video thumbnail"
      className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
      loading="lazy"
      fill
      sizes="(max-width: 768px) 100vw, 33vw"
      style={{ objectFit: 'cover' }}
    />
    <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
      <PlayCircle className="h-8 w-8 text-white" />
    </div>
  </a>
);

// --- Styled Skeleton Loader ---
const SearchVideosSkeleton = () => (
    <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-3">
        <div className="flex items-center space-x-2 mb-3">
            <VideoIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <div className="h-5 w-28 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 gap-2">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="aspect-video w-full rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ))}
        </div>
    </div>
);


const SearchVideos = ({ query, chat_history, complete, visible }: { query: string; chat_history: Message[]; complete?: (success: boolean) => void; visible: boolean; }) => {
    const [videos, setVideos] = useState<VideoResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!query) {
            setLoading(false);
            return;
        }
        
        const fetchVideos = async () => {
            setLoading(true);
            setError(null);
            try {
                // IMPORTANT: Change this to your actual video search API endpoint
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/videos`, { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: getCookie('token') },
                    body: JSON.stringify({ query, chat_history }),
                });

                if (!res.ok) throw new Error('Failed to fetch videos');

                const data = await res.json();
                if (data.videos && data.videos.length > 0) {
                    setVideos(data.videos);
                    complete?.(true);
                } else {
                    complete?.(false);
                }
            } catch (err) {
                setError('Failed to fetch videos.');
                console.error(err);
                complete?.(false);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [query, chat_history, complete]);

    if (!visible) return null;
    if (loading) return <SearchVideosSkeleton />;
    if (error || videos.length === 0) return null;

    return (
        <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-3">
            <div className="flex items-center space-x-2 mb-3">
                <VideoIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">Related Videos</h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
                {videos.slice(0, 3).map((video, i) => (
                    <VideoCard key={i} thumbnailUrl={video.img_src} link={video.url} />
                ))}
            </div>
        </div>
    );
};

export default SearchVideos;