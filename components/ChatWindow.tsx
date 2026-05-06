'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, CalendarClock, MessageSquareText, ShieldCheck, Users } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ProjectDetailContent from './ProjectDetailContent';
import type { ChatThreadSummary } from './ChatSidebar';

interface ProposedSlot {
  id: string;
  startTime: string;
  endTime: string;
  status?: string;
}

export interface ChatThreadDetail extends ChatThreadSummary {
  requestId: string;
  createdAt: string;
  updatedAt: string;
  message: string;
  announcedBy: string;
  announcementId: string;
  partnerId: string | null;
  location: string;
  expertiseNeeded: string;
  commitmentLevel?: string;
  collaborationType?: string | null;
  projectStage?: string;
  confidentiality?: string;
  announcement: any;
  proposedSlots: ProposedSlot[];
  agreedSlot?: string | null;
}

interface ChatWindowProps {
  thread: ChatThreadDetail | null;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatStatus(value: string) {
  return value.replace(/_/g, ' ');
}

export default function ChatWindow({ thread }: ChatWindowProps) {
  if (!thread) {
    return (
      <section className="chat-window chat-window--empty">
        <div className="chat-window__empty">
          <MessageSquareText size={22} />
          <h3>No thread selected</h3>
          <p>Pick collaboration thread from sidebar to review request history and project context.</p>
          <div className="chat-window__empty-actions">
            <Link href="/dashboard" className="chat-window__button chat-window__button--primary">
              Browse feed
            </Link>
            <Link href="/connections" className="chat-window__button">
              Review connections
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const messages = [
    {
      id: `${thread.requestId}-message`,
      tone: thread.direction === 'outgoing' ? ('outgoing' as const) : ('incoming' as const),
      author: thread.partnerName,
      timestamp: formatDate(thread.createdAt),
      body: thread.message,
    },
    {
      id: `${thread.requestId}-status`,
      tone: 'system' as const,
      body: `Request status: ${formatStatus(thread.status)}`,
    },
  ];

  return (
    <section className="chat-window">
      <header className="chat-window__header">
        <div className="chat-window__identity">
          <div className="chat-window__avatar">{thread.initials}</div>
          <div className="chat-window__title-block">
            <p className="chat-window__kicker">{thread.threadLabel}</p>
            <h1 className="chat-window__title">{thread.partnerName}</h1>
            <div className="chat-window__meta">
              <span>{thread.partnerRole}</span>
              <span>{thread.partnerInstitution}</span>
              <span>{thread.domain}</span>
            </div>
          </div>
        </div>

        <div className="chat-window__actions">
          <span className="chat-window__status">
            <ShieldCheck size={14} />
            {formatStatus(thread.status)}
          </span>
          <Link href={thread.partnerId ? `/profile/${thread.partnerId}` : '/profile'} className="chat-window__button">
            Profile
          </Link>
          <Link href={`/board/${thread.announcementId}`} className="chat-window__button chat-window__button--primary">
            Open post
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </header>

      <div className="chat-window__body">
        <div className="chat-window__transcript">
          <div className="chat-window__timeline">
            {messages.map((message) => (
              <MessageBubble key={message.id} tone={message.tone} author={message.author} timestamp={message.timestamp}>
                {message.body}
              </MessageBubble>
            ))}
          </div>

          {thread.proposedSlots.length > 0 && (
            <div className="chat-window__slot-rail">
              <div className="chat-window__slot-rail-header">
                <CalendarClock size={16} />
                Proposed slots
              </div>
              <div className="chat-window__slot-list">
                {thread.proposedSlots.map((slot) => (
                  <div key={slot.id} className="chat-window__slot">
                    <span>{formatDate(slot.startTime)}</span>
                    <span>{formatDate(slot.endTime)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="chat-window__context">
          <ProjectDetailContent announcement={thread.announcement} compact />

          <div className="chat-window__context-card">
            <div className="chat-window__context-title">
              <Users size={16} />
              Thread summary
            </div>
            <div className="chat-window__context-grid">
              <div className="chat-window__context-item">
                <span>Opened</span>
                <strong>{formatDate(thread.createdAt)}</strong>
              </div>
              <div className="chat-window__context-item">
                <span>Updated</span>
                <strong>{formatDate(thread.updatedAt)}</strong>
              </div>
              <div className="chat-window__context-item">
                <span>Location</span>
                <strong>{thread.location}</strong>
              </div>
              <div className="chat-window__context-item">
                <span>Need</span>
                <strong>{thread.expertiseNeeded}</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
