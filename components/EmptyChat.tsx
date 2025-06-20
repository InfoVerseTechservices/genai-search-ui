// components/EmptyChat.tsx
import SideBottomAdComponent from './Ads/SideAdBottom';
import SideTopAdComponent from './Ads/SideAdTop';
import EmptyChatMessageInput, { VideoGenParams, ImageGenParams as EmptyImageGenParams, AudioGenParams as EmptyAudioGenParams } from './EmptyChatMessageInput';

// Re-export or ensure types are consistently defined
export type { EmptyImageGenParams as ImageGenParams };
export type { EmptyAudioGenParams as AudioGenParams };
// VideoGenParams is already being re-exported by EmptyChatMessageInput

interface EmptyChatProps {
  sendMessage: (message: string, file: File | null) => void;
  onImagePromptSubmit: (params: EmptyImageGenParams, imagePromptText: string) => void;
  onAudioPromptSubmit: (params: EmptyAudioGenParams, audioPromptText: string) => void;
  onVideoPromptSubmit: (params: VideoGenParams, videoPromptText: string) => void;
  focusMode: string;
  setFocusMode: (mode: string) => void;
}

const EmptyChat = ({
  sendMessage,
  onImagePromptSubmit,
  onAudioPromptSubmit,
  onVideoPromptSubmit,
  focusMode,
  setFocusMode,
}: EmptyChatProps) => {
  return (
    <div className="flex h-screen w-full overflow-hidden">

      {/* Main content area (can be empty or have other content for the "empty" state) */}
      <div className="flex-grow flex flex-col p-4 items-center justify-center">
        {/* This area is intentionally kept minimal as EmptyChatMessageInput contains the main H2 title */}
        {/* You could add a logo here if desired, above the fixed input area. */}
      </div>

      {/* Ads sidebar */}
      <div className='w-[400px] mt-10 hidden lg:flex xl:flex flex-col items-center gap-[2rem] h-[calc(100vh-110px)] hide-scrollbar overflow-y-auto overflow-x-hidden flex-shrink-0'>
        <div className="w-[400px] h-[250px] cursor-pointer">
          <SideTopAdComponent divid='top-emptychat' />
        </div>
        <div className="w-[400px] h-[600px] cursor-pointer">
          <SideBottomAdComponent divid='bottom-emptychat' />
        </div>
      </div>

      {/* Fixed Input Area Wrapper */}
      <div
        className="fixed bottom-0 left-0 right-0 flex justify-center z-40 px-1 pb-1 md:px-4 md:pb-2 lg:pb-3 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="w-full md:max-w-2xl lg:max-w-3xl xl:max-w-4xl"> {/* Max width container */}
          <EmptyChatMessageInput
            sendMessage={sendMessage}
            focusMode={focusMode}
            setFocusMode={setFocusMode}
            onImagePromptSubmit={onImagePromptSubmit}
            onAudioPromptSubmit={onAudioPromptSubmit}
            onVideoPromptSubmit={onVideoPromptSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default EmptyChat;
