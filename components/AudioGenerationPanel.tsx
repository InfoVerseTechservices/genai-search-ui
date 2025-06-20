// components/AudioGenerationPanel.tsx
'use client';

import React from 'react';

interface AudioGenerationPanelProps {
  audioNegativePrompt: string;
  setAudioNegativePrompt: (value: string) => void;
  audioDuration: number;
  setAudioDuration: (value: number) => void;
  audioSeed: number;
  setAudioSeed: (value: number) => void;
  audioModel: string;
  setAudioModel: (value: string) => void;
  defaultModelName?: string; // For placeholder text in model input
}

const AudioGenerationPanel: React.FC<AudioGenerationPanelProps> = ({
  audioNegativePrompt,
  setAudioNegativePrompt,
  audioDuration,
  setAudioDuration,
  audioSeed,
  setAudioSeed,
  audioModel,
  setAudioModel,
  defaultModelName,
}) => {
  return (
    <div className="text-left w-full"> {/* Simplified classes */}
      <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Audio Parameters</h3>
      <div className="space-y-2">
        <textarea
          value={audioNegativePrompt}
          onChange={(e) => setAudioNegativePrompt(e.target.value)}
          placeholder="Negative prompt (e.g., Low quality.)"
          className="w-full p-2 border rounded-md text-xs sm:text-sm bg-white dark:bg-gray-700 dark:text-white dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500"
          rows={1}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            value={audioModel}
            onChange={(e) => setAudioModel(e.target.value)}
            placeholder={defaultModelName ? `Model (default: ${defaultModelName})` : "Model (e.g., stable-audio-open-1.0)"}
            className="w-full p-2 border rounded-md text-xs sm:text-sm bg-white dark:bg-gray-700 dark:text-white dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="number"
            value={audioSeed}
            onChange={(e) => setAudioSeed(parseInt(e.target.value, 10) || 0)}
            placeholder="Seed (e.g., 0)"
            className="w-full p-2 border rounded-md text-xs sm:text-sm bg-white dark:bg-gray-700 dark:text-white dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
            Duration (seconds): {audioDuration}s
          </label>
          <input
            type="range"
            min="1"  // Assuming minimum 1 second duration
            max="30"  // Assuming max 30 seconds, adjust as needed
            step="1"
            value={audioDuration}
            onChange={(e) => setAudioDuration(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
          />
        </div>
      </div>
    </div>
  );
};

export default AudioGenerationPanel;
