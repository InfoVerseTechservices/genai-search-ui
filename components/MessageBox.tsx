// 'use client';

// /* eslint-disable @next/next/no-img-element */
// import React, { MutableRefObject, useEffect, useState } from 'react';
// import { Message } from './ChatWindow';
// import { cn } from '@/lib/utils';
// import {
//   BookCopy,
//   Disc3,
//   Volume2,
//   StopCircle,
//   Layers3,
//   Plus,
// } from 'lucide-react';
// import Markdown from 'markdown-to-jsx';
// import Copy from './MessageActions/Copy';
// import Rewrite from './MessageActions/Rewrite';
// import MessageSources from './MessageSources';
// import SearchImages from './SearchImages';
// import SearchVideos from './SearchVideos';
// import { useSpeech } from 'react-text-to-speech';
// import SideTopAdComponent from './Ads/SideAdTop';
// import SideBottomAdComponent from './Ads/SideAdBottom';
// import Share from './MessageActions/Share';

// const MessageBox = ({
//   message,
//   messageIndex,
//   history,
//   loading,
//   dividerRef,
//   isLast,
//   rewrite,
//   sendMessage,
//   editMessage,
// }: {
//   message: Message;
//   messageIndex: number;
//   history: Message[];
//   loading: boolean;
//   dividerRef?: MutableRefObject<HTMLDivElement | null>;
//   isLast: boolean;
//   rewrite: (messageId: string) => void;
//   sendMessage: (message: string) => void;
//   editMessage: (messageId: string, newContent: string) => void;
// }) => {
//   const [parsedMessage, setParsedMessage] = useState(message.content);
//   const [speechMessage, setSpeechMessage] = useState(message.content);

//   useEffect(() => {
//     const regex = /\[(\d+)\]/g;

//     if (
//       message.role === 'assistant' &&
//       message?.sources &&
//       message.sources.length > 0
//     ) {
//       return setParsedMessage(
//         message.content.replace(
//           regex,
//           (_, number) =>
//             `<a href="${message.sources?.[number - 1]?.metadata?.url}" target="_blank" className="bg-light-secondary dark:bg-dark-secondary px-1 rounded ml-1 no-underline text-xs text-black relative">${number}</a>`,
//         ),
//       );
//     }

//     setSpeechMessage(message.content.replace(regex, ''));
//     setParsedMessage(message.content);
//   }, [message.content, message.sources, message.role]);

//   const { speechStatus, start, stop } = useSpeech({ text: speechMessage });

//   return (
//     <div>
//       {message.role === 'user' && (
//         <div className={cn('', messageIndex === 0 ? 'pt-16' : 'pt-8')}>
//           <h2 className="text-[#000080] bg-[#D2E3FD] self-start font-medium text-3xl max-w-max inline rounded-md whitespace-normal">
//             {message.content}
//           </h2>
//         </div>
//       )}

//       {message.role === 'assistant' && (
//         <div className="flex flex-col space-y-9 lg:space-y-0 lg:flex-row lg:justify-between lg:space-x-9">
//           <div
//             ref={dividerRef}
//             className="flex flex-col space-y-6 w-full lg:w-9/12"
//           >
//             {message.sources && message.sources.length > 0 && (
//               <div className="flex flex-col space-y-2">
//                 <div className="flex flex-row items-center space-x-2">
//                   <BookCopy className="text-black" size={20} />
//                   <h3 className="text-black  font-medium text-xl">Sources</h3>
//                 </div>
//                 <MessageSources sources={message.sources} />
//               </div>
//             )}
//             <div className="flex flex-col space-y-2">
//               <div className="flex flex-row items-center space-x-2">
//                 <Disc3
//                   className={cn(
//                     'text-black',
//                     isLast && loading ? 'animate-spin' : 'animate-none',
//                   )}
//                   size={20}
//                 />
//                 <h3 className="text-black font-medium text-xl">Answer</h3>
//               </div>
//               <Markdown
//                 className={cn(
//                   'prose prose-p:leading-relaxed prose-pre:p-0',
//                   'max-w-none break-words text-black text-sm md:text-base font-medium',
//                 )}
//               >
//                 {parsedMessage}
//               </Markdown>
//               {loading && isLast ? null : (
//                 <div className="flex flex-row items-center justify-between w-full text-black py-4 -mx-2">
//                   <div className="flex flex-row items-center space-x-1">
//                     {/*  <button className="p-2 text-black/70 dark:text-white/70 rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200 hover:text-black text-black dark:hover:text-white">
//                       <Share size={18} />
//                     </button> */}
//                     <Rewrite rewrite={rewrite} messageId={message.messageId} />
//                   </div>
//                   <div className="flex flex-row items-center space-x-1">
//                     <Copy initialMessage={message.content} message={message} />
//                     <Share message={message.content} />{' '}
//                     <button
//                       onClick={() => {
//                         if (speechStatus === 'started') {
//                           stop();
//                         } else {
//                           start();
//                         }
//                       }}
//                       className="p-2 text-black rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200 hover:text-black dark:hover:text-white"
//                     >
//                       {speechStatus === 'started' ? (
//                         <StopCircle size={18} />
//                       ) : (
//                         <Volume2 size={18} />
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               )}
//               {/* {isLast &&
//                 message.suggestions &&
//                 message.suggestions.length > 0 &&
//                 message.role === 'assistant' &&
//                 !loading && (
//                   <>
//                     <div className="h-px w-full bg-light-secondary dark:bg-dark-secondary" />
//                     <div className="flex flex-col space-y-3 text-black">
//                       <div className="flex flex-row items-center space-x-2 mt-4">
//                         <Layers3 />
//                         <h3 className="text-xl font-medium">Related</h3>
//                       </div>
//                       <div className="flex flex-col space-y-3">
//                         {message.suggestions.map((suggestion, i) => (
//                           <div
//                             className="flex flex-col space-y-3 text-sm"
//                             key={i}
//                           >
//                             <div className="h-px w-full bg-light-secondary dark:bg-dark-secondary" />
//                             <div
//                               onClick={() => {
//                                 sendMessage(suggestion);
//                               }}
//                               className="cursor-pointer flex flex-row justify-between font-medium space-x-2 items-center"
//                             >
//                               <p className="transition duration-200 text-[#24A0ED]">
//                                 {suggestion}
//                               </p>
//                               <Plus
//                                 size={20}
//                                 className="text-[#24A0ED] flex-shrink-0"
//                               />
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </>
//                 )} */}
//             </div>
//           </div>
//           <div className="lg:sticky lg:top-20 flex flex-col items-center space-y-3 w-full lg:w-3/12 z-30 h-full pb-4">
//             <SearchImages
//               query={history[messageIndex - 1].content}
//               chat_history={history.slice(0, messageIndex - 1)}
//             />
//             <SearchVideos
//               chat_history={history.slice(0, messageIndex - 1)}
//               query={history[messageIndex - 1].content}
//             />
//             <div className="w-[300px] border border-red-600 h-[1140px]">
//               <div className="w-[300px]  h-[250px] cursor-pointer">
//                 <SideTopAdComponent divid="top1" />
//               </div>
//               <div className="w-[300px] h-[600px] cursor-pointer">
//                 <SideBottomAdComponent divid="bottom1" />
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MessageBox;

// 'use client';

// /* eslint-disable @next/next/no-img-element */
// import React, { MutableRefObject, useEffect, useState } from 'react';
// import { Message } from './ChatWindow';
// import { cn } from '@/lib/utils';
// import {
//   BookCopy,
//   Disc3,
//   Volume2,
//   StopCircle,
//   Layers3,
//   Plus,
// } from 'lucide-react';
// import Markdown from 'markdown-to-jsx';
// import Copy from './MessageActions/Copy';
// import Rewrite from './MessageActions/Rewrite';
// import MessageSources from './MessageSources';
// import SearchImages from './SearchImages';
// import SearchVideos from './SearchVideos';
// import { useSpeech } from 'react-text-to-speech';
// import SideTopAdComponent from './Ads/SideAdTop';
// import SideBottomAdComponent from './Ads/SideAdBottom';
// import Share from './MessageActions/Share';

// const MessageBox = ({
//   message,
//   messageIndex,
//   history,
//   loading,
//   dividerRef,
//   isLast,
//   rewrite,
//   sendMessage,
//   editMessage,
// }: {
//   message: Message;
//   messageIndex: number;
//   history: Message[];
//   loading: boolean;
//   dividerRef?: MutableRefObject<HTMLDivElement | null>;
//   isLast: boolean;
//   rewrite: (messageId: string) => void;
//   sendMessage: (message: string) => void;
//   editMessage: (messageId: string, newContent: string) => void;
// }) => {
//   const [parsedMessage, setParsedMessage] = useState(message.content);
//   const [speechMessage, setSpeechMessage] = useState(message.content);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedContent, setEditedContent] = useState(message.content);

//   useEffect(() => {
//     const regex = /\\[(\\d+)\\]/g;

//     if (
//       message.role === 'assistant' &&
//       message?.sources &&
//       message.sources.length > 0
//     ) {
//       return setParsedMessage(
//         message.content.replace(
//           regex,
//           (_, number) =>
//             `<a href="${message.sources?.[number - 1]?.metadata?.url}" target="_blank" className="bg-light-secondary dark:bg-dark-secondary px-1 rounded ml-1 no-underline text-xs text-black relative">${number}</a>`,
//         ),
//       );
//     }

//     setSpeechMessage(message.content.replace(regex, ''));
//     setParsedMessage(message.content);
//   }, [message.content, message.sources, message.role]);

//   const { speechStatus, start, stop } = useSpeech({ text: speechMessage });

//   const handleEdit = () => {
//     setIsEditing(true);
//   };

//   const handleSave = () => {
//     editMessage(message.messageId, editedContent);
//     setIsEditing(false);
//   };

//   return (
//     <div>
//       {message.role === 'user' && (
//         <div className={cn('', messageIndex === 0 ? 'pt-16' : 'pt-8')}>
//           <h2 className="text-[#000080] bg-[#D2E3FD] self-start font-medium text-3xl max-w-max inline rounded-md whitespace-normal">
//             {isEditing ? (
//               <textarea
//                 value={editedContent}
//                 onChange={(e) => setEditedContent(e.target.value)}
//                 className="edit-input"
//               />
//             ) : (
//               message.content
//             )}
//           </h2>
//           {isEditing && (
//             <button onClick={handleSave} className="save-button">
//               Save
//             </button>
//           )}
//         </div>
//       )}

//       {message.role === 'assistant' && (
//         <div className="flex flex-col space-y-9 lg:space-y-0 lg:flex-row lg:justify-between lg:space-x-9">
//           <div
//             ref={dividerRef}
//             className="flex flex-col space-y-6 w-full lg:w-9/12"
//           >
//             {message.sources && message.sources.length > 0 && (
//               <div className="flex flex-col space-y-2">
//                 <div className="flex flex-row items-center space-x-2">
//                   <BookCopy className="text-black" size={20} />
//                   <h3 className="text-black font-medium text-xl">Sources</h3>
//                 </div>
//                 <MessageSources sources={message.sources} />
//               </div>
//             )}
//             <div className="flex flex-col space-y-2">
//               <div className="flex flex-row items-center space-x-2">
//                 <Disc3
//                   className={cn(
//                     'text-black',
//                     isLast && loading ? 'animate-spin' : 'animate-none',
//                   )}
//                   size={20}
//                 />
//                 <h3 className="text-black font-medium text-xl">Answer</h3>
//               </div>
//               <Markdown
//                 className={cn(
//                   'prose prose-p:leading-relaxed prose-pre:p-0',
//                   'max-w-none break-words text-black text-sm md:text-base font-medium',
//                 )}
//               >
//                 {parsedMessage}
//               </Markdown>
//               {loading && isLast ? null : (
//                 <div className="flex flex-row items-center justify-between w-full text-black py-4 -mx-2">
//                   <div className="flex flex-row items-center space-x-1">
//                     <Rewrite rewrite={rewrite} messageId={message.messageId} />
//                     <button onClick={handleEdit} className="edit-button">
//                       Edit
//                     </button>
//                   </div>
//                   <div className="flex flex-row items-center space-x-1">
//                     <Copy initialMessage={message.content} message={message} />
//                     <Share message={message.content} />{' '}
//                     <button
//                       onClick={() => {
//                         if (speechStatus === 'started') {
//                           stop();
//                         } else {
//                           start();
//                         }
//                       }}
//                       className="p-2 text-black rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200 hover:text-black dark:hover:text-white"
//                     >
//                       {speechStatus === 'started' ? (
//                         <StopCircle size={18} />
//                       ) : (
//                         <Volume2 size={18} />
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="lg:sticky lg:top-20 flex flex-col items-center space-y-3 w-full lg:w-3/12 z-30 h-full pb-4">
//             <SearchImages
//               query={history[messageIndex - 1].content}
//               chat_history={history.slice(0, messageIndex - 1)}
//             />
//             <SearchVideos
//               chat_history={history.slice(0, messageIndex - 1)}
//               query={history[messageIndex - 1].content}
//             />
//             <div className="w-[300px] border border-red-600 h-[1140px]">
//               <div className="w-[300px] h-[250px] cursor-pointer">
//                 <SideTopAdComponent divid="top1" />
//               </div>
//               <div className="w-[300px] h-[600px] cursor-pointer">
//                 <SideBottomAdComponent divid="bottom1" />
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MessageBox;

// 'use client';

// /* eslint-disable @next/next/no-img-element */
// import React, { MutableRefObject, useEffect, useState } from 'react';
// import { Message } from './ChatWindow';
// import { cn } from '@/lib/utils';
// import {
//   BookCopy,
//   Disc3,
//   Volume2,
//   StopCircle,
//   Layers3,
//   Plus,
// } from 'lucide-react';
// import Markdown from 'markdown-to-jsx';
// import Copy from './MessageActions/Copy';
// import Rewrite from './MessageActions/Rewrite';
// import MessageSources from './MessageSources';
// import SearchImages from './SearchImages';
// import SearchVideos from './SearchVideos';
// import { useSpeech } from 'react-text-to-speech';
// import SideTopAdComponent from './Ads/SideAdTop';
// import SideBottomAdComponent from './Ads/SideAdBottom';
// import Share from './MessageActions/Share';

// const MessageBox = ({
//   message,
//   messageIndex,
//   history,
//   loading,
//   dividerRef,
//   isLast,
//   rewrite,
//   sendMessage,
//   editMessage,
// }: {
//   message: Message;
//   messageIndex: number;
//   history: Message[];
//   loading: boolean;
//   dividerRef?: MutableRefObject<HTMLDivElement | null>;
//   isLast: boolean;
//   rewrite: (messageId: string) => void;
//   sendMessage: (message: string) => void;
//   editMessage: (messageId: string, newContent: string) => void;
// }) => {
//   const [parsedMessage, setParsedMessage] = useState(message.content);
//   const [speechMessage, setSpeechMessage] = useState(message.content);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedContent, setEditedContent] = useState(message.content);

//   useEffect(() => {
//     const regex = /\\[(\\d+)\\]/g;

//     if (
//       message.role === 'assistant' &&
//       message?.sources &&
//       message.sources.length > 0
//     ) {
//       setParsedMessage(
//         message.content.replace(
//           regex,
//           (_, number) =>
//             `<a href="${message.sources?.[number - 1]?.metadata?.url}" target="_blank" className="bg-light-secondary dark:bg-dark-secondary px-1 rounded ml-1 no-underline text-xs text-black relative">${number}</a>`,
//         ),
//       );
//     } else {
//       setParsedMessage(message.content);
//     }

//     setSpeechMessage(message.content.replace(regex, ''));
//   }, [message.content, message.sources, message.role]);

//   const { speechStatus, start, stop } = useSpeech({ text: speechMessage });

//   const handleEdit = () => {
//     setIsEditing(true);
//   };

//   const handleSave = () => {
//     if (editedContent !== message.content) {
//       editMessage(message.messageId, editedContent);
//     }
//     setIsEditing(false);
//   };

//   return (
//     <div>
//       {message.role === 'user' && (
//         <div className={cn('', messageIndex === 0 ? 'pt-16' : 'pt-8')}>
//           {isEditing ? (
//             <textarea
//               value={editedContent}
//               onChange={(e) => setEditedContent(e.target.value)}
//               className="edit-input"
//             />
//           ) : (
//             <h2 className="text-[#000080] bg-[#D2E3FD] self-start font-medium text-3xl max-w-max inline rounded-md whitespace-normal">
//               {message.content}
//             </h2>
//           )}
//           {isEditing && (
//             <button onClick={handleSave} className="save-button">
//               Save
//             </button>
//           )}
//         </div>
//       )}

//       {message.role === 'assistant' && (
//         <div className="flex flex-col space-y-9 lg:space-y-0 lg:flex-row lg:justify-between lg:space-x-9">
//           <div
//             ref={dividerRef}
//             className="flex flex-col space-y-6 w-full lg:w-9/12"
//           >
//             {message.sources && message.sources.length > 0 && (
//               <div className="flex flex-col space-y-2">
//                 <div className="flex flex-row items-center space-x-2">
//                   <BookCopy className="text-black" size={20} />
//                   <h3 className="text-black font-medium text-xl">Sources</h3>
//                 </div>
//                 <MessageSources sources={message.sources} />
//               </div>
//             )}
//             <div className="flex flex-col space-y-2">
//               <div className="flex flex-row items-center space-x-2">
//                 <Disc3
//                   className={cn(
//                     'text-black',
//                     isLast && loading ? 'animate-spin' : 'animate-none',
//                   )}
//                   size={20}
//                 />
//                 <h3 className="text-black font-medium text-xl">Answer</h3>
//               </div>
//               {/* <Markdown
//                 className={cn(
//                   'prose prose-p:leading-relaxed prose-pre:p-0',
//                   'max-w-none break-words text-black text-sm md:text-base font-medium',
//                 )}
//               >
//                 {isEditing ? (
//                   <textarea
//                     value={editedContent}
//                     onChange={(e) => setEditedContent(e.target.value)}
//                     className="edit-input"
//                   />
//                 ) : (
//                   parsedMessage
//                 )}
//               </Markdown> */}
//               <Markdown
//                 className={cn(
//                   'prose prose-p:leading-relaxed prose-pre:p-0',
//                   'max-w-none break-words text-black text-sm md:text-base font-medium',
//                 )}
//               >
//                 {isEditing ? '' : parsedMessage}
//               </Markdown>
//               {isEditing && (
//                 <textarea
//                   value={editedContent}
//                   onChange={(e) => setEditedContent(e.target.value)}
//                   className="edit-input"
//                 />
//               )}
//               {isEditing && (
//                 <button onClick={handleSave} className="save-button">
//                   Save
//                 </button>
//               )}
//               {loading && isLast ? null : (
//                 <div className="flex flex-row items-center justify-between w-full text-black py-4 -mx-2">
//                   <div className="flex flex-row items-center space-x-1">
//                     <Rewrite rewrite={rewrite} messageId={message.messageId} />
//                     <button onClick={handleEdit} className="edit-button">
//                       Edit
//                     </button>
//                   </div>
//                   <div className="flex flex-row items-center space-x-1">
//                     <Copy initialMessage={message.content} message={message} />
//                     <Share message={message.content} />{' '}
//                     <button
//                       onClick={() => {
//                         if (speechStatus === 'started') {
//                           stop();
//                         } else {
//                           start();
//                         }
//                       }}
//                       className="p-2 text-black rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200 hover:text-black dark:hover:text-white"
//                     >
//                       {speechStatus === 'started' ? (
//                         <StopCircle size={18} />
//                       ) : (
//                         <Volume2 size={18} />
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="lg:sticky lg:top-20 flex flex-col items-center space-y-3 w-full lg:w-3/12 z-30 h-full pb-4">
//             <SearchImages
//               query={history[messageIndex - 1].content}
//               chat_history={history.slice(0, messageIndex - 1)}
//             />
//             <SearchVideos
//               chat_history={history.slice(0, messageIndex - 1)}
//               query={history[messageIndex - 1].content}
//             />
//             <div className="w-[300px] border border-red-600 h-[1140px]">
//               <div className="w-[300px] h-[250px] cursor-pointer">
//                 <SideTopAdComponent divid="top1" />
//               </div>
//               <div className="w-[300px] h-[600px] cursor-pointer">
//                 <SideBottomAdComponent divid="bottom1" />
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MessageBox;

// 'use client';

// /* eslint-disable @next/next/no-img-element */
// import React, { MutableRefObject, useEffect, useState } from 'react';
// import { Message } from './ChatWindow';
// import { cn } from '@/lib/utils';
// import {
//   BookCopy,
//   Disc3,
//   Volume2,
//   StopCircle,
//   Layers3,
//   Plus,
// } from 'lucide-react';
// import Markdown from 'markdown-to-jsx';
// import Copy from './MessageActions/Copy';
// import Rewrite from './MessageActions/Rewrite';
// import MessageSources from './MessageSources';
// import SearchImages from './SearchImages';
// import SearchVideos from './SearchVideos';
// import { useSpeech } from 'react-text-to-speech';
// import SideTopAdComponent from './Ads/SideAdTop';
// import SideBottomAdComponent from './Ads/SideAdBottom';
// import Share from './MessageActions/Share';

// const MessageBox = ({
//   message,
//   messageIndex,
//   history,
//   loading,
//   dividerRef,
//   isLast,
//   rewrite,
//   sendMessage,
//   editMessage,
// }: {
//   message: Message;
//   messageIndex: number;
//   history: Message[];
//   loading: boolean;
//   dividerRef?: MutableRefObject<HTMLDivElement | null>;
//   isLast: boolean;
//   rewrite: (messageId: string) => void;
//   sendMessage: (message: string) => void;
//   editMessage: (messageId: string, newContent: string) => void;
// }) => {
//   const [parsedMessage, setParsedMessage] = useState(message.content);
//   const [speechMessage, setSpeechMessage] = useState(message.content);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedContent, setEditedContent] = useState(message.content);

//   useEffect(() => {
//     const regex = /\\[(\\d+)\\]/g;

//     if (
//       message.role === 'assistant' &&
//       message?.sources &&
//       message.sources.length > 0
//     ) {
//       setParsedMessage(
//         message.content.replace(
//           regex,
//           (_, number) =>
//             `<a href="${message.sources?.[number - 1]?.metadata?.url}" target="_blank" className="bg-light-secondary dark:bg-dark-secondary px-1 rounded ml-1 no-underline text-xs text-black relative">${number}</a>`,
//         ),
//       );
//     } else {
//       setParsedMessage(message.content);
//     }

//     setSpeechMessage(message.content.replace(regex, ''));
//   }, [message.content, message.sources, message.role]);

//   const { speechStatus, start, stop } = useSpeech({ text: speechMessage });

//   const handleEdit = () => {
//     setIsEditing(true);
//     setEditedContent(message.content); // Set initial content to the current query
//   };

//   const handleSave = () => {
//     if (editedContent !== message.content) {
//       editMessage(message.messageId, editedContent); // Update the message content in state
//       sendMessage(editedContent); // Send the edited query for processing
//     }
//     setIsEditing(false);
//   };

//   return (
//     <div>
//       {message.role === 'user' && (
//         <div className={cn('', messageIndex === 0 ? 'pt-16' : 'pt-8')}>
//           {isEditing ? (
//             <textarea
//               value={editedContent}
//               onChange={(e) => setEditedContent(e.target.value)}
//               className="edit-input"
//             />
//           ) : (
//             <h2 className="text-[#000080] bg-[#D2E3FD] self-start font-medium text-3xl max-w-max inline rounded-md whitespace-normal">
//               {message.content}
//             </h2>
//           )}
//           <div className="flex space-x-2 mt-2">
//             {isEditing ? (
//               <button onClick={handleSave} className="save-button">
//                 Save
//               </button>
//             ) : (
//               <button onClick={handleEdit} className="edit-button">
//                 Edit
//               </button>
//             )}
//           </div>
//         </div>
//       )}

//       {message.role === 'assistant' && (
//         <div className="flex flex-col space-y-9 lg:space-y-0 lg:flex-row lg:justify-between lg:space-x-9">
//           <div
//             ref={dividerRef}
//             className="flex flex-col space-y-6 w-full lg:w-9/12"
//           >
//             {message.sources && message.sources.length > 0 && (
//               <div className="flex flex-col space-y-2">
//                 <div className="flex flex-row items-center space-x-2">
//                   <BookCopy className="text-black" size={20} />
//                   <h3 className="text-black font-medium text-xl">Sources</h3>
//                 </div>
//                 <MessageSources sources={message.sources} />
//               </div>
//             )}
//             <div className="flex flex-col space-y-2">
//               <div className="flex flex-row items-center space-x-2">
//                 <Disc3
//                   className={cn(
//                     'text-black',
//                     isLast && loading ? 'animate-spin' : 'animate-none',
//                   )}
//                   size={20}
//                 />
//                 <h3 className="text-black font-medium text-xl">Answer</h3>
//               </div>
//               <Markdown
//                 className={cn(
//                   'prose prose-p:leading-relaxed prose-pre:p-0',
//                   'max-w-none break-words text-black text-sm md:text-base font-medium',
//                 )}
//               >
//                 {parsedMessage}
//               </Markdown>
//               {loading && isLast ? null : (
//                 <div className="flex flex-row items-center justify-between w-full text-black py-4 -mx-2">
//                   <div className="flex flex-row items-center space-x-1">
//                     <Rewrite rewrite={rewrite} messageId={message.messageId} />
//                   </div>
//                   <div className="flex flex-row items-center space-x-1">
//                     <Copy initialMessage={message.content} message={message} />
//                     <Share message={message.content} />{' '}
//                     <button
//                       onClick={() => {
//                         if (speechStatus === 'started') {
//                           stop();
//                         } else {
//                           start();
//                         }
//                       }}
//                       className="p-2 text-black rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200 hover:text-black dark:hover:text-white"
//                     >
//                       {speechStatus === 'started' ? (
//                         <StopCircle size={18} />
//                       ) : (
//                         <Volume2 size={18} />
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="lg:sticky lg:top-20 flex flex-col items-center space-y-3 w-full lg:w-3/12 z-30 h-full pb-4">
//             <SearchImages
//               query={history[messageIndex - 1].content}
//               chat_history={history.slice(0, messageIndex - 1)}
//             />
//             <SearchVideos
//               chat_history={history.slice(0, messageIndex - 1)}
//               query={history[messageIndex - 1].content}
//             />
//             <div className="w-[300px] border border-red-600 h-[1140px]">
//               <div className="w-[300px] h-[250px] cursor-pointer">
//                 <SideTopAdComponent divid="top1" />
//               </div>
//               <div className="w-[300px] h-[600px] cursor-pointer">
//                 <SideBottomAdComponent divid="bottom1" />
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MessageBox;
// 'use client';

// /* eslint-disable @next/next/no-img-element */
// import React, { MutableRefObject, useEffect, useState } from 'react';
// import { Message } from './ChatWindow';
// import { cn } from '@/lib/utils';
// import {
//   BookCopy,
//   Disc3,
//   Volume2,
//   StopCircle,
//   Layers3,
//   Plus,
// } from 'lucide-react';
// import Markdown from 'markdown-to-jsx';
// import Copy from './MessageActions/Copy';
// import Rewrite from './MessageActions/Rewrite';
// import MessageSources from './MessageSources';
// import SearchImages from './SearchImages';
// import SearchVideos from './SearchVideos';
// import { useSpeech } from 'react-text-to-speech';
// import SideTopAdComponent from './Ads/SideAdTop';
// import SideBottomAdComponent from './Ads/SideAdBottom';
// import Share from './MessageActions/Share';

// const MessageBox = ({
//   message,
//   messageIndex,
//   history,
//   loading,
//   dividerRef,
//   isLast,
//   rewrite,
//   sendMessage,
//   editMessage,
// }: {
//   message: Message;
//   messageIndex: number;
//   history: Message[];
//   loading: boolean;
//   dividerRef?: MutableRefObject<HTMLDivElement | null>;
//   isLast: boolean;
//   rewrite: (messageId: string) => void;
//   sendMessage: (message: string) => void;
//   editMessage: (messageId: string, newContent: string) => void;
// }) => {
//   const [parsedMessage, setParsedMessage] = useState(message.content);
//   const [speechMessage, setSpeechMessage] = useState(message.content);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedContent, setEditedContent] = useState(message.content);

//   useEffect(() => {
//     const regex = /\\[(\\d+)\\]/g;

//     if (
//       message.role === 'assistant' &&
//       message?.sources &&
//       message.sources.length > 0
//     ) {
//       setParsedMessage(
//         message.content.replace(
//           regex,
//           (_, number) =>
//             `<a href="${message.sources?.[number - 1]?.metadata?.url}" target="_blank" className="bg-light-secondary dark:bg-dark-secondary px-1 rounded ml-1 no-underline text-xs text-black relative">${number}</a>`,
//         ),
//       );
//     } else {
//       setParsedMessage(message.content);
//     }

//     setSpeechMessage(message.content.replace(regex, ''));
//   }, [message.content, message.sources, message.role]);

//   const { speechStatus, start, stop } = useSpeech({ text: speechMessage });

//   const handleEdit = () => {
//     setIsEditing(true);
//     setEditedContent(message.content); // Set initial content to the current query
//   };

//   const handleSave = () => {
//     if (editedContent !== message.content) {
//       editMessage(message.messageId, editedContent); // Update the message content in state

//       // Remove the old query and its response, then send the new query
//       const updatedHistory = history.filter(
//         (msg) => msg.messageId !== message.messageId,
//       );
//       sendMessage(editedContent);
//     }
//     setIsEditing(false);
//   };

//   return (
//     <div>
//       {message.role === 'user' && (
//         <div className={cn('', messageIndex === 0 ? 'pt-16' : 'pt-8')}>
//           {isEditing ? (
//             <textarea
//               value={editedContent}
//               onChange={(e) => setEditedContent(e.target.value)}
//               className="edit-input"
//             />
//           ) : (
//             <h2 className="text-[#000080] bg-[#D2E3FD] self-start font-medium text-3xl max-w-max inline rounded-md whitespace-normal">
//               {message.content}
//             </h2>
//           )}
//           <div className="flex space-x-2 mt-2">
//             {isEditing ? (
//               <button onClick={handleSave} className="save-button">
//                 Save
//               </button>
//             ) : (
//               <button onClick={handleEdit} className="edit-button">
//                 Edit
//               </button>
//             )}
//           </div>
//         </div>
//       )}

//       {message.role === 'assistant' && (
//         <div className="flex flex-col space-y-9 lg:space-y-0 lg:flex-row lg:justify-between lg:space-x-9">
//           <div
//             ref={dividerRef}
//             className="flex flex-col space-y-6 w-full lg:w-9/12"
//           >
//             {message.sources && message.sources.length > 0 && (
//               <div className="flex flex-col space-y-2">
//                 <div className="flex flex-row items-center space-x-2">
//                   <BookCopy className="text-black" size={20} />
//                   <h3 className="text-black font-medium text-xl">Sources</h3>
//                 </div>
//                 <MessageSources sources={message.sources} />
//               </div>
//             )}
//             <div className="flex flex-col space-y-2">
//               <div className="flex flex-row items-center space-x-2">
//                 <Disc3
//                   className={cn(
//                     'text-black',
//                     isLast && loading ? 'animate-spin' : 'animate-none',
//                   )}
//                   size={20}
//                 />
//                 <h3 className="text-black font-medium text-xl">Answer</h3>
//               </div>
//               <Markdown
//                 className={cn(
//                   'prose prose-p:leading-relaxed prose-pre:p-0',
//                   'max-w-none break-words text-black text-sm md:text-base font-medium',
//                 )}
//               >
//                 {parsedMessage}
//               </Markdown>
//               {loading && isLast ? null : (
//                 <div className="flex flex-row items-center justify-between w-full text-black py-4 -mx-2">
//                   <div className="flex flex-row items-center space-x-1">
//                     <Rewrite rewrite={rewrite} messageId={message.messageId} />
//                   </div>
//                   <div className="flex flex-row items-center space-x-1">
//                     <Copy initialMessage={message.content} message={message} />
//                     <Share message={message.content} />{' '}
//                     <button
//                       onClick={() => {
//                         if (speechStatus === 'started') {
//                           stop();
//                         } else {
//                           start();
//                         }
//                       }}
//                       className="p-2 text-black rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200 hover:text-black dark:hover:text-white"
//                     >
//                       {speechStatus === 'started' ? (
//                         <StopCircle size={18} />
//                       ) : (
//                         <Volume2 size={18} />
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="lg:sticky lg:top-20 flex flex-col items-center space-y-3 w-full lg:w-3/12 z-30 h-full pb-4">
//             <SearchImages
//               query={history[messageIndex - 1].content}
//               chat_history={history.slice(0, messageIndex - 1)}
//             />
//             <SearchVideos
//               chat_history={history.slice(0, messageIndex - 1)}
//               query={history[messageIndex - 1].content}
//             />
//             <div className="w-[300px] border border-red-600 h-[1140px]">
//               <div className="w-[300px] h-[250px] cursor-pointer">
//                 <SideTopAdComponent divid="top1" />
//               </div>
//               <div className="w-[300px] h-[600px] cursor-pointer">
//                 <SideBottomAdComponent divid="bottom1" />
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MessageBox;
// 'use client';

// /* eslint-disable @next/next/no-img-element */
// import React, { MutableRefObject, useEffect, useState } from 'react';
// import { Message } from './ChatWindow';
// import { cn } from '@/lib/utils';
// import { Edit } from 'lucide-react';
// import {
//   BookCopy,
//   Disc3,
//   Volume2,
//   StopCircle,
//   Layers3,
//   Plus,
// } from 'lucide-react';
// import Markdown from 'markdown-to-jsx';
// import Copy from './MessageActions/Copy';
// import Rewrite from './MessageActions/Rewrite';
// import MessageSources from './MessageSources';
// import SearchImages from './SearchImages';
// import SearchVideos from './SearchVideos';
// import { useSpeech } from 'react-text-to-speech';
// import SideTopAdComponent from './Ads/SideAdTop';
// import SideBottomAdComponent from './Ads/SideAdBottom';
// import Share from './MessageActions/Share';

// const MessageBox = ({
//   message,
//   messageIndex,
//   history,
//   loading,
//   dividerRef,
//   isLast,
//   rewrite,
//   sendMessage,
//   editMessage,
//   setMessages,
// }: {
//   message: Message;
//   messageIndex: number;
//   history: Message[];
//   loading: boolean;
//   dividerRef?: MutableRefObject<HTMLDivElement | null>;
//   isLast: boolean;
//   rewrite: (messageId: string) => void;
//   sendMessage: (message: string) => void;
//   editMessage: (messageId: string, newContent: string) => void;
//   setMessages: (messages: Message[]) => void; // Added to update the messages list
// }) => {
//   const [parsedMessage, setParsedMessage] = useState(message.content);
//   const [speechMessage, setSpeechMessage] = useState(message.content);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedContent, setEditedContent] = useState(message.content);

//   useEffect(() => {
//     const regex = /\\[(\\d+)\\]/g;

//     if (
//       message.role === 'assistant' &&
//       message?.sources &&
//       message.sources.length > 0
//     ) {
//       setParsedMessage(
//         message.content.replace(
//           regex,
//           (_, number) =>
//             `<a href="${message.sources?.[number - 1]?.metadata?.url}" target="_blank" className="bg-light-secondary dark:bg-dark-secondary px-1 rounded ml-1 no-underline text-xs text-black relative">${number}</a>`,
//         ),
//       );
//     } else {
//       setParsedMessage(message.content);
//     }

//     setSpeechMessage(message.content.replace(regex, ''));
//   }, [message.content, message.sources, message.role]);

//   const { speechStatus, start, stop } = useSpeech({ text: speechMessage });

//   const handleEdit = () => {
//     setIsEditing(true);
//     setEditedContent(message.content); // Set initial content to the current query
//   };

//   const handleSave = () => {
//     if (editedContent !== message.content) {
//       // Remove the old query and its response
//       const updatedHistory = history.filter((msg, index) => {
//         return (
//           msg.messageId !== message.messageId &&
//           !(index === messageIndex + 1 && msg.role === 'assistant') // Remove the response following the query
//         );
//       });

//       // Update the messages in the parent component
//       setMessages(updatedHistory);

//       // Send the new query
//       sendMessage(editedContent);
//     }
//     setIsEditing(false);
//   };

//   return (
//     <div >
//       {message.role === 'user' && (
//         <div className={cn('', messageIndex === 0 ? 'pt-16' : 'pt-8')}>
//           {isEditing ? (
//             <textarea
//               value={editedContent}
//               onChange={(e) => setEditedContent(e.target.value)}
//               className="edit-input"
//             />
//           ) : (
//             <h2 className="text-[#000080] bg-[#D2E3FD] self-start font-medium text-3xl max-w-max inline rounded-md whitespace-normal">
//               {message.content}
//             </h2>
//           )}
//           <div className="flex space-x-2 mt-2">
//             {isEditing ? (
//               <button onClick={handleSave} className="save-button">
//                 Save
//               </button>
//             ) : (
//               <button onClick={handleEdit} className="edit-button">
//                 {/* Edit */}
//                 <Edit size={18} /> {/* This adds the edit icon */}
//                 {/* <span>Edit</span> */}
//               </button>
//             )}
//           </div>
//         </div>
//       )}

//       {message.role === 'assistant' && (
//         <div className="flex flex-col space-y-9 lg:space-y-0 lg:flex-row lg:justify-between lg:space-x-9">
//           <div
//             ref={dividerRef}
//             className="flex flex-col space-y-6 w-full lg:w-9/12"
//           >
//             {message.sources && message.sources.length > 0 && (
//               <div className="flex flex-col space-y-2">
//                 <div className="flex flex-row items-center space-x-2">
//                   <BookCopy className="text-black" size={20} />
//                   <h3 className="text-black font-medium text-xl">Sources</h3>
//                 </div>
//                 <MessageSources sources={message.sources} />
//               </div>
//             )}
//             <div className="flex flex-col space-y-2">
//               <div className="flex flex-row items-center space-x-2">
//                 <Disc3
//                   className={cn(
//                     'text-black',
//                     isLast && loading ? 'animate-spin' : 'animate-none',
//                   )}
//                   size={20}
//                 />
//                 <h3 className="text-black font-medium text-xl">Answer</h3>
//               </div>
//               <Markdown
//                 className={cn(
//                   'prose prose-p:leading-relaxed prose-pre:p-0',
//                   'max-w-none break-words text-black text-sm md:text-base font-medium',
//                 )}
//               >
//                 {parsedMessage}
//               </Markdown>
//               {loading && isLast ? null : (
//                 <div className="flex flex-row items-center justify-between w-full text-black py-4 -mx-2">
//                   <div className="flex flex-row items-center space-x-1">
//                     <Rewrite rewrite={rewrite} messageId={message.messageId} />
//                   </div>
//                   <div className="flex flex-row items-center space-x-1">
//                     <Copy initialMessage={message.content} message={message} />
//                     <Share message={message.content} />{' '}
//                     <button
//                       onClick={() => {
//                         if (speechStatus === 'started') {
//                           stop();
//                         } else {
//                           start();
//                         }
//                       }}
//                       className="p-2 text-black rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200 hover:text-black dark:hover:text-white"
//                     >
//                       {speechStatus === 'started' ? (
//                         <StopCircle size={18} />
//                       ) : (
//                         <Volume2 size={18} />
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="lg:sticky lg:top-20 flex flex-col items-center space-y-3  w-[300px]  z-30 h-full pb-4">
//             <SearchImages
//               query={history[messageIndex - 1].content}
//               chat_history={history.slice(0, messageIndex - 1)}
//             />
//             <SearchVideos
//               chat_history={history.slice(0, messageIndex - 1)}
//               query={history[messageIndex - 1].content}
//             />
//             <div className="w-[300px]  gap-2.5  overflow-x-hidden">
//               <div className="w-[300px]  h-[250px]  cursor-pointer">
//                 <SideTopAdComponent divid="top1" />
//               </div>
//               <div className="w-[300px] h-[600px]  cursor-pointer">
//                 <SideBottomAdComponent divid="bottom1" />
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MessageBox;
'use client';

/* eslint-disable @next/next/no-img-element */
import React, { MutableRefObject, useEffect, useState } from 'react';
import { Message } from './ChatWindow';
import { cn } from '@/lib/utils';
import { Edit } from 'lucide-react';
import { BookCopy, Disc3, Volume2, StopCircle } from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import Copy from './MessageActions/Copy';
import Rewrite from './MessageActions/Rewrite';
import MessageSources from './MessageSources';
import SearchImages from './SearchImages';
import SearchVideos from './SearchVideos';
import { useSpeech } from 'react-text-to-speech';
import SideTopAdComponent from './Ads/SideAdTop';
import SideBottomAdComponent from './Ads/SideAdBottom';
import Share from './MessageActions/Share';
import RelatedImages from './GetOneImage';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { base16AteliersulphurpoolLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, ClipboardList } from 'lucide-react';

const MessageBox = ({
  message,
  messageIndex,
  history,
  loading,
  dividerRef,
  isLast,
  rewrite,
  sendMessage,
  editMessage,
  setMessages,
  callAd
}: {
  message: Message;
  messageIndex: number;
  history: Message[];
  loading: boolean;
  dividerRef?: MutableRefObject<HTMLDivElement | null>;
  isLast: boolean;
  rewrite: (messageId: string) => void;
  sendMessage: (message: string) => void;
  editMessage: (messageId: string, newContent: string) => void;
  setMessages: (messages: Message[]) => void;
  callAd: boolean
}) => {
  const [parsedMessage, setParsedMessage] = useState(message.content);
  const [speechMessage, setSpeechMessage] = useState(message.content);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  useEffect(() => {
    const regex = /\\[(\\d+)\\]/g;

    if (
      message.role === 'assistant' &&
      message?.sources &&
      message.sources.length > 0
    ) {
      setParsedMessage(
        message.content.replace(
          regex,
          (_, number) =>
            `<a href="${message.sources?.[number - 1]?.metadata?.url}" target="_blank" className="bg-light-secondary dark:bg-dark-secondary px-1 rounded ml-1 no-underline text-xs text-black relative">${number}</a>`,
        ),
      );
    } else {
      setParsedMessage(message.content);
    }

    setSpeechMessage(message.content.replace(regex, ''));
  }, [message.content, message.sources, message.role]);

  const { speechStatus, start, stop } = useSpeech({ text: speechMessage });

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(message.content);
  };

  const handleSave = () => {
    if (editedContent !== message.content) {
      const updatedHistory = history.filter((msg, index) => {
        return (
          msg.messageId !== message.messageId &&
          !(index === messageIndex + 1 && msg.role === 'assistant')
        );
      });

      setMessages(updatedHistory);

      sendMessage(editedContent);
    }
    setIsEditing(false);
  };
  const [isImage, setImage] = useState(false)
  const [isVideo, setVideo] = useState(false)

  const handleComplete = async (success: boolean) => {

    setVideo(!success)
    setImage(success)

  }
  const handleImg = async (success: boolean) => {

    setImage(!success)
    setVideo(success)

  }

  // Define the props type, including node
  interface MarkdownCodeProps {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
    node?: any; // adjust this based on what node actually is
  }

  const CodeBlock: React.FC<MarkdownCodeProps> = ({
    node,
    inline = false,
    className,
    children,
  }) => {
    // Extract the language from the className
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';
    const [copied, setCopied] = useState(false);
    // Render code block or inline code based on the `inline` prop
    return !inline && match ? (
      <div className="relative group">
        <SyntaxHighlighter
          language={language}
          style={base16AteliersulphurpoolLight}
          customStyle={{ margin: 0, padding: '1rem' }}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
        <button
          onClick={() => {
            navigator.clipboard.writeText(String(children))
            setCopied(true);
            setTimeout(() => setCopied(false), 1000);
          }}
          className="absolute top-2 right-2  opacity-0 group-hover:opacity-100 text-black dark transition-opacity"
          aria-label="Copy code to clipboard"

        >
          {copied ? <Check size={18} /> : <ClipboardList size={18} />}
        </button>
      </div>
    ) : (
      <code className="bg-gray dark:bg-gray px-1 py-0.5 rounded">{children}</code>

    );
  };



  return (
    <>
      <div className=''>
        {message.role === 'user' && (
          <div
            className={cn(
              'flex items-center',
              messageIndex === 0 ? 'pt-16' : 'pt-8',
            )}
          >
            <div className="flex items-center">
              {isEditing ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="edit-input p-2 text-[#000080] bg-[#D2E3FD] font-medium text-3xl rounded-md"
                />
              ) : (
                <h2 className="text-[#000080] bg-[#D2E3FD] font-medium text-3xl inline-block rounded-md whitespace-normal">
                  {message.content}
                </h2>
              )}
              {/* Edit button or Save button right after the content */}
              <button
                onClick={isEditing ? handleSave : handleEdit}
                className="ml-2"
              >
                {isEditing ? 'Save' : <Edit size={18} />}
              </button>
            </div>
          </div>
        )}

        {message.role === 'assistant' && (
          <div className="flex flex-col space-y-9 lg:space-y-0 lg:flex-row lg:justify-between lg:space-x-24 lg:w-[65rem]">
            <div
              ref={dividerRef}
              className="flex flex-col space-y-6 w-full lg:w-8/12 h-full"

            >
              {message.sources && message.sources.length > 0 && (
                <div className="flex flex-col space-y-2">
                  <div className="flex flex-row items-center space-x-2">
                    <BookCopy className="text-black" size={20} />
                    <h3 className="text-black font-medium text-xl">Sources</h3>
                  </div>
                  <MessageSources sources={message.sources} />
                </div>
              )}
              <div className="flex flex-col space-y-2">
                <div className="flex flex-row items-center space-x-2">
                  <Disc3
                    className={cn(
                      'text-black',
                      isLast && loading ? 'animate-spin' : 'animate-none',
                    )}
                    size={20}
                  />
                  <h3 className="text-black font-medium text-xl">Answer</h3>
                </div>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    code({ node, inline, className, children, ...props }: MarkdownCodeProps) {
                      return (
                        <CodeBlock
                          node={node}
                          inline={inline}
                          className={className}
                        >
                          {children}
                        </CodeBlock>
                      );
                    },
                  }}
                  className={cn(
                    'prose prose-p:leading-relaxed prose-pre:p-0',
                    'break-words text-black text-sm md:text-base font-medium',
                  )}
                >
                  {parsedMessage}
                </ReactMarkdown>

                {loading && isLast ? null : (
                  <div className="flex flex-row items-center justify-between w-full text-black py-4 -mx-2">
                    <div className="flex flex-row items-center space-x-1">
                      <Share message={message.content} />
                      <Rewrite rewrite={rewrite} messageId={message.messageId} />
                    </div>
                    <div className="flex flex-row items-center space-x-1">
                      <Copy initialMessage={message.content} message={message} />

                      <button
                        onClick={() => {
                          if (speechStatus === 'started') {
                            stop();
                          } else {
                            start();
                          }
                        }}
                        className="p-2 text-black rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200 hover:text-black dark:hover:text-white"
                      >
                        {speechStatus === 'started' ? (
                          <StopCircle size={18} />
                        ) : (
                          <Volume2 size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="lg:sticky lg:top-20 flex flex-col items-center space-y-3 w-[300px] z-30 h-full pb-4">
              <div className=' w-[300px] h-[207.36px]'>
                <div className="h-full w-full">

                  {/* add the images code here */}
                  <RelatedImages
                    chat_history={history.slice(0, messageIndex - 1)}
                    query={history[messageIndex - 1].content}
                  />
                </div>
              </div>
              {isImage ?
                <>
                  <SearchImages key="image-true" query={history[messageIndex - 1].content} chat_history={history.slice(0, messageIndex - 1)} complete={handleImg} visible={false} />

                </>
                :
                <>
                  <SearchImages
                    key="image-false"
                    query={history[messageIndex - 1].content}
                    chat_history={history.slice(0, messageIndex - 1)}
                    complete={handleImg}
                    visible={true}
                  />

                </>
              }
              {isVideo ?
                <SearchVideos
                  key={`video-${isVideo}`}
                  chat_history={history.slice(0, messageIndex - 1)}
                  query={history[messageIndex - 1].content}
                  complete={handleComplete}
                  visible={false}
                />
                :
                <SearchVideos
                  key={`video-${isVideo}`}
                  chat_history={history.slice(0, messageIndex - 1)}
                  query={history[messageIndex - 1].content}
                  complete={handleComplete}
                  visible={true}
                />
              }
              {callAd &&
                <div className=" w-[300px] mt-10 hidden lg:flex xl:flex flex-col items-center gap-2.5  h-[calc(100vh-110px)] hide-scrollbar overflow-y-auto overflow-x-hidden">
                  <div className="w-[300px]  h-[250px] cursor-pointer">
                    <SideTopAdComponent divid={`top-message-${messageIndex - 1}`} />
                  </div>
                  <div className="w-[300px] h-[600px] cursor-pointer">
                    <SideBottomAdComponent divid={`bottom-message-${messageIndex - 1}`} />
                  </div>
                </div>
              }
            </div>
          </div>
        )}

      </div>

    </>
  );
};

export default MessageBox;
