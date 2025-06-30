
'use client';

import React from 'react';

export interface AIChatParams {
  model: string;
  temperature: number;
  top_p: number;
  max_tokens: number;
}

interface ChatCompletionParametersPanelProps {
  params: AIChatParams;
  setParams: (newParams: AIChatParams | ((prevParams: AIChatParams) => AIChatParams)) => void;
  defaultModelName?: string;
}

const ChatCompletionParametersPanel: React.FC<ChatCompletionParametersPanelProps> = ({
  params,
  setParams,
  defaultModelName = "qwen-3", 
}) => {

  const handleParamChange = (field: keyof AIChatParams, value: string | number) => {
    setParams(prev => ({
      ...prev,
      [field]: typeof prev[field] === 'number' ? parseFloat(String(value)) : value,
    }));
  };

  return (
    
    <div className="text-left w-full">
      <div className="space-y-4">
   
        <div>
          <label htmlFor="aiChatModel" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Model
          </label>
          <input
            type="text"
            id="aiChatModel"
            value={params.model}
            onChange={(e) => handleParamChange('model', e.target.value)}
            placeholder={`Default: ${defaultModelName}`}
            className="w-full p-2 border rounded-md text-xs sm:text-sm bg-white dark:bg-gray-700 dark:text-white dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500"
          />
           <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">e.g., qwen-3</p>
        </div>

        <div>
          <label htmlFor="aiChatTemperature" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Temperature: {params.temperature.toFixed(2)}
          </label>
          <input
            id="aiChatTemperature"
            type="range"
            min="0"
            max="2"       
            step="0.01"
            value={params.temperature}
            onChange={(e) => handleParamChange('temperature', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
          />
        </div>

        {/* Top_p Slider */}
        <div>
          <label htmlFor="aiChatTopP" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Top P: {params.top_p.toFixed(2)}
          </label>
          <input
            id="aiChatTopP"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={params.top_p}
            onChange={(e) => handleParamChange('top_p', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
          />
        </div>

        {/* Max Tokens Input */}
        <div>
          <label htmlFor="aiChatMaxTokens" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max Tokens
          </label>
          <input
            type="number"
            id="aiChatMaxTokens"
            value={params.max_tokens}
            onChange={(e) => handleParamChange('max_tokens', parseInt(e.target.value, 10) || 1)} // Ensure it's at least 1
            min="1"
            step="1"
            placeholder="e.g., 1000"
            className="w-full p-2 border rounded-md text-xs sm:text-sm bg-white dark:bg-gray-700 dark:text-white dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatCompletionParametersPanel;
