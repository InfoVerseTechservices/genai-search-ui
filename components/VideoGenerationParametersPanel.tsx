// components/VideoGenerationParametersPanel.tsx
'use client';

import React from 'react';

// Define an interface for the component's props
export interface VideoGenParams {
  prompt: string; // This will be from the main input, not part of this panel's direct props for input
  negative_prompt?: string;
  guidance_scale?: number;
  num_frames?: number;
  duration?: number;
  model?: string; // Will be fixed to "ltx-video"
  seed?: number;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  decode_timestep?: number;
  decode_noise_scale?: number;
  upscale_and_refine?: boolean;
}

interface VideoGenerationParametersPanelProps {
  videoNegativePrompt: string;
  setVideoNegativePrompt: (value: string) => void;
  videoGuidanceScale: number;
  setVideoGuidanceScale: (value: number) => void;
  videoNumFrames: number;
  setVideoNumFrames: (value: number) => void;
  videoDuration: number;
  setVideoDuration: (value: number) => void;
  videoSeed: number;
  setVideoSeed: (value: number) => void;
  videoWidth: number;
  setVideoWidth: (value: number) => void;
  videoHeight: number;
  setVideoHeight: (value: number) => void;
  videoNumInferenceSteps: number;
  setVideoNumInferenceSteps: (value: number) => void;
  videoDecodeTimestep: number;
  setVideoDecodeTimestep: (value: number) => void;
  videoDecodeNoiseScale: number;
  setVideoDecodeNoiseScale: (value: number) => void;
  videoUpscaleAndRefine: boolean;
  setVideoUpscaleAndRefine: (value: boolean) => void;
  // Model is fixed, so no props for setting it.
}

const VideoGenerationParametersPanel: React.FC<VideoGenerationParametersPanelProps> = ({
  videoNegativePrompt, setVideoNegativePrompt,
  videoGuidanceScale, setVideoGuidanceScale,
  videoNumFrames, setVideoNumFrames,
  videoDuration, setVideoDuration,
  videoSeed, setVideoSeed,
  videoWidth, setVideoWidth,
  videoHeight, setVideoHeight,
  videoNumInferenceSteps, setVideoNumInferenceSteps,
  videoDecodeTimestep, setVideoDecodeTimestep,
  videoDecodeNoiseScale, setVideoDecodeNoiseScale,
  videoUpscaleAndRefine, setVideoUpscaleAndRefine,
}) => {
  const MODEL_NAME = "ltx-video"; // Fixed model as per requirements

  return (
    <div className="text-left w-full"> {/* Simplified classes */}
      <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-200">Video Parameters</h3>
      <div className="space-y-3">
        <textarea
          value={videoNegativePrompt}
          onChange={(e) => setVideoNegativePrompt(e.target.value)}
          placeholder="Negative prompt (e.g., blurry, low quality)"
          className="w-full p-2 border rounded-md text-xs sm:text-sm bg-white dark:bg-gray-700 dark:text-white dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500"
          rows={1}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Width: {videoWidth}px</label>
            <input type="range" min="256" max="1024" step="64" value={videoWidth} onChange={(e) => setVideoWidth(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Height: {videoHeight}px</label>
            <input type="range" min="256" max="1024" step="64" value={videoHeight} onChange={(e) => setVideoHeight(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Frames: {videoNumFrames}</label>
            <input type="range" min="10" max="120" step="1" value={videoNumFrames} onChange={(e) => setVideoNumFrames(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Duration: {videoDuration}s</label>
            <input type="range" min="1" max="10" step="0.5" value={videoDuration} onChange={(e) => setVideoDuration(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Guidance: {videoGuidanceScale}</label>
            <input type="range" min="1" max="20" step="0.1" value={videoGuidanceScale} onChange={(e) => setVideoGuidanceScale(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Steps: {videoNumInferenceSteps}</label>
            <input type="range" min="10" max="100" step="1" value={videoNumInferenceSteps} onChange={(e) => setVideoNumInferenceSteps(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Seed</label>
            <input type="number" value={videoSeed} onChange={(e) => setVideoSeed(parseInt(e.target.value) || 0)} className="w-full p-1.5 border rounded-md text-xs sm:text-sm bg-white dark:bg-gray-700 dark:text-white dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500" placeholder="Seed (e.g., 0)"/>
          </div>
          <div className="sm:col-span-2 md:col-span-1"> {/* Model display */}
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Model</label>
            <input type="text" value={MODEL_NAME} readOnly className="w-full p-1.5 border rounded-md text-xs sm:text-sm bg-gray-100 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 cursor-not-allowed" />
          </div>
        </div>

        <details className="pt-2">
          <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200">Advanced Settings</summary>
          <div className="mt-2 space-y-3 p-2 border-t dark:border-gray-600">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Decode Timestep: {videoDecodeTimestep}</label>
                <input type="range" min="0.01" max="0.1" step="0.005" value={videoDecodeTimestep} onChange={(e) => setVideoDecodeTimestep(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Decode Noise Scale: {videoDecodeNoiseScale}</label>
                <input type="range" min="0.01" max="0.1" step="0.005" value={videoDecodeNoiseScale} onChange={(e) => setVideoDecodeNoiseScale(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="videoUpscaleAndRefine"
                checked={videoUpscaleAndRefine}
                onChange={(e) => setVideoUpscaleAndRefine(e.target.checked)}
                className="h-3.5 w-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="videoUpscaleAndRefine" className="ml-2 text-xs text-gray-700 dark:text-gray-300">Upscale and Refine</label>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default VideoGenerationParametersPanel;
