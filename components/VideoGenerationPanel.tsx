// components/VideoGenerationPanel.tsx
'use client';
 
import React, { useState, useEffect } from 'react';
import { generateVideo } from '@/lib/videoActions'; // This will be created in a future step

// Interface for the expected video data in the response from the page
interface VideoResponseData {
  b64_json?: string;
}

// Interface for the successful video generation API response (full structure)
export interface VideoGenerationSuccessResponse {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  data?: VideoResponseData[]; // Make data optional as it might not be present during processing
  status?: string; // To handle "processing" or other statuses
}

interface VideoGenerationPanelProps {
  onGenerationStart: (prompt: string) => void;
  onGenerationSuccess: (data: VideoGenerationSuccessResponse) => void;
  onGenerationFailure: (error: string) => void;
  onGenerationProcessing: (data: VideoGenerationSuccessResponse) => void; // For "processing" status
  isLoading: boolean;
  currentStatus?: string | null; // To display current status like "processing"
  // defaultModelName is fixed to "ltx-video" as per requirements, so not needed as a prop
}

const VideoGenerationPanel: React.FC<VideoGenerationPanelProps> = ({
  onGenerationStart,
  onGenerationSuccess,
  onGenerationFailure,
  onGenerationProcessing,
  isLoading,
  currentStatus,
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [guidanceScale, setGuidanceScale] = useState<number>(7.5);
  const [numFrames, setNumFrames] = useState<number>(65); // Default from API docs
  const [duration, setDuration] = useState<number>(1); // Default from API docs
  const [seed, setSeed] = useState<number>(0); // Default from API docs
  const [width, setWidth] = useState<number>(768); // Default from API docs
  const [height, setHeight] = useState<number>(512); // Default from API docs
  const [numInferenceSteps, setNumInferenceSteps] = useState<number>(50); // Default from API docs
  const [decodeTimestep, setDecodeTimestep] = useState<number>(0.03); // Default from API docs
  const [decodeNoiseScale, setDecodeNoiseScale] = useState<number>(0.025); // Default from API docs
  const [upscaleAndRefine, setUpscaleAndRefine] = useState<boolean>(false); // Default from API docs

  const [timer, setTimer] = useState<number>(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const MODEL_NAME = "ltx-video"; // Fixed model as per requirements

  useEffect(() => {
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
    return () => {
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

    onGenerationStart(prompt); // Notify page that generation is starting

    try {
      const params = {
        prompt,
        negative_prompt: negativePrompt,
        guidance_scale: guidanceScale,
        num_frames: numFrames,
        duration,
        model: MODEL_NAME as "ltx-video",
        seed,
        width,
        height,
        num_inference_steps: numInferenceSteps,
        decode_timestep: decodeTimestep,
        decode_noise_scale: decodeNoiseScale,
        upscale_and_refine: upscaleAndRefine,
      };

      const result = await generateVideo(params); // API call

      // Handle successful response with video data
      if (result.data && result.data.length > 0 && result.data[0].b64_json) {
        onGenerationSuccess(result);
      } else if (result.status === "processing" && result.id) {
        // Handle response indicating the job is processing
        onGenerationProcessing(result);
      } else {
        // Handle all other cases as failures (e.g., status: "failed", or unexpected response structure)
        const errorMessage = result.error || result.status || "Video data not found in response.";
        onGenerationFailure(errorMessage);
      }
    } catch (error: any) {
      onGenerationFailure(error.message || 'An unknown error occurred during video generation.');
    }
  };

  return (
    <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg bg-white dark:bg-gray-800">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Video Generation Settings</h2>

      <div className="space-y-5">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prompt</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="e.g., A serene beach with waves crashing, cinematic lighting"
          />
        </div>

        <div>
          <label htmlFor="negativePrompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Negative Prompt</label>
          <textarea
            id="negativePrompt"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="e.g., blurry, low quality, cartoonish"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div>
            <label htmlFor="width" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Width: {width}px</label>
            <input id="width" type="range" min="256" max="1024" step="64" value={width} onChange={e => setWidth(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"/>
          </div>
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Height: {height}px</label>
            <input id="height" type="range" min="256" max="1024" step="64" value={height} onChange={e => setHeight(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"/>
          </div>
          <div>
            <label htmlFor="num_frames" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Number of Frames: {numFrames}</label>
            <input id="num_frames" type="range" min="10" max="120" step="1" value={numFrames} onChange={e => setNumFrames(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"/>
          </div>
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration (seconds): {duration}</label>
            <input id="duration" type="range" min="1" max="10" step="0.5" value={duration} onChange={e => setDuration(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"/>
          </div>
           <div>
            <label htmlFor="guidanceScale" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Guidance Scale: {guidanceScale}</label>
            <input id="guidanceScale" type="range" min="1" max="20" step="0.1" value={guidanceScale} onChange={e => setGuidanceScale(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"/>
          </div>
          <div>
            <label htmlFor="numInferenceSteps" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Inference Steps: {numInferenceSteps}</label>
            <input id="numInferenceSteps" type="range" min="10" max="100" step="1" value={numInferenceSteps} onChange={e => setNumInferenceSteps(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"/>
          </div>
          <div>
            <label htmlFor="seed" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Seed</label>
            <input type="number" id="seed" value={seed} onChange={e => setSeed(parseInt(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"/>
          </div>
        </div>

        <div className="pt-2">
            <label htmlFor="modelName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Model</label>
            <input type="text" id="modelName" value={MODEL_NAME} readOnly className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm sm:text-sm dark:bg-gray-600 dark:text-gray-300 cursor-not-allowed"/>
        </div>

        {/* Advanced Settings (Collapsible or directly shown) */}
        {/* For simplicity, showing directly. Could be put in a details/summary tag */}
        <details className="mt-4 p-3 border dark:border-gray-600 rounded-md">
            <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Advanced Settings</summary>
            <div className="mt-3 space-y-4">
                 <div>
                    <label htmlFor="decodeTimestep" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Decode Timestep: {decodeTimestep}</label>
                    <input id="decodeTimestep" type="range" min="0.01" max="0.1" step="0.005" value={decodeTimestep} onChange={e => setDecodeTimestep(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"/>
                </div>
                <div>
                    <label htmlFor="decodeNoiseScale" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Decode Noise Scale: {decodeNoiseScale}</label>
                    <input id="decodeNoiseScale" type="range" min="0.01" max="0.1" step="0.005" value={decodeNoiseScale} onChange={e => setDecodeNoiseScale(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"/>
                </div>
                <div className="flex items-center">
                    <input id="upscaleAndRefine" type="checkbox" checked={upscaleAndRefine} onChange={e => setUpscaleAndRefine(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500"/>
                    <label htmlFor="upscaleAndRefine" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Upscale and Refine</label>
                </div>
            </div>
        </details>

      </div>

      <div className="mt-8">
        <button
          onClick={handleGenerateClick}
          disabled={isLoading || !prompt.trim()}
          className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 dark:disabled:bg-gray-500 transition ease-in-out duration-150"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {currentStatus === 'processing' ? `Processing... (${timer}s)` : `Generating... (${timer}s)`}
            </>
          ) : (
            'Generate Video'
          )}
        </button>
        {currentStatus && (
             <p className="mt-3 text-sm text-center text-gray-600 dark:text-gray-300">Status: {currentStatus}</p>
        )}
      </div>
    </div>
  );
};

export default VideoGenerationPanel;
