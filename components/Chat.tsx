'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import MessageInput from './MessageInput';
import { Message, ImageGenParams, AudioGenParams, VideoGenParams, AIChatParams } from './ChatWindow';
import MessageBox from './MessageBox';
import MessageBoxLoading from './MessageBoxLoading';

import RelatedImages from './GetOneImage';
import SearchImages from './SearchImages';
import SearchVideos from './SearchVideos';
import SideTopAdComponent from './Ads/SideAdTop';
import SideBottomAdComponent from './Ads/SideAdBottom';

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
  onVideoPromptSubmit: (params: VideoGenParams, videoPromptText: string) => void;
  onAIChatSubmit: (prompt: string, params: AIChatParams) => void;
  loading: boolean;
  rewrite: (messageId: string) => void;
  editMessage: (messageId: string, newContent: string) => void;
  setMessages: (messages: Message[]) => void;
}) => {
  const messageEnd = useRef<HTMLDivElement | null>(null);
  
  const [isImageSearchVisible, setIsImageSearchVisible] = useState(true);
  const [isVideoSearchVisible, setIsVideoSearchVisible] = useState(true);

  useEffect(() => {
    messageEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    <div className="flex flex-col h-full w-full">
      <div className="flex-grow flex justify-center w-full min-h-0">
        
        <div className="grid w-full max-w-screen-xl grid-cols-[minmax(0,5fr)_300px] gap-x-20 px-4">
          
          
          <div className="overflow-y-auto min-w-0">
            <div className="pb-32">
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

          
          <div className="hidden lg:block  justify-center items-center w-full shadow-inner">
            {messages.length > 0 && (
                <div className="sticky top-6 flex flex-col space-y-4 h-[calc(100vh-4rem)] overflow-y-auto pr-2">
                    <div className='w-full h-auto'>
                        <RelatedImages chat_history={historyForSearch} query={currentQuery} />
                    </div>
                    {isImageSearchVisible && <SearchImages key="image-search" query={currentQuery} chat_history={historyForSearch} complete={handleImageSearchCompletion} visible={true} />}
                    {isVideoSearchVisible && <SearchVideos key="video-search" chat_history={historyForSearch} query={currentQuery} complete={handleVideoSearchCompletion} visible={true} />}
                    <SideTopAdComponent divid={`top-ad-sidebar`} />
                    <SideBottomAdComponent divid={`bottom-ad-sidebar`} />
                    
                    <div className="w-full h-[250px] cursor-pointer"><SideTopAdComponent divid={`top-ad-sidebar`} /></div>
                    <div className="w-full h-[600px] cursor-pointer"><SideBottomAdComponent divid={`bottom-ad-sidebar`} /></div>
                </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 dark:to-transparent">
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
    </div>
  );
};

export default Chat;