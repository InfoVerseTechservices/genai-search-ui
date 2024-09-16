import React from 'react';

// Define the prop types
interface ProfilePictureProps {
  image?: string; // Optional URL for the image
  size?: number; // Optional size for the profile picture
  className?: string; // Optional additional class names
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({ image = '/images/profile/defalut_user.svg', size = 42, className }) => {
  return (
    <img
      src={image}
      alt="avatar"
      className={`rounded-full${className ? ` ${className}` : ''}`}
      style={{ height: size, width: size }}
    />
  );
};

export default ProfilePicture;
