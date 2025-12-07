import React, { useState } from 'react';
import { Plus, Package, Clock, MessageSquare, ChevronRight, Search, Filter } from 'lucide-react';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Badge from '../ui/Badge.jsx';
import { cn } from '../../../lib/utils.js';

const statusConfig = {
  draft: { label: 'Черновик', className: 'bg-muted text-muted-foreground' },
  active: { label: 'Активно', className: 'bg-primary/20 text-primary' },
  in_progress: { label: 'В работе', className: 'bg-accent/20 text-accent' },
  completed: { label: 'Завершено', className: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Отменено', className: 'bg-destructive/20 text-destructive' },
};

export default function PackagingList({ packagings, onSelect, onCreate }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPackagings = packagings.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activePackagings = filteredPackagings.filter((p) =>
    ['active', 'in_progress', 'draft'].includes(p.status)
  );
  const archivedPackagings = filteredPackagings.filter((p) =>
    ['completed', 'cancelled'].includes(p.status)
  );

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8 mt-4 lg:mt-12 gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-foreground">Мои упаковки</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">Управляйте заданиями на упаковку товаров</p>
        </div>
        <Button onClick={onCreate} className="gap-2 w-full lg:w-auto">
          <Plus className="w-4 h-4" />
          Создать задание
        </Button>
      </div>

      <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию..."
            className="pl-10 bg-secondary border-border text-sm lg:text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="border-border bg-transparent flex-shrink-0">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {activePackagings.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Активные задания
          </h2>
          <div className="space-y-3">
            {activePackagings.map((packaging) => (
              <PackagingCard key={packaging.id} packaging={packaging} onSelect={onSelect} />
            ))}
          </div>
        </section>
      )}

      {activePackagings.length === 0 && (
        <div className="border border-dashed border-border rounded-xl p-12 text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-2">Нет активных заданий</h3>
          <p className="text-muted-foreground text-sm mb-4">
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
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">История</h2>
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
  const status = statusConfig[packaging.status] || { label: packaging.status, className: 'bg-muted text-muted-foreground' };

  return (
    <button
      onClick={() => onSelect(packaging)}
      className={cn(
        'w-full text-left bg-card border border-border rounded-xl p-4 lg:p-5 hover:border-primary/50 transition-all group',
        isArchived && 'opacity-70 hover:opacity-100'
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 lg:gap-0">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-2">
            <h3 className="font-medium text-sm lg:text-base text-foreground group-hover:text-primary transition-colors break-words">
              {packaging.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn('text-xs', status.className)}>{status.label}</Badge>
              {packaging.unreadMessages > 0 && (
                <Badge className="bg-destructive text-destructive-foreground text-xs">
                  {packaging.unreadMessages} новых
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-xs lg:text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Package className="w-3 h-3 lg:w-4 lg:h-4" />
              {packaging.articlesCount || 0} артикулов
            </span>
            {packaging.deadline && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
                до {new Date(packaging.deadline).toLocaleDateString('ru-RU')}
              </span>
            )}
            {packaging.responsesCount > 0 && (
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3 lg:w-4 lg:h-4" />
                {packaging.responsesCount} откликов
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between lg:justify-end gap-4 lg:gap-4">
          <div className="text-left lg:text-right">
            <p className="font-semibold text-sm lg:text-base text-foreground">{packaging.budget || 'Не указан'}</p>
            <p className="text-xs text-muted-foreground">бюджет</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </div>
      </div>
    </button>
  );
}

