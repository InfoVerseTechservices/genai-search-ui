import React from 'react';

interface CustomAudioWaveformIconProps {
  size?: number;
  color?: string;
}

const CustomAudioWaveformIcon: React.FC<CustomAudioWaveformIconProps> = ({ 
  size = 20, 
  color = 'currentColor' 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="10" width="2" height="4" rx="1" fill={color} />
      <rect x="7" y="6" width="2" height="12" rx="1" fill={color} />
      <rect x="11" y="8" width="2" height="8" rx="1" fill={color} />
      <rect x="15" y="4" width="2" height="16" rx="1" fill={color} />
      <rect x="19" y="9" width="2" height="6" rx="1" fill={color} />
    </svg>
  );
};

export default CustomAudioWaveformIcon;