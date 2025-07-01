'use client';

import { cn } from '@/lib/utils';
import { ArrowUp, Paperclip, SlidersHorizontal as SlidersHorizontalIcon, Plus, Image as ImageIconLucide, Video as VideoIconLucide, Bot as AIChatIcon } from 'lucide-react';
import React, { useEffect, useRef, useState, ChangeEvent, useCallback, FunctionComponent as FC } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import CustomAudioWaveformIcon from './Icons/CustomAudioWaveformIcon';
import ImageGenerationPanel from './ImageGenerationPanel';
import AudioGenerationPanel from './AudioGenerationPanel';
import VideoGenerationParametersPanel, { VideoGenParams } from './VideoGenerationParametersPanel';
type UIVideoGenParams = VideoGenParams;
import ChatCompletionParametersPanel, { AIChatParams } from './ChatCompletionParametersPanel';
import GenericModal from './GenericModal';
import AddMoreModal from './modals/AddMoreModal';

export interface ImageGenParams { prompt: string; negative_prompt?: string; model?: string; size?: string; guidance_scale?: number; }
export interface AudioGenParams { prompt:string; negative_prompt?: string; duration_seconds?: number; seed?: number; model?: string; }
interface MessageInputProps {
  sendMessage: (message: string, file: File | null) => void;
  loading: boolean;
  onImagePromptSubmit: (params: ImageGenParams, imagePromptText: string) => void;
  onAudioPromptSubmit: (params: AudioGenParams, audioPromptText: string) => void;
  onVideoPromptSubmit: (params: UIVideoGenParams, videoPromptText: string) => void;
  onAIChatSubmit: (prompt: string, params: AIChatParams) => void;
}


interface TooltipIconButtonProps {
  onClick?: (e: React.MouseEvent) => void;
  label: string;
  children: React.ReactNode;
  isActive?: boolean;
  disabled?: boolean;
}
const TooltipIconButton: FC<TooltipIconButtonProps> = ({ onClick, label, children, isActive, disabled }) => {
  const baseClasses = 'relative group flex items-center justify-center p-2 rounded-full transition-colors duration-150';
  const activeClasses = 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400';
  const inactiveClasses = 'text-gray-500 hover:bg-neutral-100 dark:text-gray-400 dark:hover:bg-gray-700';
  const tooltipClasses = 'absolute bottom-full left-1/2 -translate-x-1/2 z-40 mb-2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-xs text-white invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity';

  return (
    <button type="button" onClick={onClick} title={label} disabled={disabled} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} disabled:opacity-50 disabled:cursor-not-allowed`}>
      {children}
      <div className={tooltipClasses}>{label}</div>
    </button>
  );
};

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
    borderImageSlice: 1,
  };
};



const MessageInput = ({
  sendMessage, loading, onImagePromptSubmit, onAudioPromptSubmit, onVideoPromptSubmit, onAIChatSubmit
}: MessageInputProps) => {
    const [imageModel, setImageModelState] = useState(process.env.NEXT_PUBLIC_COLOMBO_DEFAULT_MODEL || '');
  const [message, setMessage] = useState('');
  const [textareaRows, setTextareaRows] = useState(1);
  const [mode, setMode] = useState<'multi' | 'single'>('single');
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [isImageModeActive, setIsImageModeActive] = useState(false);
  const [isAudioModeActive, setIsAudioModeActive] = useState(false);
  const [isVideoModeActive, setIsVideoModeActive] = useState(false);
  const [isAIChatModeActive, setIsAIChatModeActive] = useState(false);
  const [isAddMoreModalOpen, setIsAddMoreModalOpen] = useState(false);
  
  const [isImageParamsModalOpen, setIsImageParamsModalOpen] = useState(false);
  const [isAudioParamsModalOpen, setIsAudioParamsModalOpen] = useState(false);
  const [isVideoParamsModalOpen, setIsVideoParamsModalOpen] = useState(false);
  const [isAIChatParamsModalOpen, setIsAIChatParamsModalOpen] = useState(false);
  
  const [isSubmittingImage, setIsSubmittingImage] = useState(false);
  const [isSubmittingAudio, setIsSubmittingAudio] = useState(false);
  const [isSubmittingVideo, setIsSubmittingVideo] = useState(false);
  const [isSubmittingAIChat, setIsSubmittingAIChat] = useState(false);
  
  const [isMobileView, setIsMobileView] = useState(true);

  // All your original parameter states are preserved
  const [imageNegativePrompt, setImageNegativePrompt] = useState('');
  const [imageSize, setImageSize] = useState('512x512');
  const [imageGuidanceScale, setImageGuidanceScale] = useState(7.5);

  // Audio generation parameters
  const [audioNegativePrompt, setAudioNegativePrompt] = useState('Low quality.');
  const [audioModel, setAudioModel] = useState(process.env.NEXT_PUBLIC_COLOMBO_AUDIO_DEFAULT_MODEL || 'stable-audio-open-1.0');
  const [audioDuration, setAudioDuration] = useState(10);
  const [audioSeed, setAudioSeed] = useState(0);

  // Video generation parameters
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

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobileView) {
        if (textareaRows >= 2 && message && mode === 'single' && !isImageModeActive && !isAudioModeActive && !isVideoModeActive && !isAIChatModeActive) {
            setMode('multi');
        } else if (!message && !isImageModeActive && !isAudioModeActive && !isVideoModeActive && !isAIChatModeActive && mode === 'multi') {
            setMode('single');
        }
    }
  }, [textareaRows, mode, message, isImageModeActive, isAudioModeActive, isVideoModeActive, isAIChatModeActive, isMobileView]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputFocused = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA' || activeElement?.hasAttribute('contenteditable');
      if (e.key === '/' && !isInputFocused) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
   }, []);

  const dynamicBorderStyle = useDynamicBorderStyle();
  const modalButtonsStyle = "flex items-center gap-x-2 text-gray-700 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-gray-700 w-full px-3 py-3 rounded-md text-left";

  const handleMainSendMessage = () => { /* ... your original logic ... */ };
  const handleImageGenerationRequest = useCallback(() => { /* ... your original logic ... */ }, [/* ... */]);
  const handleAudioGenerationRequest = useCallback(() => { /* ... your original logic ... */ }, [/* ... */]);
  const handleVideoGenerationRequest = useCallback(() => { /* ... your original logic ... */ }, [/* ... */]);
  const handleAIChatSubmit = useCallback(() => { /* ... your original logic ... */ }, [/* ... */]);
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => { /* ... your original logic ... */ };
  const handleUploadFileClick = useCallback(() => { fileInputRef.current?.click(); }, []);
  
  const handleImageModeToggle = () => { /* ... your original logic ... */ };
  const handleAudioModeToggle = () => { /* ... your original logic ... */ };
  const handleVideoModeToggle = () => { /* ... your original logic ... */ };
  const handleAIChatModeToggle = () => { /* ... your original logic ... */ };
  const openActiveParamsModal = () => { /* ... your original logic ... */ };

  const handleSubmitLogic = useCallback(() => {
    if (isImageModeActive) handleImageGenerationRequest();
    else if (isAudioModeActive) handleAudioGenerationRequest();
    else if (isVideoModeActive) handleVideoGenerationRequest();
    else if (isAIChatModeActive) handleAIChatSubmit();
    else if (message.trim()) handleAIChatSubmit();
    else if (file) handleMainSendMessage();
  }, [isImageModeActive, isAudioModeActive, isVideoModeActive, isAIChatModeActive, message, file, handleImageGenerationRequest, handleAudioGenerationRequest, handleVideoGenerationRequest, handleAIChatSubmit, handleMainSendMessage]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); handleSubmitLogic(); };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitLogic(); } };

  const effectiveModeForDesktop = (isImageModeActive || isAudioModeActive || isVideoModeActive || isAIChatModeActive) ? 'multi' : mode;
  let placeholderText = file ? `Attached: ${file.name}. Add a message...` : (isImageModeActive ? "Describe image to generate..." : "Ask a follow-up...");

  function setImageModel(value: string): void {
    // This setter updates the image model state for image generation
    // (Assumes you have a state variable: const [imageModel, setImageModelState] = useState(...))
    // If you already have the useState above, this function is not needed.
    // But if you need to expose it for props, just call the state setter:
    setImageModelState(value);
  }

  return (
    <>
      <div className="w-full px-[5px] md:px-4 pb-2 sticky bottom-0 bg-transparent ">
        <form
          style={dynamicBorderStyle}
          onSubmit={handleSubmit}
          
          className={cn(
            'px-2 sm:px-4 pt-3 sm:pt-4 pb-2   flex items-center overflow-visible',
            (effectiveModeForDesktop === 'multi' || isMobileView) ? 'flex-col rounded-lg' : 'md:flex-row md:rounded-lg '
          )}
        >
        
<TextareaAutosize
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onHeightChange={(height, props) => { if (!isMobileView) { setTextareaRows(Math.ceil(height / props.rowHeight)); } }}
            minRows={(effectiveModeForDesktop === 'multi' || isMobileView) ? 3 : 1}
            className="w-full transition bg-transparent p-1 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-black dark:text-white text-sm resize-none focus:outline-none px-2 max-h-48 "
            placeholder={placeholderText}
          />
       
          

          {isAddMoreModalOpen && (
            <AddMoreModal className='absolute left-64 bottom-full mb-2' isOpen={isAddMoreModalOpen} onClose={() => setIsAddMoreModalOpen(false)}>
              <div>
                <button type="button" onClick={handleUploadFileClick} title="Attach file" className={modalButtonsStyle}>
                  <Paperclip size={20} /> <span className="text-sm font-medium">Upload document</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button type="button" onClick={handleImageModeToggle} title="Image Mode" className={modalButtonsStyle}>
                  <ImageIconLucide size={20} /> <span className="text-sm font-medium">Generate Image</span>
                </button>
                <button type="button" onClick={handleVideoModeToggle} title="Video Mode" className={modalButtonsStyle}>
                  <VideoIconLucide size={20} /> <span className="text-sm font-medium">Generate Video</span>
                </button>
              </div>
            </AddMoreModal>
          )}
<TooltipIconButton onClick={() => setIsAddMoreModalOpen(true)} label="Add" isActive={isAddMoreModalOpen}>
                <Plus size={20} />
              </TooltipIconButton>
          <div className={cn( "flex justify-between w-full items-center mt-2  order-2", (effectiveModeForDesktop === 'multi' || isMobileView) ? "justify-between" : "md:ml-2 md:mt-0" )}>
             
            <div className="flex items-center space-x-1 flex-shrink-0">
             
              <TooltipIconButton onClick={handleImageModeToggle} label="Image Generation" isActive={isImageModeActive} disabled={isAudioModeActive || isVideoModeActive || isAIChatModeActive}>
                <ImageIconLucide size={18} />
              </TooltipIconButton>
              <TooltipIconButton onClick={handleAudioModeToggle} label="Audio Generation" isActive={isAudioModeActive} disabled={isImageModeActive || isVideoModeActive || isAIChatModeActive}>
                <CustomAudioWaveformIcon size={18} />
              </TooltipIconButton>
              <TooltipIconButton onClick={handleVideoModeToggle} label="Video Generation" isActive={isVideoModeActive} disabled={isImageModeActive || isAudioModeActive || isAIChatModeActive}>
                <VideoIconLucide size={18} />
              </TooltipIconButton>
              <TooltipIconButton onClick={handleAIChatModeToggle} label="AI Chat Mode" isActive={isAIChatModeActive} disabled={isImageModeActive || isAudioModeActive || isVideoModeActive}>
                <AIChatIcon size={18} />
              </TooltipIconButton>
              {(isImageModeActive || isAudioModeActive || isVideoModeActive || isAIChatModeActive) && (
                <TooltipIconButton onClick={openActiveParamsModal} label="Edit Parameters">
                  <SlidersHorizontalIcon size={18} />
                </TooltipIconButton>
              )}
</div>
            <div className="flex items-center space-x-2">
              <button
                type="submit"
                disabled={loading || isSubmittingImage || isSubmittingAudio || isSubmittingVideo || isSubmittingAIChat || (!message.trim() && !file)}
                className="bg-[#D2E3FD] dark:bg-blue-600 text-[#000080] dark:text-white disabled:text-black/50 dark:disabled:text-white/50 disabled:bg-gray-200 dark:disabled:bg-gray-700 hover:bg-opacity-85 transition duration-100 rounded-full p-2 flex-shrink-0"
              >
                {loading || isSubmittingImage || isSubmittingAudio || isSubmittingVideo || isSubmittingAIChat ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : ( <ArrowUp size={17} /> )}
              </button>
            </div>
          </div>
        </form>
        {file && !isImageModeActive && !isAudioModeActive && !isVideoModeActive && !isAIChatModeActive && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center md:text-left md:pl-10">
            Attached: {file.name} <button onClick={() => setFile(null)} className="text-red-500 hover:text-red-600 ml-2">(Remove)</button>
          </div>
        )}
      </div>

      {isImageModeActive && (
        <GenericModal isOpen={isImageParamsModalOpen} onClose={() => setIsImageParamsModalOpen(false)} title="Image Generation Settings" size="lg">
          <ImageGenerationPanel
            imageNegativePrompt={imageNegativePrompt} setImageNegativePrompt={setImageNegativePrompt}
            imageModel={imageModel} setImageModel={setImageModel}
            imageSize={imageSize} setImageSize={setImageSize}
            imageGuidanceScale={imageGuidanceScale} setImageGuidanceScale={setImageGuidanceScale}
            defaultModelName={process.env.NEXT_PUBLIC_COLOMBO_DEFAULT_MODEL || "flux"}
          />
        </GenericModal>
      )}
      {isAudioModeActive && (
        <GenericModal isOpen={isAudioParamsModalOpen} onClose={() => setIsAudioParamsModalOpen(false)} title="Audio Generation Settings" size="lg">
          <AudioGenerationPanel
            audioNegativePrompt={audioNegativePrompt} setAudioNegativePrompt={setAudioNegativePrompt}
            audioDuration={audioDuration} setAudioDuration={setAudioDuration}
            audioSeed={audioSeed} setAudioSeed={setAudioSeed}
            audioModel={audioModel} setAudioModel={setAudioModel}
            defaultModelName={process.env.NEXT_PUBLIC_COLOMBO_AUDIO_DEFAULT_MODEL || "stable-audio-open-1.0"}
          />
        </GenericModal>
      )}
      {isVideoModeActive && (
        <GenericModal isOpen={isVideoParamsModalOpen} onClose={() => setIsVideoParamsModalOpen(false)} title="Video Generation Settings" size="xl">
          <VideoGenerationParametersPanel
            negativePrompt={videoNegativePrompt} setNegativePrompt={setVideoNegativePrompt}
            videoGuidanceScale={videoGuidanceScale} setVideoGuidanceScale={setVideoGuidanceScale}
            videoNumFrames={videoNumFrames} setVideoNumFrames={setVideoNumFrames}
            videoDuration={videoDuration} setVideoDuration={setVideoDuration}
            videoSeed={videoSeed} setVideoSeed={setVideoSeed}
            videoWidth={videoWidth} setVideoWidth={setVideoWidth}
            videoHeight={videoHeight} setVideoHeight={setVideoHeight}
            videoNumInferenceSteps={videoNumInferenceSteps} setVideoNumInferenceSteps={setVideoNumInferenceSteps}
            videoDecodeTimestep={videoDecodeTimestep} setVideoDecodeTimestep={setVideoDecodeTimestep}
            videoDecodeNoiseScale={videoDecodeNoiseScale} setVideoDecodeNoiseScale={setVideoDecodeNoiseScale}
            videoUpscaleAndRefine={videoUpscaleAndRefine} setVideoUpscaleAndRefine={setVideoUpscaleAndRefine}

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
    </>
  );
};

export default MessageInput;