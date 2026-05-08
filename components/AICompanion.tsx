'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useRef, useEffect, useMemo, useState } from 'react';
import { Bot, Send, Zap, Check, Edit3, MapPin, Tag, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';
import './AICompanion.css';

interface AICompanionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AICompanion({ open, onOpenChange }: AICompanionProps) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const transport = useMemo(() => new DefaultChatTransport({ api: '/api/chat' }), []);
  const { messages, sendMessage, status, error, addToolResult } = useChat({
    transport,
    onError: (chatError) => {
      console.error('Companion client error:', chatError);
    },
  });
  const isLoading = status === 'submitted' || status === 'streaming';
  const scrollRef = useRef<HTMLDivElement>(null);

  const submitMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    await sendMessage({ text: trimmed });
    setInput('');
  };

  // Tool handling logic
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'assistant') return;

    lastMessage.parts.forEach((part) => {
      if (part.type === 'tool-invocation') {
        const { toolName, args, toolCallId, state } = part;
        
        // Auto-execute UI actions if they are in 'call' state
        if (toolName === 'requestUIAction' && state === 'call') {
          const { action } = args as any;
          
          if (action === 'OPEN_POST_MODAL') {
            router.push('/post-project');
            onOpenChange(false); // Close companion when navigating
          } else if (action === 'NAVIGATE_TO_BOARD') {
            router.push('/dashboard');
            onOpenChange(false);
          } else if (action === 'NAVIGATE_TO_CHATS') {
            router.push('/chats');
            onOpenChange(false);
          }

          // Confirm the tool was executed
          addToolResult({
            toolCallId,
            result: { status: 'ACTION_EXECUTED', action },
          });
        }
      }
    });
  }, [messages, router, onOpenChange, addToolResult]);

  const renderMessagePart = (part: (typeof messages)[number]['parts'][number], messageId: string) => {
    if (part.type === 'text') {
      return <div key={`${messageId}-text`} className="text-content">{part.text}</div>;
    }

    if (part.type === 'tool-invocation') {
      const { toolCallId, toolName, args, state } = part;
      const toolArgs = args as any;

      if (toolName === 'showAnnouncementDraft') {
        const isResult = state === 'result';
        
        return (
          <div key={toolCallId} className="tool-invocation">
            <div className="draft-card">
              <div className="draft-card__header">
                <div className="draft-card__badge">Proposed Announcement</div>
                {isResult && <div className="draft-card__status-badge">Confirmed</div>}
              </div>

              <div className="draft-card__body">
                <h4 className="draft-card__title">{toolArgs.title}</h4>
                <p className="draft-card__content">{toolArgs.content}</p>

                <div className="draft-card__meta">
                  <div className="draft-card__meta-item">
                    <Briefcase size={14} />
                    <span>{toolArgs.type}</span>
                  </div>
                  <div className="draft-card__meta-item">
                    <Tag size={14} />
                    <span>{toolArgs.expertiseNeeded}</span>
                  </div>
                  {(toolArgs.city || toolArgs.country) && (
                    <div className="draft-card__meta-item">
                      <MapPin size={14} />
                      <span>{toolArgs.city}{toolArgs.city && toolArgs.country ? ', ' : ''}{toolArgs.country}</span>
                    </div>
                  )}
                </div>
              </div>

              {!isResult && (
                <div className="draft-card__actions">
                  <button 
                    onClick={() => submitMessage("I'd like to edit the draft.")} 
                    className="draft-card__btn draft-card__btn--secondary"
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                  <button 
                    onClick={() => submitMessage(`Perfect. Please post this announcement: "${toolArgs.title}"`)} 
                    className="draft-card__btn draft-card__btn--primary"
                  >
                    <Check size={16} />
                    Confirm & Post
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      }
    }

    return null;
  };

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading, open]);

  return (
    <div className="companion-shell">
      <button
        onClick={() => onOpenChange(!open)}
        className={`companion-launcher ${open ? 'companion-launcher--active' : ''}`}
        aria-pressed={open}
        aria-expanded={open}
        aria-label={open ? 'Close HealthAI Assistant' : 'Open HealthAI Assistant'}
      >
        <div className="companion-launcher__icon-wrapper">
          <Bot size={22} />
          <div className="companion-launcher__status" />
        </div>
      </button>

      <aside className={`companion-panel ${open ? 'companion-panel--open' : 'companion-panel--closed'}`} aria-hidden={!open}>
        <header className="companion-header">
          <div className="companion-header__brand">
            <div className="companion-header__badge">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="companion-header__title">Companion Engine</h3>
              <div className="companion-header__status">
                <div className="companion-header__status-dot" />
                Neural Core Active
              </div>
            </div>
          </div>
        </header>

        <main ref={scrollRef} className="companion-body">
            {messages.length === 0 && (
              <div className="message-row message-row--assistant">
                <div className="message-meta">HealthAI Core</div>
                <div className="message-bubble message-bubble--assistant companion-welcome">
                  Welcome. Ask me about projects, announcements, or clinical search.
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`message-row ${m.role === 'user' ? 'message-row--user' : 'message-row--assistant'}`}
              >
                <div className="message-meta">
                  {m.role === 'user' ? 'Scientist' : 'HealthAI Core'}
                </div>
                <div className={`message-bubble ${m.role === 'user' ? 'message-bubble--user' : 'message-bubble--assistant'}`}>
                  {m.parts.map((part, i) => renderMessagePart(part, `${m.id}-${i}`))}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message-row message-row--assistant">
                <div className="message-meta">Processing...</div>
                <div className="message-bubble message-bubble--assistant" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}

            {error && (
              <div className="message-row message-row--assistant">
                <div className="message-meta">System Error</div>
                <div className="message-bubble message-bubble--assistant companion-error">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Zap size={14} />
                    <strong>Connection Interrupted</strong>
                  </div>
                  Local AI did not respond. Ensure oMLX is running at 127.0.0.1:8001/v1 and the model is loaded.
                </div>
              </div>
            )}
        </main>

        <footer className="companion-footer">
          <form onSubmit={(e) => { e.preventDefault(); void submitMessage(input); }}>
            <div className="companion-input-wrapper">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Initiate command..."
                className="companion-input"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="companion-send"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </footer>
      </aside>
    </div>
  );
}
