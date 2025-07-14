'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Star, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserProfile } from '@/context/UserContext';

interface FavoriteItem {
  chatId: string;
  messageId: string;
  title: string;
  content: string;
  type: string;
  createdAt: string;
}

const FavoritesPanel = ({ preloadedData, onDataChange }: { preloadedData?: any[]; onDataChange?: () => void }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { userDetails } = useUserProfile();
  const pathname = usePathname();

  const fetchFavorites = async () => {
    if (preloadedData && preloadedData.length >= 0) {
      const sortedFavorites = [...preloadedData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setFavorites(sortedFavorites);
      setLoading(false);
      return;
    }
    
    try {
      const userId = userDetails?.id || userDetails?._id;
      if (!userId) return;

      const response = await fetch(`/api/favourite?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        const sortedFavorites = (data.favourites || []).sort((a: FavoriteItem, b: FavoriteItem) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setFavorites(sortedFavorites);
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [userDetails, preloadedData]);

  const removeFavorite = async (chatId: string, messageId: string) => {
    try {
      const userId = userDetails?.id || userDetails?._id;
      if (!userId) return;
      
      const response = await fetch(`/api/favourite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, chatId, messageId, action: 'remove' }),
      });
      
      if (response.ok) {
        setFavorites(prev => prev.filter(fav => !(fav.chatId === chatId && fav.messageId === messageId)));
        onDataChange?.(); // Notify parent to refresh
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">Loading favorites...</div>;
  }

  if (!favorites.length) {
    return <div className="text-left text-gray-500 dark:text-gray-400 py-4 text-sm">No favorites yet</div>;
  }

  return (
    <div className="space-y-1">
      {favorites.map((favorite, index) => {
        const isActive = pathname === `/c/${favorite.chatId}`;
        return (
          <div
            key={`${favorite.chatId}-${favorite.messageId}-${index}`}
            className={cn(
              "group flex items-center justify-between px-2 py-1 rounded-md transition-colors",
              isActive
                ? "bg-red-100 dark:bg-red-900/50"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            <Link
              href={`/c/${favorite.chatId}`}
              className={cn(
                "flex-grow text-xs truncate",
                isActive
                  ? "text-red-600 dark:text-red-400 font-medium"
                  : "text-gray-600 dark:text-gray-400"
              )}
              title={favorite.title}
            >
              <div className="flex items-center gap-1">
                <Star size={12} className="flex-shrink-0" />
                {favorite.title}
              </div>
            </Link>
            
            <button
              onClick={() => removeFavorite(favorite.chatId, favorite.messageId)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
              aria-label="Remove from favorites"
            >
              <Trash2 className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default FavoritesPanel;