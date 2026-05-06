import React from 'react';

export type MessageTone = 'incoming' | 'outgoing' | 'system';

interface MessageBubbleProps {
  tone?: MessageTone;
  author?: string;
  timestamp?: string;
  children: React.ReactNode;
  note?: string;
}

export default function MessageBubble({
  tone = 'incoming',
  author,
  timestamp,
  children,
  note,
}: MessageBubbleProps) {
  const isSystem = tone === 'system';

  return (
    <article className={`message-bubble message-bubble--${tone}`}>
      {!isSystem && (
        <div className="message-bubble__meta">
          <span className="message-bubble__author">{author || (tone === 'outgoing' ? 'You' : 'Participant')}</span>
          {timestamp && <span className="message-bubble__time">{timestamp}</span>}
        </div>
      )}
      <div className="message-bubble__body">{children}</div>
      {note && <div className="message-bubble__note">{note}</div>}
    </article>
  );
}
