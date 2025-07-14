'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor, Settings } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

interface ThemeToggleProps {
  isOpen?: boolean;
}

const ThemeToggle = ({ isOpen: sidebarIsOpen = false }: ThemeToggleProps) => {
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(dropdownRef, () => setIsDropdownOpen(false));

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
      <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full text-left">
        <div className={`group relative flex items-center p-3 my-2 rounded-lg gap-x-4 cursor-pointer transition-colors duration-150 dark:hover:text-blue-400 hover:text-blue-400 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${!sidebarIsOpen ? 'justify-center' : ''}`}>
          <div className="w-6 h-6 flex-shrink-0">
            <currentTheme.Icon size={24} fill="currentColor" />
          </div>
          
          {!sidebarIsOpen && (
            <div className="absolute left-full ml-2 px-2 py-1 text-xs font-medium bg-black text-white rounded-md shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
              Theme Settings
            </div>
          )}
          
          {sidebarIsOpen && <p className="text-sm font-medium whitespace-nowrap">Theme Settings</p>}
        </div>
      </button>

      {isDropdownOpen && (
        <div className="fixed left-16 bottom-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[200px] animate-in fade-in-80">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <p className="font-medium text-gray-700 dark:text-gray-300">Theme Settings</p>
          </div>
          <button
            onClick={() => {
              window.location.href = '/settings';
              setIsDropdownOpen(false);
            }}
            className="w-full flex items-center px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700"
          >
            <Settings size={18} className="mr-3" />
            App Setting
          </button>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setIsDropdownOpen(false);
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