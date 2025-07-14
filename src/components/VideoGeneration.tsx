import { useState } from 'react';
import { Video, Download, Loader2 } from 'lucide-react';

interface VideoGenerationProps {
  onClose: () => void;
}

const VideoGeneration = ({ onClose }: VideoGenerationProps) => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [duration, setDuration] = useState('3');
  const [quality, setQuality] = useState('standard');

  const generateVideo = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          negative_prompt: negativePrompt.trim(),
          duration: parseFloat(duration),
          guidance_scale: quality === 'high' ? 9.0 : 7.5,
          num_frames: quality === 'high' ? 120 : quality === 'standard' ? 90 : 65,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.data?.[0]?.b64_json) {
        setGeneratedVideo(`data:video/mp4;base64,${data.data[0].b64_json}`);
      } else {
        console.error('Video generation failed:', data.error);
      }
    } catch (error) {
      console.error('Error generating video:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadVideo = () => {
    if (!generatedVideo) return;
    
    const link = document.createElement('a');
    link.href = generatedVideo;
    link.download = `generated-video-${Date.now()}.mp4`;
    link.click();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Video size={20} />
          Generate Video
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the video you want to generate..."
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white resize-none"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Negative Prompt (Optional)</label>
          <textarea
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="What you don't want in the video..."
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white resize-none"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Duration (seconds)</label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
          >
            <option value="2">2 seconds (Fast)</option>
            <option value="3">3 seconds (Standard)</option>
            <option value="5">5 seconds (Long)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Quality</label>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
          >
            <option value="fast">Fast (65 frames)</option>
            <option value="standard">Standard (90 frames)</option>
            <option value="high">High Quality (120 frames)</option>
          </select>
        </div>

        <button
          onClick={generateVideo}
          disabled={!prompt.trim() || loading}
          className="w-full bg-[#24A0ED] text-white py-2 px-4 rounded-lg hover:bg-opacity-85 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Video'
          )}
        </button>
      </div>

      {generatedVideo && (
        <div className="space-y-3">
          <div className="relative">
            <video
              src={generatedVideo}
              controls
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600"
            />
            <button
              onClick={downloadVideo}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGeneration;