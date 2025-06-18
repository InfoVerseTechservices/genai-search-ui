// components/MessageInput.tsx
import { cn } from '@/lib/utils';
import { ArrowUp, Image as ImageIconLucide, UploadCloud } from 'lucide-react'; // Added ImageIconLucide, UploadCloud
import React, { useEffect, useRef, useState, ChangeEvent } from 'react'; // Added ChangeEvent, React
import TextareaAutosize from 'react-textarea-autosize';
// Attach component might need to be re-evaluated or used alongside new icons.
// For simplicity, we'll add new icons directly here.
// import Attach from './MessageInputActions/Attach';
import CopilotToggle from './MessageInputActions/Copilot'; // Assuming this is still desired
import ImageGenerationPanel from './ImageGenerationPanel'; // Import the panel

// Re-define or import ImageGenParams (as done in EmptyChatMessageInput)
interface ImageGenParams {
  prompt: string;
  negative_prompt?: string;
  model?: string;
  size?: string;
  guidance_scale?: number;
}

interface MessageInputProps {
  sendMessage: (message: string, file: File | null) => void;
  loading: boolean; // General loading state from parent (for text responses)
  onImagePromptSubmit: (params: ImageGenParams, imagePromptText: string) => void;
}

const MessageInput = ({
  sendMessage,
  loading, // This is the parent's loading state, primarily for text responses
  onImagePromptSubmit,
}: MessageInputProps) => {
  const [copilotEnabled, setCopilotEnabled] = useState(false); // Existing state
  const [message, setMessage] = useState(''); // Used for chat message OR image prompt
  const [textareaRows, setTextareaRows] = useState(1);
  const [mode, setMode] = useState<'multi' | 'single'>('single'); // Existing state for layout

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null); // For file input
  const [file, setFile] = useState<File | null>(null); // For attached file

  // Image Generation Mode State
  const [isImageModeActive, setIsImageModeActive] = useState(false);
  const [showImageParamsPanel, setShowImageParamsPanel] = useState(false);

  // Image Parameters State
  const [imageNegativePrompt, setImageNegativePrompt] = useState('');
  const [imageModel, setImageModel] = useState(process.env.NEXT_PUBLIC_COLOMBO_DEFAULT_MODEL || '');
  const [imageSize, setImageSize] = useState('512x512');
  const [imageGuidanceScale, setImageGuidanceScale] = useState(7.5);

  // Local loading state for the send button when submitting an image prompt
  const [isSubmittingImage, setIsSubmittingImage] = useState(false);

  useEffect(() => {
    // Existing effect for single/multi line mode
    if (textareaRows >= 2 && message && mode === 'single') {
      setMode('multi');
    } else if (!message && !isImageModeActive && mode === 'multi') { // Keep multi if image mode active
      setMode('single');
    }
  }, [textareaRows, mode, message, isImageModeActive]);

  useEffect(() => {
    // Existing effect for '/' key to focus input
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.hasAttribute('contenteditable');
      if (e.key === '/' && !isInputFocused) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const borderStyle = {
    border: '0.5px solid transparent',
    backgroundClip: 'padding-box',
    background:
      'linear-gradient(white, white) padding-box, linear-gradient(180deg, #FF0049 0%, #FFBE3B 25%, #00BB5C 50%, #187DC4 75%, #58268B 100%) border-box',
    borderImageSlice: 1,
  };

  const handleMainSendMessage = () => {
    if (loading || isSubmittingImage) return; // Prevent sending if parent is loading or local image submit
    if (message.trim().length > 0 || file) {
      sendMessage(message, file);
      setMessage('');
      setFile(null);
      if (mode === 'multi' && !isImageModeActive) setMode('single'); // Revert to single if not in image mode
    }
  };

  const handleImageGenerationRequest = async () => {
    if (loading || isSubmittingImage || !message.trim()) return;

    setIsSubmittingImage(true);
    const params: ImageGenParams = {
      prompt: message,
      negative_prompt: imageNegativePrompt.trim() || undefined,
      model: imageModel.trim() || undefined,
      size: imageSize,
      guidance_scale: imageGuidanceScale,
    };
    onImagePromptSubmit(params, message);
    setMessage('');
    // setIsImageModeActive(false); // Optional: turn off image mode
    // setShowImageParamsPanel(false); // Optional: close panel
    setIsSubmittingImage(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    // If a file is selected, ensure we are not in image mode.
    if (selectedFile) {
        setIsImageModeActive(false);
        setShowImageParamsPanel(false);
    }
  };

  const handleUploadFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageModeToggle = () => {
    const newImageModeState = !isImageModeActive;
    setIsImageModeActive(newImageModeState);
    if (newImageModeState) {
      setShowImageParamsPanel(true); // Show params panel when entering image mode
      setFile(null); // Clear any selected file
      setMode('multi'); // Force multi-line mode when image panel is open
      inputRef.current?.focus();
    } else {
      setShowImageParamsPanel(false); // Hide params panel
      if (!message) setMode('single'); // Revert to single if message is empty
    }
  };

  const effectiveMode = isImageModeActive ? 'multi' : mode;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isImageModeActive) {
      handleImageGenerationRequest();
    } else {
      handleMainSendMessage();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isImageModeActive) {
        handleImageGenerationRequest();
      } else {
        handleMainSendMessage();
      }
    }
  };

  return (
    <div className="w-full px-2 pb-2 md:px-4 md:pb-4 sticky bottom-0 bg-white dark:bg-slate-900">
      <form
        style={borderStyle}
        onSubmit={handleSubmit}
        className={cn(
          'bg-white dark:bg-slate-800 p-3 flex items-center overflow-hidden border', // Reduced padding slightly
          effectiveMode === 'multi' ? 'flex-col rounded-lg' : 'flex-row rounded-full',
        )}
      >
        {/* Action Icons Area - visible in both modes if needed, or adjusted */}
        <div className={cn("flex items-center", effectiveMode === 'multi' ? "w-full justify-between mb-2" : "mr-2")}>
          <div className="flex items-center space-x-1">
            <button type="button" onClick={handleUploadFileClick} title="Attach file" className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-50" disabled={isImageModeActive}>
              <UploadCloud size={20} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <button
              type="button"
              onClick={handleImageModeToggle}
              title={isImageModeActive ? "Switch to Text Mode" : "Switch to Image Mode"}
              className={`p-2 rounded-md transition-colors ${isImageModeActive ? 'bg-blue-100 dark:bg-blue-700 text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'}`}
            >
              <ImageIconLucide size={20} />
            </button>
            {/* CopilotToggle can be here or inside the "multi" mode section below */}
            {effectiveMode === 'single' && <CopilotToggle copilotEnabled={copilotEnabled} setCopilotEnabled={setCopilotEnabled} />}
          </div>
          {/* Send button for single line mode - moved to be part of the main input area */}
        </div>

        <div className="flex items-center w-full">
          <TextareaAutosize
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onHeightChange={(height, props) => {
              setTextareaRows(Math.ceil(height / props.rowHeight));
            }}
            className="transition bg-transparent placeholder:text-[#ACACAC] dark:placeholder:text-gray-500 placeholder:text-sm text-black dark:text-white text-sm resize-none focus:outline-none w-full px-2 max-h-24 lg:max-h-36 xl:max-h-48 flex-grow flex-shrink"
            placeholder={isImageModeActive ? "Describe image to generate..." : (file ? `Attached: ${file.name}. Add a message...` : "Ask a follow-up")}
            rows={1} // Start with 1 row, it will auto-size
          />
          <button
            type="submit" // Changed to submit, form onSubmit will handle logic
            disabled={loading || isSubmittingImage || (isImageModeActive ? !message.trim() : (!message.trim() && !file))}
            className="bg-[#D2E3FD] dark:bg-blue-600 text-[#000080] dark:text-white disabled:text-black/50 dark:disabled:text-white/50 disabled:bg-[#e0e0dc79] dark:disabled:bg-gray-700 hover:bg-opacity-85 transition duration-100 rounded-full p-2 ml-2 flex-shrink-0"
          >
            {isSubmittingImage && isImageModeActive ? (
               <svg className="animate-spin h-4 w-4 text-[#000080] dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            ) : (
              <ArrowUp className={isImageModeActive ? "text-[#000080] dark:text-white" : "bg-background"} size={17} />
            )}
          </button>
        </div>

        {effectiveMode === 'multi' && !isImageModeActive && ( // Only show this if multi-mode AND NOT image mode
            <div className="flex flex-row items-center justify-end w-full pt-2">
                {/* Original multi-mode Attach and Copilot could go here if needed, or handled above */}
                {/* This section might be redundant if icons are always visible at the top of text area */}
                <CopilotToggle copilotEnabled={copilotEnabled} setCopilotEnabled={setCopilotEnabled} />
            </div>
        )}

        {isImageModeActive && showImageParamsPanel && (
          <div className="w-full pt-2"> {/* Ensure panel takes full width */}
            <ImageGenerationPanel
              imageNegativePrompt={imageNegativePrompt}
              setImageNegativePrompt={setImageNegativePrompt}
              imageModel={imageModel}
              setImageModel={setImageModel}
              imageSize={imageSize}
              setImageSize={setImageSize}
              imageGuidanceScale={imageGuidanceScale}
              setImageGuidanceScale={setImageGuidanceScale}
              defaultModelName={process.env.NEXT_PUBLIC_COLOMBO_DEFAULT_MODEL || "flux"}
            />
          </div>
        )}
      </form>
      {file && !isImageModeActive && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 pl-10">
          Attached: {file.name} <button onClick={() => setFile(null)} className="text-red-500 ml-2">(Remove)</button>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
