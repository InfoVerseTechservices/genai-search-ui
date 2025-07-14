import { cn } from '@/lib/utils';
import { ArrowUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import CopilotToggle from './MessageInputActions/Copilot';
import Focus from './MessageInputActions/Focus';
import { File } from './ChatWindow';
import AttachSmall from './MessageInputActions/AttachSmall';
import ToolSelector from './ToolSelector';

const MessageInput = ({
  sendMessage,
  loading,
  fileIds,
  setFileIds,
  files,
  setFiles,
  focusMode,
  setFocusMode,
}: {
  sendMessage: (message: string, isImageGeneration?: boolean, useTooling?: boolean) => void;
  loading: boolean;
  fileIds: string[];
  setFileIds: (fileIds: string[]) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  focusMode: string;
  setFocusMode: (mode: string) => void;
}) => {
  const [copilotEnabled, setCopilotEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [textareaRows, setTextareaRows] = useState(1);
  const [mode, setMode] = useState<'multi' | 'single'>('single');
  const [selectedTool, setSelectedTool] = useState('image');

  useEffect(() => {
    if (textareaRows >= 2 && message && mode === 'single') {
      setMode('multi');
    } else if (!message && mode === 'multi') {
      setMode('single');
    }
  }, [textareaRows, mode, message]);

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

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    if (loading) return;
    e.preventDefault();
    if (['imageGeneration', 'videoGeneration', 'audioGeneration'].includes(focusMode)) {
      sendMessage(message, true);
    } else if (focusMode === 'webSearch') {
      sendMessage(message, false, true);
    } else if (focusMode === 'imageGen') {
      sendMessage(message, false, true);
    } else {
      sendMessage(message);
    }
    setMessage('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey && !loading) {
          e.preventDefault();
          handleSubmit(e);
        }
      }}
      className={cn(
        'bg-light-secondary dark:bg-dark-secondary p-2 sm:p-3 md:p-4 flex items-center overflow-hidden border border-light-200 dark:border-dark-200 w-full mx-auto shadow-lg',
        mode === 'multi' ? 'flex-col rounded-lg' : 'flex-row rounded-full',
      )}
    >
      {mode === 'single' && (
        <div className="flex items-center space-x-1 flex-shrink-0 overflow-hidden">
          <AttachSmall
            fileIds={fileIds}
            setFileIds={setFileIds}
            files={files}
            setFiles={setFiles}
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
      )}
      <TextareaAutosize
        ref={inputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onHeightChange={(height, props) => {
          setTextareaRows(Math.ceil(height / props.rowHeight));
        }}
        className="transition bg-transparent dark:placeholder:text-white/50 placeholder:text-sm text-sm sm:text-base dark:text-white resize-none focus:outline-none w-full px-1 sm:px-2 md:px-3 max-h-20 sm:max-h-24 lg:max-h-32 xl:max-h-48 flex-grow flex-shrink min-w-0"
        placeholder={['imageGeneration', 'videoGeneration', 'audioGeneration'].includes(focusMode) ? `Describe the ${selectedTool} you want to generate...` : "Ask a follow-up"}
        style={{ fontSize: '16px' }} // Prevent zoom on iOS
      />
      {['imageGeneration', 'videoGeneration', 'audioGeneration'].includes(focusMode) && (
        <div className="absolute -top-8 sm:-top-10 left-2 sm:left-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm whitespace-nowrap z-10">
          🎨 {selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)} Generation Mode
        </div>
      )}
      {mode === 'single' && (
        <div className="flex flex-row items-center space-x-1 flex-shrink-0">
          <div className="hidden sm:block">
            <CopilotToggle
              copilotEnabled={copilotEnabled}
              setCopilotEnabled={setCopilotEnabled}
            />
          </div>
          <button
            disabled={message.trim().length === 0 || loading}
            className="min-h-[40px] min-w-[40px] sm:min-h-touch sm:min-w-touch bg-[#24A0ED] text-white disabled:text-black/50 dark:disabled:text-white/50 hover:bg-opacity-85 transition duration-100 disabled:bg-[#e0e0dc79] dark:disabled:bg-[#ececec21] rounded-full p-2 touch-manipulation no-select"
          >
            <ArrowUp className="bg-background" size={16} />
          </button>
        </div>
      )}
      {mode === 'multi' && (
        <div className="flex flex-col w-full pt-2 gap-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-1 flex-wrap gap-1 flex-1">
              <AttachSmall
                fileIds={fileIds}
                setFileIds={setFileIds}
                files={files}
                setFiles={setFiles}
              />
              <Focus focusMode={focusMode} setFocusMode={setFocusMode} />
              <ToolSelector 
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
                generationType={focusMode}
              />
            </div>
            <div className="flex flex-row items-center space-x-1 sm:space-x-2">
              <CopilotToggle
                copilotEnabled={copilotEnabled}
                setCopilotEnabled={setCopilotEnabled}
              />
              <button
                disabled={message.trim().length === 0 || loading}
                className="min-h-[40px] min-w-[40px] sm:min-h-touch sm:min-w-touch bg-[#24A0ED] text-white disabled:text-black/50 dark:disabled:text-white/50 hover:bg-opacity-85 transition duration-100 disabled:bg-[#e0e0dc79] dark:disabled:bg-[#ececec21] rounded-full p-2 touch-manipulation no-select"
              >
                <ArrowUp className="bg-background" size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default MessageInput;