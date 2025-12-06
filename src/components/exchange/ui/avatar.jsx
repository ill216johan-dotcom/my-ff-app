import React from 'react';
import { cn } from '../../../lib/utils.js';

function Avatar({ className, children }) {
  return (
    <div
      className={cn('inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700', className)}
    >
      {children}
    </div>
  );
}

function AvatarFallback({ children }) {
  return <>{children}</>;
}

export { Avatar, AvatarFallback };
