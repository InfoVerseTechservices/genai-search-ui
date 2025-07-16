'use client';

/* eslint-disable @next/next/no-img-element */
import React, { MutableRefObject, useEffect, useState } from 'react';
import { Message } from './ChatWindow';
import { cn } from '@/lib/utils';
import {
  BookCopy,
  Disc3,
  Volume2,
  StopCircle,
  Layers3,
  Plus,
} from 'lucide-react';
import Markdown, { MarkdownToJSX } from 'markdown-to-jsx';
import Copy from './MessageActions/Copy';
import Rewrite from './MessageActions/Rewrite';
import Share from './MessageActions/Share';
import Feedback from './MessageActions/Feedback';
import Favourite from './MessageActions/Favourite';
import MessageSources from './MessageSources';
import SearchImages from './SearchImages';
import SearchVideos from './SearchVideos';
import { useSpeech } from 'react-text-to-speech';
import ThinkBox from './ThinkBox';
import RichTextRenderer from './RichTextRenderer';

const ThinkTagProcessor = ({ children }: { children: React.ReactNode }) => {
  return <ThinkBox content={children as string} />;
};

const MessageBox = ({
  message,
  messageIndex,
  history,
  loading,
  dividerRef,
  isLast,
  rewrite,
  sendMessage,
  isEnhancedSearch = false,
}: {
  message: Message;
  messageIndex: number;
  history: Message[];
  loading: boolean;
  dividerRef?: MutableRefObject<HTMLDivElement | null>;
  isLast: boolean;
  rewrite: (messageId: string) => void;
  sendMessage: (message: string) => void;
  isEnhancedSearch?: boolean;
}) => {
  const [parsedMessage, setParsedMessage] = useState(message.content);
  const [speechMessage, setSpeechMessage] = useState(message.content);

  useEffect(() => {
    const citationRegex = /\[([^\]]+)\]/g;
    const regex = /\[(\d+)\]/g;
    let processedMessage = message.content;

    if (message.role === 'assistant' && message.content.includes('<think>')) {
      const openThinkTag = processedMessage.match(/<think>/g)?.length || 0;
      const closeThinkTag = processedMessage.match(/<\/think>/g)?.length || 0;

      if (openThinkTag > closeThinkTag) {
        processedMessage += '</think> <a> </a>'; // The extra <a> </a> is to prevent the the think component from looking bad
      }
    }

    // Convert markdown images with base64 data to HTML for proper rendering
    if (processedMessage.includes('data:image/')) {
      processedMessage = processedMessage.replace(
        /!\[([^\]]*)\]\(data:image\/([^)]+)\)/g,
        '<img src="data:image/$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;" />'
      );
    }

    // Convert markdown videos with base64 data to HTML for proper rendering
    if (processedMessage.includes('data:video/')) {
      processedMessage = processedMessage.replace(
        /!\[([^\]]*)\]\(data:video\/([^)]+)\)/g,
        '<video controls style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;"><source src="data:video/$2" type="video/mp4" />$1</video>'
      );
    }

    if (
      message.role === 'assistant' &&
      message?.sources &&
      message.sources.length > 0
    ) {
      setParsedMessage(
        processedMessage.replace(
          citationRegex,
          (_, capturedContent: string) => {
            const numbers = capturedContent
              .split(',')
              .map((numStr) => numStr.trim());

            const linksHtml = numbers
              .map((numStr) => {
                const number = parseInt(numStr);

                if (isNaN(number) || number <= 0) {
                  return `[${numStr}]`;
                }

                const source = message.sources?.[number - 1];
                const url = source?.metadata?.url;

                if (url) {
                  return `<a href="${url}" target="_blank" className="bg-light-secondary dark:bg-dark-secondary px-1 rounded ml-1 no-underline text-xs text-black/70 dark:text-white/70 relative">${numStr}</a>`;
                } else {
                  return `[${numStr}]`;
                }
              })
              .join('');

            return linksHtml;
          },
        ),
      );
      setSpeechMessage(message.content.replace(regex, ''));
      return;
    }

    setSpeechMessage(message.content.replace(regex, ''));
    setParsedMessage(processedMessage);
  }, [message.content, message.sources, message.role]);

  const { speechStatus, start, stop } = useSpeech({ text: speechMessage });

  const markdownOverrides: MarkdownToJSX.Options = {
    overrides: {
      think: {
        component: ThinkTagProcessor,
      },
      video: {
        props: {
          controls: true,
          style: { maxWidth: '100%', borderRadius: '8px' }
        }
      }
    },
  };

  return (
    <div>
      {message.role === 'user' && (
        <div
          className={cn(
            'w-full px-2 sm:px-0',
            messageIndex === 0 ? 'pt-8 sm:pt-16' : 'pt-4 sm:pt-8',
            'break-words',
          )}
        >
          <h2 className="text-black dark:text-white font-medium text-xl sm:text-2xl lg:text-3xl w-full lg:w-9/12 leading-tight">
            {message.content.replace(/\?arch\{.*$/, '').replace(/\{"query":.*$/, '').trim()}
          </h2>
        </div>
      )}

      {message.role === 'assistant' && (
        <div className="flex flex-col space-y-6 sm:space-y-9 lg:space-y-0 lg:flex-row lg:justify-between lg:space-x-9 px-2 sm:px-0">
          <div
            ref={dividerRef}
            className="flex flex-col space-y-4 sm:space-y-6 w-full lg:w-9/12 min-w-0"
          >
            {message.sources && message.sources.length > 0 && (
              <div className="flex flex-col space-y-2">
                <div className="flex flex-row items-center space-x-2">
                  <BookCopy className="text-black dark:text-white flex-shrink-0" size={18} />
                  <h3 className="text-black dark:text-white font-medium text-lg sm:text-xl">
                    Sources
                  </h3>
                </div>
                <MessageSources sources={message.sources} />
              </div>
            )}
            <div className="flex flex-col space-y-2">
              <div className="flex flex-row items-center space-x-2">
                <Disc3
                  className={cn(
                    'text-black dark:text-white flex-shrink-0',
                    isLast && loading ? 'animate-spin' : 'animate-none',
                  )}
                  size={18}
                />
                <h3 className="text-black dark:text-white font-medium text-lg sm:text-xl">
                  Answer
                </h3>
              </div>

              {parsedMessage.includes('<video') || parsedMessage.includes('<img') || parsedMessage.includes('data:image/') || parsedMessage.includes('data:video/') ? (
                <div 
                  className={cn(
                    'prose prose-sm sm:prose prose-h1:mb-3 prose-h2:mb-2 prose-h2:mt-4 sm:prose-h2:mt-6 prose-h2:font-[800] prose-h3:mt-3 sm:prose-h3:mt-4 prose-h3:mb-1.5 prose-h3:font-[600] dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 font-[400]',
                    'max-w-none break-words text-black dark:text-white prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg overflow-hidden pb-4'
                  )}
                  dangerouslySetInnerHTML={{ __html: parsedMessage }}
                />
              ) : isEnhancedSearch ? (
                <RichTextRenderer content={parsedMessage} />
              ) : (
                <Markdown
                  className={cn(
                    'prose prose-sm sm:prose prose-h1:mb-3 prose-h2:mb-2 prose-h2:mt-4 sm:prose-h2:mt-6 prose-h2:font-[800] prose-h3:mt-3 sm:prose-h3:mt-4 prose-h3:mb-1.5 prose-h3:font-[600] dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 font-[400]',
                    'max-w-none break-words text-black dark:text-white prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg overflow-hidden',
                  )}
                  options={markdownOverrides}
                >
                  {parsedMessage}
                </Markdown>
              )}
              {loading && isLast ? null : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full text-black dark:text-white py-3 sm:py-4 -mx-2 gap-2 sm:gap-0">
                  <div className="flex flex-row items-center space-x-1 flex-wrap gap-1">
                    <Copy initialMessage={message.content} message={message} />
                    <Share 
                      message={message.content} 
                      chatId={history[0]?.chatId || 'default'} 
                      messageId={message.messageId} 
                    />
                    <Feedback 
                      messageId={message.messageId} 
                      chatId={history[0]?.chatId || 'default'} 
                    />
                    <Favourite 
                      messageId={message.messageId} 
                      chatId={history[0]?.chatId || 'default'}
                      message={message.content}
                      userMessage={history[messageIndex - 1]?.content}
                    />
                    <Rewrite rewrite={rewrite} messageId={message.messageId} />
                  </div>
                  <div className="flex flex-row items-center space-x-1 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        if (speechStatus === 'started') {
                          stop();
                        } else {
                          start();
                        }
                      }}
                      className="min-h-touch min-w-touch p-2 text-black/70 dark:text-white/70 rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200 hover:text-black dark:hover:text-white touch-manipulation"
                    >
                      {speechStatus === 'started' ? (
                        <StopCircle size={18} />
                      ) : (
                        <Volume2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              )}
              {isLast &&
                message.suggestions &&
                message.suggestions.length > 0 &&
                message.role === 'assistant' &&
                !loading && (
                  <>
                    <div className="h-px w-full bg-light-secondary dark:bg-dark-secondary" />
                    <div className="flex flex-col space-y-3 text-black dark:text-white">
                      <div className="flex flex-row items-center space-x-2 mt-4">
                        <Layers3 size={18} className="flex-shrink-0" />
                        <h3 className="text-lg sm:text-xl font-medium">Related</h3>
                      </div>
                      <div className="flex flex-col space-y-3">
                        {message.suggestions.map((suggestion, i) => (
                          <div
                            className="flex flex-col space-y-3 text-sm"
                            key={i}
                          >
                            <div className="h-px w-full bg-light-secondary dark:bg-dark-secondary" />
                            <div
                              onClick={() => {
                                sendMessage(suggestion);
                              }}
                              className="cursor-pointer flex flex-row justify-between font-medium space-x-2 items-center touch-manipulation min-h-touch"
                            >
                              <p className="transition duration-200 hover:text-[#24A0ED] text-sm sm:text-base leading-relaxed">
                                {suggestion}
                              </p>
                              <Plus
                                size={18}
                                className="text-[#24A0ED] flex-shrink-0"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
            </div>
          </div>
          {!parsedMessage.includes('data:image/') && !parsedMessage.includes('<video') && (
            <div className="lg:sticky lg:top-20 flex flex-col items-center space-y-3 w-full lg:w-3/12 z-30 h-full pb-40 sm:pb-48 lg:pb-40 px-2 sm:px-0">
              <SearchImages
                query={history[messageIndex - 1].content}
                chatHistory={history.slice(0, messageIndex - 1)}
                messageId={message.messageId}
              />
              <SearchVideos
                chatHistory={history.slice(0, messageIndex - 1)}
                query={history[messageIndex - 1].content}
                messageId={message.messageId}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageBox;
