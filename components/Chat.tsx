'use client';

import { Fragment, useEffect, useRef, type MutableRefObject } from 'react';
import MessageInput, { ImageGenParams, AudioGenParams } from './MessageInput';
import { Message } from './ChatWindow';
import { AIChatParams } from './ChatCompletionParametersPanel';
import MessageBox from './MessageBox';
import MessageBoxLoading from './MessageBoxLoading';
import { VideoGenParams as UIVideoGenParams } from './ChatWindow';

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
}: {
  messages: Message[];
  sendMessage: (message: string, file?: File | null) => void;
  onImagePromptSubmit: (params: ImageGenParams, imagePromptText: string) => void;
  onAudioPromptSubmit: (params: AudioGenParams, audioPromptText: string) => void;
  onVideoPromptSubmit: (params: UIVideoGenParams, videoPromptText: string) => void;
  onAIChatSubmit: (prompt: string, params: AIChatParams) => void;
  loading: boolean;
  rewrite: (messageId: string) => void;
  editMessage: (messageId: string, newContent: string) => void;
  setMessages: (messages: Message[]) => void;
}) => {
  const messageEnd = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messageEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full">

    
      <div className="flex-grow overflow-y-auto px-2 sm:px-4 md:px-6 pb-24 ">
        {messages.map((msg, i) => (
          <Fragment key={msg.messageId}>
            <MessageBox
              message={msg}
              callAd={i === messages.length - 1}
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

      
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 dark:to-transparent">
       
        <div className="w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-4 pb-4 pt-8">
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
