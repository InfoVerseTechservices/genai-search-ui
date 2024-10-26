// import { ArrowRight, Share } from 'lucide-react';
// import { useEffect, useRef, useState } from 'react';
// import TextareaAutosize from 'react-textarea-autosize';
// import CopilotToggle from './MessageInputActions/Copilot';
// import Focus from './MessageInputActions/Focus';
// import uploadIcon from '../public/uploadIcon.svg';
// import Image from 'next/image';

// const EmptyChatMessageInput = ({
//   sendMessage,
//   focusMode,
//   setFocusMode,
// }: {
//   sendMessage: (message: string) => void;
//   focusMode: string;
//   setFocusMode: (mode: string) => void;
// }) => {
//   const [copilotEnabled, setCopilotEnabled] = useState(false);
//   const [message, setMessage] = useState('');

//   const inputRef = useRef<HTMLTextAreaElement | null>(null);

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       const activeElement = document.activeElement;

//       const isInputFocused =
//         activeElement?.tagName === 'INPUT' ||
//         activeElement?.tagName === 'TEXTAREA' ||
//         activeElement?.hasAttribute('contenteditable');

//       if (e.key === '/' && !isInputFocused) {
//         e.preventDefault();
//         inputRef.current?.focus();
//       }
//     };

//     document.addEventListener('keydown', handleKeyDown);

//     return () => {
//       document.removeEventListener('keydown', handleKeyDown);
//     };
//   }, []);

//   const borderStyle = {
//     border: '0.5px solid transparent',
//     backgroundClip: 'padding-box',
//     background:
//       'linear-gradient(white, white) padding-box, linear-gradient(180deg, #FF0049 0%, #FFBE3B 25%, #00BB5C 50%, #187DC4 75%, #58268B 100%) border-box',
//     borderImageSlice: 1,
//   };

//   return (
//     <form
//       onSubmit={(e) => {
//         e.preventDefault();
//         sendMessage(message);
//         setMessage('');
//       }}
//       onKeyDown={(e) => {
//         if (e.key === 'Enter' && !e.shiftKey) {
//           e.preventDefault();
//           sendMessage(message);
//           setMessage('');
//         }
//       }}
//       className="w-full"
//     >
//       {' '}
//       <div className="flex flex-col gap-[2rem] items-center w-full text-center">
//         <div
//           style={borderStyle}
//           className=" relative flex flex-col bg-white px-5 pt-5 pb-2 rounded-lg items-center w-[48rem] border"
//         >
//           <TextareaAutosize
//             ref={inputRef}
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             minRows={6}
//             className="bg-transparent p-1 placeholder:text-[#ACACAC] text-sm self-start text-black resize-none focus:outline-none w-full max-h-24 lg:max-h-36 xl:max-h-48"
//             placeholder="Ask Coco..."
//           />
//           {/* <Image src={uploadIcon} alt='colombo' className="absolute top-2 right-2 cursor-pointer" /> */}

//           {/* Co-pilot */}

//           {/* <div className="flex flex-row items-center justify-between mt-4">
//           <div className="flex flex-row items-center space-x-1 -mx-2">
//             <Focus focusMode={focusMode} setFocusMode={setFocusMode} />
//           </div>
//           <div className="flex flex-row items-center space-x-4 -mx-2">
//             <CopilotToggle
//               copilotEnabled={copilotEnabled}
//               setCopilotEnabled={setCopilotEnabled}
//             />
//             <button
//               disabled={message.trim().length === 0}
//               className="bg-[#24A0ED] text-white disabled:text-black/50 dark:disabled:text-white/50 disabled:bg-[#e0e0dc] dark:disabled:bg-[#ececec21] hover:bg-opacity-85 transition duration-100 rounded-full p-2"
//             >
//               <ArrowRight className="bg-background" size={17} />
//             </button>
//           </div>
//         </div> */}
//         </div>
//         <p className="text-[#ACACAC] text-sm w-[44rem]">
//           Welcome to GenAI Search, your go-to tool for instant answers and web
//           exploration! <br />
//           Simply type your question or topic of interest, and GenAI will provide
//           you with accurate answers along with related links from the web.
//           Whether you&apos;re seeking quick information or <br /> diving deeper
//           into a topic, GenAI Search has you covered.
//         </p>
//       </div>
//     </form>
//   );
// };

// export default EmptyChatMessageInput;
// import { ArrowRight, Share } from 'lucide-react';
// import { useEffect, useRef, useState } from 'react';
// import TextareaAutosize from 'react-textarea-autosize';
// import CopilotToggle from './MessageInputActions/Copilot';
// import Focus from './MessageInputActions/Focus';
// import uploadIcon from '../public/uploadIcon.svg';
// import Image from 'next/image';

// const EmptyChatMessageInput = ({
//   sendMessage,
//   focusMode,
//   setFocusMode,
// }: {
//   sendMessage: (message: string) => void;
//   focusMode: string;
//   setFocusMode: (mode: string) => void;
// }) => {
//   const [copilotEnabled, setCopilotEnabled] = useState(false);
//   const [message, setMessage] = useState('');

//   const inputRef = useRef<HTMLTextAreaElement | null>(null);

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       const activeElement = document.activeElement;

//       const isInputFocused =
//         activeElement?.tagName === 'INPUT' ||
//         activeElement?.tagName === 'TEXTAREA' ||
//         activeElement?.hasAttribute('contenteditable');

//       if (e.key === '/' && !isInputFocused) {
//         e.preventDefault();
//         inputRef.current?.focus();
//       }
//     };

//     document.addEventListener('keydown', handleKeyDown);

//     return () => {
//       document.removeEventListener('keydown', handleKeyDown);
//     };
//   }, []);

//   const borderStyle = {
//     border: '0.5px solid transparent',
//     backgroundClip: 'padding-box',
//     background:
//       'linear-gradient(white, white) padding-box, linear-gradient(180deg, #FF0049 0%, #FFBE3B 25%, #00BB5C 50%, #187DC4 75%, #58268B 100%) border-box',
//     borderImageSlice: 1,
//   };

//   return (
//     <form
//       onSubmit={(e) => {
//         e.preventDefault();
//         sendMessage(message);
//         setMessage('');
//       }}
//       onKeyDown={(e) => {
//         if (e.key === 'Enter' && !e.shiftKey) {
//           e.preventDefault();
//           sendMessage(message);
//           setMessage('');
//         }
//       }}
//       className="w-full"
//     >
//       {' '}
//       <div className="flex flex-col gap-[2rem] items-center w-full text-center">
//         <div
//           style={borderStyle}
//           className=" relative flex flex-col bg-white px-5 pt-5 pb-2 rounded-lg items-center w-[48rem] border"
//         >
//           <TextareaAutosize
//             ref={inputRef}
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             minRows={6}
//             className="bg-transparent p-1 placeholder:text-[#ACACAC] text-sm self-start text-black resize-none focus:outline-none w-full max-h-24 lg:max-h-36 xl:max-h-48"
//             placeholder="Ask Coco..."
//           />
//           {/* <Image src={uploadIcon} alt='colombo' className="absolute top-2 right-2 cursor-pointer" /> */}

//           {/* Co-pilot */}

//           {/* <div className="flex flex-row items-center justify-between mt-4">
//           <div className="flex flex-row items-center space-x-1 -mx-2">
//             <Focus focusMode={focusMode} setFocusMode={setFocusMode} />
//           </div>
//           <div className="flex flex-row items-center space-x-4 -mx-2">
//             <CopilotToggle
//               copilotEnabled={copilotEnabled}
//               setCopilotEnabled={setCopilotEnabled}
//             />
//             <button
//               disabled={message.trim().length === 0}
//               className="bg-[#24A0ED] text-white disabled:text-black/50 dark:disabled:text-white/50 disabled:bg-[#e0e0dc] dark:disabled:bg-[#ececec21] hover:bg-opacity-85 transition duration-100 rounded-full p-2"
//             >
//               <ArrowRight className="bg-background" size={17} />
//             </button>
//           </div>
//         </div> */}
//         </div>
//         <p className="text-[#ACACAC] text-sm w-[44rem]">
//           Welcome to GenAI Search, your go-to tool for instant answers and web
//           exploration! <br />
//           Simply type your question or topic of interest, and GenAI will provide
//           you with accurate answers along with related links from the web.
//           Whether you&apos;re seeking quick information or <br /> diving deeper
//           into a topic, GenAI Search has you covered.
//         </p>
//       </div>
//     </form>
//   );
// };

// export default EmptyChatMessageInput;
// import { ArrowRight, Share } from 'lucide-react';
// import { useEffect, useRef, useState } from 'react';
// import TextareaAutosize from 'react-textarea-autosize';
// import CopilotToggle from './MessageInputActions/Copilot';
// import Focus from './MessageInputActions/Focus';
// import uploadIcon from '../public/uploadIcon.svg';
// import Image from 'next/image';

// const EmptyChatMessageInput = ({
//   sendMessage,
//   focusMode,
//   setFocusMode,
// }: {
//   sendMessage: (message: string) => void;
//   focusMode: string;
//   setFocusMode: (mode: string) => void;
// }) => {
//   const [copilotEnabled, setCopilotEnabled] = useState(false);
//   const [message, setMessage] = useState('');

//   const inputRef = useRef<HTMLTextAreaElement | null>(null);

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       const activeElement = document.activeElement;

//       const isInputFocused =
//         activeElement?.tagName === 'INPUT' ||
//         activeElement?.tagName === 'TEXTAREA' ||
//         activeElement?.hasAttribute('contenteditable');

//       if (e.key === '/' && !isInputFocused) {
//         e.preventDefault();
//         inputRef.current?.focus();
//       }
//     };

//     document.addEventListener('keydown', handleKeyDown);

//     return () => {
//       document.removeEventListener('keydown', handleKeyDown);
//     };
//   }, []);

//   const borderStyle = {
//     border: '0.5px solid transparent',
//     backgroundClip: 'padding-box',
//     background:
//       'linear-gradient(white, white) padding-box, linear-gradient(180deg, #FF0049 0%, #FFBE3B 25%, #00BB5C 50%, #187DC4 75%, #58268B 100%) border-box',
//     borderImageSlice: 1,
//   };

//   const handleSendMessage = () => {
//     if (message.trim().length > 0) {
//       sendMessage(message);
//       setMessage('');
//     }
//   };

//   return (
//     <form
//       onSubmit={(e) => {
//         e.preventDefault();
//         handleSendMessage();
//       }}
//       onKeyDown={(e) => {
//         if (e.key === 'Enter' && !e.shiftKey) {
//           e.preventDefault();
//           handleSendMessage();
//         }
//       }}
//       className="w-full"
//     >
//       <div className="flex flex-col gap-[2rem] items-center w-full text-center">
//         <div
//           style={borderStyle}
//           className="relative flex flex-col bg-white px-5 pt-5 pb-2 rounded-lg items-center w-[48rem] border"
//         >
//           <TextareaAutosize
//             ref={inputRef}
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             minRows={6}
//             className="bg-transparent p-1 placeholder:text-[#ACACAC] text-sm self-start text-black resize-none focus:outline-none w-full max-h-24 lg:max-h-36 xl:max-h-48"
//             placeholder="Ask Coco..."
//           />
//           {/* Enter button */}
//           <button
//             type="button"
//             onClick={handleSendMessage}
//             disabled={message.trim().length === 0}
//             className="absolute top-2 right-2 bg-[#24A0ED] text-white disabled:text-black/50 dark:disabled:text-white/50 disabled:bg-[#e0e0dc] dark:disabled:bg-[#ececec21] hover:bg-opacity-85 transition duration-100 rounded-full p-2 cursor-pointer"
//           >
//             <ArrowRight className="bg-background" size={17} />
//           </button>
//         </div>
//         <p className="text-[#ACACAC] text-sm w-[44rem]">
//           Welcome to GenAI Search, your go-to tool for instant answers and web
//           exploration! <br />
//           Simply type your question or topic of interest, and GenAI will provide
//           you with accurate answers along with related links from the web.
//           Whether you&apos;re seeking quick information or <br /> diving deeper
//           into a topic, GenAI Search has you covered.
//         </p>
//       </div>
//     </form>
//   );
// };

// export default EmptyChatMessageInput;

// import { ArrowRight, Share } from 'lucide-react';
// import { useEffect, useRef, useState } from 'react';
// import TextareaAutosize from 'react-textarea-autosize';
// import CopilotToggle from './MessageInputActions/Copilot';
// import Focus from './MessageInputActions/Focus';
// import uploadIcon from '../public/uploadIcon.svg';
// import Image from 'next/image';

// const EmptyChatMessageInput = ({
//   sendMessage,
//   focusMode,
//   setFocusMode,
// }: {
//   sendMessage: (message: string) => void;
//   focusMode: string;
//   setFocusMode: (mode: string) => void;
// }) => {
//   const [copilotEnabled, setCopilotEnabled] = useState(false);
//   const [message, setMessage] = useState('');

//   const inputRef = useRef<HTMLTextAreaElement | null>(null);

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       const activeElement = document.activeElement;

//       const isInputFocused =
//         activeElement?.tagName === 'INPUT' ||
//         activeElement?.tagName === 'TEXTAREA' ||
//         activeElement?.hasAttribute('contenteditable');

//       if (e.key === '/' && !isInputFocused) {
//         e.preventDefault();
//         inputRef.current?.focus();
//       }
//     };

//     document.addEventListener('keydown', handleKeyDown);

//     return () => {
//       document.removeEventListener('keydown', handleKeyDown);
//     };
//   }, []);

//   const borderStyle = {
//     border: '0.5px solid transparent',
//     backgroundClip: 'padding-box',
//     background:
//       'linear-gradient(white, white) padding-box, linear-gradient(180deg, #FF0049 0%, #FFBE3B 25%, #00BB5C 50%, #187DC4 75%, #58268B 100%) border-box',
//     borderImageSlice: 1,
//   };

//   const handleSendMessage = () => {
//     if (message.trim().length > 0) {
//       sendMessage(message);
//       setMessage('');
//     }
//   };

//   return (
//     <form
//       onSubmit={(e) => {
//         e.preventDefault();
//         handleSendMessage();
//       }}
//       onKeyDown={(e) => {
//         if (e.key === 'Enter' && !e.shiftKey) {
//           e.preventDefault();
//           handleSendMessage();
//         }
//       }}
//       className="w-full"
//     >
//       <div className="flex flex-col gap-[2rem] items-center w-full text-center">
//         <div
//           style={borderStyle}
//           className="relative flex flex-col bg-white px-5 pt-5 pb-2 rounded-lg items-center w-[48rem] border"
//         >
//           <TextareaAutosize
//             ref={inputRef}
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             minRows={6}
//             className="bg-transparent p-1 placeholder:text-[#ACACAC] text-sm self-start text-black resize-none focus:outline-none w-full max-h-24 lg:max-h-36 xl:max-h-48"
//             placeholder="Ask Coco..."
//           />
//           {/* Enter button at the bottom */}
//           <div className="flex justify-end w-full mt-4">
//             <button
//               type="button"
//               onClick={handleSendMessage}
//               disabled={message.trim().length === 0}
//               className="bg-[#24A0ED] text-white disabled:text-black/50 dark:disabled:text-white/50 disabled:bg-[#e0e0dc] dark:disabled:bg-[#ececec21] hover:bg-opacity-85 transition duration-100 rounded-full p-2 cursor-pointer"
//             >
//               <ArrowRight className="bg-background" size={17} />
//             </button>
//           </div>
//         </div>
//         <p className="text-[#ACACAC] text-sm w-[44rem]">
//           Welcome to GenAI Search, your go-to tool for instant answers and web
//           exploration! <br />
//           Simply type your question or topic of interest, and GenAI will provide
//           you with accurate answers along with related links from the web.
//           Whether you&apos;re seeking quick information or <br /> diving deeper
//           into a topic, GenAI Search has you covered.
//         </p>
//       </div>
//     </form>
//   );
// };

// export default EmptyChatMessageInput;

import { ArrowRight, Share } from 'lucide-react';
import { useEffect, useRef, useState, ChangeEvent } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import CopilotToggle from './MessageInputActions/Copilot';
import Focus from './MessageInputActions/Focus';
import uploadIcon from '../public/uploadIcon.svg';
import Image from 'next/image';
import InputBar from './UploadFile';
import { UploadIcon } from './Icons';

const EmptyChatMessageInput = ({
  sendMessage,
  focusMode,
  setFocusMode,
}: {
  sendMessage: (message: string , file: File | null) => void;
  focusMode: string;
  setFocusMode: (mode: string) => void;
}) => {
  const [copilotEnabled, setCopilotEnabled] = useState(false); 
  const [message, setMessage] = useState('');
  const [uploadFile,setUploadFile] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;

      const isInputFocused =
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.hasAttribute('contenteditable');

      if (e.key === '/' && !isInputFocused) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const borderStyle = {
    border: '0.5px solid transparent',
    backgroundClip: 'padding-box',
    background:
      'linear-gradient(white, white) padding-box, linear-gradient(180deg, #FF0049 0%, #FFBE3B 25%, #00BB5C 50%, #187DC4 75%, #58268B 100%) border-box',
    borderImageSlice: 1,
  };
  
  const onUploadChange = (bool: boolean) => {
    setIsUploading(bool);
  };

  const handleSendMessage = () => {
    console.log("heree ", file, uploadedFile)
    if (file || message.trim().length > 0 ) {
      sendMessage(message,file);
      console.log("here is the file ",file)
      setMessage('');
      setFile(null)
      setUploadedFile(null)
    }
  };

  const handleFileChange = async(e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile =  e.target.files?.[0] || null;
    setFile(selectedFile);
    setUploadedFile(selectedFile);
    setIsUploading(false);
    // if (selectedFile) {
    //   sendMessage(message,selectedFile);
    //   console.log("here is the file ",selectedFile)
    //   setMessage('');
    //   setFile(null)
    //   setUploadedFile(null)
    // }
  };
  const handleUploadFile = () =>{
    console.log("here in upload file ",uploadFile)
    setUploadFile(!uploadFile)
    setIsUploading(true)
  }
  return (
    <>
    {uploadFile? (
 <div className='relative'>
      
 <div className='flex flex-col items-center md:w-[28rem] md:h-[10.52rem] lg:w-[30rem] lg:h-[11.32rem] xl:w-[45rem] xl:h-[17rem] mt-[1.2rem] ml-[6rem] rounded-[1.5rem]' style={borderStyle}>
 
   <p className='lg:p-1 xl:p-5 font-[700] md:text-base lg:text-lg xl:text-xl'>Drag and Drop or upload your file here

      <button 
      type='button'
      onClick={() => handleUploadFile()}
      className='absolute right-4 font-normal text-[#E3E3E3] cursor-pointer'
      >
     <span  >x </span>
     </button>
   </p>
 

   <hr className='border-[0.1px] md:w-[28rem] lg:w-[30rem] xl:w-[45rem] border-[#FF0049]' />
   <button
     type="button"
     onClick={() => fileInputRef.current?.click()}
     className='lg:mt-[0.3rem] xl:mt-[1rem]'
   >

     <UploadIcon w={80} h={80} />
   </button>
   <button
     style={{
       background: 'linear-gradient(180deg, #6237FF, #258EFF)',
       color: 'white',
       border: 'none',
       borderRadius: '15px',
       cursor: 'pointer',
       fontWeight: 'normal',
     }}
     className='mt-[0.3rem] xl:mt-[0.5rem] md:text-[0.8rem] lg:text-[0.8rem] xl:text-[1rem] md:px-[1.25rem] md:py-[0.3rem] lg:px-[1.25rem] lg:py-[0.3rem] xl:px-[1.75rem] xl:py-[0.4rem]'
     onClick={() => fileInputRef.current?.click()}
   >
     UPLOAD
   </button>
   <p className='text-[#8B8B8B] md:mt-[0.75rem] lg:mt-[0.5rem] xl:mt-[1.75rem] md:text-xs lg:text-sm'>Max ??mb only</p>
   <input
     type="file"
     ref={fileInputRef}
     onChange={handleFileChange}
     className="hidden"
   />
 </div>

</div>

    )
    : 
    (
      <>
      <h2 className="text-[#000080] text-md sm:text-xl md:text-xl  lg:text-2xl xl:text-3xl font-medium -mt-8">
           Discover and Do More with AI
         </h2>
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSendMessage();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
        }
      }}
      className="w-full"
    >
      <div className="flex flex-col gap-[1rem] sm:gap-[2rem] items-center w-full text-center">
        <div
          style={borderStyle}
          className="relative flex flex-col bg-white px-2 sm:px-5 pt-2 sm:pt-5 pb-2 rounded-lg items-center w-[19rem] sm:w-[30rem] md:w-[35rem] lg:w-[38rem]  xl:w-[48rem] border"
        >
          <TextareaAutosize
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            minRows={6}
            maxRows={6}
            className="bg-transparent p-1 placeholder:text-[#ACACAC] text-xs sm:text-sm self-start text-black resize-none focus:outline-none w-full max-h-24 lg:max-h-36 xl:max-h-48"
            placeholder="Ask Coco..."
          />
          <button 
          type='button'
          onClick={handleUploadFile}
          >
          {/* <Image src={uploadIcon} alt='colombo' className="absolute bottom-3 right-16 cursor-pointer" /> */}
          </button>
          {/* Enter button at the bottom, keeping the box size unchanged */}
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={message.trim().length === 0}
            className="bg-[#D2E3FD] text-[#000080] disabled:text-black/50 dark:disabled:text-white/50 disabled:bg-[#e0e0dc] dark:disabled:bg-[#ececec21] hover:bg-opacity-85 transition duration-100 rounded-full p-2 cursor-pointer absolute bottom-2 right-2"
          >
            <ArrowRight className="bg-background" size={17} />
          </button>
        </div>
        <p className="text-[#ACACAC] text-[12px] sm:text-[14px] md:text-sm lg:text-sm xl:text-[16px] w-[19rem] sm:w-[600px] md:w-[600px] lg:w-[600px]   xl:w-[700px]">
          Welcome to GenAI Search, your go-to tool for instant answers and web
          exploration! 
          Simply type your question or topic of interest, and GenAI will provide
          you with accurate answers along with related links from the web.
          Whether you&apos;re seeking quick information or diving deeper
          into a topic, GenAI Search has you covered.
        </p>
      </div>
    </form>
    </>
    )}
    </>
  );
};

export default EmptyChatMessageInput;
