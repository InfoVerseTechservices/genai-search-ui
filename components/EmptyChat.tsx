// components/EmptyChat.tsx
import EmptyChatMessageInput, { VideoGenParams, ImageGenParams, AudioGenParams, AIChatParams } from './EmptyChatMessageInput'; // Added AIChatParams

// Types are primarily defined and exported by EmptyChatMessageInput or a central types file.
// No need to re-export from here if direct imports are used elsewhere.

interface EmptyChatProps {
  sendMessage: (message: string, file: File | null) => void;
  onImagePromptSubmit: (params: ImageGenParams, imagePromptText: string) => void;
  onAudioPromptSubmit: (params: AudioGenParams, audioPromptText: string) => void;
  onVideoPromptSubmit: (params: VideoGenParams, videoPromptText: string) => void;
  onAIChatSubmit: (prompt: string, params: AIChatParams) => void; // ADDED
  focusMode: string;
  setFocusMode: (mode: string) => void;
}

const EmptyChat = ({
  sendMessage,
  onImagePromptSubmit,
  onAudioPromptSubmit,
  onVideoPromptSubmit,
  onAIChatSubmit, // ADDED
  focusMode,
  setFocusMode,
}: EmptyChatProps) => {

  const titleText = "Discover and Do More with ColomboAI MC1";
  const contentPaddingBottom = "pb-72"; // Adjust as needed

  return (
    <div className="flex flex-col h-full w-full"> {/* Occupies the central column space */}

      {/* Scrollable Content Area (for Title) */}
      <div className={`flex-grow overflow-y-auto flex items-center justify-center p-4 text-center ${contentPaddingBottom}`}>
        <h2 className="text-[#000080] dark:text-blue-300 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium">
          {titleText}
        </h2>
      </div>

      {/* Sticky Input Area Wrapper */}
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
            onAIChatSubmit={onAIChatSubmit} // ADDED
          />
        </div>
      </div>
    </div>
  );
};

export default EmptyChat;
