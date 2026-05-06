'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { connectWithUser } from '@/lib/actions/profile';

interface ConnectButtonProps {
  targetUserId: string;
  initialConnected: boolean;
  isOwnProfile: boolean;
}

export default function ConnectButton({ targetUserId, initialConnected, isOwnProfile }: ConnectButtonProps) {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(initialConnected);
  const [isPending, startTransition] = useTransition();

  if (isOwnProfile) {
    return (
      <Link href="/profile" className="public-profile-button public-profile-button--primary">
        Edit profile
      </Link>
    );
  }

  const handleConnect = () => {
    startTransition(async () => {
      const result = await connectWithUser(targetUserId);
      if (!result.success) {
        alert(result.error || 'Failed to connect');
        return;
      }

      setIsConnected(true);
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      className="public-profile-button public-profile-button--primary"
      onClick={handleConnect}
      disabled={isPending || isConnected}
    >
      {isConnected ? 'Connected' : isPending ? 'Connecting…' : 'Connect'}
    </button>
  );
}
