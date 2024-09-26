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

        //Old version with citations (commented out)
        // const contentToCopy = `${initialMessage}${message.sources && message.sources.length > 0 && `\n\nCitations:\n${message.sources?.map((source: any, i: any) => `[${i + 1}] ${source.metadata.url}`).join(`\n`)}`}`;
        
        navigator.clipboard.writeText(contentToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
      }}
       className="py-2 px-3 rounded-xl hover:bg-light-secondary hover:text-black dark:hover:bg-dark-secondary transition duration-200 text-black flex flex-row items-center space-x-1"
      // className="p-2 text-black/70 rounded-xl hover:bg-light-secondary hover:text-black transition duration-200 "
    >
      {copied ? <Check size={18} /> : <ClipboardList size={18} />}
      <p className="text-sm font-medium">{copied ? 'Copied' : 'Copy'}</p>
    </button>
  );
};

export default Copy;
