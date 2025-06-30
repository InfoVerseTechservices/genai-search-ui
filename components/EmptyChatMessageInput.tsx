'use client';

import React, { useEffect, useRef, useState, ChangeEvent, FunctionComponent as FC } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowRight,
  Image as ImageIconLucide,
  Paperclip,
  Video as VideoIconLucide,
  SlidersHorizontal as SlidersHorizontalIcon,
  Bot as AIChatIcon,
  Plus,
  History as HistoryIconLucide,
} from 'lucide-react';

// Import local components (ensure these paths are correct in your project)
import CustomAudioWaveformIcon from './Icons/CustomAudioWaveformIcon';

import TextareaAutosize from 'react-textarea-autosize';
import { UploadIcon as CustomUploadIcon } from './Icons';
import React, { useEffect, useRef, useState, ChangeEvent, useCallback } from 'react';
import { toast } from 'sonner'; // This line was already present.
import TextareaAutosize from 'react-textarea-autosize'; // Keep this import
import ImageGenerationPanel from './ImageGenerationPanel';
//import AudioGenerationPanel from './AudioGenerationPanel'; // This line was already present.
import VideoGenerationParametersPanel, { VideoGenParams as UIVideoGenParams } from './VideoGenerationParametersPanel';
import ChatCompletionParametersPanel, { AIChatParams } from './ChatCompletionParametersPanel';
import GenericModal from './GenericModal';
import AddMoreModal from './modals/AddMoreModal';

// --- START: Reusable UI Component Definitions ---

// A specialized component for an Icon Button with a Tooltip
interface TooltipIconButtonProps {
  onClick?: (e: React.MouseEvent) => void;
  label: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}
const TooltipIconButton: FC<TooltipIconButtonProps> = ({ onClick, label, children, className, disabled }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      disabled={disabled}
      className={`
        relative group flex items-center justify-center p-2 rounded-full transition-colors duration-150
        text-gray-500 hover:bg-neutral-100 dark:text-gray-400 dark:hover:bg-gray-700
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className || ''}
      `}
    >
      {children}
      {/* Tooltip appearance is dark by default, which works for both themes */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-xs text-white invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity">
        {label}
      </div>
    </button>
  );
};

// A specialized component for an Icon that acts as a Link with a Tooltip
interface TooltipIconLinkProps {
  href: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}
const TooltipIconLink: FC<TooltipIconLinkProps> = ({ href, label, children, className }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      title={label}
      className={`relative group flex items-center justify-center p-2 rounded-full transition-colors duration-150 ${isActive ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'text-gray-500 hover:bg-neutral-100 dark:text-gray-400 dark:hover:bg-gray-700'} ${className || ''}`}
    >
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-xs text-white invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity">
        {label}
      </div>
    </Link>
  );
};

// --- END: Reusable UI Component Definitions ---

// --- START: Dynamic Border Style Hook ---

const useDynamicBorderStyle = () => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    // This function checks for the 'dark' class on the <html> element,
    // which is the standard way Tailwind CSS manages dark mode.
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };
    
    // Initial check when the component mounts
    checkTheme();
    
    // Use a MutationObserver to watch for changes to the <html> element's class attribute.
    // This is the most reliable way to detect theme toggles.
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    // Cleanup the observer when the component unmounts
    return () => {
      observer.disconnect();
    };
  }, []); // This effect runs only once on mount
  
  // Use a simple background color that matches the theme.
  // The dark color is Tailwind's gray-800, and light is white.
  const themeBackgroundColor = isDark ? '#1F2937' : 'white';

  const gradientBorder = isDark
    // Dark mode gradient: ends with dark
    ? 'linear-gradient(180deg, #7198C6 0%, #FFBE3B 25%, #00BB5C 50%, #1F2937 75%, #1F2937 100%)'
    // Light mode gradient: original version ending with grays
    : 'linear-gradient(180deg, #FF0049 0%, #FFBE3B 25%, #00BB5C 50%, #E0E0E0 75%, #F5F5F5 100%)';
    
  return {
    border: '0.5px solid transparent',
    backgroundClip: 'padding-box',
    // This CSS trick creates a gradient border with a solid background fill.
    background: `linear-gradient(${themeBackgroundColor}, ${themeBackgroundColor}) padding-box, 
                 ${gradientBorder} border-box`,
    borderRadius: '0.5rem'
  };
};

// --- END: Dynamic Border Style Hook ---

export type { UIVideoGenParams as VideoGenParams, AIChatParams };
export interface ImageGenParams { prompt: string; negative_prompt?: string; model?: string; size?: string; guidance_scale?: number; }

export interface AudioGenParams { prompt: string; negative_prompt?: string; duration_seconds?: number; seed?: number; model?: string; }

interface EmptyChatMessageInputProps {
  sendMessage: (message: string, file: File | null) => void;
  focusMode: string;
  setFocusMode: (mode: string) => void;
  onImagePromptSubmit: (params: ImageGenParams, imagePromptText: string) => void;
  onAudioPromptSubmit: (params: AudioGenParams, audioPromptText: string) => void;
  onVideoPromptSubmit: (params: UIVideoGenParams, videoPromptText: string) => void;
  onAIChatSubmit: (prompt: string, params: AIChatParams) => void;
}

const EmptyChatMessageInput = ({
  sendMessage, onImagePromptSubmit, onAudioPromptSubmit, onVideoPromptSubmit, onAIChatSubmit,
}: EmptyChatMessageInputProps) => {
  // --- STATE MANAGEMENT ---
  const [message, setMessage] = useState('');
  const [uploadFile, setUploadFile] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  // Mode States
  const [isImageModeActive, setIsImageModeActive] = useState(false);
  const [isAudioModeActive, setIsAudioModeActive] = useState(false);
  const [isVideoModeActive, setIsVideoModeActive] = useState(false);
  const [isAIChatModeActive, setIsAIChatModeActive] = useState(false);
  
  // Modal Visibility States
  const [isImageParamsModalOpen, setIsImageParamsModalOpen] = useState(false);
  const [isAudioParamsModalOpen, setIsAudioParamsModalOpen] = useState(false);
  const [isVideoParamsModalOpen, setIsVideoParamsModalOpen] = useState(false);
  const [isAIChatParamsModalOpen, setIsAIChatParamsModalOpen] = useState(false);
  const [isAddMoreModalOpen, setIsAddMoreModalOpen] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Generation Parameter States
  const [isSubmittingImage, setIsSubmittingImage] = useState(false);
  const [isSubmittingAudio, setIsSubmittingAudio] = useState(false);
  const [isSubmittingVideo, setIsSubmittingVideo] = useState(false);
  const [isSubmittingAIChat, setIsSubmittingAIChat] = useState(false);

  const [imageNegativePrompt, setImageNegativePrompt] = useState('');
  const [imageModel, setImageModel] = useState(process.env.NEXT_PUBLIC_COLOMBO_DEFAULT_MODEL || '');
  const [imageSize, setImageSize] = useState('512x512');
  const [imageGuidanceScale, setImageGuidanceScale] = useState(7.5);

  const [audioNegativePrompt, setAudioNegativePrompt] = useState('Low quality.');
  const [audioModel, setAudioModel] = useState(process.env.NEXT_PUBLIC_COLOMBO_AUDIO_DEFAULT_MODEL || 'stable-audio-open-1.0');
  const [audioDuration, setAudioDuration] = useState(10);
  const [audioSeed, setAudioSeed] = useState(0);

  const [videoNegativePrompt, setVideoNegativePrompt] = useState('');
  const [videoGuidanceScale, setVideoGuidanceScale] = useState<number>(7.5);
  const [videoNumFrames, setVideoNumFrames] = useState<number>(65);
  const [videoDuration, setVideoDuration] = useState<number>(1);
  const [videoSeed, setVideoSeed] = useState<number>(0);
  const [videoWidth, setVideoWidth] = useState<number>(768);
  const [videoHeight, setVideoHeight] = useState<number>(512);
  const [videoNumInferenceSteps, setVideoNumInferenceSteps] = useState<number>(50);
  const [videoDecodeTimestep, setVideoDecodeTimestep] = useState<number>(0.03);
  const [videoDecodeNoiseScale, setVideoDecodeNoiseScale] = useState<number>(0.025);
  const [videoUpscaleAndRefine, setVideoUpscaleAndRefine] = useState<boolean>(false);

  const [aiChatParams, setAIChatParams] = useState<AIChatParams>({ model: "qwen-3", temperature: 0.7, top_p: 1, max_tokens: 1000 });

  // --- DYNAMIC BORDER STYLE ---
  const dynamicBorderStyle = useDynamicBorderStyle();

  // --- STYLES ---
  // A consistent style for active mode buttons. Works in light and dark mode.
  const activeModeStyle = 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500';
  // Styles for buttons within the "Add More" modal.
  const modalButtonsStyle = "flex items-center gap-x-2 text-gray-700 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-gray-700 w-full px-3 py-3 rounded-md text-left disabled:opacity-50 disabled:cursor-not-allowed";

  // --- HANDLERS ---
  const toggleMode = (setter: React.Dispatch<React.SetStateAction<boolean>>, currentActive: boolean) => {
    const newState = !currentActive;
    // Deactivate all modes first
    setIsImageModeActive(false); setIsAudioModeActive(false); setIsVideoModeActive(false); setIsAIChatModeActive(false);
    setUploadFile(false); setFile(null); if(fileInputRef.current) fileInputRef.current.value = "";
    // Activate the selected mode if it wasn't already active
    if (newState) { 
        setter(true); 
        inputRef.current?.focus(); 
    }
  };

  const handleImageModeToggle = () => toggleMode(setIsImageModeActive, isImageModeActive);
  const handleAudioModeToggle = () => toggleMode(setIsAudioModeActive, isAudioModeActive);
  const handleVideoModeToggle = () => toggleMode(setIsVideoModeActive, isVideoModeActive);
  const handleAIChatModeToggle = () => toggleMode(setIsAIChatModeActive, isAIChatModeActive);

  const openActiveParamsModal = () => {
      if (isImageModeActive) setIsImageParamsModalOpen(true);
      else if (isAudioModeActive) setIsAudioParamsModalOpen(true);
      else if (isVideoModeActive) setIsVideoParamsModalOpen(true);
      else if (isAIChatModeActive) setIsAIChatParamsModalOpen(true);
  };
  
  const handleMainSendMessage = () => {
    if (isSubmittingImage || isSubmittingAudio || isSubmittingVideo || isSubmittingAIChat) return;
    if (message.trim().length > 0 || file) {
      sendMessage(message, file);
      setMessage('');
      setFile(null);
    }
  };

  const handleImageGenerationRequest = () => {
    if (!message.trim() || isSubmittingImage) return;
    setIsSubmittingImage(true);
    
    const params: ImageGenParams = {
      prompt: message,
      negative_prompt: imageNegativePrompt,
      model: imageModel,
      size: imageSize,
      guidance_scale: imageGuidanceScale
    };
    
    onImagePromptSubmit(params, message);
    setMessage('');
    setIsSubmittingImage(false);
  };

  const handleAudioGenerationRequest = () => {
    if (!message.trim() || isSubmittingAudio) return;
    setIsSubmittingAudio(true);
    
    const params: AudioGenParams = {
      prompt: message,
      negative_prompt: audioNegativePrompt,
      duration_seconds: audioDuration,
      seed: audioSeed,
      model: audioModel
    };
    
    onAudioPromptSubmit(params, message);
    setMessage('');
    setIsSubmittingAudio(false);
  };

  const handleVideoGenerationRequest = () => {
    if (!message.trim() || isSubmittingVideo) return;
    setIsSubmittingVideo(true);
    
    const params: UIVideoGenParams = {
      prompt: message,
      negative_prompt: videoNegativePrompt,
      guidance_scale: videoGuidanceScale,
      num_frames: videoNumFrames,
      duration: videoDuration,
      seed: videoSeed,
      width: videoWidth,
      height: videoHeight,
      num_inference_steps: videoNumInferenceSteps,
      decode_timestep: videoDecodeTimestep,
      decode_noise_scale: videoDecodeNoiseScale,
      upscale_and_refine: videoUpscaleAndRefine
    };
    
    onVideoPromptSubmit(params, message);
    setMessage('');
    setIsSubmittingVideo(false);
  };

  const handleAIChatSubmit = () => {
    if (!message.trim() || isSubmittingAIChat) return;
    setIsSubmittingAIChat(true);
    
    onAIChatSubmit(message, aiChatParams);
    setMessage('');
    setIsSubmittingAIChat(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isImageModeActive) handleImageGenerationRequest();
    else if (isAudioModeActive) handleAudioGenerationRequest();
    else if (isVideoModeActive) handleVideoGenerationRequest();
    else if (isAIChatModeActive) handleAIChatSubmit();
    else handleMainSendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setUploadFile(false);
    if (selectedFile) {
        setIsImageModeActive(false); setIsAudioModeActive(false); setIsVideoModeActive(false); setIsAIChatModeActive(false);
    }
  };
  
  const handleUploadFileToggle = () => {
    setIsAddMoreModalOpen(false);
    setUploadFile(true);
  };

  // --- DYNAMIC PLACEHOLDER ---
  let placeholderText = "Ask Colombo...";
  if (isImageModeActive) placeholderText = "Describe image to generate...";
  else if (isAudioModeActive) placeholderText = "Describe audio to generate...";
  else if (isVideoModeActive) placeholderText = "Describe video to generate...";
  else if (isAIChatModeActive) placeholderText = "Enter your AI Chat prompt...";

  // --- RENDER LOGIC ---
  if (uploadFile) {
    return (
      <div className='relative w-full flex justify-center'>
        <div 
          style={dynamicBorderStyle}
          className="flex flex-col items-center w-full mt-[1.2rem] rounded-[1.5rem] p-4 bg-white dark:bg-gray-800"
        >
          <p className='w-full text-center font-bold text-black dark:text-gray-100 md:text-base lg:text-lg xl:text-xl relative'>
            Drag & Drop or upload your file
            <button 
              type='button' 
              onClick={() => setUploadFile(false)} 
              className='absolute top-1/2 right-0 -translate-y-1/2 font-normal text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-pointer'
            >
              <span>×</span>
            </button>
          </p>
          <hr className='border-[0.1px] w-full border-gray-300 dark:border-gray-600 my-4' />
          <button type="button" onClick={() => fileInputRef.current?.click()} className='my-4'>
            <CustomUploadIcon w={80} h={80} />
          </button>
          <button 
            style={{ 
              background: 'linear-gradient(180deg, #6237FF, #258EFF)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '15px', 
              cursor: 'pointer', 
              fontWeight: 'normal' 
            }} 
            className='px-6 py-2 text-sm' 
            onClick={() => fileInputRef.current?.click()}
          >
            UPLOAD
          </button>
          <p className='text-gray-500 dark:text-gray-400 mt-4 text-xs'>Max 25mb only</p>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        </div>
      </div>
    );
  }

  return (
    <div className=' shadow-lg  rounded-2xl '>
      <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center ">
        <div 
          style={dynamicBorderStyle}
          className="relative flex flex-col bg-white dark:bg-gray-800 px-2 sm:px-4 pt-3 sm:pt-4 pb-2 rounded-lg items-center w-full"
        >
          <TextareaAutosize
            ref={inputRef} 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            onKeyDown={handleKeyDown}
            placeholder={placeholderText} 
            minRows={6} 
            maxRows={8}
            className="w-full transition bg-transparent p-1 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm self-start text-black dark:text-white resize-none focus:outline-none max-h-48"
          />

          <div className="flex items-center justify-between w-full mt-2 ">
            {isAddMoreModalOpen && (
              <AddMoreModal className='top-48 left-0' isOpen={isAddMoreModalOpen} onClose={() => setIsAddMoreModalOpen(false)}>
                <div className="flex flex-col items-center space-y-2 w-full">
                  <button type="button" onClick={handleUploadFileToggle} title="Attach file" className={modalButtonsStyle}>
                    <Paperclip size={20} />
                    <span className="text-sm font-medium">Upload document</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={handleImageModeToggle} 
                    title="Image Mode" 
                    className={modalButtonsStyle} 
                    disabled={isAudioModeActive || isVideoModeActive || isAIChatModeActive}
                  >
                    <ImageIconLucide size={20} /> 
                    <span className="text-sm font-medium">Generate Image</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={handleVideoModeToggle} 
                    title="Video Mode" 
                    className={modalButtonsStyle} 
                    disabled={isImageModeActive || isAudioModeActive || isAIChatModeActive}
                  >
                    <VideoIconLucide size={20} /> 
                    <span className="text-sm font-medium">Generate Video</span>
                  </button>
                </div>
              </AddMoreModal>
            )}

            <div className="flex items-center gap-x-1">
              <TooltipIconButton 
                onClick={() => setIsAddMoreModalOpen(true)} 
                label="Add" 
                className={isAddMoreModalOpen ? 'bg-neutral-200 dark:bg-gray-600' : ''}
              >
                <Plus size={20} />
              </TooltipIconButton>
              <TooltipIconLink 
                href="/image-generator"
                label="Image Generation" 
                className={isImageModeActive ? activeModeStyle : ''}
              >
                <ImageIconLucide size={20} color={isImageModeActive? 'white' : 'currentColor'}/>
              </TooltipIconLink>
              <TooltipIconLink 
                href="/video-generator"
                label="Video Generation" 
                className={isVideoModeActive ? activeModeStyle : ''}
              >
                <VideoIconLucide size={20} color={isVideoModeActive ? 'white' : 'currentColor'} />
              </TooltipIconLink>
              <TooltipIconButton 
                onClick={handleAudioModeToggle} 
                label="Audio Generation" 
                className={isAudioModeActive ? activeModeStyle : ''}
              >
                <CustomAudioWaveformIcon size={20} color={isAudioModeActive ? 'white' : 'currentColor'} />
              </TooltipIconButton>
            </div>

            <div className='flex items-center gap-x-2'>
              <TooltipIconButton 
                onClick={handleAIChatModeToggle} 
                label="AI Chat Mode" 
                className={isAIChatModeActive ? activeModeStyle : ''}
              >
                <AIChatIcon size={20} color={isAIChatModeActive ? 'white' : 'currentColor'} />
              </TooltipIconButton>
              
              {(isImageModeActive || isAudioModeActive || isVideoModeActive || isAIChatModeActive) && (
                <TooltipIconButton onClick={openActiveParamsModal} label="Edit Parameters">
                  <SlidersHorizontalIcon size={20} />
                </TooltipIconButton>
              )}
              
              <div className="relative group">
                <button 
                  type="submit" 
                  disabled={
                    (isImageModeActive || isAudioModeActive || isVideoModeActive || isAIChatModeActive ? !message.trim() : (!message.trim() && !file)) || 
                    isSubmittingImage || isSubmittingAudio || isSubmittingVideo || isSubmittingAIChat
                  } 
                  className="bg-[#D2E3FD] dark:bg-blue-600 text-blue-900 dark:text-white disabled:text-black/50 dark:disabled:text-white/50 disabled:bg-gray-200 dark:disabled:bg-gray-700 hover:bg-opacity-85 transition duration-100 rounded-full p-2"
                >
                  {(isSubmittingImage || isSubmittingAudio || isSubmittingVideo || isSubmittingAIChat) ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : ( 
                    
                    <ArrowRight size={17} /> 
                  )}
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity">
                  Send
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
      
      {/* Modals */}
      {isImageModeActive && (
        <GenericModal isOpen={isImageParamsModalOpen} onClose={() => setIsImageParamsModalOpen(false)} title="Image Generation Settings" size="lg">
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
        </GenericModal>
      )}
      
      {isAudioModeActive && (
        <GenericModal isOpen={isAudioParamsModalOpen} onClose={() => setIsAudioParamsModalOpen(false)} title="Audio Generation Settings" size="lg">
          <AudioGenerationPanel 
            audioNegativePrompt={audioNegativePrompt} 
            setAudioNegativePrompt={setAudioNegativePrompt} 
            audioDuration={audioDuration} 
            setAudioDuration={setAudioDuration} 
            audioSeed={audioSeed} 
            setAudioSeed={setAudioSeed} 
            audioModel={audioModel} 
            setAudioModel={setAudioModel} 
            defaultModelName={process.env.NEXT_PUBLIC_COLOMBO_AUDIO_DEFAULT_MODEL || "stable-audio-open-1.0"} 
          />
        </GenericModal>
      )}
      
      {isVideoModeActive && (
        <GenericModal isOpen={isVideoParamsModalOpen} onClose={() => setIsVideoParamsModalOpen(false)} title="Video Generation Settings" size="xl">

          <VideoGenerationParametersPanel 
            negativePrompt={videoNegativePrompt} 
            setNegativePrompt={setVideoNegativePrompt} 
            videoGuidanceScale={videoGuidanceScale} 
            setVideoGuidanceScale={setVideoGuidanceScale} 
            videoNumFrames={videoNumFrames} 
            setVideoNumFrames={setVideoNumFrames} 
            videoDuration={videoDuration} 
            setVideoDuration={setVideoDuration} 
            videoSeed={videoSeed} 
            setVideoSeed={setVideoSeed} 
            videoWidth={videoWidth} 
            setVideoWidth={setVideoWidth} 
            videoHeight={videoHeight} 
            setVideoHeight={setVideoHeight} 
            videoNumInferenceSteps={videoNumInferenceSteps} 
            setVideoNumInferenceSteps={setVideoNumInferenceSteps} 
            videoDecodeTimestep={videoDecodeTimestep} 
            setVideoDecodeTimestep={setVideoDecodeTimestep} 
            videoDecodeNoiseScale={videoDecodeNoiseScale} 
            setVideoDecodeNoiseScale={setVideoDecodeNoiseScale} 
            videoUpscaleAndRefine={videoUpscaleAndRefine} 
            setVideoUpscaleAndRefine={setVideoUpscaleAndRefine} 

          />
        </GenericModal>
      )}
      
      {isAIChatModeActive && (
        <GenericModal isOpen={isAIChatParamsModalOpen} onClose={() => setIsAIChatParamsModalOpen(false)} title="AI Chat Settings" size="md">
          <ChatCompletionParametersPanel 
            params={aiChatParams} 
            setParams={setAIChatParams} 
            defaultModelName="qwen-3" 
          />
        </GenericModal>
      )}
    </div>
  );
};

export default EmptyChatMessageInput;