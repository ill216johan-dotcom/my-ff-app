import React from 'react';
import { cn } from '../../../lib/utils.js';

const baseClasses =
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

const variants = {
  default: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-200',
  outline:
    'border border-slate-300 text-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800',
  ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
};

const sizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3',
  lg: 'h-11 px-5',
  icon: 'h-10 w-10',
};

function Button({ className, variant = 'default', size = 'default', asChild = false, ...props }) {
  const Comp = asChild ? React.Fragment : 'button';
  const content = (
    <button
      className={cn(baseClasses, variants[variant] || variants.default, sizes[size] || sizes.default, className)}
      {...props}
    />
  );

  if (asChild) {
    return React.cloneElement(props.children, {
      className: cn(props.children.props.className, baseClasses, variants[variant], sizes[size], className),
    });
  }

  return content;
}

export { Button };
