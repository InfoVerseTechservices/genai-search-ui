// components/ImageGenerationPanel.tsx
'use client';

import React from 'react';

interface ImageGenerationPanelProps {
  imageNegativePrompt: string;
  setImageNegativePrompt: (value: string) => void;
  imageModel: string;
  setImageModel: (value: string) => void;
  imageSize: string;
  setImageSize: (value: string) => void;
  imageGuidanceScale: number;
  setImageGuidanceScale: (value: number) => void;
  defaultModelName?: string;
}

const ImageGenerationPanel: React.FC<ImageGenerationPanelProps> = ({
  imageNegativePrompt,
  setImageNegativePrompt,
  imageModel,
  setImageModel,
  imageSize,
  setImageSize,
  imageGuidanceScale,
  setImageGuidanceScale,
  defaultModelName,
}) => {
  return (
    <div className="text-left w-full"> {/* Simplified classes */}
      <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Image Parameters</h3>
      <div className="space-y-2">
        <textarea
          value={imageNegativePrompt}
          onChange={(e) => setImageNegativePrompt(e.target.value)}
          placeholder="Negative prompt (e.g., blurry, ugly, watermark)"
          className="w-full p-2 border rounded-md text-xs sm:text-sm bg-white dark:bg-gray-700 dark:text-white dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500"
          rows={1}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            value={imageModel}
            onChange={(e) => setImageModel(e.target.value)}
            placeholder={defaultModelName ? `Model (default: ${defaultModelName})` : "Model (e.g., flux)"}
            className="w-full p-2 border rounded-md text-xs sm:text-sm bg-white dark:bg-gray-700 dark:text-white dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={imageSize}
            onChange={(e) => setImageSize(e.target.value)}
            className="w-full p-2 border rounded-md text-xs sm:text-sm bg-white dark:bg-gray-700 dark:text-white dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="512x512">512x512</option>
            <option value="1024x1024">1024x1024</option>
            {/* Add other sizes as needed */}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
            Guidance Scale: {imageGuidanceScale}
          </label>
          <input
            type="range"
            min="1"
            max="20"
            step="0.1"
            value={imageGuidanceScale}
            onChange={(e) => setImageGuidanceScale(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
          />
        </div>
      </div>
    </div>
  );
};

export default ImageGenerationPanel;
