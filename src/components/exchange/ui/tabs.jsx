import React, { createContext, useContext, useMemo, useState } from 'react';
import { cn } from '../../../lib/utils.js';

const TabsContext = createContext(null);

function Tabs({ value, defaultValue, onValueChange, children, className }) {
  const [internal, setInternal] = useState(defaultValue || value);
  const currentValue = value !== undefined ? value : internal;

  const handleChange = (newValue) => {
    if (value === undefined) {
      setInternal(newValue);
    }
    if (onValueChange) onValueChange(newValue);
  };

  const contextValue = useMemo(
    () => ({ value: currentValue, onChange: handleChange }),
    [currentValue],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, ...props }) {
  return (
    <div
      className={cn('inline-flex items-center rounded-lg bg-slate-100 p-1 dark:bg-slate-800', className)}
      {...props}
    />
  );
}

function TabsTrigger({ value, className, children, ...props }) {
  const ctx = useContext(TabsContext);
  const isActive = ctx?.value === value;
  return (
    <button
      className={cn(
        'min-w-0 flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-white text-orange-600 shadow dark:bg-slate-700'
          : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
        className,
      )}
      onClick={() => ctx?.onChange(value)}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, className, children, ...props }) {
  const ctx = useContext(TabsContext);
  if (ctx?.value !== value) return null;
  return (
    <div className={cn('mt-4', className)} {...props}>
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
