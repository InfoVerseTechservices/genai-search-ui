import { ArrowRight, Share } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import CopilotToggle from './MessageInputActions/Copilot';
import Focus from './MessageInputActions/Focus';
import uploadIcon from '../public/uploadIcon.svg'
import Image from 'next/image';

const EmptyChatMessageInput = ({
  sendMessage,
  focusMode,
  setFocusMode,
}: {
  sendMessage: (message: string) => void;
  focusMode: string;
  setFocusMode: (mode: string) => void;
}) => {
  const [copilotEnabled, setCopilotEnabled] = useState(false);
  const [message, setMessage] = useState('');

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

  const borderStyle = {
    border: '0.5px solid transparent',
    backgroundClip: 'padding-box',
    background: 'linear-gradient(white, white) padding-box, linear-gradient(180deg, #FF0049 0%, #FFBE3B 25%, #00BB5C 50%, #187DC4 75%, #58268B 100%) border-box',
    borderImageSlice: 1,
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        sendMessage(message);
        setMessage('');
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage(message);
          setMessage('');
        }
      }}
      className="w-full"
    > <div className='flex flex-col gap-[2rem] items-center w-full text-center'>
      <div style={borderStyle} className=" relative flex flex-col bg-white px-5 pt-5 pb-2 rounded-lg items-center w-[48rem] border">
        <TextareaAutosize
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          minRows={6}
          className="bg-transparent p-1 placeholder:text-[#ACACAC] text-sm self-start text-black resize-none focus:outline-none w-full max-h-24 lg:max-h-36 xl:max-h-48"
          placeholder="Ask Coco..."
        />
        <Image src={uploadIcon} alt='colombo' className="absolute top-2 right-2 cursor-pointer" />

        {/* Co-pilot */}

        {/* <div className="flex flex-row items-center justify-between mt-4">
          <div className="flex flex-row items-center space-x-1 -mx-2">
            <Focus focusMode={focusMode} setFocusMode={setFocusMode} />
          </div>
          <div className="flex flex-row items-center space-x-4 -mx-2">
            <CopilotToggle
              copilotEnabled={copilotEnabled}
              setCopilotEnabled={setCopilotEnabled}
            />
            <button
              disabled={message.trim().length === 0}
              className="bg-[#24A0ED] text-white disabled:text-black/50 dark:disabled:text-white/50 disabled:bg-[#e0e0dc] dark:disabled:bg-[#ececec21] hover:bg-opacity-85 transition duration-100 rounded-full p-2"
            >
              <ArrowRight className="bg-background" size={17} />
            </button>
          </div>
        </div> */}
      </div>
      <p className='text-[#ACACAC] text-sm w-[44rem]'>Welcome to GenAI Search, your go-to tool for instant answers and web exploration! <br/>
      Simply type your question or topic of interest, and GenAI will provide you with accurate answers along with related links from the web. Whether you&apos;re seeking quick information or <br/> diving deeper into a topic, GenAI Search has you covered.</p>
      </div>
    </form>
  );
};

export default EmptyChatMessageInput;
