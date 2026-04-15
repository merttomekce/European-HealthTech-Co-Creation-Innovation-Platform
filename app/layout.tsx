import React from 'react';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TopProgressBar } from '@/components/TopProgressBar';

export const metadata = {
  title: 'HealthAI - The Digital Void',
  description: 'Everything starts here.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <TopProgressBar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
