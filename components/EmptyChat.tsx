import SideBottomAdComponent from './Ads/SideAdBottom';
import SideTopAdComponent from './Ads/SideAdTop';
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
    
    <div className="flex h-full w-full">
   <div className="flex-grow  xl:mr-[30px] pr-[2rem] sm:pr-[5rem]">
     <div className="relative">
       <div className="flex flex-col items-center justify-center min-h-screen w-full mx-auto p-2 space-y-4 sm:space-y-8">
         
         <EmptyChatMessageInput
           sendMessage={sendMessage}
           focusMode={focusMode}
           setFocusMode={setFocusMode}
         />
       </div>
     </div>
   </div>
   <div className='ml-[2rem] border-[1px] border-black w-[300px] mt-10 hidden lg:flex xl:flex flex-col items-center gap-2.5  h-[calc(100vh-110px)] hide-scrollbar overflow-y-auto overflow-x-hidden'>
       <div className="w-[300px] h-[250px]  cursor-pointer">
       <SideTopAdComponent divid='top-emptychat'/>
       </div>
       <div className="w-[300px] h-[600px] cursor-pointer">
        <SideBottomAdComponent divid='bottom-emptychat'/>
       </div>
   </div>
 </div>
  );
};

export default EmptyChat;
