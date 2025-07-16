import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useUserProfile } from '@/context/UserContext';

interface FavouriteProps {
  messageId: string;
  chatId: string;
  message: string;
  userMessage?: string;
}

const Favourite: React.FC<FavouriteProps> = ({ messageId, chatId, message, userMessage }) => {
  const { userDetails, isLoggedIn } = useUserProfile();
  const [isFavourite, setIsFavourite] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFavourite = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/favourite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          chatId,
          message,
          userMessage,
          userId: userDetails?.id || userDetails?._id,
          action: isFavourite ? 'remove' : 'add'
        }),
      });

      if (response.ok) {
        setIsFavourite(!isFavourite);
      }
    } catch (error) {
      console.error('Favourite error:', error);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleFavourite}
      disabled={loading}
      className={`py-2 px-3 rounded-xl hover:bg-light-secondary hover:text-black dark:hover:bg-dark-secondary transition duration-200 flex flex-row items-center space-x-1 ${
        isFavourite ? 'text-[rgb(30,113,242)] bg-[rgb(30,113,242,0.1)]' : 'text-black dark:text-white'
      }`}
      title="Add to favourites"
    >
      <Heart size={18} fill={isFavourite ? 'currentColor' : 'none'} />
      <span className="text-sm font-medium hidden sm:inline">Favourite</span>
    </button>
  );
};

export default Favourite;