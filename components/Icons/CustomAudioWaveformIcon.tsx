// components/Icons/CustomAudioWaveformIcon.tsx
'use client';
import React from 'react';

interface CustomAudioWaveformIconProps {
  size?: number; // Approx size of the icon itself, not the button
  color?: string; // Color of the waveform lines, defaults to white
}

const CustomAudioWaveformIcon: React.FC<CustomAudioWaveformIconProps> = ({ size = 20, color = 'white' }) => {
  // Calculate bar heights and gaps based on overall size for some scalability
  // The user's CSS had specific heights (8, 16, 24px) and width (3px), gap (3px).
  // For simplicity with the animation, we'll stick to similar fixed-like proportions.
  // Total width of 5 bars * 3px width + 4 gaps * 3px = 15 + 12 = 27px.
  // Max height 24px. This fits well within a 48px button (user CSS) or a smaller one.
  // We'll use fixed px values from CSS for directness.

  const barBaseHeight = size / 3; // e.g., 20/3 = ~6.6px. Max height will be ~20px.
  const barWidth = size / 7; // e.g., 20/7 = ~2.8px
  const gap = size / 7;

  const heights = [barBaseHeight * 0.8, barBaseHeight * 1.6, barBaseHeight * 2.4, barBaseHeight * 1.6, barBaseHeight * 0.8];
  // Using heights from user CSS for direct match: 8, 16, 24, 16, 8
  const staticHeights = [8, 16, 24, 16, 8]; // these are for a 24px tall center bar
  // Scale these based on the 'size' prop, where 'size' refers to max height of the icon.
  const scaleFactor = size / 24; // Assuming 24px is the reference max height from user's CSS.

  const finalHeights = staticHeights.map(h => h * scaleFactor);
  const finalBarWidth = 3 * scaleFactor; // Original was 3px wide
  const finalGap = 3 * scaleFactor;      // Original was 3px gap

  return (
    <>
      <style jsx global>{`
        @keyframes pulseIconWave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.5); }
        }
        .waveform-bar {
          width: ${finalBarWidth}px;
          border-radius: ${1 * scaleFactor}px; /* original 1px */
          background-color: ${color};
          animation: pulseIconWave 1.2s infinite ease-in-out;
          transform-origin: center; /* Ensure scaling happens from center */
        }
      `}</style>
      <div className="waveform-icon flex items-center" style={{ gap: `${finalGap}px` }}>
        <span className="waveform-bar" style={{ height: `${finalHeights[0]}px`, animationDelay: '0s' }}></span>
        <span className="waveform-bar" style={{ height: `${finalHeights[1]}px`, animationDelay: '0.2s' }}></span>
        <span className="waveform-bar" style={{ height: `${finalHeights[2]}px`, animationDelay: '0.4s' }}></span>
        <span className="waveform-bar" style={{ height: `${finalHeights[3]}px`, animationDelay: '0.2s' }}></span>
        <span className="waveform-bar" style={{ height: `${finalHeights[4]}px`, animationDelay: '0s' }}></span>
      </div>
    </>
  );
};

export default CustomAudioWaveformIcon;
