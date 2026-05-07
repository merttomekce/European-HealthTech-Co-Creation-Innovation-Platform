'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, MessageSquareText, Send, ShieldCheck } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { sendChatMessage } from '@/lib/actions/chats';
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
  conversationId?: string | null;
  messages: ChatMessage[];
  canSendMessages?: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  body: string;
  tone: 'incoming' | 'outgoing' | 'system';
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
  const router = useRouter();
  const [draft, setDraft] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
          </div>
        </div>
      </section>
    );
  }

  const messages: ChatMessage[] = [
    ...thread.messages,
    {
      id: `${thread.requestId}-status`,
      senderId: 'system',
      senderName: 'System',
      timestamp: formatDate(thread.updatedAt),
      body: `Request status: ${formatStatus(thread.status)}`,
      tone: 'system',
    },
  ];

  const canSend = thread.canSendMessages !== false;

  const handleSend = () => {
    const text = draft.trim();
    if (!text || !canSend) return;

    setSendError(null);
    startTransition(() => {
      void (async () => {
        const result = await sendChatMessage(thread.requestId, text);
        if (!result.success) {
          setSendError(result.error || 'Failed to send message');
          return;
        }

        setDraft('');
        router.refresh();
      })();
    });
  };

  return (
    <section className="chat-window">
      <header className="chat-window__header">
        <div className="chat-window__identity">
          <div className="chat-window__avatar">{thread.initials}</div>
          <div className="chat-window__title-block">
            <p className="chat-window__kicker">{thread.threadLabel}</p>
            <h1 className="chat-window__title">{thread.partnerName}</h1>
            <div className="chat-window__meta">
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} />
                {thread.partnerRole}
              </span>
              <span>{thread.partnerInstitution}</span>
              <span style={{ color: 'var(--blue-primary)', fontWeight: 700 }}>{thread.domain}</span>
            </div>
          </div>
        </div>

        <div className="chat-window__actions">
          <Link href={thread.partnerId ? `/profile/${thread.partnerId}` : '/profile'} className="chat-window__button">
            View Credentials
          </Link>
          <Link href={`/board/${thread.announcementId}`} className="chat-window__button chat-window__button--primary">
            Review Project
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </header>

      <div className="chat-window__body">
        <div className="chat-window__transcript">
          <div className="chat-window__timeline">
            {messages.map((message) => (
              <MessageBubble key={message.id} tone={message.tone} author={message.senderName} timestamp={message.timestamp}>
                {message.body}
              </MessageBubble>
            ))}
          </div>
        </div>

        <form
          className="chat-window__composer"
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
        >
          <label className="chat-window__composer-label" htmlFor="chat-message">
            Message
          </label>
          <textarea
            id="chat-message"
            className="chat-window__composer-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder={canSend ? 'Write a message...' : 'Messaging disabled for closed threads'}
            disabled={!canSend || isPending}
            rows={3}
          />
          <div className="chat-window__composer-footer">
            <div className="chat-window__composer-hint">
              {canSend ? 'Enter to send, Shift+Enter for a new line.' : 'This thread is closed.'}
              {sendError && <span className="chat-window__composer-error">{sendError}</span>}
            </div>
            <button
              type="submit"
              className="chat-window__button chat-window__button--primary"
              disabled={!canSend || isPending || draft.trim().length === 0}
            >
              <Send size={16} />
              {isPending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
