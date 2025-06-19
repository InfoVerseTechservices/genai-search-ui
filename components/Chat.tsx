// components/Chat.tsx
'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import MessageInput from './MessageInput';
import { Message } from './ChatWindow'; // Assuming Message type is imported from ChatWindow
import MessageBox from './MessageBox';
import MessageBoxLoading from './MessageBoxLoading';

// Define ImageGenParams and AudioGenParams if not globally available or imported
interface ImageGenParams { prompt: string; negative_prompt?: string; model?: string; size?: string; guidance_scale?: number; }
interface AudioGenParams { prompt: string; negative_prompt?: string; duration_seconds?: number; seed?: number; model?: string; }

const Chat = ({
  loading,
  messages,
  sendMessage,
  onImagePromptSubmit,
  onAudioPromptSubmit,
  messageAppeared,
  rewrite,
  editMessage,
  setMessages,
}: {
  messages: Message[];
  sendMessage: (message: string, file: File | null) => void;
  onImagePromptSubmit: (params: ImageGenParams, imagePromptText: string) => void;
  onAudioPromptSubmit: (params: AudioGenParams, audioPromptText: string) => void;
  loading: boolean;
  messageAppeared: boolean;
  rewrite: (messageId: string) => void;
  editMessage: (messageId: string, newContent: string) => void;
  setMessages: (messages: Message[]) => void;
}) => {
  const [dividerWidth, setDividerWidth] = useState(0);
  const dividerRef = useRef<HTMLDivElement | null>(null);
  const messageEnd = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateDividerWidth = () => {
      if (dividerRef.current) {
        setDividerWidth(dividerRef.current.scrollWidth);
      } else {
        // Fallback for mobile if dividerRef might not exist or be relevant
        // Or, ensure ChatWindow's main container provides a ref for width if needed
        // For now, relying on MessageInput's own full-width handling for mobile via className
      }
    };

    updateDividerWidth();
    window.addEventListener('resize', updateDividerWidth);
    return () => {
      window.removeEventListener('resize', updateDividerWidth);
    };
  }, []); // Removed dividerRef from deps, as it might not be stable or always present

  useEffect(() => {
    messageEnd.current?.scrollIntoView({ behavior: 'smooth' });
    // Title setting logic can remain if needed
  }, [messages]);

  return (
    <div className="flex flex-col space-y-6 pt-8 pb-44 lg:pb-32 sm:mx-4 md:ml-[8rem]">
      {messages.map((msg, i) => {
        const isLast = i === messages.length - 1;
        return (
          <Fragment key={msg.messageId}>
            <MessageBox
              key={i} // Consider using msg.messageId if truly unique and stable for key
              message={msg}
              callAd = {i==messages.length-1} // Ensure callAd logic is sound
              messageIndex={i}
              history={messages}
              loading={loading}
              dividerRef={isLast ? dividerRef : undefined}
              isLast={isLast}
              rewrite={rewrite}
              sendMessage={sendMessage}
              editMessage={editMessage}
              setMessages={setMessages}
            />
            {!isLast && msg.role === 'assistant' && (
              <div className="h-px w-full bg-light-secondary dark:bg-dark-secondary" />
            )}
          </Fragment>
        );
      })}
      {loading && !messageAppeared && <MessageBoxLoading />}
      <div ref={messageEnd} className="h-0" />

      {/* Container for MessageInput */}
      <div
        className="fixed bottom-0 left-0 right-0 md:left-auto md:bottom-10 z-40 w-full md:w-auto" // Full width on mobile, auto on desktop
        // On desktop, width is controlled by `dividerWidth` via style prop.
        // On mobile, `w-full` takes precedence.
        style={typeof window !== 'undefined' && window.innerWidth >= 768 ? { width: dividerWidth ? `${dividerWidth}px` : 'auto' } : {}}
      >
        <MessageInput
            loading={loading}
            sendMessage={sendMessage}
            onImagePromptSubmit={onImagePromptSubmit}
            onAudioPromptSubmit={onAudioPromptSubmit}
        />
      </div>
    </div>
  );
};

export default Chat;
