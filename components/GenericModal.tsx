// components/GenericModal.tsx
'use client';

import React, { useEffect, ReactNode } from 'react';
import { X as XIcon } from 'lucide-react';

interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'; // Optional size prop
}

const GenericModal: React.FC<GenericModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // Default size
}) => {
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto'; // Ensure scroll is restored
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full h-full rounded-none', // Example for a full screen/drawer like modal
  };

  // For mobile, might want to default to a drawer-like appearance or full width
  // This simple modal will be centered. A true bottom sheet drawer is more complex.
  // Let's make it take more vertical space on mobile.
  const responsiveClasses = "w-[95vw] sm:w-full max-h-[85vh] sm:max-h-[90vh]";


  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose} // Close on overlay click
    >
      <div
        className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl flex flex-col ${responsiveClasses} ${sizeClasses[size]} overflow-hidden`}
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {title ? (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          ) : (
            <div></div> // Placeholder to keep close button to the right if no title
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            aria-label="Close modal"
          >
            <XIcon size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-grow">
          {children}
        </div>

        {/* Optional Modal Footer (can be added later if needed) */}
        {/* For this use case, parameter panels might not need a separate footer if "Done" is just the close button */}
      </div>
    </div>
  );
};

export default GenericModal;
