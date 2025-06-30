import EmptyChatMessageInput, { VideoGenParams, ImageGenParams, AudioGenParams, AIChatParams } from './EmptyChatMessageInput'; // Added AIChatParams



interface EmptyChatProps {
  sendMessage: (message: string, file: File | null) => void;
  onImagePromptSubmit: (params: ImageGenParams, imagePromptText: string) => void;
  onAudioPromptSubmit: (params: AudioGenParams, audioPromptText: string) => void;
  onVideoPromptSubmit: (params: VideoGenParams, videoPromptText: string) => void;
  onAIChatSubmit: (prompt: string, params: AIChatParams) => void; 
  focusMode: string;
  setFocusMode: (mode: string) => void;
}

const EmptyChat = ({
  sendMessage,
  onImagePromptSubmit,
  onAudioPromptSubmit,
  onVideoPromptSubmit,
  onAIChatSubmit, 
  focusMode,
  setFocusMode,
}: EmptyChatProps) => {

  const titleText = "How can I help you today?"; 
  const contentPaddingBottom = ""; // Adjust as needed

  return (
    <div className="flex flex-col justify-center h-screen"> 

      <div className={` overflow-y-auto flex items-center justify-center p-4 text-center ${contentPaddingBottom} `}>
        <h2 className="dark:text-blue-300 text-xl sm:text-2xl md:text-3xl lg:text-3xl  font-medium">
          {titleText}
        </h2>
      </div>

      <div className="sticky bottom-0 w-full bg-white dark:bg-slate-900  border-gray-200 dark:border-gray-700 py-3 md:py-4 z-10">
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
