'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, MessageSquareText, PanelLeftClose } from 'lucide-react';

export interface ChatThreadSummary {
  id: string;
  title: string;
  partnerName: string;
  partnerRole: string;
  partnerInstitution: string;
  domain: string;
  status: string;
  preview: string;
  updatedAt: string;
  direction: 'incoming' | 'outgoing';
  threadLabel: string;
  unread: number;
  initials: string;
}

interface ChatSidebarProps {
  threads: ChatThreadSummary[];
  selectedId?: string;
}

function statusLabel(status: string) {
  return status.replace(/_/g, ' ');
}

export default function ChatSidebar({ threads, selectedId }: ChatSidebarProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return threads;

    return threads.filter((thread) => (
      thread.title.toLowerCase().includes(value)
      || thread.partnerName.toLowerCase().includes(value)
      || thread.partnerRole.toLowerCase().includes(value)
      || thread.partnerInstitution.toLowerCase().includes(value)
      || thread.domain.toLowerCase().includes(value)
      || thread.status.toLowerCase().includes(value)
    ));
  }, [query, threads]);

  const incomingCount = threads.filter((thread) => thread.direction === 'incoming').length;

  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar__header">
        <div className="chat-sidebar__topline">
          <div>
            <p className="chat-sidebar__kicker">Secure Messaging</p>
            <h2 className="chat-sidebar__title">Inbox</h2>
          </div>
          <span className="chat-sidebar__count">{threads.length} active</span>
        </div>

        <div className="chat-sidebar__summary">
          <span>{incomingCount} Incoming Requests</span>
          <span>{threads.length - incomingCount} Active Dialogs</span>
        </div>

        <label className="chat-sidebar__search">
          <Search size={18} />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search collaborations..."
          />
        </label>
      </div>

      <div className="chat-sidebar__list">
        {filtered.length === 0 ? (
          <div className="chat-sidebar__empty">
            <PanelLeftClose size={24} />
            <p>No threads found in archive.</p>
          </div>
        ) : (
          filtered.map((thread) => (
            <Link
              key={thread.id}
              href={`/chats/${thread.id}`}
              className={`chat-thread ${selectedId === thread.id ? 'is-active' : ''}`}
              aria-current={selectedId === thread.id ? 'page' : undefined}
            >
              <div className="chat-thread__avatar">{thread.initials}</div>
              <div className="chat-thread__copy">
                <div className="chat-thread__row">
                  <span className="chat-thread__name">{thread.partnerName}</span>
                  {thread.unread > 0 ? (
                    <span className="chat-thread__badge">{thread.unread}</span>
                  ) : (
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--blue-primary)', textTransform: 'uppercase' }}>
                      {statusLabel(thread.status)}
                    </span>
                  )}
                </div>
                <div className="chat-thread__role">{thread.partnerRole}</div>
                <div className="chat-thread__preview">{thread.preview}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </aside>
  );
}
