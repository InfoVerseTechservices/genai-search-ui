import { getModelForFunction } from '@/lib/modelSelector';

interface ModelIndicatorProps {
  focusMode: string;
  selectedTool?: string;
  className?: string;
}

const ModelIndicator = ({ focusMode, selectedTool, className = '' }: ModelIndicatorProps) => {
  const modelConfig = getModelForFunction(focusMode, selectedTool);
  
  return (
    <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${className}`}>
      <div className={`w-2 h-2 rounded-full mr-1 ${
        modelConfig.model === 'mc-1' ? 'bg-purple-500' : 'bg-blue-500'
      }`} />
      <span className="text-gray-600 dark:text-gray-400">
        {modelConfig.model}
      </span>
      {modelConfig.supportsTools && (
        <span className="ml-1 text-green-600 dark:text-green-400">⚡</span>
      )}
    </div>
  );
};

export default ModelIndicator;