import React from 'react';

interface RichTextRendererProps {
  content: string;
}

const RichTextRenderer: React.FC<RichTextRendererProps> = ({ content }) => {
  const renderRichContent = (text: string): JSX.Element => {
    // Real-time markdown processing for streaming content
    let processedText = text
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>')
      // Italic text
      .replace(/\*([^*\n]+)\*/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>')
      // Headers - process line by line to avoid conflicts
      .split('\n')
      .map(line => {
        if (line.startsWith('#### ')) {
          return `<h4 class="text-base font-semibold mt-4 mb-2 text-blue-700 dark:text-blue-400">${line.slice(5)}</h4>`;
        } else if (line.startsWith('### ')) {
          return `<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-white">${line.slice(4)}</h3>`;
        } else if (line.startsWith('## ')) {
          return `<h2 class="text-xl font-bold mt-5 mb-3 text-gray-900 dark:text-white">${line.slice(3)}</h2>`;
        } else if (line.startsWith('# ')) {
          return `<h1 class="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">${line.slice(2)}</h1>`;
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          return `<li class="ml-6 mb-1 text-gray-800 dark:text-gray-200 list-disc">${line.slice(2)}</li>`;
        } else if (line.match(/^\d+\. /)) {
          return `<li class="ml-6 mb-1 text-gray-800 dark:text-gray-200 list-decimal">${line.replace(/^\d+\. /, '')}</li>`;
        } else if (line.trim() === '') {
          return '<br/>';
        } else {
          return `<p class="mb-3 text-gray-800 dark:text-gray-200 leading-relaxed">${line}</p>`;
        }
      })
      .join('')
      // Code blocks
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-red-600 dark:text-red-400">$1</code>')
      // Links
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>');
    
    return (
      <div 
        className="prose prose-sm max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: processedText }}
      />
    );

  };

  const renderWebSearchContent = (text: string): JSX.Element => {
    // Check if content has embedded search results in response
    const hasSearchResults = text.includes('**Category**:') || text.includes('**Title**:') || text.includes('**URL**:');
    
    if (hasSearchResults) {
      // Parse structured search results
      const resultPattern = /\*\*Category\*\*:\s*([^\n]+)\s*\n\s*-\s*\*\*Title\*\*:\s*([^\n]+)\s*\n\s*-\s*\*\*URL\*\*:\s*([^\n]+)\s*\n\s*-\s*\*\*Snippet\*\*:\s*([^\n]+(?:\n(?!\*\*Category\*\*)[^\n]*)*)/g;
      const results = [];
      let match;
      
      while ((match = resultPattern.exec(text)) !== null) {
        results.push({
          category: match[1].trim(),
          title: match[2].trim(),
          url: match[3].trim(),
          snippet: match[4].trim()
        });
      }
      
      if (results.length > 0) {
        // Split content into response text and search results
        const responseText = text.split(/\*\*Category\*\*:/)[0].trim();
        
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
    return renderRichContent(text);
  };

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      {renderRichContent(content)}
    </div>
  );
};

export default RichTextRenderer;