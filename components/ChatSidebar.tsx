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
            <p className="chat-sidebar__kicker">Collaboration inbox</p>
            <h2 className="chat-sidebar__title">Threads</h2>
          </div>
          <span className="chat-sidebar__count">{threads.length}</span>
        </div>

        <div className="chat-sidebar__summary">
          <span>{incomingCount} incoming</span>
          <span>{threads.length - incomingCount} outgoing</span>
        </div>

        <label className="chat-sidebar__search">
          <Search size={16} />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search names, domains, statuses"
          />
        </label>
      </div>

      <div className="chat-sidebar__list">
        {filtered.length === 0 ? (
          <div className="chat-sidebar__empty">
            <PanelLeftClose size={18} />
            <p>No matching threads.</p>
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
                  <span className="chat-thread__badge">{thread.unread > 0 ? `${thread.unread}` : statusLabel(thread.status)}</span>
                </div>
                <div className="chat-thread__role">{thread.partnerRole} · {thread.partnerInstitution}</div>
                <div className="chat-thread__preview">{thread.preview}</div>
                <div className="chat-thread__foot">
                  <span>{thread.domain}</span>
                  <span>{thread.threadLabel}</span>
                </div>
              </div>
              <MessageSquareText size={16} className="chat-thread__icon" />
            </Link>
          ))
        )}
      </div>
    </aside>
  );
}
