import { useState } from 'react';
import { X, Play, Pause, Download } from 'lucide-react';

interface AudioGenerationProps {
  onClose: () => void;
}

const AudioGeneration = ({ onClose }: AudioGenerationProps) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const generateAudio = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      const data = await response.json();
      const binaryString = atob(data.data[0].b64_json);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: 'audio/wav' });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (error) {
      console.error('Audio generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (!audioUrl) return;
    
    if (isPlaying) {
      audio?.pause();
      setIsPlaying(false);
    } else {
      const newAudio = new Audio(audioUrl);
      newAudio.play();
      newAudio.onended = () => setIsPlaying(false);
      setAudio(newAudio);
      setIsPlaying(true);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = 'generated-audio.wav';
    a.click();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Generate Audio</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <X size={20} />
        </button>
      </div>
      
      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the audio you want to generate..."
          className="w-full p-3 border rounded-lg resize-none h-24 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
        />
        
        <button
          onClick={generateAudio}
          disabled={!prompt.trim() || isGenerating}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate Audio'}
        </button>
        
        {audioUrl && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <button onClick={togglePlayback} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <span className="flex-1 text-sm">Generated Audio</span>
            <button onClick={downloadAudio} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
              <Download size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioGeneration;