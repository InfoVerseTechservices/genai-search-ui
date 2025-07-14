import { ChevronDown, Image, Video, Volume2, Search, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';
import { Fragment, useRef, useEffect, useState } from 'react';

const toolOptions = [
  { key: 'generate_image', title: 'Generate Image', icon: <Image size={16} /> },
  { key: 'generate_video', title: 'Generate Video', icon: <Video size={16} /> },
  { key: 'generate_audio', title: 'Generate Audio', icon: <Volume2 size={16} /> },
  { key: 'generate_speech', title: 'Generate Speech', icon: <Mic size={16} /> },
  { key: 'search', title: 'Web Search', icon: <Search size={16} /> },
];

const ToolSelector = ({
  selectedTool,
  setSelectedTool,
  generationType,
}: {
  selectedTool: string;
  setSelectedTool: (tool: string) => void;
  generationType: string;
}) => {
  const [showAbove, setShowAbove] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const checkPosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        setShowAbove(spaceBelow < 200 && spaceAbove > spaceBelow);
      }
    };

    checkPosition();
    window.addEventListener('resize', checkPosition);
    window.addEventListener('scroll', checkPosition);
    
    return () => {
      window.removeEventListener('resize', checkPosition);
      window.removeEventListener('scroll', checkPosition);
    };
  }, []);

  if (generationType !== 'toolingGeneration') return null;

  const currentTool = toolOptions.find(tool => tool.key === selectedTool) || toolOptions[0];

  return (
    <Popover className="relative">
      <PopoverButton
        ref={buttonRef}
        type="button"
        className="text-black/50 dark:text-white/50 rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary active:scale-95 transition duration-200 hover:text-black dark:hover:text-white"
      >
        <div className="flex flex-row items-center space-x-1">
          {currentTool.icon}
          <p className="text-xs font-medium hidden lg:block">{currentTool.title}</p>
          <ChevronDown size={16} className="-translate-x-1" />
        </div>
      </PopoverButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-150"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <PopoverPanel className={cn("absolute z-20 w-48 left-0", showAbove ? "bottom-full mb-2" : "top-full mt-2")}>
          <div className="bg-light-primary dark:bg-dark-primary border rounded-lg border-light-200 dark:border-dark-200 p-2">
            {toolOptions.map((tool) => (
              <PopoverButton
                key={tool.key}
                onClick={() => setSelectedTool(tool.key)}
                className={cn(
                  'w-full p-2 rounded-lg flex items-center space-x-2 text-left transition duration-200',
                  selectedTool === tool.key
                    ? 'bg-light-secondary dark:bg-dark-secondary text-[#24A0ED]'
                    : 'hover:bg-light-secondary dark:hover:bg-dark-secondary text-black dark:text-white'
                )}
              >
                {tool.icon}
                <span className="text-sm font-medium">{tool.title}</span>
              </PopoverButton>
            ))}
          </div>
        </PopoverPanel>
      </Transition>
    </Popover>
  );
};

export default ToolSelector;