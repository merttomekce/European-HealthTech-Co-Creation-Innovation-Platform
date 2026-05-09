import React from 'react';
import { loadChatWorkspace } from '@/lib/chat-threads';
import ChatSidebar, { ChatThreadSummary } from '@/components/ChatSidebar';
import ChatWindow, { ChatThreadDetail } from '@/components/ChatWindow';

function Workspace({
  threads,
  selected,
}: {
  threads: ChatThreadSummary[];
  selected: ChatThreadDetail | null;
}) {
  const active = selected || null;

  return (
    <div className="chat-shell">
      <div className="chat-grid">
        <ChatSidebar threads={threads} selectedId={active?.id} />
        <ChatWindow thread={active} />
      </div>
    </div>
  );
}

export default async function ChatsPage() {
  const { threads, selectedThread } = await loadChatWorkspace(undefined, false);
  return <Workspace threads={threads} selected={selectedThread} />;
}
