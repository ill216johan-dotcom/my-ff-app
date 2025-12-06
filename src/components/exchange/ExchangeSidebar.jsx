import React from 'react';
import { Package, Plus, History, Settings, HelpCircle, Bell } from 'lucide-react';
import { cn } from '../../lib/utils.js';

const notifications = {
  packagings: 2,
  messages: 3,
};

function ExchangeSidebar({ currentView, onNavigate }) {
  const total = notifications.packagings + notifications.messages;
  const navItems = [
    { id: 'list', icon: Package, label: 'Мои упаковки', badge: notifications.packagings },
    { id: 'create', icon: Plus, label: 'Создать задание' },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-col">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-900 dark:text-white">Биржа упаковки</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Личный кабинет</p>
          </div>
        </div>
      </div>

      {total > 0 && (
        <div className="px-4 pt-4">
          <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-lg flex items-center gap-3">
            <div className="relative">
              <Bell className="w-5 h-5 text-orange-500" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {total}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-900 dark:text-white font-medium">Новые уведомления</p>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                {notifications.packagings > 0 && `${notifications.packagings} откликов`}
                {notifications.packagings > 0 && notifications.messages > 0 && ', '}
                {notifications.messages > 0 && `${notifications.messages} сообщений`}
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  currentView === item.id
                    ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{item.badge}</span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <p className="px-3 mb-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Архив</p>
          <button
            onClick={() => onNavigate('list')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <History className="w-5 h-5" />
            История заданий
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
          <HelpCircle className="w-5 h-5" />
          Помощь
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
          <Settings className="w-5 h-5" />
          Настройки
        </button>
      </div>
    </aside>
  );
}

export default ExchangeSidebar;
