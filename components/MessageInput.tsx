// components/MessageInput.tsx
import { cn } from '@/lib/utils';
import { ArrowUp, Image as ImageIconLucide, UploadCloud, Waves } from 'lucide-react'; // Added Waves
import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import CopilotToggle from './MessageInputActions/Copilot';
import ImageGenerationPanel from './ImageGenerationPanel';
import AudioGenerationPanel from './AudioGenerationPanel'; // Import new panel

// Define ImageGenParams (or import from shared location)
interface ImageGenParams {
  prompt: string;
  negative_prompt?: string;
  model?: string;
  size?: string;
  guidance_scale?: number;
}

// Define AudioGenParams (or import from shared location)
export interface AudioGenParams {
    prompt: string;
    negative_prompt?: string;
    duration_seconds?: number;
    seed?: number;
    model?: string;
}

interface MessageInputProps {
  sendMessage: (message: string, file: File | null) => void;
  loading: boolean;
  onImagePromptSubmit: (params: ImageGenParams, imagePromptText: string) => void;
  onAudioPromptSubmit: (params: AudioGenParams, audioPromptText: string) => void; // New prop
}

const MessageInput = ({
  sendMessage,
  loading,
  onImagePromptSubmit,
  onAudioPromptSubmit, // New prop
}: MessageInputProps) => {
  const [copilotEnabled, setCopilotEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [textareaRows, setTextareaRows] = useState(1);
  const [mode, setMode] = useState<'multi' | 'single'>('single');

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [isImageModeActive, setIsImageModeActive] = useState(false);
  const [showImageParamsPanel, setShowImageParamsPanel] = useState(false);
  const [imageNegativePrompt, setImageNegativePrompt] = useState('');
  const [imageModel, setImageModel] = useState(process.env.NEXT_PUBLIC_COLOMBO_DEFAULT_MODEL || '');
  const [imageSize, setImageSize] = useState('512x512');
  const [imageGuidanceScale, setImageGuidanceScale] = useState(7.5);
  const [isSubmittingImage, setIsSubmittingImage] = useState(false);

  const [isAudioModeActive, setIsAudioModeActive] = useState(false);
  const [showAudioParamsPanel, setShowAudioParamsPanel] = useState(false);
  const [audioNegativePrompt, setAudioNegativePrompt] = useState('Low quality.');
  const [audioModel, setAudioModel] = useState(process.env.NEXT_PUBLIC_COLOMBO_AUDIO_DEFAULT_MODEL || 'stable-audio-open-1.0');
  const [audioDuration, setAudioDuration] = useState(10);
  const [audioSeed, setAudioSeed] = useState(0);
  const [isSubmittingAudio, setIsSubmittingAudio] = useState(false);

  useEffect(() => {
    if (textareaRows >= 2 && message && mode === 'single') {
      setMode('multi');
    } else if (!message && !isImageModeActive && !isAudioModeActive && mode === 'multi') {
      setMode('single');
    }
  }, [textareaRows, mode, message, isImageModeActive, isAudioModeActive]);

  useEffect(() => {
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
    if (loading || isSubmittingImage || isSubmittingAudio) return;
    if (message.trim().length > 0 || file) {
      sendMessage(message, file);
      setMessage('');
      setFile(null);
      if (mode === 'multi' && !isImageModeActive && !isAudioModeActive) setMode('single');
    }
  };

  const handleImageGenerationRequest = async () => {
    if (loading || isSubmittingImage || isSubmittingAudio || !message.trim()) return;
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
    setIsSubmittingImage(false);
  };

  const handleAudioGenerationRequest = async () => {
    if (loading || isSubmittingImage || isSubmittingAudio || !message.trim()) return;
    setIsSubmittingAudio(true);
    const params: AudioGenParams = {
      prompt: message,
      negative_prompt: audioNegativePrompt.trim() || undefined,
      model: audioModel.trim() || undefined,
      duration_seconds: audioDuration,
      seed: audioSeed,
    };
    onAudioPromptSubmit(params, message);
    setMessage('');
    setIsSubmittingAudio(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
        setIsImageModeActive(false); setShowImageParamsPanel(false);
        setIsAudioModeActive(false); setShowAudioParamsPanel(false);
    }
  };

  const handleUploadFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageModeToggle = () => {
    const newImageModeState = !isImageModeActive;
    setIsImageModeActive(newImageModeState);
    setShowImageParamsPanel(newImageModeState);
    if (newImageModeState) {
      setFile(null);
      setIsAudioModeActive(false); setShowAudioParamsPanel(false);
      setMode('multi');
      inputRef.current?.focus();
    } else {
      if (!message && !isAudioModeActive) setMode('single');
    }
  };

  const handleAudioModeToggle = () => {
    const newAudioModeState = !isAudioModeActive;
    setIsAudioModeActive(newAudioModeState);
    setShowAudioParamsPanel(newAudioModeState);
    if (newAudioModeState) {
      setFile(null);
      setIsImageModeActive(false); setShowImageParamsPanel(false);
      setMode('multi');
      inputRef.current?.focus();
    } else {
       if (!message && !isImageModeActive) setMode('single');
    }
  };

  const effectiveMode = isImageModeActive || isAudioModeActive ? 'multi' : mode;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isImageModeActive) handleImageGenerationRequest();
    else if (isAudioModeActive) handleAudioGenerationRequest();
    else handleMainSendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isImageModeActive) handleImageGenerationRequest();
      else if (isAudioModeActive) handleAudioGenerationRequest();
      else handleMainSendMessage();
    }
  };

  let placeholderText = file ? `Attached: ${file.name}. Add a message...` : "Ask a follow-up";
  if (isImageModeActive) placeholderText = "Describe image to generate...";
  else if (isAudioModeActive) placeholderText = "Describe audio to generate...";

  return (
    <div className="w-full px-2 pb-2 md:px-4 md:pb-4 sticky bottom-0 bg-white dark:bg-slate-900">
      <form
        style={borderStyle}
        onSubmit={handleSubmit}
        className={cn(
          'bg-white dark:bg-slate-800 p-3 flex items-center overflow-hidden border',
          effectiveMode === 'multi' ? 'flex-col rounded-lg' : 'flex-row rounded-full',
        )}
      >
        <div className={cn("flex items-center", effectiveMode === 'multi' ? "w-full justify-between mb-2" : "mr-2")}>
          <div className="flex items-center space-x-1">
            <button type="button" onClick={handleUploadFileClick} title="Attach file" className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-50" disabled={isImageModeActive || isAudioModeActive}>
              <UploadCloud size={20} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <button
              type="button"
              onClick={handleImageModeToggle}
              title={isImageModeActive ? "Switch to Text/Audio" : "Switch to Image Mode"}
              className={`p-2 rounded-md transition-colors ${isImageModeActive ? 'bg-blue-100 dark:bg-blue-700 text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'} disabled:opacity-50`}
              disabled={isAudioModeActive}
            >
              <ImageIconLucide size={20} />
            </button>
            <button
              type="button"
              onClick={handleAudioModeToggle}
              title={isAudioModeActive ? "Switch to Text/Image" : "Switch to Audio Mode"}
              className={`p-2 rounded-md transition-colors ${isAudioModeActive ? 'bg-green-100 dark:bg-green-700 text-green-600 dark:text-green-300' : 'text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400'} disabled:opacity-50`}
              disabled={isImageModeActive}
            >
              <Waves size={20} />
            </button>
            {effectiveMode === 'single' && <CopilotToggle copilotEnabled={copilotEnabled} setCopilotEnabled={setCopilotEnabled} />}
          </div>
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
            placeholder={placeholderText}
            rows={1}
          />
          <button
            type="submit"
            disabled={loading || isSubmittingImage || isSubmittingAudio || (isImageModeActive || isAudioModeActive ? !message.trim() : (!message.trim() && !file))}
            className="bg-[#D2E3FD] dark:bg-blue-600 text-[#000080] dark:text-white disabled:text-black/50 dark:disabled:text-white/50 disabled:bg-[#e0e0dc79] dark:disabled:bg-gray-700 hover:bg-opacity-85 transition duration-100 rounded-full p-2 ml-2 flex-shrink-0"
          >
            {(isSubmittingImage && isImageModeActive) || (isSubmittingAudio && isAudioModeActive) ? (
               <svg className="animate-spin h-4 w-4 text-[#000080] dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            ) : (
              <ArrowUp className={(isImageModeActive || isAudioModeActive) ? "text-[#000080] dark:text-white" : "bg-background"} size={17} />
            )}
          </button>
        </div>

        {effectiveMode === 'multi' && !isImageModeActive && !isAudioModeActive && (
            <div className="flex flex-row items-center justify-end w-full pt-2">
                <CopilotToggle copilotEnabled={copilotEnabled} setCopilotEnabled={setCopilotEnabled} />
            </div>
        )}

        {isImageModeActive && showImageParamsPanel && (
          <div className="w-full pt-2">
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
        {isAudioModeActive && showAudioParamsPanel && (
          <div className="w-full pt-2">
            <AudioGenerationPanel
              audioNegativePrompt={audioNegativePrompt} setAudioNegativePrompt={setAudioNegativePrompt}
              audioDuration={audioDuration} setAudioDuration={setAudioDuration}
              audioSeed={audioSeed} setAudioSeed={setAudioSeed}
              audioModel={audioModel} setAudioModel={setAudioModel}
              defaultModelName={process.env.NEXT_PUBLIC_COLOMBO_AUDIO_DEFAULT_MODEL || "stable-audio-open-1.0"}
            />
          </div>
        )}
      </form>
      {file && !isImageModeActive && !isAudioModeActive && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 pl-10">
          Attached: {file.name} <button onClick={() => setFile(null)} className="text-red-500 ml-2">(Remove)</button>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
