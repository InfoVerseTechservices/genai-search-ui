
'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  mediaItem: { id: string; type: 'image' | 'video' };
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  onClose,
  onNext,
  onPrev,
  mediaItem,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen) {
    return null;
  }

  const placeholderSrc = mediaItem.type === 'image' 
    ? `https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800`
    : `https://videos.pexels.com/video-files/3209828/3209828-hd_1280_720_25fps.mp4`;

  return (
 
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
      onClick={onClose} 
    >
      <button
        className="absolute top-4 right-4 text-white text-4xl font-bold hover:opacity-80"
        onClick={onClose}
      >
        ×
      </button>

      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white text-5xl font-bold hover:opacity-80"
        onClick={(e) => { e.stopPropagation(); onPrev(); }} // Stop propagation to prevent closing
      >
        ‹
      </button>

      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white text-5xl font-bold hover:opacity-80"
        onClick={(e) => { e.stopPropagation(); onNext(); }} // Stop propagation to prevent closing
      >
        ›
      </button>

      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
        {mediaItem.type === 'image' ? (
          <Image
            src={placeholderSrc}
            alt="Enlarged media"
            width={800}
            height={600}
            className="max-w-full max-h-[90vh] rounded-lg"
            style={{ objectFit: 'contain' }}
            priority
          />
        ) : (
          <video src={placeholderSrc} controls autoPlay className="max-w-full max-h-[90vh] rounded-lg" />
        )}
      </div>
    </div>
  );
};

export default LightboxModal;