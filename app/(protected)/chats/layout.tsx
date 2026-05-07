import React from 'react';
import './chats.css';

export default function ChatsLayout({ children }: { children: React.ReactNode }) {
  return <div className="chat-route">{children}</div>;
}
