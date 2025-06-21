// components/EmptyChat.tsx
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
  // Calculate padding needed at the bottom of the scrollable content area
  // to ensure content doesn't hide behind the sticky input.
  // This depends on the height of the input area.
  // For EmptyChatMessageInput, it has a textarea (minRows 6 initially) + icon bar + possible param panel.
  // Let's estimate a generous padding, e.g., pb-60 or pb-72 (240px-288px) on the scrollable part.
  // This might need adjustment based on actual rendered height of EmptyChatMessageInput.
  
  const contentPaddingBottom = "pb-72"; // Adjust as needed

  return (
    // This root div should be given a height (e.g., h-full or calculated height by parent)
    // to define the bounds for the sticky footer.
    <div className="flex flex-col h-full w-full"> {/* Occupies the central column space */}

      {/* Scrollable Content Area (for Title) */}
      <div className={`flex-grow overflow-y-auto flex items-center justify-center p-4 text-center ${contentPaddingBottom}`}>
        <h2 className="text-[#000080] dark:text-blue-300 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium">
          {titleText}
        </h2>
        {/* If there were other elements like suggested prompts, they would go here too */}
      </div>

      {/* Sticky Input Area Wrapper */}
      {/* This div sticks to the bottom of the parent (the root div of EmptyChat) */}
      <div className="sticky bottom-0 w-full bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700 py-3 md:py-4 z-10">
        {/* Centering and max-width container for the input itself, with horizontal padding */}
        <div className="w-full max-w-5xl mx-auto px-5">
          <EmptyChatMessageInput
            sendMessage={sendMessage}
            focusMode={focusMode}
            setFocusMode={setFocusMode}
            onImagePromptSubmit={onImagePromptSubmit}
            onAudioPromptSubmit={onAudioPromptSubmit}
            onVideoPromptSubmit={onVideoPromptSubmit}
            // Assuming EmptyChatMessageInput no longer renders its own H2 title
          />
        </div>
      </div>

      {/* Ad sidebar was removed in previous iteration; parent component should handle multi-column layout. */}
    </div>
  );
};

export default EmptyChat;
