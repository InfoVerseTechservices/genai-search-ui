import React from 'react';

interface ProfilePictureProps {
  image?: string;
  size?: number;
  className?: string;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  image,
  size = 42,
  className,
}) => {
  const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDIiIGhlaWdodD0iNDIiIHZpZXdCb3g9IjAgMCA0MiA0MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjEiIGN5PSIyMSIgcj0iMjEiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB4PSI5IiB5PSI5IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMiAxMkM5Ljc5IDEyIDggMTAuMjEgOCA4UzkuNzkgNDEyIDRTMTQuMjEgNiAxNiA4UzEyIDEwLjIxIDEyIDEyWk0xMiAxNEM3IDEzIDIgMTYgMiAyMFYyMkgyMlYyMEMxOCAxNiAxMyAxMyAxMiAxNFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHN2Zz4KPHN2Zz4=';
  
  return (
    <img
      src={image || defaultImage}
      alt="avatar"
      className={`rounded-full ${className || ''}`}
      width={size}
      height={size}
      onError={(e) => {
        e.currentTarget.src = defaultImage;
      }}
    />
  );
};

export default ProfilePicture;