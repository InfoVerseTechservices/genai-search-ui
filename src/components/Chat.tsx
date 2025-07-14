'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import MessageInput from './MessageInput';
import { File, Message } from './ChatWindow';
import MessageBox from './MessageBox';
import MessageBoxLoading from './MessageBoxLoading';

const Chat = ({
  loading,
  messages,
  sendMessage,
  messageAppeared,
  rewrite,
  fileIds,
  setFileIds,
  files,
  setFiles,
  focusMode,
  setFocusMode,
}: {
  messages: Message[];
  sendMessage: (message: string, isImageGeneration?: boolean, useTooling?: boolean) => void;
  loading: boolean;
  messageAppeared: boolean;
  rewrite: (messageId: string) => void;
  fileIds: string[];
  setFileIds: (fileIds: string[]) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  focusMode: string;
  setFocusMode: (mode: string) => void;
}) => {
  const [dividerWidth, setDividerWidth] = useState(0);
  const dividerRef = useRef<HTMLDivElement | null>(null);
  const messageEnd = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateDividerWidth = () => {
      if (dividerRef.current) {
        const isMobile = window.innerWidth <= 640;
        setDividerWidth(isMobile ? window.innerWidth - 16 : dividerRef.current.scrollWidth);
      }
    };

    updateDividerWidth();

    window.addEventListener('resize', updateDividerWidth);

    return () => {
      window.removeEventListener('resize', updateDividerWidth);
    };
  });

  useEffect(() => {
    const scroll = () => {
      messageEnd.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (messages.length === 1) {
      document.title = `${messages[0].content.substring(0, 30)} - ColomboAI`;
    }

    if (messages[messages.length - 1]?.role == 'user') {
      scroll();
    }
  }, [messages]);

  return (
    <div className="flex flex-col space-y-4 sm:space-y-6 pt-4 sm:pt-8 pb-32 sm:pb-44 lg:pb-32 px-2 sm:px-4 md:px-8 max-w-full overflow-hidden">
      {messages.map((msg, i) => {
        const isLast = i === messages.length - 1;

        return (
          <Fragment key={`${msg.messageId}-${i}`}>
            <MessageBox
              key={`msg-${i}`}
              message={msg}
              messageIndex={i}
              history={messages}
              loading={loading}
              dividerRef={isLast ? dividerRef : undefined}
              isLast={isLast}
              rewrite={rewrite}
              sendMessage={sendMessage}
              isEnhancedSearch={true}
            />
            {!isLast && msg.role === 'assistant' && (
              <div key={`divider-${i}`} className="h-px w-full bg-light-secondary dark:bg-dark-secondary mx-2 sm:mx-0" />
            )}
          </Fragment>
        );
      })}
      {loading && !messageAppeared && (
        <div className="px-2 sm:px-0">
          <MessageBoxLoading />
        </div>
      )}
      <div ref={messageEnd} className="h-0" />
      {dividerWidth > 0 && (
        <>
          <div
            className="bottom-20 sm:bottom-24 lg:bottom-10 fixed z-40 left-2 right-2 sm:left-auto sm:right-auto"
            style={{ width: window.innerWidth <= 640 ? 'calc(100vw - 1rem)' : dividerWidth }}
          >
            <MessageInput
              loading={loading}
              sendMessage={sendMessage}
              fileIds={fileIds}
              setFileIds={setFileIds}
              files={files}
              setFiles={setFiles}
              focusMode={focusMode}
              setFocusMode={setFocusMode}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;
