'use client';

import { usePathname } from 'next/navigation';
import LandingGradientBackdrop from './LandingGradientBackdrop';

const backdropRoutes = new Set(['/', '/login', '/login/password', '/auth/register']);

export default function RouteBackdrop() {
  const pathname = usePathname();

  if (!pathname || !backdropRoutes.has(pathname)) {
    return null;
  }

  return <LandingGradientBackdrop />;
}
