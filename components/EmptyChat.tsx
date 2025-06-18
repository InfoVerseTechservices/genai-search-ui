import SideBottomAdComponent from './Ads/SideAdBottom';
import SideTopAdComponent from './Ads/SideAdTop';
import EmptyChatMessageInput from './EmptyChatMessageInput';

// Define ImageGenParams if not globally available or imported
interface ImageGenParams {
  prompt: string;
  negative_prompt?: string;
  model?: string;
  size?: string;
  guidance_scale?: number;
}

// Define AudioGenParams if not globally available or imported
interface AudioGenParams {
  prompt: string;
  negative_prompt?: string;
  duration_seconds?: number;
  seed?: number;
  model?: string;
}

const EmptyChat = ({
  sendMessage,
  onImagePromptSubmit,
  onAudioPromptSubmit, // Add this
  focusMode,
  setFocusMode,
}: {
  sendMessage: (message: string, file: File | null) => void;
  onImagePromptSubmit: (params: ImageGenParams, imagePromptText: string) => void;
  onAudioPromptSubmit: (params: AudioGenParams, audioPromptText: string) => void; // Add this
  focusMode: string;
  setFocusMode: (mode: string) => void;
}) => {
  return (

    <div className="flex h-full w-full">
      <div className="flex-grow  xl:mr-[0px] pr-[2rem] sm:pr-[5rem]">
        <div className="relative">
          <div className="flex flex-col items-center justify-center min-h-screen w-full mx-auto p-2 space-y-4 sm:space-y-8">

            <EmptyChatMessageInput
              sendMessage={sendMessage}
              focusMode={focusMode}
              setFocusMode={setFocusMode}
              onImagePromptSubmit={onImagePromptSubmit}
              onAudioPromptSubmit={onAudioPromptSubmit} // Pass it down
            />
          </div>
        </div>
      </div>
      <div className='w-[400px] mt-10 hidden lg:flex xl:flex flex-col items-center gap-[2rem] h-[calc(100vh-110px)] hide-scrollbar overflow-y-auto overflow-x-hidden'>
        <div className="w-[400px] h-[250px]  cursor-pointer">
          <SideTopAdComponent divid='top-emptychat' />
        </div>
        <div className="w-[400px] h-[600px] cursor-pointer">
          <SideBottomAdComponent divid='bottom-emptychat' />
        </div>
      </div>
    </div>
  );
};

export default EmptyChat;
