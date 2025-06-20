// components/MessageInput.tsx
import { cn } from '@/lib/utils';
// Corrected import for CustomAudioWaveformIcon, Paperclip is already there
import { ArrowUp, Image as ImageIconLucide, Paperclip, Video as VideoIconLucide } from 'lucide-react'; // Added VideoIconLucide
import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import CopilotToggle from './MessageInputActions/Copilot';
import ImageGenerationPanel from './ImageGenerationPanel';
import AudioGenerationPanel from './AudioGenerationPanel';
import CustomAudioWaveformIcon from './Icons/CustomAudioWaveformIcon'; // Correct import
import VideoGenerationParametersPanel, { VideoGenParams as UIVideoGenParams } from './VideoGenerationParametersPanel'; // Added

// Re-export for ChatWindow
export type { UIVideoGenParams as VideoGenParams };

interface ImageGenParams { prompt: string; negative_prompt?: string; model?: string; size?: string; guidance_scale?: number; }
interface AudioGenParams { prompt: string; negative_prompt?: string; duration_seconds?: number; seed?: number; model?: string; }
interface MessageInputProps {
  sendMessage: (message: string, file: File | null) => void;
  loading: boolean;
  onImagePromptSubmit: (params: ImageGenParams, imagePromptText: string) => void;
  onAudioPromptSubmit: (params: AudioGenParams, audioPromptText: string) => void;
  onVideoPromptSubmit: (params: UIVideoGenParams, videoPromptText: string) => void; // Added for video
}

const MessageInput = ({
  sendMessage,
  loading,
  onImagePromptSubmit,
  onAudioPromptSubmit,
  onVideoPromptSubmit, // Added for video
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

  // Video Mode State - NEW
  const [isVideoModeActive, setIsVideoModeActive] = useState(false);
  const [showVideoParamsPanel, setShowVideoParamsPanel] = useState(false);
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
  const [isSubmittingVideo, setIsSubmittingVideo] = useState(false);

  useEffect(() => {
    // Desktop: single/multi line mode based on content
    // Mobile: will mostly be 'multi' due to new layout
    if (typeof window !== 'undefined' && window.innerWidth >= 768) { // md breakpoint
        if (textareaRows >= 2 && message && mode === 'single' && !isImageModeActive && !isAudioModeActive && !isVideoModeActive) { // Updated condition
            setMode('multi');
        } else if (!message && !isImageModeActive && !isAudioModeActive && !isVideoModeActive && mode === 'multi') { // Updated condition
            setMode('single');
        }
    }
  }, [textareaRows, mode, message, isImageModeActive, isAudioModeActive, isVideoModeActive]); // Added isVideoModeActive

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
      if (mode === 'multi' && !isImageModeActive && !isAudioModeActive && typeof window !== 'undefined' && window.innerWidth >= 768) setMode('single');
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

  const handleVideoGenerationRequest = async () => { // NEW
    if (loading || isSubmittingImage || isSubmittingAudio || isSubmittingVideo || !message.trim()) return;
    setIsSubmittingVideo(true);
    const params: UIVideoGenParams = {
      prompt: message,
      negative_prompt: videoNegativePrompt.trim() || undefined,
      guidance_scale: videoGuidanceScale,
      num_frames: videoNumFrames,
      duration: videoDuration,
      model: "ltx-video",
      seed: videoSeed,
      width: videoWidth,
      height: videoHeight,
      num_inference_steps: videoNumInferenceSteps,
      decode_timestep: videoDecodeTimestep,
      decode_noise_scale: videoDecodeNoiseScale,
      upscale_and_refine: videoUpscaleAndRefine,
    };
    onVideoPromptSubmit(params, message);
    setMessage('');
    setIsSubmittingVideo(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
        setIsImageModeActive(false); setShowImageParamsPanel(false);
        setIsAudioModeActive(false); setShowAudioParamsPanel(false);
        setIsVideoModeActive(false); setShowVideoParamsPanel(false); // NEW: Deactivate video mode
    }
  };
  const handleUploadFileClick = () => { fileInputRef.current?.click(); };

  const handleImageModeToggle = () => {
    const newImageModeState = !isImageModeActive;
    setIsImageModeActive(newImageModeState);
    setShowImageParamsPanel(newImageModeState);
    if (newImageModeState) {
      setFile(null);
      setIsAudioModeActive(false); setShowAudioParamsPanel(false);
      setIsVideoModeActive(false); setShowVideoParamsPanel(false); // NEW
      inputRef.current?.focus();
    }
  };

  const handleAudioModeToggle = () => {
    const newAudioModeState = !isAudioModeActive;
    setIsAudioModeActive(newAudioModeState);
    setShowAudioParamsPanel(newAudioModeState);
    if (newAudioModeState) {
      setFile(null);
      setIsImageModeActive(false); setShowImageParamsPanel(false);
      setIsVideoModeActive(false); setShowVideoParamsPanel(false); // NEW
      inputRef.current?.focus();
    }
  };

  const handleVideoModeToggle = () => { // NEW
    const newVideoModeState = !isVideoModeActive;
    setIsVideoModeActive(newVideoModeState);
    setShowVideoParamsPanel(newVideoModeState);
    if (newVideoModeState) {
      setFile(null);
      setIsImageModeActive(false); setShowImageParamsPanel(false);
      setIsAudioModeActive(false); setShowAudioParamsPanel(false);
      inputRef.current?.focus();
    }
  };

  const effectiveModeForDesktop = isImageModeActive || isAudioModeActive || isVideoModeActive ? 'multi' : mode; // Updated condition

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isImageModeActive) handleImageGenerationRequest();
    else if (isAudioModeActive) handleAudioGenerationRequest();
    else if (isVideoModeActive) handleVideoGenerationRequest(); // NEW
    else handleMainSendMessage();
   };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isImageModeActive) handleImageGenerationRequest();
      else if (isAudioModeActive) handleAudioGenerationRequest();
      else if (isVideoModeActive) handleVideoGenerationRequest(); // NEW
      else handleMainSendMessage();
    }
   };

  let placeholderText = file ? `Attached: ${file.name}. Add a message...` : "Ask a follow-up";
  if (isImageModeActive) placeholderText = "Describe image to generate...";
  else if (isAudioModeActive) placeholderText = "Describe audio to generate...";
  else if (isVideoModeActive) placeholderText = "Describe video to generate..."; // NEW

  return (
    <div className="w-full px-[5px] md:px-4 pb-2 sticky bottom-0 bg-white dark:bg-slate-900">
      <form
        style={borderStyle}
        onSubmit={handleSubmit}
        className={cn(
          'bg-white dark:bg-slate-800 p-2 md:p-3 flex flex-col md:flex-row items-center overflow-hidden border rounded-lg',
          `md:${effectiveModeForDesktop === 'multi' ? 'flex-col rounded-lg' : 'flex-row rounded-full'}`
        )}
      >
        <TextareaAutosize
          ref={inputRef}
          value={message}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onHeightChange={(height: number, props: { rowHeight: number }) => {
            // For desktop, update rows which might change mode
            if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                setTextareaRows(Math.ceil(height / props.rowHeight));
            }
          }}
          minRows={3}
          className="w-full transition bg-transparent placeholder:text-[#ACACAC] dark:placeholder:text-gray-500 placeholder:text-sm text-black dark:text-white text-sm resize-none focus:outline-none px-2 max-h-36 md:max-h-24 lg:max-h-36 xl:max-h-48 order-1"
          placeholder={placeholderText}
        />

        <div className={cn(
          "flex items-center w-full mt-2 md:mt-0",
          `md:${effectiveModeForDesktop === 'multi' ? "justify-between" : "ml-2"}`,
          "order-2"
        )}>
          <div className="flex items-center space-x-1 flex-grow md:flex-grow-0">
            <button type="button" onClick={handleUploadFileClick} title="Attach file" className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-50" disabled={isImageModeActive || isAudioModeActive || isVideoModeActive}>
              <Paperclip size={20} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <button type="button" onClick={handleImageModeToggle} title={isImageModeActive ? "Switch to Text/Audio/Video Mode" : "Switch to Image Mode"} className={`p-2 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center ${isImageModeActive ? 'bg-blue-500 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-500 dark:hover:text-blue-400'}`} disabled={isAudioModeActive || isVideoModeActive}>
              <ImageIconLucide size={20} />
            </button>
            <button type="button" onClick={handleAudioModeToggle} title={isAudioModeActive ? "Switch to Text/Image/Video Mode" : "Switch to Audio Mode"} className={`p-2 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center ${isAudioModeActive ? 'bg-purple-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-500 dark:hover:text-purple-400'}`} disabled={isImageModeActive || isVideoModeActive}>
              <CustomAudioWaveformIcon size={20} color={isAudioModeActive ? 'white' : (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'white' : 'currentColor')} />
            </button>
            {/* NEW Video Mode Toggle Button */}
            <button type="button" onClick={handleVideoModeToggle} title={isVideoModeActive ? "Switch to Text/Image/Audio Mode" : "Switch to Video Mode"} className={`p-2 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center ${isVideoModeActive ? 'bg-red-500 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400'}`} disabled={isImageModeActive || isAudioModeActive}>
              <VideoIconLucide size={20} />
            </button>
             <div className={cn("hidden", `md:${effectiveModeForDesktop === 'multi' ? "flex" : "hidden"}`)}>
                <CopilotToggle copilotEnabled={copilotEnabled} setCopilotEnabled={setCopilotEnabled} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isSubmittingImage || isSubmittingAudio || isSubmittingVideo || (isImageModeActive || isAudioModeActive || isVideoModeActive ? !message.trim() : (!message.trim() && !file))}
            className="bg-[#D2E3FD] dark:bg-blue-600 text-[#000080] dark:text-white disabled:text-black/50 dark:disabled:text-white/50 disabled:bg-[#e0e0dc79] dark:disabled:bg-gray-700 hover:bg-opacity-85 transition duration-100 rounded-full p-2 ml-2 md:ml-0 flex-shrink-0"
          >
            {(isSubmittingImage && isImageModeActive) || (isSubmittingAudio && isAudioModeActive) || (isSubmittingVideo && isVideoModeActive) ? ( // Updated condition
               <svg className="animate-spin h-4 w-4 text-[#000080] dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            ) : (
              <ArrowUp className={(isImageModeActive || isAudioModeActive || isVideoModeActive) ? "text-[#000080] dark:text-white" : "bg-background"} size={17} />
            )}
          </button>
        </div>

        {/* Parameter Panels Container - Ensure this is correctly placed based on 'multi' or 'single' mode for desktop */}
        <div className={cn("w-full pt-2 order-3", `md:${effectiveModeForDesktop === 'multi' ? 'block' : 'hidden'}`)}>
            {(isImageModeActive && showImageParamsPanel) && (
                <ImageGenerationPanel
              imageNegativePrompt={imageNegativePrompt} setImageNegativePrompt={setImageNegativePrompt}
              imageModel={imageModel} setImageModel={setImageModel}
              imageSize={imageSize} setImageSize={setImageSize}
              imageGuidanceScale={imageGuidanceScale} setImageGuidanceScale={setImageGuidanceScale}
              defaultModelName={process.env.NEXT_PUBLIC_COLOMBO_DEFAULT_MODEL || "flux"}
                />
            )}
            {(isAudioModeActive && showAudioParamsPanel) && (
                <AudioGenerationPanel
                audioNegativePrompt={audioNegativePrompt} setAudioNegativePrompt={setAudioNegativePrompt}
                audioDuration={audioDuration} setAudioDuration={setAudioDuration}
                audioSeed={audioSeed} setAudioSeed={setAudioSeed}
                audioModel={audioModel} setAudioModel={setAudioModel}
                defaultModelName={process.env.NEXT_PUBLIC_COLOMBO_AUDIO_DEFAULT_MODEL || "stable-audio-open-1.0"}
                />
            )}
            {/* NEW Video Parameters Panel */}
            {(isVideoModeActive && showVideoParamsPanel) && (
                <VideoGenerationParametersPanel
                    videoNegativePrompt={videoNegativePrompt} setVideoNegativePrompt={setVideoNegativePrompt}
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
            )}
        </div>
      </form>
      {file && !isImageModeActive && !isAudioModeActive && !isVideoModeActive && ( // Updated condition
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center md:text-left md:pl-10">
          Attached: {file.name} <button onClick={() => setFile(null)} className="text-red-500 ml-2">(Remove)</button>
        </div>
      )}
    </div>
  );
};
export default MessageInput;
