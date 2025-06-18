// components/EmptyChatMessageInput.tsx
import { ArrowRight, Image as ImageIconLucide, UploadCloud } from 'lucide-react'; // ImageIconLucide from lucide
import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { UploadIcon as CustomUploadIcon } from './Icons';
import ImageGenerationPanel from './ImageGenerationPanel'; // Import the new panel

// Copied from ChatWindow.tsx or shared types file
interface ImageGenParams {
  prompt: string;
  negative_prompt?: string;
  model?: string;
  size?: string;
  guidance_scale?: number;
}

interface EmptyChatMessageInputProps {
  sendMessage: (message: string, file: File | null) => void;
  focusMode: string; // Assuming focusMode is still relevant, though not directly used in image gen panel
  setFocusMode: (mode: string) => void; // Same as above
  onImagePromptSubmit: (params: ImageGenParams, imagePromptText: string) => void;
}

const EmptyChatMessageInput = ({
  sendMessage,
  focusMode,
  setFocusMode,
  onImagePromptSubmit,
}: EmptyChatMessageInputProps) => {
  const [message, setMessage] = useState(''); // Used for chat message OR image prompt
  const [uploadFile, setUploadFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Image Generation Mode State
  const [isImageModeActive, setIsImageModeActive] = useState(false);
  const [showImageParamsPanel, setShowImageParamsPanel] = useState(false); // To control panel visibility within image mode

  // Image Parameters State
  const [imageNegativePrompt, setImageNegativePrompt] = useState('');
  const [imageModel, setImageModel] = useState(process.env.NEXT_PUBLIC_COLOMBO_DEFAULT_MODEL || '');
  const [imageSize, setImageSize] = useState('512x512');
  const [imageGuidanceScale, setImageGuidanceScale] = useState(7.5);

  // This local loading state is for the main send button when in image mode.
  // The parent (ChatWindow) will have its own loading state for the actual API call.
  const [isSubmittingImage, setIsSubmittingImage] = useState(false);


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

  const handleMainSendMessage = () => { // Renamed from handleSendMessage to avoid conflict if used internally
    if (message.trim().length > 0 || file) { // file check for normal chat
      sendMessage(message, file);
      setMessage('');
      setFile(null);
    }
  };

  const handleImageGenerationRequest = async () => {
    if (!message.trim()) return; // Prompt is from the main 'message' state

    setIsSubmittingImage(true); // Indicate local submission process started

    const params: ImageGenParams = {
      prompt: message, // Use main input 'message' as prompt
      negative_prompt: imageNegativePrompt.trim() || undefined,
      model: imageModel.trim() || undefined,
      size: imageSize,
      guidance_scale: imageGuidanceScale,
    };

    onImagePromptSubmit(params, message); // Pass main 'message' as imagePromptText

    setMessage(''); // Clear main input after submitting for image
    // Optionally reset other image params or keep them for next generation
    // setIsImageModeActive(false); // Optionally turn off image mode after submit
    // setShowImageParamsPanel(false); // Optionally close panel
    setIsSubmittingImage(false); // Local submission process finished
  };


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setUploadFile(false);
  };

  const handleUploadFileToggle = () => {
    const newUploadFileState = !uploadFile;
    setUploadFile(newUploadFileState);
    if (newUploadFileState) {
      setIsImageModeActive(false); // Turn off image mode if activating file upload
      setShowImageParamsPanel(false);
    }
  };

  const handleImageModeToggle = () => {
    const newImageModeState = !isImageModeActive;
    setIsImageModeActive(newImageModeState);
    if (newImageModeState) {
      setShowImageParamsPanel(true); // Show params panel when entering image mode
      if (uploadFile) setUploadFile(false); // Turn off file upload if activating image mode
      inputRef.current?.focus(); // Focus main input for image prompt
    } else {
      setShowImageParamsPanel(false); // Hide params panel when leaving image mode
    }
  };

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


  if (uploadFile) {
    // File Upload Panel (existing JSX, slightly adapted)
    return (
      <div className='relative'>
        <div className='flex flex-col items-center md:w-[28rem] md:h-[10.52rem] lg:w-[30rem] lg:h-[11.32rem] xl:w-[45rem] xl:h-[17rem] mt-[1.2rem] ml-[0] sm:ml-[6rem] rounded-[1.5rem]' style={borderStyle}>
          <p className='lg:p-1 xl:p-5 font-[700] md:text-base lg:text-lg xl:text-xl'>Drag and Drop or upload your file here
            <button type='button' onClick={handleUploadFileToggle} className='absolute right-4 font-normal text-[#E3E3E3] cursor-pointer'>
              <span>x</span>
            </button>
          </p>
          <hr className='border-[0.1px] md:w-[28rem] lg:w-[30rem] xl:w-[45rem] border-[#FF0049]' />
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
      <h2 className="text-[#000080] dark:text-blue-300 text-md sm:text-xl md:text-xl lg:text-2xl xl:text-3xl font-medium -mt-8">
        {isImageModeActive ? "Describe an Image to Generate" : "Discover and Do More with AI"}
      </h2>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col gap-[1rem] sm:gap-[2rem] items-center w-full text-center">
          <div style={borderStyle} className="relative flex flex-col bg-white dark:bg-slate-900 px-2 sm:px-5 pt-2 sm:pt-5 pb-2 rounded-lg items-center w-[19rem] sm:w-[30rem] md:w-[35rem] lg:w-[38rem]  xl:w-[48rem] border">
            <TextareaAutosize
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown} // Use this for Enter key submission
              minRows={isImageModeActive && showImageParamsPanel ? 3 : 6} // Adjust rows
              maxRows={6}
              className="bg-transparent p-1 placeholder:text-[#ACACAC] dark:placeholder:text-gray-500 text-xs sm:text-sm self-start text-black dark:text-white resize-none focus:outline-none w-full max-h-24 lg:max-h-36 xl:max-h-48"
              placeholder={isImageModeActive ? "Describe the image you want to create..." : "Ask Coco..."}
            />
            <div className="flex items-center justify-between w-full mt-1">
              <div className="flex items-center space-x-1">
                <button type="button" onClick={handleUploadFileToggle} title="Attach file" className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-50" disabled={isImageModeActive}>
                  <UploadCloud size={20} />
                </button>
                <button
                  type="button"
                  onClick={handleImageModeToggle}
                  title={isImageModeActive ? "Switch to Text Mode" : "Switch to Image Mode"}
                  className={`p-2 rounded-md transition-colors ${isImageModeActive ? 'bg-blue-100 dark:bg-blue-700 text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'}`}
                >
                  <ImageIconLucide size={20} />
                </button>
              </div>
              <button
                type="submit"
                disabled={(isImageModeActive ? !message.trim() : (!message.trim() && !file)) || isSubmittingImage}
                className="bg-[#D2E3FD] dark:bg-blue-600 text-[#000080] dark:text-white disabled:text-black/50 dark:disabled:text-white/50 disabled:bg-[#e0e0dc] dark:disabled:bg-gray-700 hover:bg-opacity-85 transition duration-100 rounded-full p-2 cursor-pointer"
              >
                {isSubmittingImage && isImageModeActive ? (
                  <svg className="animate-spin h-4 w-4 text-[#000080] dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <ArrowRight className={isImageModeActive ? "text-[#000080] dark:text-white" : "bg-background"} size={17} />
                )}
              </button>
            </div>
          </div>

          {isImageModeActive && showImageParamsPanel && (
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
          )}

          {!isImageModeActive && !uploadFile && (
            <p className="text-[#ACACAC] text-[12px] sm:text-[14px] md:text-sm lg:text-sm xl:text-[16px] w-[19rem] sm:w-[600px] md:w-[600px] lg:w-[600px] xl:w-[700px]">
              Welcome to GenAI Search, your go-to tool for instant answers and web exploration!
              Simply type your question or topic of interest, and GenAI will provide
              you with accurate answers along with related links from the web.
              Whether you&apos;re seeking quick information or diving deeper
              into a topic, GenAI Search has you covered.
            </p>
          )}
        </div>
      </form>
    </>
  );
};

export default EmptyChatMessageInput;
