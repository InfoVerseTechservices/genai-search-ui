'use client';

import React, { useEffect, useRef, useState, FunctionComponent as FC, ChangeEvent } from 'react';
import {
  ArrowRight,
  Image as ImageIconLucide,
  Video as VideoIconLucide,
  Bot as AIChatIcon,
  Plus,
  Search,
  Code,
  Mic,
  Sparkles,
  Paperclip,
  Combine,
  ChevronRight,
  FolderKanban as GoogleDriveIcon,
  Image as GooglePhotosIcon,
} from 'lucide-react';

// Import your custom hook (ensure the path is correct)
import { useSpeechRecognition } from './hooks/useSpeechRecognition';

// Import local components (ensure these paths are correct in your project)
import CustomAudioWaveformIcon from './Icons/CustomAudioWaveformIcon';
import { UploadIcon as CustomUploadIcon } from './Icons';
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from 'sonner';
import ImageGenerationPanel from './ImageGenerationPanel';
import AudioGenerationPanel from './AudioGenerationPanel';
import VideoGenerationParametersPanel, { VideoGenParams as UIVideoGenParams } from './VideoGenerationParametersPanel';
import ChatCompletionParametersPanel, { AIChatParams } from './ChatCompletionParametersPanel';
import GenericModal from './GenericModal';
import AddMoreModal from './modals/AddMoreModal';


// --- Reusable UI Components (Included for completeness) ---
export interface TooltipIconButtonProps {
  onClick?: (e: React.MouseEvent) => void;
  label: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}
const TooltipIconButton: FC<TooltipIconButtonProps> = ({ onClick, label, children, className, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    disabled={disabled}
    className={`relative group flex items-center justify-center p-2 rounded-full transition-colors duration-150 text-gray-500 hover:bg-neutral-100 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`}
  >
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-xs text-white invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity">
      {label}
    </div>
  </button>
);

// --- Dynamic Border Style Hook (Included for completeness) ---
const useDynamicBorderStyle = () => {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  const themeBackgroundColor = isDark ? '#1F2937' : 'white';
  const gradientBorder = isDark
    ? 'linear-gradient(180deg, #7198C6 0%, #FFBE3B 25%, #00BB5C 50%, #1F2937 75%, #1F2937 100%)'
    : 'linear-gradient(180deg, #FF0049 0%, #FFBE3B 25%, #00BB5C 50%, #E0E0E0 75%, #F5F5F5 100%)';
  return {
    border: '0.5px solid transparent',
    backgroundClip: 'padding-box',
    background: `linear-gradient(${themeBackgroundColor}, ${themeBackgroundColor}) padding-box, ${gradientBorder} border-box`,
    borderRadius: '0.5rem'
  };
};

// --- Type Definitions (Included for completeness) ---
export type { UIVideoGenParams as VideoGenParams, AIChatParams };
export interface ImageGenParams { prompt: string; negative_prompt?: string; model?: string; size?: string; guidance_scale?: number; }
export interface AudioGenParams { prompt: string; negative_prompt?: string; duration_seconds?: number; seed?: number; model?: string; }

interface EmptyChatMessageInputProps {
  sendMessage: (message: string, file: File | null) => void;
  onImagePromptSubmit: (params: ImageGenParams, imagePromptText: string) => void;
  onAudioPromptSubmit: (params: AudioGenParams, audioPromptText: string) => void;
  onVideoPromptSubmit: (params: UIVideoGenParams, videoPromptText: string) => void;
  onAIChatSubmit: (prompt: string, params: AIChatParams) => void;
  onSearchSubmit?: (prompt: string) => void;
  onWriteCodeSubmit?: (prompt: string) => void;
  // NOTE: onAudioRecord is removed as it's now handled internally
}

const EmptyChatMessageInput: FC<Omit<EmptyChatMessageInputProps, 'onAudioRecord'>> = ({
  sendMessage,
  onImagePromptSubmit,
  onAudioPromptSubmit,
  onVideoPromptSubmit,
  onAIChatSubmit,
  onSearchSubmit = (prompt) => toast.info(`Web Search for: "${prompt}"`),
  onWriteCodeSubmit = (prompt) => toast.info(`Code generation for: "${prompt}"`),
}) => {
  // --- STATE MANAGEMENT ---
  const [message, setMessage] = useState('');
  const [uploadFile, setUploadFile] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Mode States
  const [isImageModeActive, setIsImageModeActive] = useState(false);
  const [isAudioModeActive, setIsAudioModeActive] = useState(false);
  const [isVideoModeActive, setIsVideoModeActive] = useState(false);
  const [isAIChatModeActive, setIsAIChatModeActive] = useState(false);
  const [isSearchModeActive, setIsSearchModeActive] = useState(false);
  const [isCodeModeActive, setIsCodeModeActive] = useState(false);

  // Modal Visibility
  const [isAddMoreModalOpen, setIsAddMoreModalOpen] = useState(false);
  const [isAddFromAppsModalOpen, setIsAddFromAppsModalOpen] = useState(false);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [isImageParamsModalOpen, setIsImageParamsModalOpen] = useState(false);
  const [isAudioParamsModalOpen, setIsAudioParamsModalOpen] = useState(false);
  const [isVideoParamsModalOpen, setIsVideoParamsModalOpen] = useState(false);
  const [isAIChatParamsModalOpen, setIsAIChatParamsModalOpen] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Parameter States
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
  
  // + ADDED: Speech recognition hook
  const { isListening, transcript, startListening, setTranscript } = useSpeechRecognition();
  
  const dynamicBorderStyle = useDynamicBorderStyle();

  // + ADDED: Effect to update the message input with the voice transcript
  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
      inputRef.current?.focus();
    }
  }, [transcript]);

  // --- HANDLERS ---
  const resetAllModes = () => {
    setIsImageModeActive(false); setIsAudioModeActive(false); setIsVideoModeActive(false);
    setIsAIChatModeActive(false); setIsSearchModeActive(false); setIsCodeModeActive(false);
    setUploadFile(false); setFile(null); if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleMode = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    resetAllModes();
    setter(true);
    setIsAddMoreModalOpen(false);
    setIsAddFromAppsModalOpen(false);
    setIsToolsModalOpen(false);
    inputRef.current?.focus();
  };
  
  // + ADDED: Handler to start voice recording for search
  const handleStartRecording = () => {
    setMessage('');
    setTranscript('');
    toggleMode(setIsSearchModeActive); // Automatically switch to search mode
    startListening();
  };

  const handleUploadFileToggle = () => {
    resetAllModes();
    setUploadFile(true);
    setIsAddMoreModalOpen(false);
    setIsAddFromAppsModalOpen(false);
  };
  
  const handleCloseAddModals = () => {
    setIsAddMoreModalOpen(false);
    setIsAddFromAppsModalOpen(false);
  };
  
  const handleConnectGoogleDrive = () => {
    toast.info("Connecting to Google Drive... (Feature coming soon!)");
    handleCloseAddModals();
  };
  
  const handleConnectGooglePhotos = () => {
    toast.info("Connecting to Google Photos... (Feature coming soon!)");
    handleCloseAddModals();
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if(selectedFile) {
        if(selectedFile.size > 25 * 1024 * 1024) { // 25MB check
            toast.error("File is too large. Max size is 25MB.");
            return;
        }
        setFile(selectedFile);
        resetAllModes();
    }
    setUploadFile(false);
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || (!message.trim() && !file)) return;

    setIsSubmitting(true);
    try {
        if (isImageModeActive) await onImagePromptSubmit({ prompt: message, negative_prompt: imageNegativePrompt, model: imageModel, size: imageSize, guidance_scale: imageGuidanceScale }, message);
        else if (isAudioModeActive) await onAudioPromptSubmit({ prompt: message, negative_prompt: audioNegativePrompt, duration_seconds: audioDuration, seed: audioSeed, model: audioModel }, message);
        else if (isVideoModeActive) await onVideoPromptSubmit({ prompt: message, negative_prompt: videoNegativePrompt, guidance_scale: videoGuidanceScale, num_frames: videoNumFrames, duration: videoDuration, seed: videoSeed, width: videoWidth, height: videoHeight, num_inference_steps: videoNumInferenceSteps, decode_timestep: videoDecodeTimestep, decode_noise_scale: videoDecodeNoiseScale, upscale_and_refine: videoUpscaleAndRefine }, message);
        else if (isAIChatModeActive) await onAIChatSubmit(message, aiChatParams);
        else if (isSearchModeActive) await onSearchSubmit(message);
        else if (isCodeModeActive) await onWriteCodeSubmit(message);
        else await sendMessage(message, file);
      
        setMessage(''); setFile(null); setTranscript('');
    } catch (error) {
        console.error("Submission failed:", error);
        toast.error("An error occurred during submission.");
    } finally {
        setIsSubmitting(false);
        if (isSearchModeActive || isCodeModeActive) { // Reset mode after submission
            resetAllModes();
        }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };
  
  // --- UI LOGIC ---
  let placeholderText = "Ask Colombo...";
  if (isListening) placeholderText = "Listening for your search query...";
  else if (isImageModeActive) placeholderText = "Describe an image to generate...";
  else if (isAudioModeActive) placeholderText = "Describe audio to generate...";
  else if (isVideoModeActive) placeholderText = "Describe a video to generate...";
  else if (isAIChatModeActive) placeholderText = "Ask Colombo...";
  else if (isSearchModeActive) placeholderText = "What do you want to search for?";
  else if (isCodeModeActive) placeholderText = "Describe the code you need...";
  else if (file) placeholderText = `Attached: ${file.name}. Add a message...`;

  const isAnyGenerationMode = isImageModeActive || isAudioModeActive || isVideoModeActive || isAIChatModeActive || isSearchModeActive || isCodeModeActive;
  const modalButtonsStyle = "flex items-center gap-x-3 text-gray-700 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-gray-700 w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium";

  if (uploadFile) {
    return (
      <div className='relative w-full flex justify-center'>
        <div style={dynamicBorderStyle} className="flex flex-col items-center w-full mt-[1.2rem] rounded-[1.5rem] p-4 bg-white dark:bg-gray-800">
          <p className='w-full text-center font-bold text-black dark:text-gray-100 md:text-base lg:text-lg xl:text-xl relative'>
            Drag & Drop or upload your file
            <button type='button' onClick={() => setUploadFile(false)} className='absolute top-1/2 right-0 -translate-y-1/2 font-normal text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-pointer'><span>×</span></button>
          </p>
          <hr className='border-[0.1px] w-full border-gray-300 dark:border-gray-600 my-4' />
          <button type="button" onClick={() => fileInputRef.current?.click()} className='my-4'><CustomUploadIcon w={80} h={80} /></button>
          <button style={{ background: 'linear-gradient(180deg, #6237FF, #258EFF)', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'normal' }} className='px-6 py-2 text-sm' onClick={() => fileInputRef.current?.click()}>UPLOAD</button>
          <p className='text-gray-500 dark:text-gray-400 mt-4 text-xs'>Max 25mb only</p>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        </div>
      </div>
    );
  }

  return (
    <div className='shadow-lg rounded-2xl'>
      <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center">
        <div style={dynamicBorderStyle} className="relative flex flex-col bg-white dark:bg-gray-800 px-2 sm:px-4 pt-3 sm:pt-4 pb-2 rounded-lg items-center w-full">
          <TextareaAutosize ref={inputRef} value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholderText} minRows={6} maxRows={8} className="w-full transition bg-transparent p-1 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm self-start text-black dark:text-white resize-none focus:outline-none max-h-48" />

          <div className="flex items-center justify-between w-full mt-2">
            {/* --- Left Aligned Icons --- */}
            <div className="flex items-center gap-x-1">
              <TooltipIconButton onClick={() => setIsAddMoreModalOpen(prev => !prev)} label="Add" className={isAddMoreModalOpen ? 'bg-neutral-200 dark:bg-gray-600' : ''}><Plus size={20} /></TooltipIconButton>
              <TooltipIconButton onClick={() => setIsToolsModalOpen(true)} label="Tools" className={isToolsModalOpen ? 'bg-neutral-200 dark:bg-gray-600' : ''}><Sparkles size={20} /></TooltipIconButton>
              <TooltipIconButton onClick={() => toggleMode(setIsAIChatModeActive)} label="AI Chat Mode"><AIChatIcon size={20} color={isAIChatModeActive ? '#3B82F6' : 'currentColor'} /></TooltipIconButton>
            </div>

            {/* --- Right Aligned Icons --- */}
            <div className='flex items-center gap-x-2'>
              {/* --- MODIFIED: Mic Button for Voice Search --- */}
              <TooltipIconButton
                onClick={handleStartRecording}
                label={isListening ? "Recording..." : "Search with Voice"}
                disabled={isListening}
                className={isSearchModeActive ? 'bg-neutral-200 dark:bg-gray-600' : ''}
              >
                <Mic size={20} color={isListening ? '#EF4444' : 'currentColor'} />
              </TooltipIconButton>

              <TooltipIconButton onClick={() => toggleMode(setIsAudioModeActive)} label="Use Voice Mode"><CustomAudioWaveformIcon size={20} color={isAudioModeActive ? '#3B82F6' : 'currentColor'} /></TooltipIconButton>
              <div className="relative group">
                <button type="submit" disabled={isSubmitting || (isAnyGenerationMode ? !message.trim() : (!message.trim() && !file))} className="bg-[#D2E3FD] dark:bg-blue-600 text-blue-900 dark:text-white disabled:text-black/50 dark:disabled:text-white/50 disabled:bg-gray-200 dark:disabled:bg-gray-700 hover:bg-opacity-85 transition duration-100 rounded-full p-2">
                  {isSubmitting ? <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <ArrowRight size={17} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
      
      {/* --- Modals --- */}
      <AddMoreModal className='top-48 left-0' isOpen={isAddMoreModalOpen} onClose={handleCloseAddModals}>
        <div className="flex flex-col space-y-1 p-1">
          <button type="button" onClick={handleUploadFileToggle} className={modalButtonsStyle}><Paperclip size={20} /><span>Upload documents</span></button>
          <button type="button" onClick={() => setIsAddFromAppsModalOpen(true)} className={`${modalButtonsStyle} ${isAddFromAppsModalOpen ? 'bg-neutral-200 dark:bg-gray-700' : ''}`}>
            <Combine size={20} />
            <span>Add from Apps</span>
            <ChevronRight size={16}/>
          </button>
        </div>
      </AddMoreModal>

      <AddMoreModal className='top-68 left-52 z-50 shadow-xl' isOpen={isAddFromAppsModalOpen} onClose={() => setIsAddFromAppsModalOpen(false)}>
        <div className="flex flex-col space-y-1 p-1 w-40 ">
            <button type="button" onClick={handleConnectGoogleDrive} className={`${modalButtonsStyle} hover:text-blue-400 dark:hover:text-blue-400`}>
                <GoogleDriveIcon size={18} />
                <span>Google Drive</span>
            </button>
            <button type="button" onClick={handleConnectGooglePhotos} className={`${modalButtonsStyle} hover:text-blue-400 dark:hover:text-blue-400`}>
                <GooglePhotosIcon size={18}  />
                <span>Google Photos</span>
            </button>
        </div>
      </AddMoreModal>

      <AddMoreModal className='top-48 left-52' isOpen={isToolsModalOpen} onClose={() => setIsToolsModalOpen(false)}>
        <div className="flex flex-col space-y-1 p-1">
            <button type="button" onClick={() => toggleMode(setIsImageModeActive)} className={modalButtonsStyle}><ImageIconLucide size={20} /><span>Generate Image</span></button>
            <button type="button" onClick={() => toggleMode(setIsVideoModeActive)} className={modalButtonsStyle}><VideoIconLucide size={20} /><span>Generate Video</span></button>
            <button type="button" onClick={() => toggleMode(setIsSearchModeActive)} className={modalButtonsStyle}><Search size={20}/><span>Search Web</span></button>
            <button type="button" onClick={() => toggleMode(setIsCodeModeActive)} className={modalButtonsStyle}><Code size={20}/><span>Write or Code</span></button>
        </div>
      </AddMoreModal>

      {/* Parameter Modals */}
      {isImageModeActive && <GenericModal isOpen={isImageParamsModalOpen} onClose={() => setIsImageParamsModalOpen(false)} title="Image Generation Settings" size="lg"><ImageGenerationPanel imageNegativePrompt={imageNegativePrompt} setImageNegativePrompt={setImageNegativePrompt} imageModel={imageModel} setImageModel={setImageModel} imageSize={imageSize} setImageSize={setImageSize} imageGuidanceScale={imageGuidanceScale} setImageGuidanceScale={setImageGuidanceScale} defaultModelName={process.env.NEXT_PUBLIC_COLOMBO_DEFAULT_MODEL || "flux"} /></GenericModal>}
      {isAudioModeActive && <GenericModal isOpen={isAudioParamsModalOpen} onClose={() => setIsAudioParamsModalOpen(false)} title="Audio Generation Settings" size="lg"><AudioGenerationPanel audioNegativePrompt={audioNegativePrompt} setAudioNegativePrompt={setAudioNegativePrompt} audioDuration={audioDuration} setAudioDuration={setAudioDuration} audioSeed={audioSeed} setAudioSeed={setAudioSeed} audioModel={audioModel} setAudioModel={setAudioModel} defaultModelName={process.env.NEXT_PUBLIC_COLOMBO_AUDIO_DEFAULT_MODEL || "stable-audio-open-1.0"} /></GenericModal>}
      {isVideoModeActive && <GenericModal isOpen={isVideoParamsModalOpen} onClose={() => setIsVideoParamsModalOpen(false)} title="Video Generation Settings" size="xl"><VideoGenerationParametersPanel negativePrompt={videoNegativePrompt} setNegativePrompt={setVideoNegativePrompt} videoGuidanceScale={videoGuidanceScale} setVideoGuidanceScale={setVideoGuidanceScale} videoNumFrames={videoNumFrames} setVideoNumFrames={setVideoNumFrames} videoDuration={videoDuration} setVideoDuration={setVideoDuration} videoSeed={videoSeed} setVideoSeed={setVideoSeed} videoWidth={videoWidth} setVideoWidth={setVideoWidth} videoHeight={videoHeight} setVideoHeight={setVideoHeight} videoNumInferenceSteps={videoNumInferenceSteps} setVideoNumInferenceSteps={setVideoNumInferenceSteps} videoDecodeTimestep={videoDecodeTimestep} setVideoDecodeTimestep={setVideoDecodeTimestep} videoDecodeNoiseScale={videoDecodeNoiseScale} setVideoDecodeNoiseScale={setVideoDecodeNoiseScale} videoUpscaleAndRefine={videoUpscaleAndRefine} setVideoUpscaleAndRefine={setVideoUpscaleAndRefine} /></GenericModal>}
      {isAIChatModeActive && <GenericModal isOpen={isAIChatParamsModalOpen} onClose={() => setIsAIChatParamsModalOpen(false)} title="AI Chat Settings" size="md"><ChatCompletionParametersPanel params={aiChatParams} setParams={setAIChatParams} defaultModelName="qwen-3" /></GenericModal>}
    </div>
  );
};

export default EmptyChatMessageInput;
