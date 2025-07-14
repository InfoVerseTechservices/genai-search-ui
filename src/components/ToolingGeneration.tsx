import { useState } from 'react';
import { X, Send, Loader2, Copy, Check } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';

interface ToolingGenerationProps {
  onClose: () => void;
  selectedTools?: string[];
}

interface ToolOption {
  id: string;
  name: string;
  description: string;
}

const availableTools: ToolOption[] = [
  { id: 'generate_image', name: '🎨 Generate Image', description: 'Create stunning images from text descriptions' },
  { id: 'search', name: '🔍 Web Search', description: 'Search the web for current information' },
  { id: 'multi_modal_understanding', name: '👁️ Multi Modal Understanding', description: 'Understand and analyze images, videos, and other media' },
  { id: 'edit_image', name: '✏️ Edit Image', description: 'Edit and modify existing images' },
  { id: 'generate_speech', name: '🗣️ Generate Speech', description: 'Convert text to natural speech' },
  { id: 'generate_audio', name: '🎵 Generate Audio', description: 'Generate audio clips and sound effects' },
  { id: 'generate_video', name: '🎬 Generate Video', description: 'Create videos from text prompts' },
];

const ToolingGeneration = ({ onClose, selectedTools = [] }: ToolingGenerationProps) => {
  const [prompt, setPrompt] = useState('');
  const [tools, setTools] = useState<string[]>(selectedTools);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const toggleTool = (toolId: string) => {
    setTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const renderRichContent = (content: string): JSX.Element => {
    // Handle web search responses with structured results
    if (content.includes('**Category**:') || content.includes('**Title**:') || content.includes('**URL**:')) {
      return renderWebSearchContent(content);
    }
    
    // Process line by line for better control
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      if (!trimmed) {
        elements.push(<br key={index} />);
        return;
      }
      
      // Headers
      if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4 key={index} className="text-base font-semibold mt-4 mb-2 text-blue-700 dark:text-blue-400">
            {trimmed.slice(5)}
          </h4>
        );
      } else if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-white">
            {trimmed.slice(4)}
          </h3>
        );
      } else if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-xl font-bold mt-5 mb-3 text-gray-900 dark:text-white">
            {trimmed.slice(3)}
          </h2>
        );
      } else if (trimmed.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">
            {trimmed.slice(2)}
          </h1>
        );
      }
      // List items
      else if (trimmed.match(/^[-*+]\s/)) {
        const content = trimmed.replace(/^[-*+]\s/, '');
        const formatted = content
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')
          .replace(/\[([^\]]+)\]/g, '<span class="text-blue-600 dark:text-blue-400 font-medium">[$1]</span>');
        
        elements.push(
          <li key={index} className="ml-6 mb-2 text-gray-800 dark:text-gray-200 list-disc" 
              dangerouslySetInnerHTML={{ __html: formatted }} />
        );
      }
      // Regular paragraphs
      else {
        const formatted = trimmed
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')
          .replace(/\*([^*]+)\*/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>')
          .replace(/\[([^\]]+)\]/g, '<span class="text-blue-600 dark:text-blue-400 font-medium">[$1]</span>')
          .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-red-600 dark:text-red-400">$1</code>');
        
        elements.push(
          <p key={index} className="mb-3 text-gray-800 dark:text-gray-200 leading-relaxed" 
             dangerouslySetInnerHTML={{ __html: formatted }} />
        );
      }
    });
    
    return <div className="space-y-1">{elements}</div>;
  };

  const renderWebSearchContent = (content: string): JSX.Element => {
    // Check if content has embedded search results in response
    const hasSearchResults = content.includes('**Category**:') || content.includes('**Title**:') || content.includes('**URL**:');
    
    if (hasSearchResults) {
      // Parse structured search results
      const resultPattern = /\*\*Category\*\*:\s*([^\n]+)\s*\n\s*-\s*\*\*Title\*\*:\s*([^\n]+)\s*\n\s*-\s*\*\*URL\*\*:\s*([^\n]+)\s*\n\s*-\s*\*\*Snippet\*\*:\s*([^\n]+(?:\n(?!\*\*Category\*\*)[^\n]*)*)/g;
      const results = [];
      let match;
      
      while ((match = resultPattern.exec(content)) !== null) {
        results.push({
          category: match[1].trim(),
          title: match[2].trim(),
          url: match[3].trim(),
          snippet: match[4].trim()
        });
      }
      
      if (results.length > 0) {
        // Split content into response text and search results
        const responseText = content.split(/\*\*Category\*\*:/)[0].trim();
        
        return (
          <div className="space-y-6">
            {responseText && (
              <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
                {renderRichContent(responseText)}
              </div>
            )}
            
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">🔍 Sources</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">({results.length} results)</span>
              </div>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-start gap-3">
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-sm mt-1">[{index + 1}]</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-1">
                          <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {result.title.replace(/\s*\(via\s*\*[^*]+\*\)$/, '')}
                          </a>
                        </h4>
                        <p className="text-green-600 dark:text-green-400 text-xs mb-2 break-all">
                          {result.url}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                          {result.snippet}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
    }
    
    // Fallback to rich content rendering
    return renderRichContent(content);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setResponse('Please enter a prompt.');
      return;
    }
    if (tools.length === 0) {
      setResponse('Please select at least one tool.');
      return;
    }

    setIsLoading(true);
    setIsStreaming(true);
    setResponse('');
    setArtifacts([]);

    try {
      const response = await fetch('/api/tooling-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          tools,
          stream: true,
          max_output_tokens: 1024,
          temperature: 1,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let currentArtifacts: any[] = [];

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line === '[DONE]') break;
          
          try {
            let jsonData;
            
            // Handle 'data: ' prefixed responses
            if (line.startsWith('data: ')) {
              jsonData = JSON.parse(line.substring(6));
            } else if (line.startsWith('[status]')) {
              jsonData = JSON.parse(line.replace('[status] ', ''));
            } else {
              jsonData = JSON.parse(line);
            }
            
            // Extract text from the response
            if (jsonData.output_text_delta?.text) {
              const text = jsonData.output_text_delta.text;
              const isGenerationTool = tools.some(tool => 
                ['generate_image', 'generate_video', 'generate_audio', 'generate_speech'].includes(tool)
              );
              
              // For generation tools, skip all text - only show artifacts
              if (isGenerationTool) {
                // Skip all text for generation tools
                return;
              }
              
              // For search/text tools, show text but skip system messages
              if (!text.includes('[Generating response...]') && 
                  !text.includes('<tool>') && 
                  !text.includes('</tool>')) {
                fullResponse += text;
                setResponse(fullResponse);
              }
            }
            // Handle artifacts (images, videos, audio)
            else if (jsonData.artifacts && Object.keys(jsonData.artifacts).length > 0) {
              currentArtifacts = Object.values(jsonData.artifacts);
              setArtifacts(currentArtifacts);
              
              const isGenerationTool = tools.some(tool => 
                ['generate_image', 'generate_video', 'generate_audio', 'generate_speech'].includes(tool)
              );
              
              // For generation tools, show minimal success message
              if (isGenerationTool && currentArtifacts.length > 0) {
                setResponse('✨ Content generated successfully!');
              }
            }
            // Handle tool responses that might contain artifacts
            else if (jsonData.tool_response_delta && jsonData.tool_response_delta.artifacts) {
              const toolArtifacts = Object.values(jsonData.tool_response_delta.artifacts);
              currentArtifacts = [...currentArtifacts, ...toolArtifacts];
              setArtifacts(currentArtifacts);
            }
            // Handle search results
            else if (jsonData.search_results && jsonData.search_results.length > 0) {
              const searchText = jsonData.search_results.map((result: any) => 
                `**Category**: ${result.category || 'General'}\n- **Title**: ${result.title}\n- **URL**: ${result.url}\n- **Snippet**: ${result.snippet}\n`
              ).join('\n');
              fullResponse += searchText;
              setResponse(fullResponse);
            }
            // Handle completion status
            else if (jsonData.status === 'completed' || jsonData.finish_reason) {
              // Check if we have artifacts but no response text for generation tools
              if (currentArtifacts.length > 0 && !fullResponse.trim()) {
                const artifactTypes = currentArtifacts.map((a: any) => a.type).join(', ');
                fullResponse = `✨ Successfully generated ${artifactTypes}!`;
                setResponse(fullResponse);
              }
            }
            // Handle other response formats
            else if (jsonData.type === 'response') {
              fullResponse += jsonData.data;
              setResponse(fullResponse);
            }
          } catch (e) {
            // Skip parsing errors for non-JSON lines
            console.warn('Failed to parse chunk:', line.substring(0, 100), e);
          }
        }
      }
      
      // Final check for artifacts after streaming completes
      const isGenerationTool = tools.some(tool => 
        ['generate_image', 'generate_video', 'generate_audio', 'generate_speech'].includes(tool)
      );
      
      if (currentArtifacts.length > 0 && (!fullResponse.trim() || isGenerationTool)) {
        if (isGenerationTool) {
          setResponse('✨ Content generated successfully!');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setResponse(`❌ Error: ${error instanceof Error ? error.message : 'Failed to generate response. Please check your connection and try again.'}`);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Tooling Generation
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Select Tools <span className="text-xs text-blue-600 dark:text-blue-400">(Model: {tools.length > 0 ? 'mc-1' : 'qwen-3'})</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => toggleTool(tool.id)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  tools.includes(tool.id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="font-medium text-sm text-gray-900 dark:text-white">
                  {tool.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {tool.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Prompt
          </label>
          <TextareaAutosize
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to create... e.g., 'A futuristic city at sunset with flying cars'"
            minRows={3}
            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-xs text-purple-700 dark:text-purple-300">
            💡 <strong>Tip:</strong> Select tools above and describe what you want to create for AI-powered generation.
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || tools.length === 0 || isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span className="animate-pulse">AI is thinking...</span>
            </>
          ) : (
            <>
              <Send size={20} />
              Generate with Tools
            </>
          )}
        </button>

        {isLoading && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                Processing your request with selected tools...
              </span>
            </div>
          </div>
        )}

        {response && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></span>
              {tools.includes('search') ? '🔍 Search Results' : 'AI Response'} {isStreaming && <span className="text-sm text-blue-600 dark:text-blue-400">(streaming...)</span>}
            </h3>
            <div className="relative p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-blue-200 dark:border-gray-600">
              <button
                onClick={() => copyToClipboard(response)}
                className="absolute top-3 right-3 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-600/50"
                title="Copy response"
              >
                {copiedText ? <Check size={16} /> : <Copy size={16} />}
              </button>
              <div className="pr-12">
                {renderRichContent(response)}
              </div>
            </div>
          </div>
        )}

        {artifacts.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Generated Content ({artifacts.length})
            </h3>
            <div className="grid gap-4">
              {artifacts.map((artifact, index) => (
                <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                  {artifact.type === 'image' && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">🖼️ Image Generated</span>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = `data:image/png;base64,${artifact.data}`;
                            link.download = `generated-image-${Date.now()}.png`;
                            link.click();
                          }}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                        >
                          📥 Download
                        </button>
                      </div>
                      <div className="relative group">
                        <img
                          src={`data:image/png;base64,${artifact.data}`}
                          alt="Generated Image"
                          className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">Click to view full size</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {artifact.type === 'audio' && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">🎵 Audio Generated</span>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = `data:audio/wav;base64,${artifact.data}`;
                            link.download = `generated-audio-${Date.now()}.wav`;
                            link.click();
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          📥 Download
                        </button>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <audio controls className="w-full">
                          <source src={`data:audio/wav;base64,${artifact.data}`} type="audio/wav" />
                          Your browser does not support audio playback.
                        </audio>
                      </div>
                    </div>
                  )}
                  {artifact.type === 'video' && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">🎬 Video Generated</span>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = `data:video/mp4;base64,${artifact.data}`;
                            link.download = `generated-video-${Date.now()}.mp4`;
                            link.click();
                          }}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                        >
                          📥 Download
                        </button>
                      </div>
                      <video controls className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg bg-black">
                        <source src={`data:video/mp4;base64,${artifact.data}`} type="video/mp4" />
                        Your browser does not support video playback.
                      </video>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolingGeneration;