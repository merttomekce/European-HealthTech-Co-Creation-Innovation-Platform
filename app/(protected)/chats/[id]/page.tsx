import React from 'react';
import { notFound } from 'next/navigation';
import { loadChatWorkspace } from '@/lib/chat-threads';
import ChatSidebar, { ChatThreadSummary } from '@/components/ChatSidebar';
import ChatWindow, { ChatThreadDetail } from '@/components/ChatWindow';

function Workspace({
  threads,
  selected,
}: {
  threads: ChatThreadSummary[];
  selected: ChatThreadDetail;
}) {
  return (
    <div className="chat-shell">
      <header className="chat-header">
        <div>
          <p className="chat-header__eyebrow">Collaboration workspace</p>
          <h1 className="chat-header__title">Chats</h1>
          <p className="chat-header__subtitle">Track request history, negotiation state, and project context in one place.</p>
        </div>
        <div className="chat-header__stats">
          <div className="chat-header__stat">
            <span className="chat-header__stat-label">Threads</span>
            <strong>{threads.length}</strong>
          </div>
          <div className="chat-header__stat">
            <span className="chat-header__stat-label">Selected</span>
            <strong>{selected.threadLabel}</strong>
          </div>
        </div>
      </header>

      <div className="chat-grid">
        <ChatSidebar threads={threads} selectedId={selected.id} />
        <ChatWindow thread={selected} />
      </div>
    </div>
  );
}

export default async function ChatThreadPage({ params }: { params: { id: string } }) {
  const { threads, selectedThread } = await loadChatWorkspace(params.id, true);

  if (!selectedThread) {
    notFound();
  }

  return <Workspace threads={threads} selected={selectedThread} />;
}
