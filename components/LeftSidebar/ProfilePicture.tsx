import React from 'react';
import Image from 'next/image';

// Define the prop types
interface ProfilePictureProps {
  image?: string; // Optional URL for the image
  size?: number; // Optional size for the profile picture
  className?: string; // Optional additional class names
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  image = '/images/profile/defalut_user.svg',
  size = 42,
  className,
}) => {
  return (
    // <Image
    //   src={image}
    //   alt="avatar"
    //   className={`rounded-full${className ? ` ${className}` : ''}`}
    //   width={size}
    //   height={size}
    //   referrerPolicy={'no-referrer'}
    // />
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image}
      alt="avatar"
      className={`rounded-full ${className}`}
      width={size}
      height={size}
    />
  );
};

export default ProfilePicture;
