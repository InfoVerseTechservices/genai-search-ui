// --- Helper functions ---

// Time-based greeting depending on user's timezone
export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// Emoji generator
export const getRandomEmoji = (): string => {
  const emojis = ['👋', '🌟', '🚀', '💡', '🎯', '✨', '🔥', '💫', '🌈', '⚡'];
  return emojis[Math.floor(Math.random() * emojis.length)];
};

// Check if the user was recently active
export const isRecentlyActive = (lastActive?: string): boolean => {
  if (!lastActive) return false;
  const lastActiveTime = new Date(lastActive).getTime();
  const now = Date.now();
  const hourInMs = 60 * 60 * 1000;
  return (now - lastActiveTime) < hourInMs;
};