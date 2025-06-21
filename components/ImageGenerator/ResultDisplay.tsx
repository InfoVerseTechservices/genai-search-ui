/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';

interface ImageResponseData {
  b64_json?: string;
  url?: string; // Though API spec says null for b64_json, keep for flexibility
  revised_prompt?: string;
}

interface ResultDisplayProps {
  imageData: {
    created: number;
    data: ImageResponseData[];
    id: string;
    object: string;
    model: string;
  } | null;
  prompt?: string; // Original prompt for display
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ imageData, prompt }) => {
  if (!imageData || imageData.data.length === 0) {
    return null; // Or a placeholder like <p>No image generated yet.</p>
  }

  const image = imageData.data[0];
  const imageUrl = image.b64_json ? `data:image/png;base64,${image.b64_json}` : image.url;

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    // Attempt to create a filename from prompt or use a generic one
    const filenamePrompt = prompt ? prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'generated_image';
    a.download = `${filenamePrompt}_${imageData.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="mt-6 p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Generated Image</h3>
      {imageUrl ? (
        <div className="space-y-4">
          <img
            src={imageUrl}
            alt={image.revised_prompt || prompt || 'Generated image'}
            className="rounded-lg w-full max-w-md mx-auto" // Adjust max-width as needed
          />
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold">Original Prompt:</span> {prompt}
            </p>
            {image.revised_prompt && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                <span className="font-semibold">Revised Prompt:</span> {image.revised_prompt}
              </p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              <span className="font-semibold">Model:</span> {imageData.model}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              <span className="font-semibold">ID:</span> {imageData.id}
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="w-full mt-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Download Image
          </button>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">Image data is not available.</p>
      )}
    </div>
  );
};

export default ResultDisplay;
