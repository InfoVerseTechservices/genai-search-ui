// import { cn } from '@/lib/utils';
// import { ArrowUp } from 'lucide-react';
// import { useEffect, useRef, useState } from 'react';
// import TextareaAutosize from 'react-textarea-autosize';
// import Attach from './MessageInputActions/Attach';
// import CopilotToggle from './MessageInputActions/Copilot';

// const MessageInput = ({
//   sendMessage,
//   loading,
// }: {
//   sendMessage: (message: string) => void;
//   loading: boolean;
// }) => {
//   const [copilotEnabled, setCopilotEnabled] = useState(false);
//   const [message, setMessage] = useState('');
//   const [textareaRows, setTextareaRows] = useState(1);
//   const [mode, setMode] = useState<'multi' | 'single'>('single');

//   useEffect(() => {
//     if (textareaRows >= 2 && message && mode === 'single') {
//       setMode('multi');
//     } else if (!message && mode === 'multi') {
//       setMode('single');
//     }
//   }, [textareaRows, mode, message]);

//   const inputRef = useRef<HTMLTextAreaElement | null>(null);

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       const activeElement = document.activeElement;

//       const isInputFocused =
//         activeElement?.tagName === 'INPUT' ||
//         activeElement?.tagName === 'TEXTAREA' ||
//         activeElement?.hasAttribute('contenteditable');

//       if (e.key === '/' && !isInputFocused) {
//         e.preventDefault();
//         inputRef.current?.focus();
//       }
//     };

//     document.addEventListener('keydown', handleKeyDown);

//     return () => {
//       document.removeEventListener('keydown', handleKeyDown);
//     };
//   }, []);

//   const borderStyle = {
//     border: '0.5px solid transparent',
//     backgroundClip: 'padding-box',
//     background: 'linear-gradient(white, white) padding-box, linear-gradient(180deg, #FF0049 0%, #FFBE3B 25%, #00BB5C 50%, #187DC4 75%, #58268B 100%) border-box',
//     borderImageSlice: 1,
//   };

//   return (
//     <form style={borderStyle}
//       onSubmit={(e) => {
//         if (loading) return;
//         e.preventDefault();
//         sendMessage(message);
//         setMessage('');
//       }}
//       onKeyDown={(e) => {
//         if (e.key === 'Enter' && !e.shiftKey && !loading) {
//           e.preventDefault();
//           sendMessage(message);
//           setMessage('');
//         }
//       }}
//       className={cn(
//         'bg-white p-4 flex items-center overflow-hidden border ',
//         mode === 'multi' ? 'flex-col rounded-lg' : 'flex-row rounded-full',
//       )}
//     >
//       {mode === 'single' && <Attach />}
//       <TextareaAutosize
//         ref={inputRef}
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         onHeightChange={(height, props) => {
//           setTextareaRows(Math.ceil(height / props.rowHeight));
//         }}
//         className="transition bg-transparent placeholder:text-[#ACACAC] placeholder:text-sm text-black text-sm  resize-none focus:outline-none w-full px-2 max-h-24 lg:max-h-36 xl:max-h-48 flex-grow flex-shrink"
//         placeholder="Ask a follow-up"
//       />
//       {/* Co-pilot */}

//       {/* {mode === 'single' && (
//         <div className="flex flex-row items-center space-x-4">
//           <CopilotToggle
//             copilotEnabled={copilotEnabled}
//             setCopilotEnabled={setCopilotEnabled}
//           />
//           <button
//             disabled={message.trim().length === 0 || loading}
//             className="bg-[#24A0ED] text-white disabled:text-black/50 dark:disabled:text-white/50 hover:bg-opacity-85 transition duration-100 disabled:bg-[#e0e0dc79] dark:disabled:bg-[#ececec21] rounded-full p-2"
//           >
//             <ArrowUp className="bg-background" size={17} />
//           </button>
//         </div>
//       )} */}
//       {/* {mode === 'multi' && (
//         <div className="flex flex-row items-center justify-between w-full pt-2">
//           <Attach />
//           <div className="flex flex-row items-center space-x-4">
//             <CopilotToggle
//               copilotEnabled={copilotEnabled}
//               setCopilotEnabled={setCopilotEnabled}
//             />
//             <button
//               disabled={message.trim().length === 0 || loading}
//               className="bg-[#24A0ED] text-white text-black/50 dark:disabled:text-white/50 hover:bg-opacity-85 transition duration-100 disabled:bg-[#e0e0dc79] dark:disabled:bg-[#ececec21] rounded-full p-2"
//             >
//               <ArrowUp className="bg-background" size={17} />
//             </button>
//           </div>
//         </div>
//       )} */}
//     </form>
//   );
// };

// export default MessageInput;
import { cn } from '@/lib/utils';
import { ArrowUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import Attach from './MessageInputActions/Attach';
import CopilotToggle from './MessageInputActions/Copilot';

const MessageInput = ({
  sendMessage,
  loading,
}: {
  sendMessage: (message: string) => void;
  loading: boolean;
}) => {
  const [copilotEnabled, setCopilotEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [textareaRows, setTextareaRows] = useState(1);
  const [mode, setMode] = useState<'multi' | 'single'>('single');

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

  const borderStyle = {
    border: '0.5px solid transparent',
    backgroundClip: 'padding-box',
    background:
      'linear-gradient(white, white) padding-box, linear-gradient(180deg, #FF0049 0%, #FFBE3B 25%, #00BB5C 50%, #187DC4 75%, #58268B 100%) border-box',
    borderImageSlice: 1,
  };

  const handleSendMessage = () => {
    if (message.trim().length > 0) {
      sendMessage(message);
      setMessage('');
    }
  };

  return (
    <form
      style={borderStyle}
      onSubmit={(e) => {
        if (loading) return;
        e.preventDefault();
        handleSendMessage();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey && !loading) {
          e.preventDefault();
          handleSendMessage();
        }
      }}
      className={cn(
        'bg-white p-4 flex items-center overflow-hidden border',
        mode === 'multi' ? 'flex-col rounded-lg' : 'flex-row rounded-full',
      )}
    >
      {mode === 'single' && <Attach />}
      <TextareaAutosize
        ref={inputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onHeightChange={(height, props) => {
          setTextareaRows(Math.ceil(height / props.rowHeight));
        }}
        className="transition bg-transparent placeholder:text-[#ACACAC] placeholder:text-sm text-black text-sm resize-none focus:outline-none w-full px-2 max-h-24 lg:max-h-36 xl:max-h-48 flex-grow flex-shrink"
        placeholder="Ask a follow-up"
      />
      {/* Enter button for sending message */}
      <button
        type="button"
        onClick={handleSendMessage}
        disabled={message.trim().length === 0 || loading}
        className="bg-[#24A0ED] text-white disabled:text-black/50 dark:disabled:text-white/50 hover:bg-opacity-85 transition duration-100 disabled:bg-[#e0e0dc79] dark:disabled:bg-[#ececec21] rounded-full p-2 ml-2"
      >
        <ArrowUp className="bg-background" size={17} />
      </button>
      {/* Co-pilot and other actions */}
      {mode === 'multi' && (
        <div className="flex flex-row items-center justify-between w-full pt-2">
          <Attach />
          <div className="flex flex-row items-center space-x-4">
            <CopilotToggle
              copilotEnabled={copilotEnabled}
              setCopilotEnabled={setCopilotEnabled}
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={message.trim().length === 0 || loading}
              className="bg-[#24A0ED] text-white text-black/50 dark:disabled:text-white/50 hover:bg-opacity-85 transition duration-100 disabled:bg-[#e0e0dc79] dark:disabled:bg-[#ececec21] rounded-full p-2"
            >
              <ArrowUp className="bg-background" size={17} />
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

export default MessageInput;
