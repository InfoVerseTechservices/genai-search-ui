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
    
    <div className="flex">
   <div className="flex-grow mr-[300px]">
     <div className="relative">
       <div className="flex flex-col items-center justify-center min-h-screen w-full mx-auto p-2 space-y-8">
         <h2 className="text-[#000080] text-3xl font-medium -mt-8">
           Discover and Do More with AI
         </h2>
         <EmptyChatMessageInput
           sendMessage={sendMessage}
           focusMode={focusMode}
           setFocusMode={setFocusMode}
         />
       </div>
     </div>
   </div>
   <div className='fixed top-[110px] right-5 min-w-[88px] border border-red-500 max-w-[300px] flex flex-col items-center gap-2.5  h-[calc(100vh-110px)] hide-scrollbar overflow-y-auto overflow-x-hidden'>
       <div className="min-h-[20px] min-w-[88px] cursor-pointer">
       <SideTopAdComponent divid='top2'/>
       </div>
       {/* <div className="w-[300px] h-[600px] cursor-pointer">
        <SideBottomAdComponent divid='bottom2'/>
       </div> */}
   </div>
 </div>
  );
};

export default EmptyChat;
