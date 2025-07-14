'use client';

import ToolingGeneration from '@/components/ToolingGeneration';

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-light-primary dark:bg-dark-primary">
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <ToolingGeneration onClose={() => {}} />
        </div>
      </div>
    </div>
  );
}