// components/MessageInput.tsx
import { cn } from '@/lib/utils';
import { ArrowUp, Image as ImageIconLucide, Paperclip, Video as VideoIconLucide, SlidersHorizontal as SlidersHorizontalIcon } from 'lucide-react'; // Added SlidersHorizontalIcon
import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import CopilotToggle from './MessageInputActions/Copilot';
import ImageGenerationPanel from './ImageGenerationPanel';
import AudioGenerationPanel from './AudioGenerationPanel';
import CustomAudioWaveformIcon from './Icons/CustomAudioWaveformIcon';
import VideoGenerationParametersPanel, { VideoGenParams as UIVideoGenParams } from './VideoGenerationParametersPanel';
import GenericModal from './GenericModal'; // Import GenericModal

export type { UIVideoGenParams as VideoGenParams };
export interface ImageGenParams { prompt: string; negative_prompt?: string; model?: string; size?: string; guidance_scale?: number; }
export interface AudioGenParams { prompt: string; negative_prompt?: string; duration_seconds?: number; seed?: number; model?: string; }

interface MessageInputProps {
  sendMessage: (message: string, file: File | null) => void;
  loading: boolean; // General loading from ChatWindow (e.g., for WS text messages)
  onImagePromptSubmit: (params: ImageGenParams, imagePromptText: string) => void;
  onAudioPromptSubmit: (params: AudioGenParams, audioPromptText: string) => void;
  onVideoPromptSubmit: (params: UIVideoGenParams, videoPromptText: string) => void;
}

const MessageInput = ({
  sendMessage,
  loading,
  onImagePromptSubmit,
  onAudioPromptSubmit,
  onVideoPromptSubmit,
}: MessageInputProps) => {
  const [copilotEnabled, setCopilotEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [textareaRows, setTextareaRows] = useState(1);
  const [mode, setMode] = useState<'multi' | 'single'>('single');

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // Image states
  const [isImageModeActive, setIsImageModeActive] = useState(false);
  const [isImageParamsModalOpen, setIsImageParamsModalOpen] = useState(false); // NEW
  const [imageNegativePrompt, setImageNegativePrompt] = useState('');
  const [imageModel, setImageModel] = useState(process.env.NEXT_PUBLIC_COLOMBO_DEFAULT_MODEL || '');
  const [imageSize, setImageSize] = useState('512x512');
  const [imageGuidanceScale, setImageGuidanceScale] = useState(7.5);
  const [isSubmittingImage, setIsSubmittingImage] = useState(false);

  // Audio states
  const [isAudioModeActive, setIsAudioModeActive] = useState(false);
  const [isAudioParamsModalOpen, setIsAudioParamsModalOpen] = useState(false); // NEW
  const [audioNegativePrompt, setAudioNegativePrompt] = useState('Low quality.');
  const [audioModel, setAudioModel] = useState(process.env.NEXT_PUBLIC_COLOMBO_AUDIO_DEFAULT_MODEL || 'stable-audio-open-1.0');
  const [audioDuration, setAudioDuration] = useState(10);
  const [audioSeed, setAudioSeed] = useState(0);
  const [isSubmittingAudio, setIsSubmittingAudio] = useState(false);

  // Video states
  const [isVideoModeActive, setIsVideoModeActive] = useState(false);
  const [isVideoParamsModalOpen, setIsVideoParamsModalOpen] = useState(false); // NEW
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

  const [isMobileView, setIsMobileView] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobileView) {
        if (textareaRows >= 2 && message && mode === 'single' && !isImageModeActive && !isAudioModeActive && !isVideoModeActive) {
            setMode('multi');
        } else if (!message && !isImageModeActive && !isAudioModeActive && !isVideoModeActive && mode === 'multi') {
            setMode('single');
        }
    }
  }, [textareaRows, mode, message, isImageModeActive, isAudioModeActive, isVideoModeActive, isMobileView]);

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
    if (isImageModeActive || isAudioModeActive || isVideoModeActive) {
        console.warn("Send message called while a generation mode is active. This should be handled by specific generation handlers.");
        return;
    }
    if (loading || isSubmittingImage || isSubmittingAudio || isSubmittingVideo) return;
    if (message.trim().length > 0 || file) {
      sendMessage(message, file);
      setMessage('');
      setFile(null);
      if (!isMobileView && mode === 'multi') {
        setMode('single');
      }
    }
  };

  const handleImageGenerationRequest = async () => {
    if (loading || isSubmittingImage || isSubmittingAudio || isSubmittingVideo || !message.trim()) return;
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
    // Panel is now modal, no need to manage showImageParamsPanel here
  };

  const handleAudioGenerationRequest = async () => {
    if (loading || isSubmittingImage || isSubmittingAudio || isSubmittingVideo || !message.trim()) return;
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
    // Panel is now modal
  };

  const handleVideoGenerationRequest = async () => {
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
    // Panel is now modal
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
        setIsImageModeActive(false); setIsImageParamsModalOpen(false);
        setIsAudioModeActive(false); setIsAudioParamsModalOpen(false);
        setIsVideoModeActive(false); setIsVideoParamsModalOpen(false);
    }
  };
  const handleUploadFileClick = () => { fileInputRef.current?.click(); };

  const handleImageModeToggle = () => {
    const newImageModeState = !isImageModeActive;
    setIsImageModeActive(newImageModeState);
    if (newImageModeState) {
      setFile(null);
      setIsAudioModeActive(false); setIsAudioParamsModalOpen(false);
      setIsVideoModeActive(false); setIsVideoParamsModalOpen(false);
      inputRef.current?.focus();
    } else {
      setIsImageParamsModalOpen(false);
    }
  };

  const handleAudioModeToggle = () => {
    const newAudioModeState = !isAudioModeActive;
    setIsAudioModeActive(newAudioModeState);
    if (newAudioModeState) {
      setFile(null);
      setIsImageModeActive(false); setIsImageParamsModalOpen(false);
      setIsVideoModeActive(false); setIsVideoParamsModalOpen(false);
      inputRef.current?.focus();
    } else {
      setIsAudioParamsModalOpen(false);
    }
  };

  const handleVideoModeToggle = () => {
    const newVideoModeState = !isVideoModeActive;
    setIsVideoModeActive(newVideoModeState);
    if (newVideoModeState) {
      setFile(null);
      setIsImageModeActive(false); setIsImageParamsModalOpen(false);
      setIsAudioModeActive(false); setIsAudioParamsModalOpen(false);
      inputRef.current?.focus();
    } else {
      setIsVideoParamsModalOpen(false);
    }
  };

  const openActiveParamsModal = () => {
    if (isImageModeActive) setIsImageParamsModalOpen(true);
    else if (isAudioModeActive) setIsAudioParamsModalOpen(true);
    else if (isVideoModeActive) setIsVideoParamsModalOpen(true);
  };

  const effectiveModeForDesktop = (isImageModeActive || isAudioModeActive || isVideoModeActive) ? 'multi' : mode;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isImageModeActive) handleImageGenerationRequest();
    else if (isAudioModeActive) handleAudioGenerationRequest();
    else if (isVideoModeActive) handleVideoGenerationRequest();
    else handleMainSendMessage();
   };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isImageModeActive) handleImageGenerationRequest();
      else if (isAudioModeActive) handleAudioGenerationRequest();
      else if (isVideoModeActive) handleVideoGenerationRequest();
      else handleMainSendMessage();
    }
   };

  let placeholderText = file ? `Attached: ${file.name}. Add a message...` : "Ask a follow-up";
  if (isImageModeActive) placeholderText = "Describe image to generate...";
  else if (isAudioModeActive) placeholderText = "Describe audio to generate...";
  else if (isVideoModeActive) placeholderText = "Describe video to generate...";

  return (
    <>
      <div className="w-full px-[5px] md:px-4 pb-2 sticky bottom-0 bg-white dark:bg-slate-900">
        <form
          style={borderStyle}
          onSubmit={handleSubmit}
          className={cn(
            'bg-white dark:bg-slate-800 p-2 md:p-3 flex items-center overflow-hidden border',
            (effectiveModeForDesktop === 'multi' || isMobileView) ?
              'flex-col rounded-lg' :
              'md:flex-row md:rounded-full'
          )}
        >
          <TextareaAutosize
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onHeightChange={(height, props) => {
              if (!isMobileView) {
                  setTextareaRows(Math.ceil(height / props.rowHeight));
              }
            }}
            minRows={(effectiveModeForDesktop === 'multi' || isMobileView) ? 3 : 1}
            className="w-full transition bg-transparent placeholder:text-[#ACACAC] dark:placeholder:text-gray-500 placeholder:text-sm text-black dark:text-white text-sm resize-none focus:outline-none px-2 max-h-36 md:max-h-24 lg:max-h-36 xl:max-h-48 order-1"
            placeholder={placeholderText}
          />

          <div className={cn(
            "flex items-center w-full mt-2",
            (effectiveModeForDesktop === 'multi' || isMobileView) ? "justify-between" : "md:ml-2 md:mt-0",
            "order-2"
          )}>
            {/* Left Group: Actionable Icons */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button type="button" onClick={handleUploadFileClick} title="Attach file" className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-50" disabled={isImageModeActive || isAudioModeActive || isVideoModeActive}>
                <Paperclip size={20} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              <button type="button" onClick={handleImageModeToggle} title={isImageModeActive ? "Switch to Text/Audio/Video Mode" : "Switch to Image Mode"} className={`p-2 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center ${isImageModeActive ? 'bg-blue-500 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-500 dark:hover:text-blue-400'}`} disabled={isAudioModeActive || isVideoModeActive}>
                <ImageIconLucide size={20} />
              </button>
              <button type="button" onClick={handleAudioModeToggle} title={isAudioModeActive ? "Switch to Text/Image/Video Mode" : "Switch to Audio Mode"} className={`p-2 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center ${isAudioModeActive ? 'bg-purple-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-500 dark:hover:text-purple-400'}`} disabled={isImageModeActive || isVideoModeActive}>
                <CustomAudioWaveformIcon size={20} color={isAudioModeActive ? 'white' : 'currentColor'} />
              </button>
              <button type="button" onClick={handleVideoModeToggle} title={isVideoModeActive ? "Switch to Text/Image/Audio Mode" : "Switch to Video Mode"} className={`p-2 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center ${isVideoModeActive ? 'bg-red-500 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400'}`} disabled={isImageModeActive || isAudioModeActive}>
                <VideoIconLucide size={20} />
              </button>
              {(isImageModeActive || isAudioModeActive || isVideoModeActive) && (
                <button
                  type="button"
                  onClick={openActiveParamsModal}
                  title="Edit Parameters"
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                >
                  <SlidersHorizontalIcon size={20} />
                </button>
              )}
              <div className={cn("hidden", `md:${effectiveModeForDesktop === 'multi' && !isMobileView ? "flex items-center" : "hidden"}`)}>
                <CopilotToggle copilotEnabled={copilotEnabled} setCopilotEnabled={setCopilotEnabled} />
              </div>
            </div>

            {/* Right Group: Static Audio Icon (conditional) + Submit Button */}
            <div className="flex items-center space-x-2">
              <div className={cn("hidden", `md:${effectiveModeForDesktop === 'multi' && !isMobileView ? "flex items-center" : "hidden"}`)}>
                <CustomAudioWaveformIcon size={20} color="currentColor" />
              </div>
              <button
                type="submit"
                disabled={loading || isSubmittingImage || isSubmittingAudio || isSubmittingVideo || (isImageModeActive || isAudioModeActive || isVideoModeActive ? !message.trim() : (!message.trim() && !file))}
                className="bg-[#D2E3FD] dark:bg-blue-600 text-[#000080] dark:text-white disabled:text-black/50 dark:disabled:text-white/50 disabled:bg-[#e0e0dc79] dark:disabled:bg-gray-700 hover:bg-opacity-85 transition duration-100 rounded-full p-2 flex-shrink-0"
              >
                {(isImageModeActive && isSubmittingImage) || (isAudioModeActive && isSubmittingAudio) || (isVideoModeActive && isSubmittingVideo) ? (
                   <svg className="animate-spin h-4 w-4 text-[#000080] dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                ) : (
                  <ArrowUp className={(isImageModeActive || isAudioModeActive || isVideoModeActive) ? "text-[#000080] dark:text-white" : "bg-background"} size={17} />
                )}
              </button>
            </div>
          </div>

          {/* Parameter Panels are now rendered in Modals, so this div is no longer needed here. */}
          {/* <div className={cn("w-full pt-2 order-3",
              ((isImageModeActive) || (isAudioModeActive) || (isVideoModeActive)) && (effectiveModeForDesktop === 'multi' || isMobileView) ? 'block' : 'hidden'
            )}>
          </div> */}
        </form>
        {file && !isImageModeActive && !isAudioModeActive && !isVideoModeActive && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center md:text-left md:pl-10">
            Attached: {file.name} <button onClick={() => setFile(null)} className="text-red-500 ml-2">(Remove)</button>
          </div>
        )}
      </div>

      {/* Modals for Parameters */}
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
        </GenericModal>
      )}
    </>
  );
};
export default MessageInput;
