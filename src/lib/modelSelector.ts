export interface ModelConfig {
  model: string;
  supportsTools: boolean;
  supportsMultimodal: boolean;
}

export const MODEL_MAPPINGS: Record<string, ModelConfig> = {
  // Tooling functions require mc-1
  'toolingGeneration': { model: 'mc-1', supportsTools: true, supportsMultimodal: true },
  'generate_image': { model: 'bagel-7b-mot', supportsTools: true, supportsMultimodal: true },
  'generate_video': { model: 'mc-1', supportsTools: true, supportsMultimodal: true },
  'generate_audio': { model: 'mc-1', supportsTools: true, supportsMultimodal: true },
  'generate_speech': { model: 'mc-1', supportsTools: true, supportsMultimodal: true },
  'search': { model: 'mc-1', supportsTools: true, supportsMultimodal: false },
  
  // Standard functions use qwen-3
  'webSearch': { model: 'qwen-3', supportsTools: false, supportsMultimodal: false },
  'writingAssistant': { model: 'qwen-3', supportsTools: false, supportsMultimodal: false },
  'academicSearch': { model: 'qwen-3', supportsTools: false, supportsMultimodal: false },
  'youtubeSearch': { model: 'qwen-3', supportsTools: false, supportsMultimodal: false },
  'redditSearch': { model: 'qwen-3', supportsTools: false, supportsMultimodal: false },
  'wolframAlphaSearch': { model: 'qwen-3', supportsTools: false, supportsMultimodal: false },
  'imageGeneration': { model: 'bagel-7b-mot', supportsTools: true, supportsMultimodal: true },
  'videoGeneration': { model: 'wan', supportsTools: false, supportsMultimodal: false },
};

export function getModelForFunction(functionType: string, selectedTool?: string): ModelConfig {
  console.log(`Model selection for function: ${functionType}, tool: ${selectedTool}`);
  
  // For tooling generation, check specific tool or use default
  if (functionType === 'toolingGeneration') {
    const config = selectedTool ? (MODEL_MAPPINGS[selectedTool] || MODEL_MAPPINGS['toolingGeneration']) : MODEL_MAPPINGS['toolingGeneration'];
    console.log(`Selected model for tooling: ${config.model}`);
    return config;
  }
  
  // Return specific model config or default to qwen-3
  const config = MODEL_MAPPINGS[functionType] || { model: 'qwen-3', supportsTools: false, supportsMultimodal: false };
  console.log(`Selected model for ${functionType}: ${config.model}`);
  return config;
}

export function getAllAvailableModels(): Record<string, ModelConfig> {
  return MODEL_MAPPINGS;
}

export function getModelsByCapability(capability: 'tools' | 'multimodal'): string[] {
  return Object.entries(MODEL_MAPPINGS)
    .filter(([_, config]) => 
      capability === 'tools' ? config.supportsTools : config.supportsMultimodal
    )
    .map(([key, _]) => key);
}