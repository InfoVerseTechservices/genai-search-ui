'use client';

import { cn } from '@/lib/utils';
import {
  ArrowUp,
  Paperclip,
  Plus,
  Image as ImageIconLucide,
  Video as VideoIconLucide,
  Bot as AIChatIcon,
  Sparkles,
  Mic,
  Combine,
  ChevronRight,
  Search,
  FolderKanban as GoogleDriveIcon,
  Image as GooglePhotosIcon,
  Code,
} from 'lucide-react';
import React, { useEffect, useRef, useState, ChangeEvent, FunctionComponent as FC } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from 'sonner';
import crypto from 'crypto';
import { File } from './ChatWindow';
import AttachSmall from './MessageInputActions/AttachSmall';

// --- Type Definitions ---
export interface ImageGenParams { prompt: string; negative_prompt?: string; model?: string; size?: string; guidance_scale?: number; }
export interface AudioGenParams { prompt: string; negative_prompt?: string; duration_seconds?: number; seed?: number; model?: string; }

interface MessageInputProps {
  sendMessage: (message: string, isImageGeneration?: boolean, useTooling?: boolean) => void;
  loading: boolean;
  fileIds: string[];
  setFileIds: (fileIds: string[]) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  focusMode: string;
  setFocusMode: (mode: string) => void;
}

// --- Reusable Tooltip Button ---
export interface TooltipIconButtonProps {
  onClick?: (e: React.MouseEvent) => void;
  label: string;
  children: React.ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  className?: string;
}
const TooltipIconButton: FC<TooltipIconButtonProps> = ({ onClick, label, children, isActive, disabled, className }) => {
  const baseClasses = 'relative group flex items-center justify-center p-2 rounded-full transition-colors duration-150';
  const activeClasses = 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400';
  const inactiveClasses = 'text-gray-500 hover:bg-neutral-100 dark:text-gray-400 dark:hover:bg-gray-700';
  const tooltipClasses = 'absolute bottom-full left-1/2 -translate-x-1/2 z-40 mb-2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-xs text-white invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity';
  return (
    <button type="button" onClick={onClick} title={label} disabled={disabled} className={cn(baseClasses, isActive ? activeClasses : inactiveClasses, "disabled:opacity-50 disabled:cursor-not-allowed", className)}>
      {children}
      <div className={tooltipClasses}>{label}</div>
    </button>
  );
};

// --- Dynamic Border Style Hook ---
const useDynamicBorderStyle = () => {
    const [isDark, setIsDark] = useState(false);
    useEffect(() => {
        const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);
    const gradientBorder = isDark
        ? 'linear-gradient(180deg, #7198C6 0%, #FFBE3B 25%, #00BB5C 50%, #1F2937 75%, #1F2937 100%)'
        : 'linear-gradient(180deg, #FF0049 0%, #FFBE3B 25%, #00BB5C 50%, #187DC4 75%, #58268B 100%)';
    return {
        border: '0.5px solid transparent',
        backgroundClip: 'padding-box',
        background: `linear-gradient(${isDark ? '#1F2937' : 'white'}, ${isDark ? '#1F2937' : 'white'}) padding-box, ${gradientBorder} border-box`,
    };
};

// --- AddMoreModal Component ---
const AddMoreModal: FC<{ className?: string; isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ className, isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg ${className}`}>
      {children}
    </div>
  );
};

// --- Main MessageInput Component ---
const MessageInput = ({
  sendMessage, loading, fileIds, setFileIds, files, setFiles, focusMode, setFocusMode
}: MessageInputProps) => {
  // --- STATE MANAGEMENT ---
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal States
  const [isAddMoreModalOpen, setIsAddMoreModalOpen] = useState(false);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [isAddFromAppsModalOpen, setIsAddFromAppsModalOpen] = useState(false);
  
  // Refs
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- HOOKS and STYLES ---
  const dynamicBorderStyle = useDynamicBorderStyle();
  const modalButtonsStyle = "flex items-center gap-x-3 text-gray-700 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-gray-700 w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (e.key === '/' && !(activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA')) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.modal-container')) {
        setIsAddMoreModalOpen(false);
        setIsToolsModalOpen(false);
        setIsAddFromAppsModalOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
   }, []);

  // --- HANDLERS ---
  const resetAllModes = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const toggleMode = (mode: string) => {
    resetAllModes();
    setFocusMode(mode);
    setIsAddMoreModalOpen(false);
    setIsToolsModalOpen(false);
    inputRef.current?.focus();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      resetAllModes();
      // Convert browser File to custom File interface
      const customFile: File = {
        fileName: selectedFile.name,
        fileExtension: selectedFile.name.split('.').pop() || '',
        fileId: crypto.randomBytes(7).toString('hex')
      };
      setFile(customFile);
    }
  };

  const handleUploadFileClick = () => {
    setIsAddMoreModalOpen(false);
    setIsToolsModalOpen(false);
    fileInputRef.current?.click();
  };

  const handleAddMoreClick = () => {
    setIsToolsModalOpen(false);
    setIsAddFromAppsModalOpen(false);
    setIsAddMoreModalOpen(p => !p);
  };

  const handleToolsClick = () => {
    setIsAddMoreModalOpen(false);
    setIsAddFromAppsModalOpen(false);
    setIsToolsModalOpen(p => !p);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || loading) return;
    setIsSubmitting(true);
    try {
        if (['imageGeneration', 'videoGeneration', 'audioGeneration'].includes(focusMode)) {
          sendMessage(message, true);
        } else if (focusMode === 'webSearch') {
          sendMessage(message, false, true);
        } else {
          sendMessage(message);
        }
        setMessage('');
        resetAllModes();
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  // --- RENDER LOGIC ---
  const isSubmitDisabled = loading || isSubmitting || (!message.trim() && !file);

  const placeholderText = 
    file ? `Attached: ${file.fileName}. Add a message...` :
    ['imageGeneration', 'videoGeneration', 'audioGeneration'].includes(focusMode) ? "Describe what you want to generate..." :
    "Ask a follow-up...";

  return (
    <div className='shadow-lg rounded-2xl'>
      <form onSubmit={handleSubmit} className="flex flex-col justify-center">
          <div style={dynamicBorderStyle} className="relative flex flex-col bg-white dark:bg-gray-800 px-2 sm:px-4 pt-2 pb-2 rounded-lg items-center">
          
          <TextareaAutosize
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            className="w-full transition bg-transparent p-4 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-black dark:text-white text-sm resize-none focus:outline-none"
          />
          
          <div className="flex items-center justify-between w-full px-2">
            <div className="flex items-center gap-x-1">
                <div className="relative">
                    <TooltipIconButton onClick={handleAddMoreClick} label="Add" isActive={isAddMoreModalOpen}>
                        <Plus size={20} />
                    </TooltipIconButton>
                </div>
                <div className="relative">
                    <TooltipIconButton onClick={handleToolsClick} label="Tools" isActive={isToolsModalOpen}>
                        <Sparkles size={20} />
                    </TooltipIconButton>
                </div>
            </div>

            <div className='flex items-center gap-x-2'>
              <button type="submit" disabled={isSubmitDisabled} className="bg-[#D2E3FD] dark:bg-blue-600 text-blue-900 dark:text-white disabled:opacity-50 disabled:bg-gray-200 dark:disabled:bg-gray-700 hover:bg-opacity-85 transition duration-100 rounded-full p-2">
                {loading || isSubmitting ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <ArrowUp size={20} />
                )}
              </button>
            </div>
            </div>
          </div>
        </form>

      {/* --- Modals --- */}
      <AddMoreModal className='absolute bottom-[6rem] left-4 z-50 modal-container' isOpen={isAddMoreModalOpen} onClose={() => setIsAddMoreModalOpen(false)}>
        <div className="flex flex-col space-y-1 p-1">
          <button type="button" onClick={handleUploadFileClick} className={modalButtonsStyle}><Paperclip size={20} /><span>Upload document</span></button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <button type="button" onClick={() => { setIsAddMoreModalOpen(false); setIsToolsModalOpen(false); setIsAddFromAppsModalOpen(true); }} className={modalButtonsStyle}>
            <Combine size={20} /><span>Add from Apps</span><ChevronRight size={16} className='ml-auto'/>
          </button>
        </div>
      </AddMoreModal>

      <AddMoreModal className='absolute bottom-[6rem] left-16 z-50 modal-container' isOpen={isToolsModalOpen} onClose={() => setIsToolsModalOpen(false)}>
        <div className="flex flex-col space-y-1 p-1">
            <button type="button" onClick={() => toggleMode('imageGeneration')} className={modalButtonsStyle}><ImageIconLucide size={20} /><span>Generate Image</span></button>
            <button type="button" onClick={() => toggleMode('videoGeneration')} className={modalButtonsStyle}><VideoIconLucide size={20} /><span>Generate Video</span></button>
            <button type="button" onClick={() => toggleMode('audioGeneration')} className={modalButtonsStyle}><Search size={20} /><span>Generate Audio</span></button>
            <button type="button" onClick={() => toggleMode('webSearch')} className={modalButtonsStyle}><Search size={20}/><span>Search Web</span></button>
            <button type="button" onClick={() => toggleMode('writingAssistant')} className={modalButtonsStyle}><Code size={20}/><span>Write Code</span></button>
        </div>
      </AddMoreModal>

      <AddMoreModal className='absolute bottom-[9rem] left-44 z-50 shadow-xl modal-container' isOpen={isAddFromAppsModalOpen} onClose={() => setIsAddFromAppsModalOpen(false)}>
        <div className="flex flex-col space-y-1 p-1 w-48">
            <button type="button" className={`${modalButtonsStyle}`}><GoogleDriveIcon size={18} /><span>Google Drive</span></button>
            <button type="button" className={`${modalButtonsStyle}`}><GooglePhotosIcon size={18} /><span>Google Photos</span></button>
        </div>
      </AddMoreModal>
      
      <div className="text-center py-2 px-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          ColomboAI MC1 can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
};

export default MessageInput;