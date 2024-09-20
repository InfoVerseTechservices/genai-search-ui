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
    
    <div className="flex ">
   <div className="flex-grow mr-[20px]  xl:mr-[30px] ">
     <div className="relative">
       <div className="flex flex-col items-center justify-center min-h-screen w-full mx-auto p-2 space-y-8">
         <h2 className="text-[#000080] text-xl sm:text-xl md:text-xl  lg:text-2xl xl:text-3xl font-medium -mt-8">
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
   <div className=' w-[300px] mt-10 hidden lg:flex xl:flex flex-col items-center gap-2.5  h-[calc(100vh-110px)] hide-scrollbar overflow-y-auto overflow-x-hidden'>
       <div className="w-[300px] h-[250px]  cursor-pointer">
       {/* <SideTopAdComponent divid='top2'/> */}
       </div>
       <div className="w-[300px] h-[600px] cursor-pointer">
        {/* <SideBottomAdComponent divid='bottom2'/> */}
       </div>
   </div>
 </div>
  );
};

export default EmptyChat;
