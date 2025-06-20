// components/EmptyChat.tsx
import SideBottomAdComponent from './Ads/SideAdBottom';
import SideTopAdComponent from './Ads/SideAdTop';
// Assuming types are correctly imported/exported by EmptyChatMessageInput or a shared types file
import EmptyChatMessageInput, { VideoGenParams, ImageGenParams, AudioGenParams } from './EmptyChatMessageInput';


interface EmptyChatProps {
  sendMessage: (message: string, file: File | null) => void;
  onImagePromptSubmit: (params: ImageGenParams, imagePromptText: string) => void;
  onAudioPromptSubmit: (params: AudioGenParams, audioPromptText: string) => void;
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

  const titleText = "Discover and Do More with ColomboAI MC1";

  return (
    // This root div should fill the allocated central column space.
    // items-center will center the content if the content is narrower than the column (e.g. max-w-5xl for input)
    <div className="flex flex-col h-full w-full items-center">

      {/* Title Area: Centered, takes up available vertical space pushing input to bottom */}
      <div className="flex-grow flex items-center justify-center p-4 text-center">
        <h2 className="text-[#000080] dark:text-blue-300 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium">
          {titleText}
        </h2>
      </div>

      {/* Input Area Container: At the bottom of this flex-col, horizontally centered with padding */}
      {/* This div handles the max-width and padding for the input area itself. */}
      <div className="w-full max-w-5xl mx-auto px-5 pb-4">
         <EmptyChatMessageInput
            sendMessage={sendMessage}
            focusMode={focusMode}
            setFocusMode={setFocusMode}
            onImagePromptSubmit={onImagePromptSubmit}
            onAudioPromptSubmit={onAudioPromptSubmit}
            onVideoPromptSubmit={onVideoPromptSubmit}
            // EmptyChatMessageInput no longer renders its own H2
         />
      </div>

      {/* Ad sidebar is removed. It should be a sibling to the component that renders EmptyChat if a
          three-column layout (LeftSidebar | EmptyChat-Content | AdSidebar) is desired at the page level.
          EmptyChat is now only responsible for its own content within the column it's given.
      */}
    </div>
  );
};

export default EmptyChat;
