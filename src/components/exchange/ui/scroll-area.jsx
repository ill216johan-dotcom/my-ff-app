import React from 'react';
import { cn } from '../../../lib/utils.js';

function ScrollArea({ className, children, ...props }) {
  return (
    <div className={cn('overflow-auto', className)} {...props}>
      {children}
    </div>
  );
}

export { ScrollArea };
