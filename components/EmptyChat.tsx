import EmptyChatMessageInput from './EmptyChatMessageInput';

const EmptyChat = ({
  sendMessage,
  focusMode,
  setFocusMode,
}: {
  sendMessage: (message: string) => void;
  focusMode: string;
  setFocusMode: (mode: string) => void;
}) => {
  return (
    <>
    <div className="relative">
      <div className="flex flex-col items-center justify-center min-h-screen max-w-screen-sm mx-auto p-2 space-y-8">
        <h2 className="text-black/70 dark:text-white/70 text-3xl font-medium -mt-8">
          Research begins here.
        </h2>
        <EmptyChatMessageInput
          sendMessage={sendMessage}
          focusMode={focusMode}
          setFocusMode={setFocusMode}
        />
      </div>
    </div>
    <div className='border border-red-600 fixed top-[110px] right-5 w-[300px] flex flex-col items-center gap-2.5 h-[calc(100vh-110px)] hide-scrollbar overflow-y-auto overflow-x-hidden'>
          <div className="w-[300px]  h-[250px] cursor-pointer">
          {/* <SideTopAdComponent divid='top2'/> */}
          heree
        </div>
        <div className="w-[300px] h-[600px] cursor-pointer">
          {/* <SideBottomAdComponent divid='bottom2'/> */}
        </div>
          </div>
    </>
  );
};

export default EmptyChat;
