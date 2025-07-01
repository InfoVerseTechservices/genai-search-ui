'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Import your components
import MessageInput from './MessageInput';
import MessageBox from './MessageBox';
import MessageBoxLoading from './MessageBoxLoading';
import RelatedImages from './GetOneImage';
import SearchImages from './SearchImages';
import SearchVideos from './SearchVideos';
import SideTopAdComponent from './Ads/SideAdTop';
import SideBottomAdComponent from './Ads/SideAdBottom';
import { ArrowLeft } from './Icons'; // Assuming you have this icon
import LightThemeLogo from '../public/images/lightTheme_logo.png';
import DarkThemeLogo from '../public/images/darkTheme_logo.png';

// Import the types from ChatWindow
import type { Message, ImageGenParams, AudioGenParams, VideoGenParams, AIChatParams } from './ChatWindow';

// Define the props this UI component will need
interface ChatPageUIProps {
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

const ChatPageUI = ({
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
}: ChatPageUIProps) => {
  const router = useRouter();
  const messageEnd = useRef<HTMLDivElement | null>(null);

  // State for the right sidebar components
  const [isImageSearchVisible, setIsImageSearchVisible] = useState(true);
  const [isVideoSearchVisible, setIsVideoSearchVisible] = useState(true);

  useEffect(() => {
    messageEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Logic to get the last query for the sidebar searches
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  const currentQuery = lastUserMessage?.content || '';
  const historyForSearch = lastUserMessage
    ? messages.slice(0, messages.lastIndexOf(lastUserMessage))
    : messages;
    
  const handleImageSearchCompletion = (success: boolean) => {
    setIsImageSearchVisible(!success);
    setIsVideoSearchVisible(success);
  };
  const handleVideoSearchCompletion = (success: boolean) => {
    setIsVideoSearchVisible(!success);
    setIsImageSearchVisible(success);
  };

  return (
    <main className="bg-white dark:bg-slate-900 min-h-screen">
      {/* Header from your Layout.tsx */}
      <header className="sticky top-0 z-40 border-b border-[#E3E3E3] dark:border-gray-700 bg-white dark:bg-slate-900 h-[60px] md:h-[70px]">
        {/* ... (Your full header code with logos and back button) ... */}
        <div className="hidden md:flex items-center justify-center h-full">
            <Image src={LightThemeLogo} alt="Logo" className="w-[160px] h-auto block dark:hidden" priority />
            <Image src={DarkThemeLogo} alt="Logo" className="w-[160px] h-auto hidden dark:block" priority />
        </div>
        <div className="md:hidden flex items-center justify-between h-full px-4">
          <button onClick={() => router.push('/')} aria-label="Go back to home" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <ArrowLeft size={24} color="#374151" />
          </button>
          <div className="flex-1 flex justify-center">
            <Image src={LightThemeLogo} alt="Logo" className="w-[130px] h-auto block dark:hidden" priority />
            <Image src={DarkThemeLogo} alt="Logo" className="w-[130px] h-auto hidden dark:block" priority />
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Main Content Area - This is the body from your Chat.tsx */}
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 pt-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-x-12">
          {/* Left Column: Messages */}
          <div className="flex flex-col gap-4">
            {messages.map((message, idx) => (
              <Fragment key={message.messageId || idx}>
                <MessageBox
                  message={message}
                  messageIndex={idx}
                  history={messages.slice(0, idx)}
                  loading={loading}
                  isLast={idx === messages.length - 1}
                  rewrite={rewrite}
                  sendMessage={sendMessage}
                  editMessage={editMessage}
                  setMessages={setMessages}
                />
                {loading && idx === messages.length - 1 && <MessageBoxLoading />}
                <div ref={idx === messages.length - 1 ? messageEnd : undefined} />
              </Fragment>
            ))}
          </div>

          {/* Right Column: Related Content and Ads */}
          <div className="hidden lg:block">
              <div className="sticky top-[94px] flex flex-col space-y-4 h-[calc(100vh-120px)] overflow-y-auto pr-2">
                  <RelatedImages chat_history={historyForSearch} query={currentQuery} />
                  {isImageSearchVisible && <SearchImages key="image-search" query={currentQuery} chat_history={historyForSearch} complete={handleImageSearchCompletion} visible={true} />}
                  {isVideoSearchVisible && <SearchVideos key="video-search" chat_history={historyForSearch} query={currentQuery} complete={handleVideoSearchCompletion} visible={true} />}
                  <SideTopAdComponent divid={`top-ad-sidebar`} />
                  <SideBottomAdComponent divid={`bottom-ad-sidebar`} />
              </div>
          </div>
        </div>
      </div>

      {/* Fixed Message Input at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-white via-white to-transparent dark:from-slate-900 dark:via-slate-900 dark:to-transparent">
        <div className="w-full max-w-4xl mx-auto px-4 pb-4 pt-8">
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
    </main>
  );
};

export default ChatPageUI;