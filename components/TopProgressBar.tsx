'use client';

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

export function TopProgressBar() {
  return (
    <ProgressBar
      height="3px"
      color="var(--blue-primary)"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}
