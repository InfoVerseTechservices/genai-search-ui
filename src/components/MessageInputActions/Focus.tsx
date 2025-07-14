import {
  BadgePercent,
  ChevronDown,
  Globe,
  Pencil,
  ScanEye,
  SwatchBook,
  Image,
  Video,
  Volume2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from '@headlessui/react';
import { SiReddit, SiYoutube } from '@icons-pack/react-simple-icons';
import { Fragment, useRef, useEffect, useState } from 'react';

const focusModes = [
  {
    key: 'webSearch',
    title: 'All',
    description: 'AI-powered search across all of the internet',
    icon: <Globe size={20} />,
    useTooling: true,
  },
  {
    key: 'academicSearch',
    title: 'Academic',
    description: 'Search in published academic papers',
    icon: <SwatchBook size={20} />,
  },
  {
    key: 'writingAssistant',
    title: 'Writing',
    description: 'Chat without searching the web',
    icon: <Pencil size={16} />,
  },
  {
    key: 'wolframAlphaSearch',
    title: 'Wolfram Alpha',
    description: 'Computational knowledge engine',
    icon: <BadgePercent size={20} />,
  },
  {
    key: 'youtubeSearch',
    title: 'Youtube',
    description: 'Search and watch videos',
    icon: <SiYoutube className="h-5 w-auto mr-0.5" />,
  },
  {
    key: 'redditSearch',
    title: 'Reddit',
    description: 'Search for discussions and opinions',
    icon: <SiReddit className="h-5 w-auto mr-0.5" />,
  },
  {
    key: 'imageGeneration',
    title: 'Image Generation',
    description: 'Generate images from text prompts',
    icon: <Image size={20} />,
  },
  // {
  //   key: 'imageGen',
  //   title: 'Image Gen',
  //   description: 'AI-powered image generation with tooling',
  //   icon: <Image size={20} />,
  //   useTooling: true,
  // },
  {
    key: 'videoGeneration',
    title: 'Video Generation',
    description: 'Generate videos from text prompts',
    icon: <Video size={20} />,
  },
  {
    key: 'audioGeneration',
    title: 'Audio Generation',
    description: 'Generate audio from text prompts',
    icon: <Volume2 size={20} />,
  },
  // {
  //   key: 'toolingGeneration',
  //   title: 'Tooling Generation',
  //   description: 'Advanced AI with multiple tools',
  //   icon: <ScanEye size={20} />,
  //   subItems: [
  //     { key: 'generate_image', title: 'Generate Image', icon: <Image size={16} /> },
  //     { key: 'generate_video', title: 'Generate Video', icon: <Video size={16} /> },
  //     { key: 'generate_audio', title: 'Generate Audio', icon: <Volume2 size={16} /> },
  //     { key: 'generate_speech', title: 'Generate Speech', icon: <Volume2 size={16} /> },
  //     { key: 'search', title: 'Web Search', icon: <Globe size={16} /> },
  //   ],
  // },
];

const Focus = ({
  focusMode,
  setFocusMode,
}: {
  focusMode: string;
  setFocusMode: (mode: string) => void;
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
        
        setShowAbove(spaceBelow < 300 && spaceAbove > spaceBelow);
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

  return (
    <Popover className="relative w-auto max-w-[6rem] sm:max-w-[8rem] md:max-w-md lg:max-w-lg mt-[6.5px] z-50">
      <PopoverButton
        ref={buttonRef}
        type="button"
        className="min-h-[40px] min-w-[40px] px-2 sm:px-3 text-black/50 dark:text-white/50 rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary active:scale-95 transition duration-200 hover:text-black dark:hover:text-white touch-manipulation flex items-center justify-center"
      >
        {focusMode !== 'webSearch' ? (
          <div className="flex flex-row items-center space-x-1">
            <div className="flex-shrink-0">
              {focusModes.find((mode) => mode.key === focusMode)?.icon}
            </div>
            <p className="text-xs font-medium hidden lg:block truncate">
              {focusModes.find((mode) => mode.key === focusMode)?.title}
            </p>
            <ChevronDown size={12} className="lg:size-4 flex-shrink-0" />
          </div>
        ) : (
          <div className="flex flex-row items-center space-x-1">
            <div className="flex-shrink-0">
              <ScanEye size={16} className="sm:size-5" />
            </div>
            <p className="text-xs font-medium hidden lg:block">Focus</p>
          </div>
        )}
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
        <PopoverPanel className={cn(
          "absolute z-[9999]",
          "left-1/2 transform -translate-x-1/2 sm:left-0 sm:transform-none",
          "w-[90vw] sm:w-80 md:w-[500px] lg:w-[600px]",
          "max-w-[90vw] sm:max-w-none",
          showAbove ? "bottom-full mb-2" : "top-full mt-2"
        )}>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 bg-light-primary dark:bg-dark-primary border rounded-lg border-light-200 dark:border-dark-200 w-full p-2 sm:p-3 md:p-4 max-h-[60vh] sm:max-h-[400px] md:max-h-none overflow-y-auto shadow-lg">
            {focusModes.map((mode, i) => (
              <div key={i}>
                <PopoverButton
                  onClick={() => setFocusMode(mode.key)}
                  className={cn(
                    'min-h-[65px] sm:min-h-[75px] p-2 sm:p-3 md:p-4 rounded-lg flex flex-col items-center sm:items-start justify-center sm:justify-start text-center sm:text-start space-y-1 duration-200 cursor-pointer transition w-full touch-manipulation',
                    focusMode === mode.key
                      ? 'bg-light-secondary dark:bg-dark-secondary ring-2 ring-[#24A0ED]/20'
                      : 'hover:bg-light-secondary dark:hover:bg-dark-secondary',
                  )}
                >
                  <div
                    className={cn(
                      'flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 w-full',
                      focusMode === mode.key
                        ? 'text-[#24A0ED]'
                        : 'text-black dark:text-white',
                    )}
                  >
                    <div className="flex-shrink-0">
                      {mode.icon}
                    </div>
                    <p className="text-xs sm:text-sm font-medium truncate leading-tight">{mode.title}</p>
                  </div>
                  <p className="text-black/70 dark:text-white/70 text-xs leading-tight line-clamp-2 hidden sm:block">
                    {mode.description}
                  </p>
                </PopoverButton>

              </div>
            ))}
          </div>
        </PopoverPanel>
      </Transition>
    </Popover>
  );
};

export default Focus;
