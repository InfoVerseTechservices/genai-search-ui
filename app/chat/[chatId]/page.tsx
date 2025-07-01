
import ChatPageUI from "@/components/ChatPageUI";
import ChatWindow from "@/components/ChatWindow";
import LayoutClientWrapper from "@/components/LayoutClientWrapper";
import Layout from "@/components/MainNavBar";
import { Suspense } from "react";

// Define the shape of the props this page will receive from Next.js
interface PageProps {
  params: {
    chatId: string;
  };
}

export default function ChatPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div>Loading Chat...</div>}>
      <LayoutClientWrapper>
      <ChatWindow id={params.chatId} />
      </LayoutClientWrapper>
    </Suspense>
  );
}