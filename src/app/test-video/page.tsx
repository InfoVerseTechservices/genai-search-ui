'use client';

import { useState } from 'react';

export default function TestVideoPage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const generateVideo = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          duration: 3,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.data?.[0]?.b64_json) {
        const videoData = `data:video/mp4;base64,${data.data[0].b64_json}`;
        setResult(videoData);
      } else {
        setResult('Error: ' + (data.error || 'No video data'));
      }
    } catch (error) {
      setResult('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Video Generation Test</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Video Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the video you want to generate..."
                className="w-full p-3 border rounded-lg resize-none"
                rows={3}
              />
            </div>
            
            <button
              onClick={generateVideo}
              disabled={!prompt.trim() || loading}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Generating...' : 'Generate Video'}
            </button>
          </div>
          
          {result && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Result:</h3>
              {result.startsWith('data:video') ? (
                <video controls className="w-full max-w-2xl rounded-lg">
                  <source src={result} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                  {result}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}