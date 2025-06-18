// components/EmptyChatMessageInput.tsx
import { ArrowRight, Image as ImageIcon, UploadCloud } from 'lucide-react';
import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { UploadIcon as CustomUploadIcon } from './Icons'; // Assuming this is public/images/icons/sidebar/uploadIcon.svg or similar

// Define ImageGenParams interface
interface ImageGenParams {
  prompt: string;
  negative_prompt?: string;
  model?: string;
  size?: string;
  guidance_scale?: number;
}

interface EmptyChatMessageInputProps {
  sendMessage: (message: string, file: File | null) => void;
  focusMode: string;
  setFocusMode: (mode: string) => void;
  onImagePromptSubmit: (params: ImageGenParams, imagePromptText: string) => void;
}

const EmptyChatMessageInput = ({
  sendMessage,
  focusMode,
  setFocusMode,
  onImagePromptSubmit,
}: EmptyChatMessageInputProps) => {
  const [message, setMessage] = useState('');
  const [uploadFile, setUploadFile] = useState(false);
  // const [uploadedFile, setUploadedFile] = useState<File | null>(null); // This state seems unused, file is used directly
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  // const [isUploading, setIsUploading] = useState(false); // This state seems unused

  const [showImagePanel, setShowImagePanel] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageNegativePrompt, setImageNegativePrompt] = useState('');
  const [imageModel, setImageModel] = useState(process.env.NEXT_PUBLIC_COLOMBO_DEFAULT_MODEL || '');
  const [imageSize, setImageSize] = useState('512x512');
  const [imageGuidanceScale, setImageGuidanceScale] = useState(7.5);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false); // For image panel button

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.hasAttribute('contenteditable');
      if (e.key === '/' && !isInputFocused && !showImagePanel) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showImagePanel]);

  const borderStyle = {
    border: '0.5px solid transparent',
    backgroundClip: 'padding-box',
    background:
      'linear-gradient(white, white) padding-box, linear-gradient(180deg, #FF0049 0%, #FFBE3B 25%, #00BB5C 50%, #187DC4 75%, #58268B 100%) border-box',
    borderImageSlice: 1,
  };

  const handleSendMessage = () => {
    if (file || message.trim().length > 0) {
      sendMessage(message, file);
      setMessage('');
      setFile(null);
      // setUploadedFile(null); // Corresponding to its removal
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    // setUploadedFile(selectedFile); // Corresponding to its removal
    setUploadFile(false); // Close panel after selection
  };

  const handleUploadFileToggle = () => {
    const newUploadFileState = !uploadFile;
    setUploadFile(newUploadFileState);
    if (newUploadFileState && showImagePanel) {
      setShowImagePanel(false); // Close image panel if opening upload
    }
  };

  const handleImagePanelToggle = () => {
    const newImagePanelState = !showImagePanel;
    setShowImagePanel(newImagePanelState);
    if (newImagePanelState && uploadFile) {
      setUploadFile(false); // Close upload panel if opening image
    }
  };

  const handleImageGenerationSubmit = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true); // Visually indicate loading on the "Generate Image" button

    const params: ImageGenParams = {
      prompt: imagePrompt,
      negative_prompt: imageNegativePrompt.trim() || undefined,
      model: imageModel.trim() || undefined,
      size: imageSize,
      guidance_scale: imageGuidanceScale,
    };

    // This callback now signals to the parent (ChatWindow) to handle the actual API call
    // and subsequent message updates.
    onImagePromptSubmit(params, imagePrompt);

    // Reset fields and close panel
    setImagePrompt('');
    setImageNegativePrompt('');
    // Not resetting model, size, guidance for user convenience if they want to make similar images
    setShowImagePanel(false);
    setIsGeneratingImage(false); // Reset loading state for the button
  };

  if (uploadFile) {
    return (
      <div className='relative'>
        <div className='flex flex-col items-center md:w-[28rem] md:h-[10.52rem] lg:w-[30rem] lg:h-[11.32rem] xl:w-[45rem] xl:h-[17rem] mt-[1.2rem] ml-[6rem] rounded-[1.5rem]' style={borderStyle}>
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
      <h2 className="text-[#000080] text-md sm:text-xl md:text-xl lg:text-2xl xl:text-3xl font-medium -mt-8">
        Discover and Do More with AI
      </h2>
      <form
        onSubmit={(e) => { e.preventDefault(); if (!showImagePanel) handleSendMessage(); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !showImagePanel && message.trim().length > 0) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
        className="w-full"
      >
        <div className="flex flex-col gap-[1rem] sm:gap-[2rem] items-center w-full text-center">
          <div style={borderStyle} className="relative flex flex-col bg-white dark:bg-slate-800 px-2 sm:px-5 pt-2 sm:pt-5 pb-2 rounded-lg items-center w-[19rem] sm:w-[30rem] md:w-[35rem] lg:w-[38rem]  xl:w-[48rem] border">
            <TextareaAutosize
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              minRows={showImagePanel ? 2 : 6}
              maxRows={6}
              className="bg-transparent p-1 placeholder:text-[#ACACAC] text-xs sm:text-sm self-start text-black dark:text-white resize-none focus:outline-none w-full max-h-24 lg:max-h-36 xl:max-h-48"
              placeholder="Ask Coco..."
            />
            <div className="flex items-center justify-between w-full mt-1">
              <div className="flex items-center space-x-1">
                <button type="button" onClick={handleUploadFileToggle} title="Attach file" className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                  <UploadCloud size={20} />
                </button>
                <button type="button" onClick={handleImagePanelToggle} title="Generate image" className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                  <ImageIcon size={20} />
                </button>
              </div>
              <button
                type="submit" // Changed to type submit for form
                disabled={message.trim().length === 0 && !file}
                className="bg-[#D2E3FD] text-[#000080] disabled:text-black/50 dark:disabled:text-white/50 disabled:bg-[#e0e0dc] dark:disabled:bg-[#555] hover:bg-opacity-85 transition duration-100 rounded-full p-2 cursor-pointer"
              >
                <ArrowRight className="bg-background" size={17} />
              </button>
            </div>
          </div>

          {showImagePanel && (
            <div className="mt-2 p-3 border-t dark:border-gray-700 w-[19rem] sm:w-[30rem] md:w-[35rem] lg:w-[38rem]  xl:w-[48rem] bg-white dark:bg-slate-800 rounded-b-lg shadow-md text-left">
              <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Generate Image</h3>
              <div className="space-y-2">
                <TextareaAutosize
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe the image to generate..."
                  className="w-full p-2 border rounded-md text-xs sm:text-sm bg-white dark:bg-gray-700 dark:text-white dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500"
                  minRows={2} maxRows={4}
                />
                <TextareaAutosize
                  value={imageNegativePrompt}
                  onChange={(e) => setImageNegativePrompt(e.target.value)}
                  placeholder="Negative prompt (e.g., blurry, ugly)"
                  className="w-full p-2 border rounded-md text-xs sm:text-sm bg-white dark:bg-gray-700 dark:text-white dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500"
                  minRows={1} maxRows={3}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={imageModel}
                    onChange={(e) => setImageModel(e.target.value)}
                    placeholder={process.env.NEXT_PUBLIC_COLOMBO_DEFAULT_MODEL ? `Model (default: ${process.env.NEXT_PUBLIC_COLOMBO_DEFAULT_MODEL})` : "Model (e.g., flux)"}
                    className="w-full p-2 border rounded-md text-xs sm:text-sm bg-white dark:bg-gray-700 dark:text-white dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <select
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value)}
                    className="w-full p-2 border rounded-md text-xs sm:text-sm bg-white dark:bg-gray-700 dark:text-white dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="512x512">512x512</option>
                    <option value="1024x1024">1024x1024</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Guidance Scale: {imageGuidanceScale}</label>
                  <input
                    type="range" min="1" max="20" step="0.1"
                    value={imageGuidanceScale}
                    onChange={(e) => setImageGuidanceScale(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
                  />
                </div>
                <button
                  onClick={handleImageGenerationSubmit}
                  disabled={isGeneratingImage || !imagePrompt.trim()}
                  className="w-full mt-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-500 text-sm flex items-center justify-center"
                >
                  {isGeneratingImage && (
                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                  )}
                  {isGeneratingImage ? 'Generating...' : 'Generate Image'}
                </button>
              </div>
            </div>
          )}

          {!showImagePanel && !uploadFile && (
            <p className="text-[#ACACAC] text-[12px] sm:text-[14px] md:text-sm lg:text-sm xl:text-[16px] w-[19rem] sm:w-[600px] md:w-[600px] lg:w-[600px]   xl:w-[700px]">
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
