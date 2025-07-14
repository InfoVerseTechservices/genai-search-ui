import React, { useState } from 'react';
import { ThumbsDown } from 'lucide-react';

interface DislikeProps {
  messageId: string;
  chatId: string;
}

const Dislike: React.FC<DislikeProps> = ({ messageId, chatId }) => {
  const [isDisliked, setIsDisliked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDislike = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          chatId,
          type: 'dislike',
          action: isDisliked ? 'remove' : 'add'
        }),
      });

      if (response.ok) {
        setIsDisliked(!isDisliked);
      }
    } catch (error) {
      console.error('Dislike error:', error);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleDislike}
      disabled={loading}
      className={`py-2 px-3 rounded-xl hover:bg-light-secondary hover:text-black dark:hover:bg-dark-secondary transition duration-200 flex flex-row items-center space-x-1 ${
        isDisliked ? 'text-red-600 dark:text-red-400' : 'text-black dark:text-white'
      }`}
      title="Dislike this response"
    >
      <ThumbsDown size={18} fill={isDisliked ? 'currentColor' : 'none'} />
      <span className="text-sm font-medium">Dislike</span>
    </button>
  );
};

export default Dislike;