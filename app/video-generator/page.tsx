'use client'; // This page needs to be a client component for useState and event handlers

import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import VideoGeneratorForm from '@/components/VideoGeneratorForm';
import VideoPlayer from '@/components/VideoPlayer';
// Removed fs, path, toml imports

interface FormData {
  prompt: string;
  negativePrompt: string;
  guidanceScale: number;
  numFrames: number;
  duration: number;
  width: number;
  height: number;
  inferenceSteps: number;
  upscaleAndRefine: boolean;
}

// This function will run on the server during build or initial load if called directly,
// or can be called from a server action/route handler if needed dynamically post-load.
// For this setup, getApiConfig is called within handleGenerateVideo, which is fine as it's
// an event handler in a client component that can call server-side logic if it were a server action.
// Here, it's assumed getApiConfig can run server-side, or its logic is adapted.
// To make fs/toml work in a client component handler, this would ideally be a server action.
// Old getApiConfig function is removed.


const VideoGeneratorPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [generatedVideoData, setGeneratedVideoData] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup timer on component unmount
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const handleGenerateVideo = async (formData: FormData) => {
    console.log("VIDEO_GENERATOR_PAGE_LOG: handleGenerateVideo CALLED - Fetching config from /api/get-config/");
    setIsLoading(true);
    setError(null);
    setGeneratedVideoData(null);
    setVideoId(null);
    setElapsedTime(0);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime(prevTime => prevTime + 1);
    }, 1000);

    let apiConfig;
    try {
      const configResponse = await fetch('/api/get-config/'); 
      if (!configResponse.ok) {
        const errorData = await configResponse.json().catch(() => ({ error: "Failed to fetch API config, server returned an error" }));
        throw new Error(errorData.error || `Failed to fetch API config: ${configResponse.statusText}`);
      }
      apiConfig = await configResponse.json();
    } catch (configError) {
      setError(configError instanceof Error ? configError.message : String(configError));
      setIsLoading(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    // Check if the fetched API configuration is valid
    // The API route /api/get-config now handles the "your_api_key_here" check
    // and returns a 500 or 400 error if config is missing or placeholder.
    // The client-side fetch handles these HTTP errors above.
    // So, if we reach here and apiConfig is populated, it should be valid.
    // We still check for the presence of keys as a safeguard.
    if (!apiConfig || !apiConfig.apiKey || !apiConfig.apiUrl || !apiConfig.modelName) {
      setError("Invalid API configuration received. Please check server logs and config.toml.");
      setIsLoading(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }


    const requestBody = {
      prompt: formData.prompt,
      negative_prompt: formData.negativePrompt,
      guidance_scale: formData.guidanceScale,
      num_frames: formData.numFrames,
      duration: formData.duration,
      width: formData.width,
      height: formData.height,
      num_inference_steps: formData.inferenceSteps,
      upscale_and_refine: formData.upscaleAndRefine,
      model_name: apiConfig.modelName,
      // seed: 0, // As per curl example, though not in form
      // strength: 0, // As per curl example, though not in form
    };

    try {
      // Use the proxy route instead of calling the external API directly
      const response = await fetch(`/api/generate-video-proxy`, {
        method: 'POST',
        headers: {
          // The proxy will set 'accept' and 'Authorization'
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.length > 0 && result.data[0].b64_json) {
          setGeneratedVideoData(result.data[0].b64_json);
          setVideoId(result.id || `generated-${Date.now()}`); // Use result.id or fallback
        } else {
          setError("Video data not found in API response.");
          console.error("Unexpected response structure:", result);
        }
      } else {
        let errorDetail = `API returned status ${response.status} ${response.statusText}`;
        try {
          const errorResult = await response.json();
          errorDetail = errorResult.detail || errorResult.message || JSON.stringify(errorResult);
        } catch (e) { /* Ignore if response is not JSON or parsing fails */ }
        setError(`Error generating video: ${errorDetail}`);
        console.error("API Error from mc1.colomboai.com:", errorDetail, "Status:", response.status, "Response:", response);
      }
    } catch (err) {
      setError(`Network or other error: ${err instanceof Error ? err.message : String(err)}`);
      console.error("Fetch/Network Error:", err);
    } finally {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Video Generator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 text-gray-700">Video Settings</h2>
            <VideoGeneratorForm onSubmit={handleGenerateVideo} isLoading={isLoading} />
          </div>

          <div className="lg:col-span-2">
            {isLoading && (
              <div className="mb-6 p-4 text-center bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded-lg shadow-md">
                <div className="flex justify-center items-center mb-2">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-lg font-medium">Generating video... Please wait.</p>
                </div>
                <p className="text-sm">Elapsed Time: {elapsedTime} seconds</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 text-center bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}

            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Generated Video</h2>
            <VideoPlayer videoData={generatedVideoData} videoId={videoId || undefined} videoType="mp4" />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VideoGeneratorPage;
