import React, { useEffect, useRef } from 'react';

type Props = {
  onClose?: () => void;
  isOpen: boolean;
  children?: React.ReactNode;
  className?: string;
};

const AddMoreModal = ({ onClose, isOpen, className, children }: Props) => {
  const modalRef = useRef<HTMLDivElement>(null);

 
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}

      className={`
        ${className} 
        absolute 
        w-auto h-auto 
        rounded-md 
        px-2 py-4 

        // Light Mode Styles
        bg-white 
        text-black 
        border border-gray-200 
        shadow-xl 

        // Dark Mode Styles
        dark:bg-gray-800 
        dark:text-gray-100 
        dark:border-gray-700
        dark:shadow-2xl dark:shadow-black/25
      `}
    >
      {children}
    </div>
  );
};

export default AddMoreModal;