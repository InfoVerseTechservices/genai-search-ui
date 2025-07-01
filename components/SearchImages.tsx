
'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { Message } from './ChatWindow';
import { getCookie } from '@/components/LeftSidebar/cookies';

type ImageResult = {
  url: string;
  img_src: string;
  title: string;
};

const MediaCard = ({ imageUrl, link, onClick }: { imageUrl: string; link: string; onClick: () => void; }) => (
  <a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    onClick={(e) => { e.preventDefault(); onClick(); }}
    className="group relative block aspect-square w-full overflow-hidden rounded-lg cursor-pointer"
  >
    <Image
      src={imageUrl}
      alt="Related search result"
      fill
      className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
      sizes="(max-width: 768px) 100vw, 50vw"
      priority={false}
    />
    <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
      <ExternalLink className="h-6 w-6 text-white" />
    </div>
  </a>
);

// --- Styled Skeleton Loader ---
const SearchImagesSkeleton = () => (
    <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-3">
        <div className="flex items-center space-x-2 mb-3">
            <ImageIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <div className="h-5 w-28 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square w-full rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ))}
        </div>
    </div>
);


const SearchImages = ({ query, chat_history, complete, visible }: { query: string; chat_history: Message[]; complete?: (success: boolean) => void; visible: boolean; }) => {
    const [images, setImages] = useState<ImageResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    useEffect(() => {
        if (!query) {
            setLoading(false);
            return;
        }

        const fetchImages = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: getCookie('token') },
                    body: JSON.stringify({ query, chat_history }),
                });

                if (!res.ok) throw new Error('Failed to fetch images');

                const data = await res.json();
                if (data.images && data.images.length > 0) {
                    setImages(data.images);
                    complete?.(true);
                } else {
                    complete?.(false);
                }
            } catch (err) {
                setError('Failed to fetch images.');
                console.error(err);
                complete?.(false);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, [query, chat_history, complete]);

    const openLightboxAtIndex = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    if (!visible) return null;
    if (loading) return <SearchImagesSkeleton />;
    if (error || images.length === 0) return null;

    const slides = images.map(img => ({ src: img.img_src }));

    return (
        <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-3">
            <div className="flex items-center space-x-2 mb-3">
                <ImageIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">Related Images</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {images.slice(0, 3).map((image, i) => (
                    <MediaCard key={i} imageUrl={image.img_src} link={image.url} onClick={() => openLightboxAtIndex(i)} />
                ))}
                
                {images.length > 3 && (
                    images.length === 4 ? (
                        <MediaCard imageUrl={images[3].img_src} link={images[3].url} onClick={() => openLightboxAtIndex(3)} />
                    ) : (
                        <button
                            onClick={() => openLightboxAtIndex(3)}
                            className="group relative flex items-center justify-center aspect-square w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700/50"
                        >
                            <>
                                <Image
                                    src={images[3].img_src}
                                    alt="View more images"
                                    fill
                                    className="object-cover transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:brightness-50"
                                    style={{ objectFit: 'cover' }}
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority={false}
                                />
                                <span className="absolute text-white font-bold text-lg">+{images.length - 3}</span>
                            </>
                        </button>
                    )
                )}
            </div>
            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                slides={slides}
                index={lightboxIndex}
            />
        </div>
    );
};

export default SearchImages;
