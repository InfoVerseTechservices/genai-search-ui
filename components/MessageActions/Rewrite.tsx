import { ArrowLeftRight } from 'lucide-react';

const Rewrite = ({
  rewrite,
  messageId,
}: {
  rewrite: (messageId: string) => void;
  messageId: string;
}) => {
  return (
    <button
      onClick={() => rewrite(messageId)}
      className="py-2 px-3  rounded-xl hover:bg-light-secondary hover:text-black dark:hover:bg-dark-secondary transition duration-200 text-black dark:text-white flex flex-row items-center space-x-1"
    >
      <ArrowLeftRight size={18} />
      <p className="text-sm font-medium">Rewrite</p>
    </button>
  );
};

export default Rewrite;
