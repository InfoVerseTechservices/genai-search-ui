'use client';

/* eslint-disable @next/next/no-img-element */
import React, { MutableRefObject, useEffect, useState, useRef,  useCallback  } from 'react';
import { ComponentPropsWithoutRef } from 'react';
import { Message } from './ChatWindow';
import { cn } from '@/lib/utils';
import { Edit, Image as ImageIconLucide, Waves as AudioIconLucide, Video as VideoIconLucide, BookCopy, Disc3, Volume2, StopCircle, Check, ClipboardList } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { base16AteliersulphurpoolLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import Copy from './MessageActions/Copy';
import Rewrite from './MessageActions/Rewrite';
import MessageSources from './MessageSources';
import Share from './MessageActions/Share';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Define ContextualActionsPlaceholder component
const ContextualActionsPlaceholder: React.FC<{ messageId: string }> = ({ messageId }) => {
  const handleRegenerate = () => console.log("Regenerate clicked for:", messageId);
  const handleFollowUp = () => console.log("More like this clicked for:", messageId);

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
  isLast,
  rewrite,
  sendMessage,
  editMessage,
  setMessages,
}: {
  message: Message;
  messageIndex: number;
  history: Message[];
  loading: boolean;
  isLast: boolean;
  rewrite: (messageId: string) => void;
  sendMessage: (message: string, file?: File | null) => void;
  editMessage: (messageId: string, newContent: string) => void;
  setMessages: (messages: Message[]) => void;
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

  const CodeBlock = ({
    className,
    children,
    ...props
  }: React.PropsWithChildren<ComponentPropsWithoutRef<'code'>>) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';
    const [copied, setCopied] = useState(false);
    const codeString = Array.isArray(children) ? children.join('') : String(children);

    if (match) {
      return (
        <div className="relative group my-2">
          <SyntaxHighlighter language={language} style={base16AteliersulphurpoolLight} customStyle={{ margin: 0, padding: '1rem', borderRadius: '0.5rem' }} PreTag="div">
            {codeString.replace(/\n$/, '')}
          </SyntaxHighlighter>
          <button
            onClick={() => { navigator.clipboard.writeText(codeString); setCopied(true); setTimeout(() => setCopied(false), 1000); }}
            className="absolute top-2 right-2 p-1 bg-gray-200 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 text-black dark:text-white transition-opacity"
            aria-label="Copy code to clipboard"
          >
            {copied ? <Check size={16} /> : <ClipboardList size={16} />}
          </button>
        </div>
      );
    } else {
      return (
        <code className={cn("bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm", className)} {...props}>
          {codeString}
        </code>
      );
    }
  };

  return (
    <div className='dark:text-white px-2 sm:px-4 pb-5 flex flex-col'>
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

      {/* User Prompts for Image, Audio, Video */}
      {message.role === 'user' && message.type === 'image_prompt' && (
         <div className={cn('flex items-start', messageIndex === 0 ? 'pt-16' : 'pt-8')}>
           <ImageIconLucide size={24} className="mr-2 mt-1 text-blue-500 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Image prompt:</span>
            <h2 className="text-[#000080] dark:text-blue-300 bg-[#D2E3FD] dark:bg-slate-700 self-start font-medium text-lg sm:text-xl max-w-max inline rounded-md whitespace-normal p-2">
              {message.imagePromptText || message.content}
            </h2>
            {message.status === 'loading' && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Generating image...</p>}
            {message.status === 'error' && <p className="text-sm text-red-500 dark:text-red-400 mt-1">Image generation failed.</p>}
          </div>
        </div>
      )}
      {message.role === 'user' && message.type === 'audio_prompt' && (
         <div className={cn('flex items-start', messageIndex === 0 ? 'pt-16' : 'pt-8')}>
           <AudioIconLucide size={24} className="mr-2 mt-1 text-purple-500 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Audio prompt:</span>
            <h2 className="text-[#000080] dark:text-purple-300 bg-[#E0D2FD] dark:bg-slate-700 self-start font-medium text-lg sm:text-xl max-w-max inline rounded-md whitespace-normal p-2">
              {message.audioPromptText || message.content}
            </h2>
             {message.status === 'loading' && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Generating audio...</p>}
            {message.status === 'error' && <p className="text-sm text-red-500 dark:text-red-400 mt-1">Audio generation failed.</p>}
          </div>
        </div>
      )}
      {message.role === 'user' && message.type === 'video_prompt' && (
         <div className={cn('flex items-start', messageIndex === 0 ? 'pt-16' : 'pt-8')}>
           <VideoIconLucide size={24} className="mr-2 mt-1 text-red-500 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Video prompt:</span>
            <h2 className="text-[#000080] dark:text-red-300 bg-[#FDD2D2] dark:bg-slate-700 self-start font-medium text-lg sm:text-xl max-w-max inline rounded-md whitespace-normal p-2">
              {message.videoPromptText || message.content}
            </h2>
            {message.status === 'loading' && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Generating video...</p>}
            {message.status === 'error' && <p className="text-sm text-red-500 dark:text-red-400 mt-1">Video generation failed.</p>}
          </div>
        </div>
      )}

      {message.role === 'assistant' && message.type === 'generated_image' && message.b64Json && (
        <div className="pt-4">
          <img src={`data:image/png;base64,${message.b64Json}`} alt={message.imagePromptText || "Generated image"} className="rounded-lg border dark:border-gray-600 max-w-md w-full h-auto shadow-md" />
        </div>
      )}
      {message.role === 'assistant' && message.type === 'generated_audio' && message.b64JsonAudio && (
        <div className="pt-4">
          <audio controls src={`data:audio/mpeg;base64,${message.b64JsonAudio}`} className="rounded-lg w-full max-w-md" />
        </div>
      )}
      {message.role === 'assistant' && message.type === 'generated_video' && message.b64JsonVideo && (
        <div className="pt-4">
          <video controls autoPlay muted loop src={`data:video/mp4;base64,${message.b64JsonVideo}`} className="rounded-lg border dark:border-gray-600 max-w-md w-full h-auto shadow-md" />
        </div>
      )}

      {message.role === 'assistant' && (message.type === 'text' || !message.type) && (
        <div className="w-full flex flex-col space-y-6">
          {message.sources && message.sources.length > 0 && (
            <div className="flex flex-col space-y-2">
              <div className="flex flex-row items-center space-x-2">
                <BookCopy className="text-black dark:text-white" size={20} />
                <h3 className="text-black dark:text-white font-medium text-lg sm:text-xl">Sources</h3>
              </div>
              <MessageSources sources={message.sources} />
            </div>
          )}
          <div className="flex flex-col space-y-2">
           

            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{ code: CodeBlock }}
              className="prose prose-p:leading-relaxed prose-pre:p-0 dark:prose-invert max-w-none break-words text-black dark:text-gray-200 text-sm md:text-base font-medium"
            >
              {parsedMessage}
            </ReactMarkdown>
            {message.status !== 'streaming' && !(isLast && loading) && (
              <>
                <div className="flex flex-row items-center justify-between w-full text-black dark:text-white py-4 -mx-2">
                    <div className="flex flex-row items-center space-x-1">
                      <Share message={message.content} chatId={message.chatId} messageId={message.messageId}/>
                      <Rewrite rewrite={rewrite} messageId={message.messageId} />
                    </div>
                    <div className="flex flex-row items-center space-x-1">
                      <Copy initialMessage={message.content} message={message} />
                      <button onClick={() => { if (speechStatus === 'started') stop(); else start(); }} className="p-2 text-black dark:text-white rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary">
                        {speechStatus === 'started' ? <StopCircle size={18} /> : <Volume2 size={18} />}
                      </button>
                    </div>
                </div>
                <ContextualActionsPlaceholder messageId={message.messageId} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBox;
function useSpeech({ text }: { text: string }): { speechStatus: 'idle' | 'started' | 'stopped'; start: () => void; stop: () => void } {
  const [speechStatus, setSpeechStatus] = useState<'idle' | 'started' | 'stopped'>('idle');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const start = useCallback(() => {
    if (!window.speechSynthesis) return;
    if (speechStatus === 'started') return;
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
    }
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeechStatus('stopped');
    utterance.onerror = () => setSpeechStatus('stopped');
    utteranceRef.current = utterance;
    setSpeechStatus('started');
    window.speechSynthesis.speak(utterance);
  }, [text, speechStatus]);

  const stop = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setSpeechStatus('stopped');
    utteranceRef.current = null;
  }, []);

  return { speechStatus, start, stop };
}

