import { Check, ClipboardList } from 'lucide-react';
import { Message } from '../ChatWindow';
import { useState } from 'react';

const Copy = ({
  message,
  initialMessage,
}: {
  message: Message;
  initialMessage: string;
}) => {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {

        //Remove citations from the copied content
        const contentToCopy = `${initialMessage}`

       
        
        navigator.clipboard.writeText(contentToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
      }}
       className="py-2 px-3  rounded-xl hover:bg-light-secondary hover:text-black dark:hover:bg-dark-secondary transition duration-200 text-black dark:text-white flex flex-row items-center space-x-1"
    >
      {copied ? <Check size={18} /> : <ClipboardList size={18} />}
      <p className="text-sm font-medium">{copied ? 'Copied' : 'Copy'}</p>
    </button>
  );
};

export default Copy;
