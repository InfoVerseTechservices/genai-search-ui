// app/image-generator/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import InputPanel from '@/components/ImageGenerator/InputPanel';
import ResultDisplay from '@/components/ImageGenerator/ResultDisplay';
import { toast } from 'sonner';
// No longer need ApiConfigParams from lib/imageActions

interface ImageResponseData {
  b64_json?: string;
  url?: string;
  revised_prompt?: string;
}

interface ImageGenerationSuccessResponse {
  created: number;
  data: ImageResponseData[];
  id: string;
  object: string;
  model: string;
}

const ImageGeneratorPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageData, setImageData] = useState<ImageGenerationSuccessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');

  // Removed apiConfig state
  const [defaultModelDisplay, setDefaultModelDisplay] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Optionally, still load default model name for display purposes
    const modelNameFromEnv = process.env.NEXT_PUBLIC_COLOMBO_DEFAULT_MODEL;
    if (modelNameFromEnv) {
      setDefaultModelDisplay(modelNameFromEnv);
    }
    // No longer need to check for API_KEY or API_URL here for the client
    // The server-side proxy handles that.
    // User will be instructed to set server-side env vars (COLOMBO_API_KEY, etc.)
  }, []);

  const handleGenerationStart = (promptValue: string) => {
    setIsLoading(true);
    setError(null);
    setImageData(null);
    setCurrentPrompt(promptValue);
  };

  const handleGenerationSuccess = (data: ImageGenerationSuccessResponse) => {
    setIsLoading(false);
    setImageData(data);
    toast.success('Image generated successfully!');
  };

  const handleGenerationFailure = (errorMessage: string) => {
    setIsLoading(false);
    setError(errorMessage);
    toast.error(`Error generating image: ${errorMessage}`);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">AI Image Generator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="md:sticky md:top-8">
          <InputPanel
            onGenerationStart={handleGenerationStart}
            onGenerationSuccess={handleGenerationSuccess}
            onGenerationFailure={handleGenerationFailure}
            isLoading={isLoading}
            defaultModelName={defaultModelDisplay} // Pass for display
            // Removed apiConfig prop
          />
        </div>
        <div className="mt-6 md:mt-0">
          {error && !isLoading && (
            <div className="p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200" role="alert">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}
          {isLoading && (
            <div className="flex flex-col justify-center items-center p-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg min-h-[300px]">
              <svg className="animate-spin h-10 w-10 text-indigo-600 dark:text-indigo-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg text-gray-600 dark:text-gray-300">Generating image, please wait...</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">This may take a moment.</p>
            </div>
          )}
          {!isLoading && !error && imageData && (
            <ResultDisplay imageData={imageData} prompt={currentPrompt} />
          )}
          {!isLoading && !imageData && !error && (
            <div className="flex flex-col justify-center items-center p-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg min-h-[300px] text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-gray-500 mb-4">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
              <p className="text-lg text-gray-500 dark:text-gray-400">Your generated image will appear here.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Enter a prompt and click &quot;Generate Image&quot; to start.</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Ensure server API settings are configured.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGeneratorPage;
