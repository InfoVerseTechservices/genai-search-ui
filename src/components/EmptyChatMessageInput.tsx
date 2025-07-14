import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import CopilotToggle from './MessageInputActions/Copilot';
import Focus from './MessageInputActions/Focus';
import Optimization from './MessageInputActions/Optimization';
import Attach from './MessageInputActions/Attach';
import { File } from './ChatWindow';
import ToolSelector from './ToolSelector';

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

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (['imageGeneration', 'videoGeneration', 'audioGeneration'].includes(focusMode)) {
      sendMessage(message, true);
    } else if (focusMode === 'webSearch') {
      // Use tooling generation for enhanced search
      sendMessage(message, false, true); // third param indicates tooling mode
    } else if (focusMode === 'imageGen') {
      // Use tooling generation for enhanced image generation
      sendMessage(message, false, true); // third param indicates tooling mode
    } else {
      sendMessage(message);
    }
    setMessage('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSubmit(e);
        }
      }}
      className="w-full"
    >
      <div className="flex flex-col bg-white dark:bg-gray-800 px-3 sm:px-5 pt-4 sm:pt-5 pb-2 rounded-lg w-full border border-gray-200 dark:border-gray-700 shadow-sm">
        <TextareaAutosize
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          minRows={2}
          className="bg-transparent placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm text-gray-900 dark:text-white resize-none focus:outline-none w-full max-h-24 lg:max-h-36 xl:max-h-48"
          placeholder={['imageGeneration', 'videoGeneration', 'audioGeneration'].includes(focusMode) ? `Describe the ${selectedTool} you want to generate...` : "Ask anything..."}
          style={{ fontSize: '16px' }}
        />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 sm:mt-4 gap-3 sm:gap-0">
          <div className="flex flex-row items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-wrap gap-1 w-full sm:w-auto">
            <Attach
              fileIds={fileIds}
              setFileIds={setFileIds}
              files={files}
              setFiles={setFiles}
              showText={false}
            />
            <Focus focusMode={focusMode} setFocusMode={setFocusMode} />
            <div className="hidden sm:block">
              <ToolSelector 
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
                generationType={focusMode}
              />
            </div>
          </div>
          <div className="flex flex-row items-center space-x-1 sm:space-x-2 lg:space-x-4 self-end sm:self-auto">
            <div className="hidden sm:block">
              <Optimization
                optimizationMode={optimizationMode}
                setOptimizationMode={setOptimizationMode}
              />
            </div>
            <button
              disabled={message.trim().length === 0}
              className="min-h-[40px] min-w-[40px] bg-blue-600 text-white disabled:text-gray-400 disabled:bg-gray-200 dark:disabled:bg-gray-700 hover:bg-blue-700 transition duration-200 rounded-full p-2 touch-manipulation"
            >
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default EmptyChatMessageInput;