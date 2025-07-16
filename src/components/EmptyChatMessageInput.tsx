import { ArrowRight, Sparkles, Mic, Image, Video, Search, Code, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import CopilotToggle from './MessageInputActions/Copilot';
import Focus from './MessageInputActions/Focus';
import Optimization from './MessageInputActions/Optimization';
import Attach from './MessageInputActions/Attach';
import { File } from './ChatWindow';
import ToolSelector from './ToolSelector';
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from '@headlessui/react';
import { Fragment } from 'react';
import CustomAudioWaveformIcon from './Icons/CustomAudioWaveformIcon';

// --- Dynamic Border Style Hook ---
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

const EmptyChatMessageInput = ({
  sendMessage,
  focusMode,
  setFocusMode,
  optimizationMode,
  setOptimizationMode,
  fileIds,
  setFileIds,
  files,
  setFiles,
}: {
  sendMessage: (message: string, isImageGeneration?: boolean, useTooling?: boolean) => void;
  focusMode: string;
  setFocusMode: (mode: string) => void;
  optimizationMode: string;
  setOptimizationMode: (mode: string) => void;
  fileIds: string[];
  setFileIds: (fileIds: string[]) => void;
  files: File[];
  setFiles: (files: File[]) => void;
}) => {
  const [copilotEnabled, setCopilotEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedTool, setSelectedTool] = useState('image');
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const dynamicBorderStyle = useDynamicBorderStyle();

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

    inputRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !message.trim()) return;

    setIsSubmitting(true);
    try {
      if (['imageGeneration', 'videoGeneration', 'audioGeneration'].includes(focusMode)) {
        await sendMessage(message, true);
      } else if (focusMode === 'webSearch') {
        await sendMessage(message, false, true);
      } else if (focusMode === 'imageGen') {
        await sendMessage(message, false, true);
      } else {
        await sendMessage(message);
      }
      setMessage('');
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shadow-lg rounded-2xl">
      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        className="flex flex-col items-center justify-center"
      >
      <div style={dynamicBorderStyle} className="relative flex flex-col bg-white dark:bg-gray-800 px-2 sm:px-4 pt-3 sm:pt-4 pb-2 rounded-lg items-center w-full">
        <TextareaAutosize
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          minRows={6}
          maxRows={8}
          className="w-full transition bg-transparent p-1 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm self-start text-black dark:text-white resize-none focus:outline-none max-h-48"
          placeholder={['imageGeneration', 'videoGeneration', 'audioGeneration'].includes(focusMode) ? `Describe the ${selectedTool} you want to generate...` : "Ask anything..."}
        />
        <div className="flex items-center justify-between w-full mt-2">
          <div className="flex items-center gap-x-1">
            <Attach
              fileIds={fileIds}
              setFileIds={setFileIds}
              files={files}
              setFiles={setFiles}
              showText={false}
            />
            <Popover className="relative">
              <PopoverButton
                type="button"
                className="min-h-[40px] min-w-[40px] px-2 sm:px-3 text-black/50 dark:text-white/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition duration-200 hover:text-black dark:hover:text-white touch-manipulation flex items-center justify-center"
                title="Tools"
              >
                <Sparkles size={20} />
              </PopoverButton>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <PopoverPanel className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 z-50">
                  <div className="flex flex-col space-y-1">
                    <PopoverButton
                      onClick={() => setFocusMode('imageGeneration')}
                      className="flex items-center gap-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors"
                    >
                      <Image size={20} />
                      <span>Generate Image</span>
                    </PopoverButton>
                    <PopoverButton
                      onClick={() => setFocusMode('videoGeneration')}
                      className="flex items-center gap-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors"
                    >
                      <Video size={20} />
                      <span>Generate Video</span>
                    </PopoverButton>
                    <PopoverButton
                      onClick={() => setFocusMode('audioGeneration')}
                      className="flex items-center gap-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors"
                    >
                      <Volume2 size={20} />
                      <span>Generate Audio</span>
                    </PopoverButton>
                    <PopoverButton
                      onClick={() => setFocusMode('webSearch')}
                      className="flex items-center gap-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors"
                    >
                      <Search size={20} />
                      <span>Search Web</span>
                    </PopoverButton>
                    <PopoverButton
                      onClick={() => setFocusMode('writingAssistant')}
                      className="flex items-center gap-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors"
                    >
                      <Code size={20} />
                      <span>Write Code</span>
                    </PopoverButton>
                  </div>
                </PopoverPanel>
              </Transition>
            </Popover>
            <Focus focusMode={focusMode} setFocusMode={setFocusMode} />
          </div>
          <div className="flex items-center gap-x-2">
            <button
              type="button"
              onClick={() => setFocusMode('audioGeneration')}
              className="min-h-[40px] min-w-[40px] px-2 text-black/50 dark:text-white/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200 flex items-center justify-center"
              title="Use Voice Mode"
            >
              <CustomAudioWaveformIcon size={20} color={focusMode === 'audioGeneration' ? '#3B82F6' : 'currentColor'} />
            </button>
            <button
              type="submit"
              disabled={isSubmitting || message.trim().length === 0}
              className="bg-[#D2E3FD] dark:bg-blue-600 text-blue-900 dark:text-white disabled:text-black/50 dark:disabled:text-white/50 disabled:bg-gray-200 dark:disabled:bg-gray-700 hover:bg-opacity-85 transition duration-100 rounded-full p-2"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <ArrowRight size={17} />
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
    </div>
  );
};

export default EmptyChatMessageInput;