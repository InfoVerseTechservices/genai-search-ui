// 'use client';

// import MessageBoxLoading from './MessageBoxLoading';

// const UserMessageSkeleton = () => (
//     <div className='px-2 sm:px-4 py-5 flex justify-end'>
//         <div className="w-2/3 md:w-1/2 lg:w-1/3">
//             <div className="h-10 bg-blue-200 dark:bg-blue-900/50 rounded-lg animate-pulse" />
//         </div>
//     </div>
// );

// const RightSidebarSkeleton = () => (
//     <div className="hidden lg:block w-full">
//          <div className="sticky top-6 flex flex-col space-y-4 h-[calc(100vh-4rem)] overflow-y-auto pr-2">
//             <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
//             <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
//             <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
//         </div>
//     </div>
// );

// const MessageInputSkeleton = () => (
//      <div className="w-full h-14 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
// )


// const ChatSkeleton = () => {
//   return (
//     <div className="flex flex-col h-full w-full">
//       <div className="flex-grow flex justify-center w-full min-h-0">
//         <div className="grid w-full max-w-screen-xl grid-cols-[minmax(0,5fr)_300px] gap-x-20 px-4">
//           <div className="overflow-y-auto min-w-0">
//             <div className="pb-32">
//               <UserMessageSkeleton />
//               <div className="h-px w-full bg-gray-200 dark:bg-gray-700/50 my-4" />
//               <MessageBoxLoading />
//             </div>
//           </div>

//           <RightSidebarSkeleton />

//         </div>
//       </div>
      
// \      <div className="fixed bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 dark:to-transparent">
//         <div className="w-full max-w-4xl mx-auto px-4 pb-4 pt-8">
//           <MessageInputSkeleton />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatSkeleton;



'use client';

import MessageBoxLoading from './MessageBoxLoading';

const UserMessageSkeleton = () => (
    <div className='px-2 sm:px-4 py-5 flex justify-end'>
        <div className="w-2/3 md:w-1/2 lg:w-1/3">
            <div className="h-10 bg-blue-200 dark:bg-blue-900/50 rounded-lg animate-pulse" />
        </div>
    </div>
);

const RightSidebarSkeleton = () => (
    <div className="hidden xl:block w-[300px] flex-shrink-0">
         <div className="sticky top-6 flex flex-col space-y-4 h-[calc(100vh-4rem)] overflow-y-auto pr-2">
            <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
    </div>
);

const MessageInputSkeleton = () => (
     <div className="w-full h-14 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
);

const ChatSkeleton = () => {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-grow flex justify-center w-full min-h-0">
        <div className="flex w-full max-w-screen-xl gap-x-12 px-4">
          <div className="flex-1 overflow-y-auto min-w-0">
            <div className="pb-32">
              <UserMessageSkeleton />
              <div className="h-px w-full bg-gray-200 dark:bg-gray-700/50 my-4" />
              <MessageBoxLoading />
            </div>
          </div>
          <RightSidebarSkeleton />
        </div>
      </div>
      
      <div className="absolute bottom-0 w-full z-10 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 dark:to-transparent">
        <div className="w-full max-w-4xl mx-auto px-4 pb-4 pt-8">
          <MessageInputSkeleton />
        </div>
      </div>
    </div>
  );
};

export default ChatSkeleton;