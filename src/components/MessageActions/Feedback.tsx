import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface FeedbackProps {
  messageId: string;
  chatId: string;
}

const Feedback: React.FC<FeedbackProps> = ({ messageId, chatId }) => {
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFeedback = async (type: 'like' | 'dislike') => {
    setLoading(true);
    const newFeedback = feedback === type ? null : type;
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          chatId,
          type,
          action: newFeedback ? 'add' : 'remove'
        }),
      });

      if (response.ok) {
        setFeedback(newFeedback);
      }
    } catch (error) {
      console.error('Feedback error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-row items-center space-x-1">
      <button
        onClick={() => handleFeedback('like')}
        disabled={loading}
        className={`py-2 px-3 rounded-xl hover:bg-light-secondary hover:text-black dark:hover:bg-dark-secondary transition duration-200 flex flex-row items-center space-x-1 ${
          feedback === 'like' ? 'text-[rgb(30,113,242)] bg-[rgb(30,113,242,0.1)]' : 'text-black dark:text-white'
        }`}
        title="Like this response"
      >
        <ThumbsUp size={18} fill={feedback === 'like' ? 'currentColor' : 'none'} />
        <span className="text-sm font-medium hidden sm:inline">Like</span>
      </button>
      
      <button
        onClick={() => handleFeedback('dislike')}
        disabled={loading}
        className={`py-2 px-3 rounded-xl hover:bg-light-secondary hover:text-black dark:hover:bg-dark-secondary transition duration-200 flex flex-row items-center space-x-1 ${
          feedback === 'dislike' ? 'text-[rgb(30,113,242)] bg-[rgb(30,113,242,0.1)]' : 'text-black dark:text-white'
        }`}
        title="Dislike this response"
      >
        <ThumbsDown size={18} fill={feedback === 'dislike' ? 'currentColor' : 'none'} />
        <span className="text-sm font-medium hidden sm:inline">Dislike</span>
      </button>
    </div>
  );
};

export default Feedback;