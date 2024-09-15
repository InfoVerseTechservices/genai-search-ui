// Icons.tsx
import React from 'react';

interface FeedIconProps {
  w: string;
  h: string;
  fill: string;
}

export const FeedIcon: React.FC<FeedIconProps> = ({ w, h, fill }) => (
  <svg width={w} height={h} viewBox="0 0 24 24" fill={fill} xmlns="http://www.w3.org/2000/svg">
    {/* SVG path here */}
  </svg>
);
