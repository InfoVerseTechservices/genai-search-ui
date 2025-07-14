import React, { useState } from 'react';
import { ThumbsUp } from 'lucide-react';

interface LikeProps {
  messageId: string;
  chatId: string;
}

const Like: React.FC<LikeProps> = ({ messageId, chatId }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
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
          type: 'like',
          action: isLiked ? 'remove' : 'add'
        }),
      });

      if (response.ok) {
        setIsLiked(!isLiked);
      }
    } catch (error) {
      console.error('Like error:', error);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`py-2 px-3 rounded-xl hover:bg-light-secondary hover:text-black dark:hover:bg-dark-secondary transition duration-200 flex flex-row items-center space-x-1 ${
        isLiked ? 'text-green-600 dark:text-green-400' : 'text-black dark:text-white'
      }`}
      title="Like this response"
    >
      <ThumbsUp size={18} fill={isLiked ? 'currentColor' : 'none'} />
      <span className="text-sm font-medium">Like</span>
    </button>
  );
};

export default Like;