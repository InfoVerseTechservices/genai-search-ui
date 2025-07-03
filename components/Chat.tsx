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
    messageEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
   
    <div className="flex flex-col h-full w-full">
      
     
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto "
      >
        <div className="px-4 pt-4">
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

      
      <div className="absolute bottom-0 w-full py-2 md:py-4 z-10 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 dark:to-transparent ">
        <div className=" max-w-5xl mx-auto px-5  mb-5">
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