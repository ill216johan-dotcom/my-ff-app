import React from 'react';
import { cn } from '../../../lib/utils.js';

function Card({ className, ...props }) {
  return (
    <div
      className={cn('rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900', className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return <div className={cn('p-4 pb-2', className)} {...props} />;
}

function CardTitle({ className, ...props }) {
  return <h3 className={cn('text-lg font-semibold text-slate-900 dark:text-slate-50', className)} {...props} />;
}

function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-slate-500 dark:text-slate-400', className)} {...props} />;
}

function CardContent({ className, ...props }) {
  return <div className={cn('p-4 pt-0', className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
