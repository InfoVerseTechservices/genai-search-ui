"use client";

import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
// import { SendIcon, UploadIcon, PeeksIcon, RemoveIcon } from "../Icons";
import { useRouter } from 'next/navigation';
import { UploadIcon } from './Icons';

interface InputBarProps {
  sendMessage: (message: string, file: File | null) => void;
  setUploadedFile: (file: File | null) => void;
  uploading: (isUploading: boolean) => void;
  uploadedFile: File | null;
}

const InputBar: React.FC<InputBarProps> = ({ sendMessage, setUploadedFile, uploading, uploadedFile }) => {
  const [message, setMessage] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.push('/gen-search');
    if (message.trim() || file) {
      sendMessage(message, file);
      setMessage('');
      setFile(null);
      setUploadedFile(null);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setUploadedFile(selectedFile);
    setIsUploading(false);
    uploading(false);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const borderStyle = {
    border: '0.5px solid transparent',
    backgroundClip: 'padding-box',
    background: 'linear-gradient(white, white) padding-box, linear-gradient(180deg, #FF0049 0%, #FFBE3B 25%, #00BB5C 50%, #187DC4 75%, #58268B 100%) border-box',
    borderImageSlice: 1,
  };

  return (
    <div className='relative'>
      
        <div className='flex flex-col items-center md:w-[28rem] md:h-[10.52rem] lg:w-[30rem] lg:h-[11.32rem] xl:w-[45rem] xl:h-[17rem] mt-[1.2rem] ml-[6rem] rounded-[1.5rem]' style={borderStyle}>
        
          <p className='lg:p-1 xl:p-5 font-[700] md:text-base lg:text-lg xl:text-xl'>Drag and Drop or upload your file here

            <span className='absolute right-4 font-normal text-[#E3E3E3] cursor-pointer' >x </span>
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
  );
};

export default InputBar;
