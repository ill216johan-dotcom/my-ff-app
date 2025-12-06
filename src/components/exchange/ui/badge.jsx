import React from 'react';
import { cn } from '../../../lib/utils.js';

function Badge({ className, children, variant = 'solid', ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        variant === 'outline'
          ? 'border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-100'
          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
