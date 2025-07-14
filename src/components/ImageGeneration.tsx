import { useState } from 'react';
import { Image, Download, Loader2, Code } from 'lucide-react';

interface ImageGenerationProps {
  onClose: () => void;
}

const ImageGeneration = ({ onClose }: ImageGenerationProps) => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState('1024x1024');
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [showRawData, setShowRawData] = useState(false);

  const generateImage = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          negative_prompt: negativePrompt.trim(),
          response_format: 'b64_json',
          size: imageSize,
          num_inference_steps: 25,
          guidance_scale: 7.5,
          n: 1,
        }),
      });

      const data = await response.json();
      setRawResponse(data);
      
      if (response.ok && data.data?.[0]?.b64_json) {
        setGeneratedImage(`data:image/png;base64,${data.data[0].b64_json}`);
      } else {
        console.error('Image generation failed:', data.error);
      }
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `generated-image-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Image size={20} />
          Generate Image
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
            placeholder="Describe the image you want to generate..."
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white resize-none"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Negative Prompt (Optional)</label>
          <textarea
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="What you don't want in the image..."
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white resize-none"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Image Size</label>
          <select
            value={imageSize}
            onChange={(e) => setImageSize(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
          >
            <option value="512x512">512x512 (Fast)</option>
            <option value="1024x1024">1024x1024 (Standard)</option>
            <option value="1536x1024">1536x1024 (Landscape)</option>
            <option value="1024x1536">1024x1536 (Portrait)</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={generateImage}
            disabled={!prompt.trim() || loading}
            className="flex-1 bg-[#24A0ED] text-white py-2 px-4 rounded-lg hover:bg-opacity-85 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Image'
            )}
          </button>
          {rawResponse && (
            <button
              onClick={() => setShowRawData(!showRawData)}
              className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-opacity-85 flex items-center gap-2"
            >
              <Code size={16} />
              Raw Data
            </button>
          )}
        </div>
      </div>

      {generatedImage && (
        <div className="space-y-3">
          <div className="relative">
            <img
              src={generatedImage}
              alt="Generated"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600"
              style={{ imageRendering: 'crisp-edges' }}
            />
            <button
              onClick={downloadImage}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      )}

      {showRawData && rawResponse && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Raw API Response:</h4>
          <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-xs overflow-auto max-h-64 border border-gray-300 dark:border-gray-600">
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ImageGeneration;