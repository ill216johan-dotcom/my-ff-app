import React from 'react';
import { cn } from '../../../lib/utils.js';

function Label({ className, ...props }) {
  return <label className={cn('text-sm font-medium text-slate-700 dark:text-slate-200', className)} {...props} />;
}

export { Label };
