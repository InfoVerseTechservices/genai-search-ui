'use client';

import { cn } from '@/lib/utils';
import {
  ArrowUp,
  Paperclip,
  SlidersHorizontal as SlidersHorizontalIcon,
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

import CustomAudioWaveformIcon from './Icons/CustomAudioWaveformIcon';
import ImageGenerationPanel from './ImageGenerationPanel';
import AudioGenerationPanel from './AudioGenerationPanel';
import VideoGenerationParametersPanel, { VideoGenParams } from './VideoGenerationParametersPanel';
import ChatCompletionParametersPanel, { AIChatParams } from './ChatCompletionParametersPanel';
import GenericModal from './GenericModal';
import AddMoreModal from './modals/AddMoreModal';

// --- Type Definitions (Unchanged) ---
export interface ImageGenParams { prompt: string; negative_prompt?: string; model?: string; size?: string; guidance_scale?: number; }
export interface AudioGenParams { prompt: string; negative_prompt?: string; duration_seconds?: number; seed?: number; model?: string; }

interface MessageInputProps {
  sendMessage: (message: string, file: File | null) => void;
  loading: boolean;
  onImagePromptSubmit: (params: ImageGenParams, imagePromptText: string) => void;
  onAudioPromptSubmit: (params: AudioGenParams, audioPromptText: string) => void;
  onVideoPromptSubmit: (params: VideoGenParams, videoPromptText: string) => void;
  onAIChatSubmit: (prompt: string, params: AIChatParams) => void;
  onSearchSubmit?: (prompt: string) => void;
  onWriteCodeSubmit?: (prompt: string) => void;
  onAudioRecord?: () => void;
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


// --- Dynamic Border Style Hook (Unchanged) ---
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

// --- Main MessageInput Component (FIXED) ---
const MessageInput = ({
  sendMessage, loading, onImagePromptSubmit, onAudioPromptSubmit, onVideoPromptSubmit, onAIChatSubmit, 
  onSearchSubmit = (prompt) => toast.info(`Web Search for: "${prompt}"`),
  onWriteCodeSubmit = (prompt) => toast.info(`Code generation for: "${prompt}"`),
  onAudioRecord = () => toast.info('Audio recording feature coming soon!'),
}: MessageInputProps) => {
  // --- STATE MANAGEMENT ---
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mode States
  const [isImageModeActive, setIsImageModeActive] = useState(false);
  const [isAudioModeActive, setIsAudioModeActive] = useState(false);
  const [isVideoModeActive, setIsVideoModeActive] = useState(false);
  const [isAIChatModeActive, setIsAIChatModeActive] = useState(false);
  const [isSearchModeActive, setIsSearchModeActive] = useState(false);
  const [isCodeModeActive, setIsCodeModeActive] = useState(false);
  
  // Modal States
  const [isAddMoreModalOpen, setIsAddMoreModalOpen] = useState(false);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [isAddFromAppsModalOpen, setIsAddFromAppsModalOpen] = useState(false);
  const [isImageParamsModalOpen, setIsImageParamsModalOpen] = useState(false);
  const [isAudioParamsModalOpen, setIsAudioParamsModalOpen] = useState(false);
  const [isVideoParamsModalOpen, setIsVideoParamsModalOpen] = useState(false);
  const [isAIChatParamsModalOpen, setIsAIChatParamsModalOpen] = useState(false);
  
  // Refs
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- PARAMETER STATES (Unchanged) ---
  const [imageModel, setImageModel] = useState(process.env.NEXT_PUBLIC_COLOMBO_DEFAULT_MODEL || '');
  const [imageNegativePrompt, setImageNegativePrompt] = useState('');
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
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
   }, []);

  // --- HANDLERS (FIXED & UNIFIED) ---
  const resetAllModes = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsImageModeActive(false); setIsAudioModeActive(false); setIsVideoModeActive(false);
    setIsAIChatModeActive(false); setIsSearchModeActive(false); setIsCodeModeActive(false);
  };
  
  // --- FIX (as per your example) ---
  // The toggleMode function is now simpler. It just resets everything
  // and then activates the new mode.
  const toggleMode = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    resetAllModes(); // Always reset everything first
    setter(true);     // Activate the desired mode
    
    // Close modals after any selection
    setIsAddMoreModalOpen(false);
    setIsToolsModalOpen(false);
    inputRef.current?.focus();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      resetAllModes(); // A file upload overrides any active mode
      setFile(selectedFile);
    }
  };

  const handleUploadFileClick = () => {
    setIsAddMoreModalOpen(false);
    fileInputRef.current?.click();
  };
  
  const openActiveParamsModal = () => {
    if (isImageModeActive) setIsImageParamsModalOpen(true);
    else if (isAudioModeActive) setIsAudioParamsModalOpen(true);
    else if (isVideoModeActive) setIsVideoParamsModalOpen(true);
    else if (isAIChatModeActive) setIsAIChatParamsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || loading) return;
    setIsSubmitting(true);
    try {
        if (isImageModeActive) onImagePromptSubmit({ prompt: message, negative_prompt: imageNegativePrompt, model: imageModel, size: imageSize, guidance_scale: imageGuidanceScale }, message);
        else if (isAudioModeActive) onAudioPromptSubmit({ prompt: message, negative_prompt: audioNegativePrompt, duration_seconds: audioDuration, seed: audioSeed, model: audioModel }, message);
        else if (isVideoModeActive) onVideoPromptSubmit({ prompt: message, negative_prompt: videoNegativePrompt, guidance_scale: videoGuidanceScale, num_frames: videoNumFrames, duration: videoDuration, model: 'ltx-video', seed: videoSeed, width: videoWidth, height: videoHeight, num_inference_steps: videoNumInferenceSteps, decode_timestep: videoDecodeTimestep, decode_noise_scale: videoDecodeNoiseScale, upscale_and_refine: videoUpscaleAndRefine }, message);
        else if (isAIChatModeActive) onAIChatSubmit(message, aiChatParams);
        else if (isSearchModeActive) onSearchSubmit && onSearchSubmit(message);
        else if (isCodeModeActive) onWriteCodeSubmit && onWriteCodeSubmit(message);
        else sendMessage(message, file); // Default action
        
        setMessage(''); // Clear text input after submission
        resetAllModes(); // Fully reset state
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
  const anyModeActive = isImageModeActive || isAudioModeActive || isVideoModeActive || isAIChatModeActive || isSearchModeActive || isCodeModeActive;
  const isSubmitDisabled = loading || isSubmitting || (anyModeActive ? !message.trim() : !message.trim() && !file);

  const placeholderText = 
    file ? `Attached: ${file.name}. Add a message...` :
    isImageModeActive ? "Describe the image you want to generate..." :
    isAudioModeActive ? "Describe the audio you want to generate..." :
    isVideoModeActive ? "Describe the video you want to generate..." :
    isAIChatModeActive ? "Ask Colombo..." :
    isSearchModeActive ? "What do you want to search for?" :
    isCodeModeActive ? "Describe the code you need..." :
    "Ask a follow-up...";

  return (
    <div className='shadow-lg rounded-2xl'>
      <form onSubmit={handleSubmit}  className="flex flex-col justify-center">
          <div style={dynamicBorderStyle} className="relative flex flex-col bg-white dark:bg-gray-800 px-2  sm:px-4 pt-2  pb-2 rounded-lg items-center">
          
          <TextareaAutosize
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            
            className="w-full transition bg-transparent p-4 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-black dark:text-white text-sm resize-none focus:outline-none"
          />
          
          <div className="flex items-center justify-between w-full  px-2 ">
            <div className="flex items-center gap-x-1">
                {/* --- Left Aligned Icons --- */}
                <div className="relative">
                    <TooltipIconButton onClick={() => setIsAddMoreModalOpen(p => !p)} label="Add" isActive={isAddMoreModalOpen}>
                        <Plus size={20} />
                    </TooltipIconButton>
                </div>
                <div className="relative">
                    <TooltipIconButton onClick={() => setIsToolsModalOpen(p => !p)} label="Tools" isActive={isToolsModalOpen}>
                        <Sparkles size={20} />
                    </TooltipIconButton>
                </div>
            </div>

            <div className='flex items-center gap-x-2'>
              {/* --- Right Aligned Icons --- */}
              {/* --- FIX (as per your example) --- Using the simpler toggleMode and removing the `disabled` prop */}
              <TooltipIconButton onClick={() => toggleMode(setIsAIChatModeActive)} label="AI Chat Mode" isActive={isAIChatModeActive}>
                <AIChatIcon size={20} />
              </TooltipIconButton>

              <TooltipIconButton onClick={onAudioRecord} label="Record Audio">
                  <Mic size={20} />
              </TooltipIconButton>

              {/* {anyModeActive && <TooltipIconButton onClick={openActiveParamsModal} label="Edit Parameters"><SlidersHorizontalIcon size={20} /></TooltipIconButton>} */}
              
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
      <AddMoreModal className='absolute bottom-[6rem] left-4 z-50' isOpen={isAddMoreModalOpen} onClose={() => setIsAddMoreModalOpen(false)}>
        <div className="flex flex-col space-y-1 p-1">
          <button type="button" onClick={handleUploadFileClick} className={modalButtonsStyle}><Paperclip size={20} /><span>Upload document</span></button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <button type="button" onClick={() => { setIsAddMoreModalOpen(false); setIsAddFromAppsModalOpen(true); }} className={modalButtonsStyle}>
            <Combine size={20} /><span>Add from Apps</span><ChevronRight size={16} className='ml-auto'/>
          </button>
        </div>
      </AddMoreModal>

      <AddMoreModal className='absolute bottom-[6rem] left-16 z-50' isOpen={isToolsModalOpen} onClose={() => setIsToolsModalOpen(false)}>
        <div className="flex flex-col space-y-1 p-1">
           
            <button type="button" onClick={() => toggleMode(setIsImageModeActive)} className={modalButtonsStyle}><ImageIconLucide size={20} /><span>Generate Image</span></button>
            <button type="button" onClick={() => toggleMode(setIsVideoModeActive)} className={modalButtonsStyle}><VideoIconLucide size={20} /><span>Generate Video</span></button>
            <button type="button" onClick={() => toggleMode(setIsAudioModeActive)} className={modalButtonsStyle}><CustomAudioWaveformIcon size={20} /><span>Generate Audio</span></button>
            <button type="button" onClick={() => toggleMode(setIsSearchModeActive)} className={modalButtonsStyle}><Search size={20}/><span>Search Web</span></button>
            <button type="button" onClick={() => toggleMode(setIsCodeModeActive)} className={modalButtonsStyle}><Code size={20}/><span>Write Code</span></button>
        </div>
      </AddMoreModal>

      <AddMoreModal className='absolute bottom-[9rem] left-44 z-50 shadow-xl' isOpen={isAddFromAppsModalOpen} onClose={() => setIsAddFromAppsModalOpen(false)}>
        <div className="flex flex-col space-y-1 p-1 w-48 ">
            <button type="button" className={`${modalButtonsStyle}`}><GoogleDriveIcon size={18} /><span>Google Drive</span></button>
            <button type="button" className={`${modalButtonsStyle}`}><GooglePhotosIcon size={18} /><span>Google Photos</span></button>
        </div>
      </AddMoreModal>
      
      {/* Parameter Modals (Unchanged) */}
      {isImageModeActive && <GenericModal isOpen={isImageParamsModalOpen} onClose={() => setIsImageParamsModalOpen(false)} title="Image Generation Settings" size="lg"><ImageGenerationPanel imageNegativePrompt={imageNegativePrompt} setImageNegativePrompt={setImageNegativePrompt} imageModel={imageModel} setImageModel={setImageModel} imageSize={imageSize} setImageSize={setImageSize} imageGuidanceScale={imageGuidanceScale} setImageGuidanceScale={setImageGuidanceScale} defaultModelName={process.env.NEXT_PUBLIC_COLOMBO_DEFAULT_MODEL || "flux"} /></GenericModal>}
      {isAudioModeActive && <GenericModal isOpen={isAudioParamsModalOpen} onClose={() => setIsAudioParamsModalOpen(false)} title="Audio Generation Settings" size="lg"><AudioGenerationPanel audioNegativePrompt={audioNegativePrompt} setAudioNegativePrompt={setAudioNegativePrompt} audioDuration={audioDuration} setAudioDuration={setAudioDuration} audioSeed={audioSeed} setAudioSeed={setAudioSeed} audioModel={audioModel} setAudioModel={setAudioModel} defaultModelName={process.env.NEXT_PUBLIC_COLOMBO_AUDIO_DEFAULT_MODEL || "stable-audio-open-1.0"} /></GenericModal>}
      {isVideoModeActive && <GenericModal isOpen={isVideoParamsModalOpen} onClose={() => setIsVideoParamsModalOpen(false)} title="Video Generation Settings" size="xl"><VideoGenerationParametersPanel negativePrompt={videoNegativePrompt} setNegativePrompt={setVideoNegativePrompt} videoGuidanceScale={videoGuidanceScale} setVideoGuidanceScale={setVideoGuidanceScale} videoNumFrames={videoNumFrames} setVideoNumFrames={setVideoNumFrames} videoDuration={videoDuration} setVideoDuration={setVideoDuration} videoSeed={videoSeed} setVideoSeed={setVideoSeed} videoWidth={videoWidth} setVideoWidth={setVideoWidth} videoHeight={videoHeight} setVideoHeight={setVideoHeight} videoNumInferenceSteps={videoNumInferenceSteps} setVideoNumInferenceSteps={setVideoNumInferenceSteps} videoDecodeTimestep={videoDecodeTimestep} setVideoDecodeTimestep={setVideoDecodeTimestep} videoDecodeNoiseScale={videoDecodeNoiseScale} setVideoDecodeNoiseScale={setVideoDecodeNoiseScale} videoUpscaleAndRefine={videoUpscaleAndRefine} setVideoUpscaleAndRefine={setVideoUpscaleAndRefine} /></GenericModal>}
      {isAIChatModeActive && <GenericModal isOpen={isAIChatParamsModalOpen} onClose={() => setIsAIChatParamsModalOpen(false)} title="AI Chat Settings" size="md"><ChatCompletionParametersPanel params={aiChatParams} setParams={setAIChatParams} defaultModelName="qwen-3" /></GenericModal>}
    </div>
  );
};

export default MessageInput;