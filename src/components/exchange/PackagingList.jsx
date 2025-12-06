import React from 'react';
import { Plus, Package, Clock, MessageSquare, ChevronRight, Search, Filter } from 'lucide-react';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Badge } from './ui/badge.jsx';
import { cn } from '../../lib/utils.js';

const statusConfig = {
  draft: { label: 'Черновик', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200' },
  active: { label: 'Активно', className: 'bg-orange-100 text-orange-600' },
  in_progress: { label: 'В работе', className: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Завершено', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200' },
  cancelled: { label: 'Отменено', className: 'bg-red-100 text-red-600' },
};

function PackagingList({ packagings, onSelect, onCreate }) {
  const activePackagings = packagings.filter((p) => ['active', 'in_progress', 'draft'].includes(p.status));
  const archivedPackagings = packagings.filter((p) => ['completed', 'cancelled'].includes(p.status));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Мои упаковки</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Управляйте заданиями на упаковку товаров</p>
        </div>
        <Button onClick={onCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Создать задание
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Поиск по названию..." className="pl-10 bg-slate-50 dark:bg-slate-800/50" />
        </div>
        <Button variant="outline" size="icon" className="border-slate-200 dark:border-slate-700 bg-transparent">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {activePackagings.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Активные задания</h2>
          <div className="space-y-3">
            {activePackagings.map((packaging) => (
              <PackagingCard key={packaging.id} packaging={packaging} onSelect={onSelect} />
            ))}
          </div>
        </section>
      )}

      {activePackagings.length === 0 && (
        <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-medium text-slate-900 dark:text-white mb-2">Нет активных заданий</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
            Создайте новое задание на упаковку, чтобы получить отклики исполнителей
          </p>
          <Button onClick={onCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Создать первое задание
          </Button>
        </div>
      )}

      {archivedPackagings.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">История</h2>
          <div className="space-y-3">
            {archivedPackagings.map((packaging) => (
              <PackagingCard key={packaging.id} packaging={packaging} onSelect={onSelect} isArchived />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PackagingCard({ packaging, onSelect, isArchived = false }) {
  const status = statusConfig[packaging.status];

  return (
    <button
      onClick={() => onSelect(packaging)}
      className={cn(
        'w-full text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-orange-300 transition-all group',
        isArchived && 'opacity-70 hover:opacity-100',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-medium text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">
              {packaging.title}
            </h3>
            <Badge className={cn('text-xs', status.className)}>{status.label}</Badge>
            {packaging.unreadMessages > 0 && (
              <Badge className="bg-red-100 text-red-600 text-xs">{packaging.unreadMessages} новых</Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Package className="w-4 h-4" />
              {packaging.articlesCount} артикулов
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              до {new Date(packaging.deadline).toLocaleDateString('ru-RU')}
            </span>
            {packaging.responsesCount > 0 && (
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                {packaging.responsesCount} откликов
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold text-slate-900 dark:text-white">{packaging.budget}</p>
            <p className="text-xs text-slate-500">бюджет</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
        </div>
      </div>
    </button>
  );
}

export default PackagingList;
