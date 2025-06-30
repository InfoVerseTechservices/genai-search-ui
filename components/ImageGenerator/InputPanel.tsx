// components/ImageGenerator/InputPanel.tsx
'use client';

import React, { useState, useEffect } from 'react';
// generateImage no longer needs ApiConfigParams
import { generateImage } from '@/lib/imageActions';

interface InputPanelProps {
  onGenerationStart: (prompt: string) => void;
  onGenerationSuccess: (data: any) => void;
  onGenerationFailure: (error: string) => void;
  isLoading: boolean;
  // Removed apiConfig prop
  defaultModelName?: string; // Optional: To display default model info from env
}

const InputPanel: React.FC<InputPanelProps> = ({
  onGenerationStart,
  onGenerationSuccess,
  onGenerationFailure,
  isLoading,
  defaultModelName, // Optional prop
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [size, setSize] = useState<string>('512x512');
  const [guidanceScale, setGuidanceScale] = useState<number>(7.5);
  const [model, setModel] = useState<string>(''); // User's model choice
  const [timer, setTimer] = useState<number>(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Timer logic remains the same
     if (isLoading) {
      const id = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
      setIntervalId(id);
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      setTimer(0);
    }
    return () => { // eslint-disable-next-line react-hooks/exhaustive-deps
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId, isLoading]);

  const handleGenerateClick = async () => {
    if (!prompt.trim()) {
      onGenerationFailure("Prompt cannot be empty.");
      return;
    }
    // No more apiConfig check here

    onGenerationStart(prompt);
    try {
      const params = {
        prompt,
        negative_prompt: negativePrompt,
        size,
        guidance_scale: guidanceScale,
        model: model.trim() || undefined, // Pass user model choice, or undefined to use proxy's default
        response_format: 'b64_json' as 'b64_json',
      };
      // generateImage no longer takes apiConfig
      const result = await generateImage(params);

      // Assuming result directly is the success data or includes an error field if that's how generateImage is modified
      // Based on current generateImage, it throws on error, so a direct non-error result is success.
      onGenerationSuccess(result);
    } catch (error: any) {
      // Error message is now directly from the rethrown error in generateImage
      onGenerationFailure(error.message || 'An unknown error occurred.');
    }
  };

  // JSX for the component:
  // The placeholder for the model input can be updated if defaultModelName is provided.
  // The button's disabled state no longer depends on apiConfig.
  return (
    <div className="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Image Generation</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prompt</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            placeholder="A futuristic cityscape at night..."
          />
        </div>

        <div>
          <label htmlFor="negativePrompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Negative Prompt</label>
          <textarea
            id="negativePrompt"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            placeholder="ugly, blurry, watermark..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="size" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image Size</label>
            <select
              id="size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="512x512">512x512</option>
            </select>
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Model</label>
            <input
              type="text"
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              placeholder={defaultModelName ? `Default: ${defaultModelName}` : "e.g., flux, bagel"}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Leave empty to use server default model.</p>
          </div>
        </div>

        <div>
          <label htmlFor="guidanceScale" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Guidance Scale: {guidanceScale}
          </label>
          <input
            id="guidanceScale"
            type="range"
            min="1"
            max="20"
            step="0.1"
            value={guidanceScale}
            onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
      <div className="mt-6">
        <button
          onClick={handleGenerateClick}
          disabled={isLoading || !prompt.trim()} // No longer disabled by apiConfig presence
          className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 dark:disabled:bg-gray-500"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating... ({timer}s)
            </>
          ) : (
            'Generate Image'
          )}
        </button>
        {/* Removed message about apiConfig loading/missing */}
      </div>
    </div>
  );
};
export default InputPanel;
