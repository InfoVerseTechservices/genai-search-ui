
'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useOnClickOutside } from '../hooks/useOnClickOutside';

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);


  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  useEffect(() => {
    setMounted(true);
  }, []);

  const themeOptions = [
    {
      value: 'light',
      label: 'Light Mode',
      Icon: Sun,
    },
    {
      value: 'dark',
      label: 'Dark Mode',
      Icon: Moon,
    },
    {
      value: 'system',
      label: 'System Preference',
      Icon: Monitor,
    },
  ];

  if (!mounted) {
    return (
      <div className="w-full h-[46px] bg-gray-200/50 dark:bg-gray-700/50 rounded-lg animate-pulse"></div>
    );
  }

  const currentTheme = themeOptions.find(option => option.value === theme) || themeOptions[2];

  return (
    <div className="relative group" ref={dropdownRef}>
    
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-full p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
        aria-label="Theme settings"
      >
        <currentTheme.Icon size={20} />
        
        
        <div className="absolute left-full ml-2  px-2 py-1 text-xs font-medium bg-black text-white rounded-md shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-30">
          Theme Settings
        </div>
      </button>

    
      {isOpen && (
        <div className="fixed left-16 bottom-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[200px] animate-in fade-in-80">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <p className="font-medium text-gray-700 dark:text-gray-300">Theme Settings</p>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-left text-sm transition-colors ${
                  theme === option.value
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <option.Icon size={18} className="mr-3" />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;