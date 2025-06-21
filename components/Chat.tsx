// components/Chat.tsx
'use client';

import { Fragment, useEffect, useRef } from 'react'; // Removed useState
import MessageInput, { VideoGenParams, ImageGenParams, AudioGenParams } from './MessageInput'; // Assuming types are exported
import { Message } from './ChatWindow';
import MessageBox from './MessageBox';
import MessageBoxLoading from './MessageBoxLoading';

// Ensure these prop types are complete as expected by MessageInput and ChatWindow
// interface ImageGenParams { /* ... */ } (defined in MessageInput)
// interface AudioGenParams { /* ... */ } (defined in MessageInput)
// interface VideoGenParams { /* ... */ } (defined in MessageInput)

const Chat = ({
  loading,
  messages,
  sendMessage,
  onImagePromptSubmit,
  onAudioPromptSubmit,
  onVideoPromptSubmit,
  messageAppeared,
  rewrite,
  editMessage,
  setMessages,
}: {
  messages: Message[];
  sendMessage: (message: string, file?: File | null) => void;
  onImagePromptSubmit: (params: ImageGenParams, imagePromptText: string) => void;
  onAudioPromptSubmit: (params: AudioGenParams, audioPromptText: string) => void;
  onVideoPromptSubmit: (params: VideoGenParams, videoPromptText: string) => void;
  loading: boolean;
  messageAppeared: boolean;
  rewrite: (messageId: string) => void;
  editMessage: (messageId: string, newContent: string) => void;
  setMessages: (messages: Message[]) => void;
}) => {
  const dividerRef = useRef<HTMLDivElement | null>(null);
  const messageEnd = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messageEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const messageListPaddingBottom = 'pb-24 md:pb-28';

  return (
    <div className="flex flex-col h-full w-full">

      {/* Messages list area - scrollable */}
      <div className={`flex-grow overflow-y-auto space-y-6 pt-8 ${messageListPaddingBottom} px-2 sm:px-4 md:px-6`}>
        {messages.map((msg, i) => {
          const isLast = i === messages.length - 1;
          return (
            <Fragment key={msg.messageId}>
              <MessageBox
                key={msg.messageId}
                message={msg}
                callAd = {i === messages.length - 1}
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
        {loading && messages.length > 0 && messages[messages.length -1].role === 'user' && <MessageBoxLoading />}
        <div ref={messageEnd} className="h-0" />
      </div>

      {/* Sticky Input Area Wrapper */}
      <div className="sticky bottom-0 w-full bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700 py-2 md:py-3 z-10">
        {/* Centering and max-width container for the input itself */}
        <div className="w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-2 md:px-0">
          <MessageInput
              loading={loading}
              sendMessage={sendMessage}
              onImagePromptSubmit={onImagePromptSubmit}
              onAudioPromptSubmit={onAudioPromptSubmit}
              onVideoPromptSubmit={onVideoPromptSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
