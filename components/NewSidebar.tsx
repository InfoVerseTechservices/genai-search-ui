'use client';

import { cn } from '@/lib/utils';
import { History, Home, Search, SquarePen, Settings } from 'lucide-react';
import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';
import React, { useState, type ReactNode } from 'react';
import Layout from './Layout';
import SettingsDialog from './SettingsDialog';
import { NewGenSearchIcon } from './Icons';

const VerticalIconContainer = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex gap-8">
      
      {children}</div>
  );
};

const NewSidebar = ({ children }: { children: React.ReactNode }) => {
  const segments = useSelectedLayoutSegments();


  return (
    <div className=''>
              <Layout>{children}</Layout>
    {/* <div className="fixed top-[70px] left-[110px]">
        <div className="  flex gap-8   px-2 py-8">
          <a href="/">
                <NewGenSearchIcon />
          </a>
          <a href='/library'>
                <History/>
          </a>
        </div>
      </div> */}

      </div>
  );
};

export default NewSidebar;
