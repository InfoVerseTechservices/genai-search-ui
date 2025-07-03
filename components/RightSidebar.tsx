
'use aclient';

import React from 'react';
import RelatedImages from './GetOneImage';
import MediaGrid from './MediaGrid';
import { useLayout } from '@/components/SharedPlaceholder'; 

const AdPlaceholder = ({ divid }: { divid: string }) => (
  <div id={divid} className="flex h-28 w-full items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex-shrink-0">
    <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">Advertisement</span>
  </div>
);

const SideTopAdComponent = ({ divid }: { divid: string }) => <AdPlaceholder divid={divid} />;
const SideBottomAdComponent = ({ divid }: { divid: string }) => <AdPlaceholder divid={divid} />;


const RightSidebar = () => {
  const { rightSidebarContent } = useLayout();
  
  if (!rightSidebarContent) {
    return null;
  }
  const { query, history } = rightSidebarContent;

  return (
    <aside className="hidden xl:block w-[320px] flex-shrink-0 h-screen px-2 py-20">
      <div className="sticky top-10 h-[calc(100vh-5rem)]">
        <div className="h-full overflow-y-auto space-y-4 pr-2">
          
          <RelatedImages
            chat_history={
              history?.map((msg: any) => ({
                ...msg,
                messageId: msg.messageId ?? '',
                chatId: msg.chatId ?? '',
                createdAt: msg.createdAt ?? new Date().toISOString(),
              })) ?? []
            }
            query={query}
          />
          
          <MediaGrid query={query} chat_history={history} />
          
          <SideTopAdComponent divid={`top-ad-sidebar`} />
          <SideBottomAdComponent divid={`bottom-ad-sidebar`} />
          
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;