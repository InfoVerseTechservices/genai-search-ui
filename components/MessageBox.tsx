// components/MessageBox.tsx
'use client';

/* eslint-disable @next/next/no-img-element */
import React, { MutableRefObject, useEffect, useState } from 'react';
import { Message } from './ChatWindow'; // Updated Message type
import { cn } from '@/lib/utils';
import { Edit, Image as ImageIconLucide } from 'lucide-react'; // Added ImageIconLucide
import { BookCopy, Disc3, Volume2, StopCircle } from 'lucide-react';
// import Markdown from 'markdown-to-jsx'; // Will use ReactMarkdown
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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { base16AteliersulphurpoolLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, ClipboardList } from 'lucide-react';

const MessageBox = ({
  message,
  messageIndex,
  history,
  loading, // This is general loading for assistant text response
  dividerRef,
  isLast,
  rewrite,
  sendMessage, // For resending user message or suggestions
  editMessage, // For editing user message
  setMessages, // For editing user message
  callAd,
}: {
  message: Message;
  messageIndex: number;
  history: Message[];
  loading: boolean;
  dividerRef?: MutableRefObject<HTMLDivElement | null>;
  isLast: boolean;
  rewrite: (messageId: string) => void;
  sendMessage: (message: string, file?: File | null) // Added file optional param
    => void;
  editMessage: (messageId: string, newContent: string) => void;
  setMessages: (messages: Message[]) => void;
  callAd: boolean;
}) => {
  const [parsedMessage, setParsedMessage] = useState(message.content);
  const [speechMessage, setSpeechMessage] = useState(message.content);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  useEffect(() => {
    const regex = /\[(\d+)\]/g; // This regex seems specific, ensure it's correct: /\[(\d+)\]/g might be more common for [1] style links

    if (
      message.role === 'assistant' &&
      message.type !== 'generated_image' && // Don't process generated images this way
      message?.sources &&
      message.sources.length > 0
    ) {
      setParsedMessage(
        message.content.replace(
          regex,
          (_, number) =>
            `<a href="${message.sources?.[parseInt(number, 10) - 1]?.metadata?.url}" target="_blank" className="bg-light-secondary dark:bg-dark-secondary px-1 rounded ml-1 no-underline text-xs text-black dark:text-gray-300 relative">${number}</a>`,
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
      // Logic for saving edited user messages (as provided in existing file)
      const updatedHistory = history.filter((msg, index) => {
        return (
          msg.messageId !== message.messageId &&
          !(index === messageIndex + 1 && msg.role === 'assistant')
        );
      });
      setMessages(updatedHistory);
      sendMessage(editedContent); // Resend the edited query
    }
    setIsEditing(false);
  };

  const [isImageSearchVisible, setIsImageSearchVisible] = useState(true);
  const [isVideoSearchVisible, setIsVideoSearchVisible] = useState(true);

  const handleImageSearchCompletion = (success: boolean) => {
    setIsImageSearchVisible(!success); // Hide if successful, or handle as needed
    setIsVideoSearchVisible(success); // Show video if image was successful (example logic)
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
        <SyntaxHighlighter language={language} style={base16AteliersulphurpoolLight} customStyle={{ margin: 0, padding: '1rem', borderRadius: '0.5rem' }}>
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

  // Main rendering logic
  return (
    <div className='dark:text-white'> {/* Added dark:text-white for better dark mode visibility */}
      {message.role === 'user' && (message.type === 'text' || !message.type) && (
        // Standard User Text Message
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

      {message.role === 'user' && message.type === 'image_prompt' && (
        // User Image Prompt Message
        <div className={cn('flex items-start', messageIndex === 0 ? 'pt-16' : 'pt-8')}>
           <ImageIconLucide size={24} className="mr-2 mt-1 text-blue-500 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Image prompt:</span>
            <h2 className="text-[#000080] dark:text-blue-300 bg-[#D2E3FD] dark:bg-slate-700 self-start font-medium text-lg sm:text-xl max-w-max inline rounded-md whitespace-normal p-2">
              {message.imagePromptText || message.content} {/* Display the specific image prompt text */}
            </h2>
            {message.status === 'loading' && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Generating image...</p>}
          </div>
        </div>
      )}

      {message.role === 'assistant' && message.type === 'generated_image' && message.b64Json && (
        // Assistant Generated Image Message
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
            {/* Add download or other actions if needed */}
          </div>
        </div>
      )}

      {message.role === 'assistant' && (message.type === 'text' || !message.type) && (
        // Standard Assistant Text Message (existing logic)
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
              )}
            </div>
          </div>
          {/* Right sidebar with SearchImages, SearchVideos, Ads */}
          <div className="lg:sticky lg:top-20 flex flex-col items-center space-y-3 w-[300px] z-30 h-full pb-4">
            <div className='w-[300px] h-[207.36px]'>
              <div className="h-full w-full">
                <RelatedImages chat_history={history.slice(0, messageIndex -1)} query={history[messageIndex - 1]?.content} />
              </div>
            </div>
            {isImageSearchVisible && <SearchImages key="image-search" query={history[messageIndex -1]?.content} chat_history={history.slice(0, messageIndex -1)} complete={handleImageSearchCompletion} visible={true} />}
            {isVideoSearchVisible && <SearchVideos key="video-search" chat_history={history.slice(0, messageIndex-1)} query={history[messageIndex-1]?.content} complete={handleVideoSearchCompletion} visible={true} />}
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
