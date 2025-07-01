'use client';

import { Fragment, useEffect, useRef } from 'react';
import MessageInput from './MessageInput';
import type { Message, ImageGenParams, AudioGenParams, VideoGenParams, AIChatParams } from './ChatWindow';
import MessageBox from './MessageBox';
import MessageBoxLoading from './MessageBoxLoading';

interface ChatProps {
  loading: boolean;
  messages: Message[];
  sendMessage: (message: string, file?: File | null) => void;
  onImagePromptSubmit: (params: ImageGenParams, imagePromptText: string) => void;
  onAudioPromptSubmit: (params: AudioGenParams, audioPromptText: string) => void;
  onVideoPromptSubmit: (params: VideoGenParams, videoPromptText: string) => void;
  onAIChatSubmit: (prompt: string, params: AIChatParams) => void;
  rewrite: (messageId: string) => void;
  editMessage: (messageId: string, newContent: string) => void;
  setMessages: (messages: Message[]) => void;
}

const Chat = ({
  loading,
  messages,
  sendMessage,
  onImagePromptSubmit,
  onAudioPromptSubmit,
  onVideoPromptSubmit,
  onAIChatSubmit,
  rewrite,
  editMessage,
  setMessages,
}: ChatProps) => {
  const messageEnd = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // This part is correct and will scroll to the bottom when new messages arrive.
    messageEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    // This parent container is correctly set up with `relative` positioning,
    // which is required for the `absolute` child to be positioned correctly.
    <div className="flex flex-col h-full w-full relative">
      
      {/* Message List Area */}
      {/* FIX: Changed `flex-grow` to `flex-1`.
          This div now grows to fill the ENTIRE parent height.
          The `overflow-y-auto` makes ONLY this section scrollable.
          The `pb-32` is crucial to add space at the bottom so the last
          message isn't hidden underneath the absolutely positioned input. */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto pb-32"
      >
        <div className="px-4">
          {messages.map((msg, i) => (
            <Fragment key={msg.messageId}>
              <MessageBox
                message={msg}
                messageIndex={i}
                history={messages}
                loading={loading}
                isLast={i === messages.length - 1}
                rewrite={rewrite}
                sendMessage={sendMessage}
                editMessage={editMessage}
                setMessages={setMessages}
              />
              {i < messages.length - 1 && msg.role === 'assistant' && (
                <div className="h-px w-full bg-gray-200 dark:bg-gray-700/50 my-4" />
              )}
            </Fragment>
          ))}
          {loading && messages.length > 0 && messages[messages.length - 1].role === 'user' && <MessageBoxLoading />}
          <div ref={messageEnd} className="h-0" />
        </div>
      </div>

      {/* Fixed Message Input at the bottom */}
      {/* FIX: Replaced `sticky` with `absolute`. This takes the input out of
          the document flow and pins it to the bottom of the nearest `relative`
          parent, which is the main div of this component. */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 dark:to-transparent pt-8">
        <div className="w-full max-w-4xl mx-auto px-4 pb-4">
          <MessageInput
            loading={loading}
            sendMessage={sendMessage}
            onImagePromptSubmit={onImagePromptSubmit}
            onAudioPromptSubmit={onAudioPromptSubmit}
            onVideoPromptSubmit={onVideoPromptSubmit}
            onAIChatSubmit={onAIChatSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;