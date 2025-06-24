// app/video-generator/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import VideoGenerationPanel from '@/components/VideoGenerationPanel'; // This will be created in the next step
import { toast } from 'sonner';

// Interface for the expected video data in the response
interface VideoResponseData {
  b64_json?: string; // Assuming b64_json will be used for video
  // Potentially other fields like 'url' if the API might return a direct link
}

// Interface for the successful video generation API response
interface VideoGenerationSuccessResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  data: VideoResponseData[];
  status?: string; // To store status like "processing"
}

const VideoGeneratorPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [videoData, setVideoData] = useState<VideoGenerationSuccessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [status, setStatus] = useState<string | null>(null); // For "processing", "success", etc.

  useEffect(() => {
    // Placeholder for any initial setup, if needed.
    // For example, checking if API keys are set on the server (though this page won't handle it directly).
    // For now, we can keep this empty or log a message.
    console.log("Video Generator Page Initialized");
  }, []);

  const handleGenerationStart = (promptValue: string) => {
    setIsLoading(true);
    setError(null);
    setVideoData(null);
    setCurrentPrompt(promptValue);
    setStatus("processing"); // Set status to processing
    toast.info('Video generation started...');
  };

  const handleGenerationSuccess = (data: VideoGenerationSuccessResponse) => {
    setIsLoading(false);
    setVideoData(data);
    setStatus(data.status || "success"); // Use status from response or default to success
    toast.success('Video generated successfully!');
  };

  const handleGenerationFailure = (errorMessage: string) => {
    setIsLoading(false);
    setError(errorMessage);
    setStatus("error");
    toast.error(`Error generating video: ${errorMessage}`);
  };

  const handleGenerationProcessing = (processingData: VideoGenerationSuccessResponse) => {
    // This function can be used if the API first returns a "processing" status
    // and then later updates with the actual video data.
    // For now, we assume the API might return "processing" as part of the initial response.
    setIsLoading(true); // Keep loading true
    setVideoData(processingData); // Store minimal data if available
    setStatus(processingData.status || "processing");
    toast.info('Video is processing...');
  };


  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">AI Video Generator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="md:sticky md:top-8">
          {/* VideoGenerationPanel will be created in the next step */}
          <VideoGenerationPanel
            onGenerationStart={handleGenerationStart}
            onGenerationSuccess={handleGenerationSuccess}
            onGenerationFailure={handleGenerationFailure}
            onGenerationProcessing={handleGenerationProcessing} // Pass the new handler
            isLoading={isLoading}
            currentStatus={status} // Pass current status
            // defaultModelName={"ltx-video"} // As specified
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
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {status === 'processing' ? 'Processing video, please wait...' : 'Generating video, please wait...'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">This may take a some time.</p>
            </div>
          )}
          {!isLoading && !error && videoData && videoData.data && videoData.data.length > 0 && videoData.data[0].b64_json && (
            // Video Player Display
            <div className="flex flex-col items-center p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg">
                <video
                    key={videoData.id} // Use a key to force re-render if videoData changes
                    controls
                    autoPlay
                    loop
                    className="w-full max-w-md rounded-lg shadow-lg"
                    src={`data:video/mp4;base64,${videoData.data[0].b64_json}`} // Assuming MP4, adjust if different
                >
                    Your browser does not support the video tag.
                </video>
                {videoData.status && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Status: {videoData.status}</p>
                )}
                {currentPrompt && (
                     <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Prompt: {currentPrompt}</p>
                )}
            </div>
          )}
          {!isLoading && !videoData && !error && (
            // Initial placeholder before generation
            <div className="flex flex-col justify-center items-center p-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg min-h-[300px] text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-gray-500 mb-4">
                <path d="M15.5 13.5c0 2.485 0 4.5-2.5 4.5s-2.5-2.015-2.5-4.5S10.5 9 13 9s2.5 2.015 2.5 4.5z"/>
                <path d="M2 10s1.5-2 5-2 5 2 5 2" />
                <path d="M22 10s-1.5-2-5-2-5 2-5 2" />
                <path d="M12 16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4" />
                <path d="M12 16v-4" />
                <path d="M20 12v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-4" />
              </svg>
              <p className="text-lg text-gray-500 dark:text-gray-400">Your generated video will appear here.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Enter a prompt and click "Generate Video" to start.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoGeneratorPage;
