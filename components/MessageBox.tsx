// components/MessageBox.tsx
'use client';

/* eslint-disable @next/next/no-img-element */
import React, { MutableRefObject, useEffect, useState } from 'react';
import { Message } from './ChatWindow';
import { cn } from '@/lib/utils';
import { Edit, Image as ImageIconLucide, Waves as AudioIconLucide, Video as VideoIconLucide, BookCopy, Disc3, Volume2, StopCircle, Check, ClipboardList } from 'lucide-react'; // Added VideoIconLucide
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { base16AteliersulphurpoolLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import Copy from './MessageActions/Copy';
import Rewrite from './MessageActions/Rewrite';
import MessageSources from './MessageSources';
import SearchImages from './SearchImages';
import SearchVideos from './SearchVideos';
import { useSpeech } from 'react-text-to-speech';
import SideTopAdComponent from './Ads/SideAdTop';
import SideBottomAdComponent from './Ads/SideAdBottom';
import Share from './MessageActions/Share';
import RelatedImages from './GetOneImage';

// Define ContextualActionsPlaceholder component
const ContextualActionsPlaceholder: React.FC<{ messageId: string }> = ({ messageId }) => {
  const handleRegenerate = () => console.log("Regenerate clicked for:", messageId);
  const handleFollowUp = () => console.log("More like this clicked for:", messageId); // Changed log message for clarity

  return (
    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-2">
      <button
        onClick={handleRegenerate}
        className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
      >
        Regenerate
      </button>
      <button
        onClick={handleFollowUp}
        className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
      >
        More like this
      </button>
    </div>
  );
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
  editMessage,
  setMessages,
  callAd,
}: {
  message: Message;
  messageIndex: number;
  history: Message[];
  loading: boolean;
  dividerRef?: MutableRefObject<HTMLDivElement | null>;
  isLast: boolean;
  rewrite: (messageId: string) => void;
  sendMessage: (message: string, file?: File | null) => void;
  editMessage: (messageId: string, newContent: string) => void;
  setMessages: (messages: Message[]) => void;
  callAd: boolean;
}) => {
  const [parsedMessage, setParsedMessage] = useState(message.content);
  const [speechMessage, setSpeechMessage] = useState(message.content);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  useEffect(() => {
    const regex = /\[(\d+)\]/g;

    if (
      message.role === 'assistant' &&
      (message.type === 'text' || !message.type) &&
      message?.sources &&
      message.sources.length > 0
    ) {
      setParsedMessage(
        message.content.replace(
          regex,
          (_, number) => {
            const sourceIndex = parseInt(number, 10) - 1;
            if (message.sources && sourceIndex >= 0 && sourceIndex < message.sources.length) {
              return `<a href="${message.sources[sourceIndex]?.metadata?.url}" target="_blank" className="bg-light-secondary dark:bg-dark-secondary px-1 rounded ml-1 no-underline text-xs text-black dark:text-gray-300 relative">${number}</a>`;
            }
            return `[${number}]`;
          }
        ),
      );
    } else {
      setParsedMessage(message.content);
    }
    setSpeechMessage(message.content.replace(regex, ''));
  }, [message.content, message.sources, message.role, message.type]);

  const { speechStatus, start, stop } = useSpeech({ text: speechMessage });

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(message.content);
  };

  const handleSave = () => {
    if (editedContent !== message.content) {
      const updatedHistory = history.filter((msg, index) => {
        return (
          msg.messageId !== message.messageId &&
          !(index === messageIndex + 1 && msg.role === 'assistant')
        );
      });
      setMessages(updatedHistory);
      sendMessage(editedContent, null);
    }
    setIsEditing(false);
  };

  const [isImageSearchVisible, setIsImageSearchVisible] = useState(true);
  const [isVideoSearchVisible, setIsVideoSearchVisible] = useState(true);

  const handleImageSearchCompletion = (success: boolean) => {
    setIsImageSearchVisible(!success);
    setIsVideoSearchVisible(success);
  };
  const handleVideoSearchCompletion = (success: boolean) => {
    setIsVideoSearchVisible(!success);
    setIsImageSearchVisible(success);
  };

  interface MarkdownCodeProps {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
    node?: any;
   }

  const CodeBlock: React.FC<MarkdownCodeProps> = ({ node, inline = false, className, children }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';
    const [copied, setCopied] = useState(false);
    return !inline && match ? (
      <div className="relative group my-2">
        <SyntaxHighlighter language={language} style={base16AteliersulphurpoolLight} customStyle={{ margin: 0, padding: '1rem', borderRadius: '0.5rem' }} PreTag="div">
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
        <button
          onClick={() => { navigator.clipboard.writeText(String(children)); setCopied(true); setTimeout(() => setCopied(false), 1000); }}
          className="absolute top-2 right-2 p-1 bg-gray-200 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 text-black dark:text-white transition-opacity"
          aria-label="Copy code to clipboard"
        >
          {copied ? <Check size={16} /> : <ClipboardList size={16} />}
        </button>
      </div>
    ) : (
      <code className={cn("bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm", className)}>{children}</code>
    );
  };

  const currentQuery = history[messageIndex > 0 ? messageIndex - 1 : 0]?.content;
  const historyForSearch = history.slice(0, messageIndex > 0 ? messageIndex - 1 : 0);

  return (
    <div className='dark:text-white'>
      {/* Standard User Text Message */}
      {message.role === 'user' && (message.type === 'text' || !message.type) && (
        <div className={cn('flex items-center', messageIndex === 0 ? 'pt-16' : 'pt-8')}>
          <div className="flex items-center">
            {isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="edit-input p-2 text-[#000080] dark:text-blue-300 bg-[#D2E3FD] dark:bg-slate-700 font-medium text-xl sm:text-3xl rounded-md w-full"
              />
            ) : (
              <h2 className="text-[#000080] dark:text-blue-300 bg-[#D2E3FD] dark:bg-slate-700 font-medium text-xl sm:text-3xl inline-block rounded-md whitespace-normal p-2">
                {message.content}
              </h2>
            )}
            <button onClick={isEditing ? handleSave : handleEdit} className="ml-2 p-1 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white">
              {isEditing ? 'Save' : <Edit size={18} />}
            </button>
          </div>
        </div>
      )}

      {/* User Image Prompt Message */}
      {message.role === 'user' && message.type === 'image_prompt' && (
        <div className={cn('flex items-start', messageIndex === 0 ? 'pt-16' : 'pt-8')}>
           <ImageIconLucide size={24} className="mr-2 mt-1 text-blue-500 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Image prompt:</span>
            <h2 className="text-[#000080] dark:text-blue-300 bg-[#D2E3FD] dark:bg-slate-700 self-start font-medium text-lg sm:text-xl max-w-max inline rounded-md whitespace-normal p-2">
              {message.imagePromptText || message.content}
            </h2>
            {message.status === 'loading' && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Generating image...</p>}
            {message.status === 'error' && <p className="text-sm text-red-500 dark:text-red-400 mt-1">Image generation failed. {message.content && message.content.includes("Error: ") ? message.content.split("Error: ")[1] : message.content}</p>}
          </div>
        </div>
      )}

      {/* User Audio Prompt Message */}
      {message.role === 'user' && message.type === 'audio_prompt' && (
        <div className={cn('flex items-start', messageIndex === 0 ? 'pt-16' : 'pt-8')}>
           <AudioIconLucide size={24} className="mr-2 mt-1 text-purple-500 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Audio prompt:</span>
            <h2 className="text-[#000080] dark:text-purple-300 bg-[#E0D2FD] dark:bg-slate-700 self-start font-medium text-lg sm:text-xl max-w-max inline rounded-md whitespace-normal p-2">
              {message.audioPromptText || message.content}
            </h2>
            {message.status === 'loading' && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Generating audio...</p>}
            {message.status === 'error' && <p className="text-sm text-red-500 dark:text-red-400 mt-1">Audio generation failed. {message.content && message.content.includes("Error: ") ? message.content.split("Error: ")[1] : message.content}</p>}
          </div>
        </div>
      )}

      {/* NEW: User Video Prompt Message */}
      {message.role === 'user' && message.type === 'video_prompt' && (
        <div className={cn('flex items-start', messageIndex === 0 ? 'pt-16' : 'pt-8')}>
           <VideoIconLucide size={24} className="mr-2 mt-1 text-red-500 flex-shrink-0" /> {/* Video icon color */}
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Video prompt:</span>
            <h2 className="text-[#000080] dark:text-red-300 bg-[#FDD2D2] dark:bg-slate-700 self-start font-medium text-lg sm:text-xl max-w-max inline rounded-md whitespace-normal p-2">
              {message.videoPromptText || message.content}
            </h2>
            {message.status === 'loading' && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Generating video... (this may take a moment)</p>}
            {message.status === 'error' && <p className="text-sm text-red-500 dark:text-red-400 mt-1">Video generation failed. {message.content && message.content.includes("Error: ") ? message.content.split("Error: ")[1] : message.content}</p>}
          </div>
        </div>
      )}

      {/* Assistant Generated Image Message */}
      {message.role === 'assistant' && message.type === 'generated_image' && message.b64Json && (
        <div className={cn("pt-4", messageIndex === 0 ? 'pt-16' : 'pt-8')}>
          <div className="flex flex-col space-y-2">
             <div className="flex flex-row items-center space-x-2">
                <ImageIconLucide className="text-black dark:text-white" size={20} />
                <h3 className="text-black dark:text-white font-medium text-xl">Generated Image</h3>
              </div>
            {message.imagePromptText && <p className="text-sm text-gray-600 dark:text-gray-400 italic">From prompt: "{message.imagePromptText}"</p>}
            <img
              src={`data:image/png;base64,${message.b64Json}`}
              alt={message.imagePromptText || "Generated image"}
              className="rounded-lg border dark:border-gray-600 max-w-md w-full h-auto"
            />
            <ContextualActionsPlaceholder messageId={message.messageId} />
          </div>
        </div>
      )}

      {/* Assistant Generated Audio Message */}
      {message.role === 'assistant' && message.type === 'generated_audio' && message.b64JsonAudio && (
        <div className={cn("pt-4", messageIndex === 0 ? 'pt-16' : 'pt-8')}>
          <div className="flex flex-col space-y-2">
             <div className="flex flex-row items-center space-x-2">
                <AudioIconLucide className="text-black dark:text-white" size={20} />
                <h3 className="text-black dark:text-white font-medium text-xl">Generated Audio</h3>
              </div>
            {message.audioPromptText && <p className="text-sm text-gray-600 dark:text-gray-400 italic">From prompt: "{message.audioPromptText}"</p>}
            <audio
              controls
              src={`data:audio/mpeg;base64,${message.b64JsonAudio}`}
              className="rounded-lg border dark:border-gray-600 w-full max-w-md"
            >
              Your browser does not support the audio element.
            </audio>
            <ContextualActionsPlaceholder messageId={message.messageId} />
          </div>
        </div>
      )}

      {/* NEW: Assistant Generated Video Message */}
      {message.role === 'assistant' && message.type === 'generated_video' && message.b64JsonVideo && (
        <div className={cn("pt-4", messageIndex === 0 ? 'pt-16' : 'pt-8')}>
          <div className="flex flex-col space-y-2">
             <div className="flex flex-row items-center space-x-2">
                <VideoIconLucide className="text-black dark:text-white" size={20} />
                <h3 className="text-black dark:text-white font-medium text-xl">Generated Video</h3>
              </div>
            {message.videoPromptText && <p className="text-sm text-gray-600 dark:text-gray-400 italic">From prompt: "{message.videoPromptText}"</p>}
            <video
              controls
              autoPlay // Consider adding 'muted' attribute: autoPlay muted
              loop
              src={`data:video/mp4;base64,${message.b64JsonVideo}`} // Assuming MP4 format
              className="rounded-lg border dark:border-gray-600 max-w-md w-full h-auto shadow-md"
            >
              Your browser does not support the video tag.
            </video>
            <ContextualActionsPlaceholder messageId={message.messageId} />
          </div>
        </div>
      )}

      {/* Standard Assistant Text Message */}
      {message.role === 'assistant' && (message.type === 'text' || !message.type) && (
        <div className="flex flex-col space-y-9 lg:space-y-0 lg:flex-row lg:justify-between lg:space-x-24 lg:w-[65rem]">
           <div ref={dividerRef} className="flex flex-col space-y-6 w-full lg:w-8/12 h-full">
            {message.sources && message.sources.length > 0 && (
              <div className="flex flex-col space-y-2">
                 <div className="flex flex-row items-center space-x-2">
                  <BookCopy className="text-black dark:text-white" size={20} />
                  <h3 className="text-black dark:text-white font-medium text-xl">Sources</h3>
                </div>
                <MessageSources sources={message.sources} />
              </div>
            )}
            <div className="flex flex-col space-y-2">
              <div className="flex flex-row items-center space-x-2">
                <Disc3 className={cn('text-black dark:text-white', isLast && loading ? 'animate-spin' : 'animate-none')} size={20} />
                <h3 className="text-black dark:text-white font-medium text-xl">Answer</h3>
              </div>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{ code: CodeBlock }}
                className={cn('prose prose-p:leading-relaxed prose-pre:p-0', 'dark:prose-invert max-w-none break-words text-black dark:text-gray-200 text-sm md:text-base font-medium')}
              >
                {parsedMessage}
              </ReactMarkdown>
              {loading && isLast ? null : (
                <>
                  <div className="flex flex-row items-center justify-between w-full text-black dark:text-white py-4 -mx-2">
                    <div className="flex flex-row items-center space-x-1">
                      <Share message={message.content} chatId={message.chatId} messageId={message.messageId}/>
                      <Rewrite rewrite={rewrite} messageId={message.messageId} />
                    </div>
                    <div className="flex flex-row items-center space-x-1">
                      <Copy initialMessage={message.content} message={message} />
                      <button
                        onClick={() => { if (speechStatus === 'started') stop(); else start(); }}
                        className="p-2 text-black dark:text-white rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200"
                      >
                        {speechStatus === 'started' ? <StopCircle size={18} /> : <Volume2 size={18} />}
                      </button>
                    </div>
                  </div>
                  <ContextualActionsPlaceholder messageId={message.messageId} />
                </>
              )}
            </div>
          </div>
          <div className="lg:sticky lg:top-20 flex flex-col items-center space-y-3 w-[300px] z-30 h-full pb-4">
            <div className='w-[300px] h-[207.36px]'>
              <div className="h-full w-full">
                <RelatedImages chat_history={historyForSearch} query={currentQuery} />
              </div>
            </div>
            {isImageSearchVisible && <SearchImages key="image-search" query={currentQuery} chat_history={historyForSearch} complete={handleImageSearchCompletion} visible={true} />}
            {isVideoSearchVisible && <SearchVideos key="video-search" chat_history={historyForSearch} query={currentQuery} complete={handleVideoSearchCompletion} visible={true} />}
            {callAd && (
              <div className="w-[300px] mt-10 hidden lg:flex xl:flex flex-col items-center gap-2.5 h-[calc(100vh-110px)] hide-scrollbar overflow-y-auto overflow-x-hidden">
                <div className="w-[300px] h-[250px] cursor-pointer"><SideTopAdComponent divid={`top-message-${messageIndex}`} /></div>
                <div className="w-[300px] h-[600px] cursor-pointer"><SideBottomAdComponent divid={`bottom-message-${messageIndex}`} /></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBox;
