// components/EmptyChatMessageInput.tsx
import { ArrowRight, Image as ImageIconLucide, Paperclip, Video as VideoIconLucide } from 'lucide-react';
import CustomAudioWaveformIcon from './Icons/CustomAudioWaveformIcon';
import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { UploadIcon as CustomUploadIcon } from './Icons';
import ImageGenerationPanel from './ImageGenerationPanel';
import AudioGenerationPanel from './AudioGenerationPanel';
import VideoGenerationParametersPanel, { VideoGenParams as UIVideoGenParams } from './VideoGenerationParametersPanel';

export type { UIVideoGenParams as VideoGenParams };
export interface ImageGenParams { prompt: string; negative_prompt?: string; model?: string; size?: string; guidance_scale?: number; }
export interface AudioGenParams { prompt: string; negative_prompt?: string; duration_seconds?: number; seed?: number; model?: string; }

interface EmptyChatMessageInputProps {
  sendMessage: (message: string, file: File | null) => void;
  focusMode: string;
  setFocusMode: (mode: string) => void;
  onImagePromptSubmit: (params: ImageGenParams, imagePromptText: string) => void;
  onAudioPromptSubmit: (params: AudioGenParams, audioPromptText: string) => void;
  onVideoPromptSubmit: (params: UIVideoGenParams, videoPromptText: string) => void;
}

const EmptyChatMessageInput = ({
  sendMessage,
  focusMode,
  setFocusMode,
  onImagePromptSubmit,
  onAudioPromptSubmit,
  onVideoPromptSubmit,
}: EmptyChatMessageInputProps) => {
  const [message, setMessage] = useState('');
  const [uploadFile, setUploadFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Image Mode State
  const [isImageModeActive, setIsImageModeActive] = useState(false);
  const [showImageParamsPanel, setShowImageParamsPanel] = useState(false);
  const [imageNegativePrompt, setImageNegativePrompt] = useState('');
  const [imageModel, setImageModel] = useState(process.env.NEXT_PUBLIC_COLOMBO_DEFAULT_MODEL || '');
  const [imageSize, setImageSize] = useState('512x512');
  const [imageGuidanceScale, setImageGuidanceScale] = useState(7.5);
  const [isSubmittingImage, setIsSubmittingImage] = useState(false);

  // Audio Mode State
  const [isAudioModeActive, setIsAudioModeActive] = useState(false);
  const [showAudioParamsPanel, setShowAudioParamsPanel] = useState(false);
  const [audioNegativePrompt, setAudioNegativePrompt] = useState('Low quality.');
  const [audioModel, setAudioModel] = useState(process.env.NEXT_PUBLIC_COLOMBO_AUDIO_DEFAULT_MODEL || 'stable-audio-open-1.0');
  const [audioDuration, setAudioDuration] = useState(10);
  const [audioSeed, setAudioSeed] = useState(0);
  const [isSubmittingAudio, setIsSubmittingAudio] = useState(false);

  // Video Mode State
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
    return () => document.removeEventListener('keydown', handleKeyDown);
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
        console.warn("Send message called while a generation mode is active.");
        return;
    }
    if (isSubmittingImage || isSubmittingAudio || isSubmittingVideo) return;
    if (message.trim().length > 0 || file) {
      sendMessage(message, file);
      setMessage('');
      setFile(null);
    }
  };

  const handleImageGenerationRequest = async () => {
    if (!message.trim() || isSubmittingImage || isSubmittingAudio || isSubmittingVideo) return;
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
    if (isImageModeActive) {
      setShowImageParamsPanel(true);
    }
  };

  const handleAudioGenerationRequest = async () => {
    if (!message.trim() || isSubmittingImage || isSubmittingAudio || isSubmittingVideo) return;
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
    if (isAudioModeActive) {
      setShowAudioParamsPanel(true);
    }
  };

  const handleVideoGenerationRequest = async () => {
    if (!message.trim() || isSubmittingImage || isSubmittingAudio || isSubmittingVideo) return;
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
    if (isVideoModeActive) {
      setShowVideoParamsPanel(true);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setUploadFile(false);
    if (selectedFile) {
        setIsImageModeActive(false); setShowImageParamsPanel(false);
        setIsAudioModeActive(false); setShowAudioParamsPanel(false);
        setIsVideoModeActive(false); setShowVideoParamsPanel(false);
    }
  };

  const handleUploadFileToggle = () => {
    const newUploadFileState = !uploadFile;
    setUploadFile(newUploadFileState);
    if (newUploadFileState) {
      setIsImageModeActive(false); setShowImageParamsPanel(false);
      setIsAudioModeActive(false); setShowAudioParamsPanel(false);
      setIsVideoModeActive(false); setShowVideoParamsPanel(false);
    } else {
        if(fileInputRef.current) fileInputRef.current.value = "";
        setFile(null);
    }
  };

  const handleImageModeToggle = () => {
    const newImageModeState = !isImageModeActive;
    setIsImageModeActive(newImageModeState);
    setShowImageParamsPanel(newImageModeState);
    if (newImageModeState) {
      setUploadFile(false); setFile(null); if(fileInputRef.current) fileInputRef.current.value = "";
      setIsAudioModeActive(false); setShowAudioParamsPanel(false);
      setIsVideoModeActive(false); setShowVideoParamsPanel(false);
      inputRef.current?.focus();
    }
  };

  const handleAudioModeToggle = () => {
    const newAudioModeState = !isAudioModeActive;
    setIsAudioModeActive(newAudioModeState);
    setShowAudioParamsPanel(newAudioModeState);
    if (newAudioModeState) {
      setUploadFile(false); setFile(null); if(fileInputRef.current) fileInputRef.current.value = "";
      setIsImageModeActive(false); setShowImageParamsPanel(false);
      setIsVideoModeActive(false); setShowVideoParamsPanel(false);
      inputRef.current?.focus();
    }
  };

  const handleVideoModeToggle = () => {
    const newVideoModeState = !isVideoModeActive;
    setIsVideoModeActive(newVideoModeState);
    setShowVideoParamsPanel(newVideoModeState);
    if (newVideoModeState) {
      setUploadFile(false); setFile(null); if(fileInputRef.current) fileInputRef.current.value = "";
      setIsImageModeActive(false); setShowImageParamsPanel(false);
      setIsAudioModeActive(false); setShowAudioParamsPanel(false);
      inputRef.current?.focus();
    }
  };

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

  let placeholderText = "Ask Coco...";
  if (isImageModeActive) placeholderText = "Describe image to generate...";
  else if (isAudioModeActive) placeholderText = "Describe audio to generate...";
  else if (isVideoModeActive) placeholderText = "Describe video to generate...";


  if (uploadFile) {
    return (
      <div className='relative w-full flex justify-center'>
        <div className='flex flex-col items-center w-[calc(100%-10px)] md:w-[28rem] lg:w-[30rem] xl:w-[45rem] mt-[1.2rem] rounded-[1.5rem]' style={borderStyle}>
          <p className='w-full text-center lg:p-1 xl:p-5 font-[700] md:text-base lg:text-lg xl:text-xl relative'>Drag and Drop or upload your file here
            <button type='button' onClick={handleUploadFileToggle} className='absolute top-1/2 right-4 -translate-y-1/2 font-normal text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-pointer'>
              <span>x</span>
            </button>
          </p>
          <hr className='border-[0.1px] w-full border-[#FF0049]' />
          <button type="button" onClick={() => fileInputRef.current?.click()} className='lg:mt-[0.3rem] xl:mt-[1rem]'>
            <CustomUploadIcon w={80} h={80} />
          </button>
          <button style={{ background: 'linear-gradient(180deg, #6237FF, #258EFF)', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'normal' }} className='mt-[0.3rem] xl:mt-[0.5rem] md:text-[0.8rem] lg:text-[0.8rem] xl:text-[1rem] md:px-[1.25rem] md:py-[0.3rem] lg:px-[1.25rem] lg:py-[0.3rem] xl:px-[1.75rem] xl:py-[0.4rem]' onClick={() => fileInputRef.current?.click()}>
            UPLOAD
          </button>
          <p className='text-[#8B8B8B] md:mt-[0.75rem] lg:mt-[0.5rem] xl:mt-[1.75rem] md:text-xs lg:text-sm'>Max ??mb only</p>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        </div>
      </div>
    );
   }

  return (
    <>
      <h2 className="text-[#000080] dark:text-blue-300 text-md sm:text-xl md:text-xl lg:text-2xl xl:text-3xl font-medium -mt-8 text-center md:text-left">
        {isImageModeActive ? "Describe an Image" : isAudioModeActive ? "Describe Audio" : isVideoModeActive ? "Describe Video" : "Discover and Do More with ColomboAI MC1"}
      </h2>
      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <div
          style={borderStyle}
          className="relative flex flex-col bg-white dark:bg-slate-900 px-2 sm:px-4 pt-3 sm:pt-4 pb-2 rounded-lg items-center w-[calc(100%-10px)] md:w-auto md:min-w-[35rem] lg:min-w-[38rem] xl:min-w-[48rem] border"
        >
          <TextareaAutosize
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            minRows={6}
            maxRows={8}
            className="w-full bg-transparent p-1 placeholder:text-[#ACACAC] dark:placeholder:text-gray-500 text-xs sm:text-sm self-start text-black dark:text-white resize-none focus:outline-none max-h-48 sm:max-h-36 md:max-h-48"
            placeholder={placeholderText}
          />
          <div className="flex items-center justify-between w-full mt-2">
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button type="button" onClick={handleUploadFileToggle} title="Attach file" className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-50" disabled={isImageModeActive || isAudioModeActive || isVideoModeActive}>
                <Paperclip size={20} />
              </button>
              <button type="button" onClick={handleImageModeToggle} title={isImageModeActive ? "Switch to Text/Audio/Video Mode" : "Switch to Image Mode"} className={`p-2 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center ${isImageModeActive ? 'bg-blue-500 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-500 dark:hover:text-blue-400'}`} disabled={isAudioModeActive || isVideoModeActive}>
                <ImageIconLucide size={20} />
              </button>
              <button type="button" onClick={handleAudioModeToggle} title={isAudioModeActive ? "Switch to Text/Image/Video Mode" : "Switch to Audio Mode"} className={`p-2 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center ${isAudioModeActive ? 'bg-purple-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-500 dark:hover:text-purple-400'}`} disabled={isImageModeActive || isVideoModeActive}>
                <CustomAudioWaveformIcon size={20} color={isAudioModeActive ? 'white' : 'currentColor'} />
              </button>
              <button type="button" onClick={handleVideoModeToggle} title={isVideoModeActive ? "Switch to Text/Image/Audio Mode" : "Switch to Video Mode"} className={`p-2 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center ${isVideoModeActive ? 'bg-red-500 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400'}`} disabled={isImageModeActive || isAudioModeActive}>
                <VideoIconLucide size={20} />
              </button>
            </div>
            <button type="submit" disabled={(isImageModeActive || isAudioModeActive || isVideoModeActive ? !message.trim() : (!message.trim() && !file)) || isSubmittingImage || isSubmittingAudio || isSubmittingVideo } className="bg-[#D2E3FD] dark:bg-blue-600 text-[#000080] dark:text-white disabled:text-black/50 dark:disabled:text-white/50 disabled:bg-[#e0e0dc] dark:disabled:bg-gray-700 hover:bg-opacity-85 transition duration-100 rounded-full p-2">
              {(isImageModeActive && isSubmittingImage) || (isAudioModeActive && isSubmittingAudio) || (isVideoModeActive && isSubmittingVideo) ? (
                <svg className="animate-spin h-4 w-4 text-[#000080] dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <ArrowRight className={(isImageModeActive || isAudioModeActive || isVideoModeActive) ? "text-[#000080] dark:text-white" : "bg-background"} size={17} />
              )}
            </button>
          </div>
        </div>

        <div className="w-[calc(100%-10px)] mx-auto md:w-auto md:min-w-[35rem] lg:min-w-[38rem] xl:min-w-[48rem]">
            {(isImageModeActive && showImageParamsPanel) && ( <ImageGenerationPanel imageNegativePrompt={imageNegativePrompt} setImageNegativePrompt={setImageNegativePrompt} imageModel={imageModel} setImageModel={setImageModel} imageSize={imageSize} setImageSize={setImageSize} imageGuidanceScale={imageGuidanceScale} setImageGuidanceScale={setImageGuidanceScale} defaultModelName={process.env.NEXT_PUBLIC_COLOMBO_DEFAULT_MODEL || "flux"} /> )}
            {(isAudioModeActive && showAudioParamsPanel) && ( <AudioGenerationPanel audioNegativePrompt={audioNegativePrompt} setAudioNegativePrompt={setAudioNegativePrompt} audioDuration={audioDuration} setAudioDuration={setAudioDuration} audioSeed={audioSeed} setAudioSeed={setAudioSeed} audioModel={audioModel} setAudioModel={setAudioModel} defaultModelName={process.env.NEXT_PUBLIC_COLOMBO_AUDIO_DEFAULT_MODEL || "stable-audio-open-1.0"}/> )}
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

        {!(isImageModeActive || isAudioModeActive || isVideoModeActive || uploadFile) && (
             <p className="text-[#ACACAC] text-[12px] sm:text-[14px] md:text-sm lg:text-sm xl:text-[16px] mt-4 md:mt-2 w-[calc(100%-20px)] sm:w-auto md:max-w-xl lg:max-w-2xl text-center">
              Welcome to GenAI Search, your go-to tool for instant answers and web exploration!
              Simply type your question or topic of interest, and GenAI will provide
              you with accurate answers along with related links from the web.
              Whether you&apos;re seeking quick information or diving deeper
              into a topic, GenAI Search has you covered.
            </p>
        )}
      </form>
    </>
  );
};
export default EmptyChatMessageInput;
