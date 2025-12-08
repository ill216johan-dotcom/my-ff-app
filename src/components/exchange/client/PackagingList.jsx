import React, { useState } from 'react';
import { Plus, Package, Clock, MessageSquare, Search, Filter, TrendingUp, CheckCircle, Hourglass } from 'lucide-react';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Badge from '../ui/Badge.jsx';
import { Card, CardContent } from '../ui/Card.jsx';
import { cn } from '../../../lib/utils.js';

const statusConfig = {
  draft: { label: 'Черновик', className: 'bg-muted text-muted-foreground' },
  active: { label: 'Активно', className: 'bg-primary/20 text-primary' },
  in_progress: { label: 'В работе', className: 'bg-accent/20 text-accent' },
  completed: { label: 'Завершено', className: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Отменено', className: 'bg-destructive/20 text-destructive' },
};

export default function PackagingList({ packagings, onSelect, onCreate, selectedId }) {
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

  const stats = {
    total: packagings.length,
    active: packagings.filter((p) => p.status === 'active').length,
    inProgress: packagings.filter((p) => p.status === 'in_progress').length,
    completed: packagings.filter((p) => p.status === 'completed').length,
    totalResponses: packagings.reduce((acc, p) => acc + (p.responsesCount || 0), 0),
    unreadMessages: packagings.reduce((acc, p) => acc + (p.unreadMessages || 0), 0),
  };

  return (
    <div className="flex flex-col lg:flex-row lg:h-full">
      <div className="flex-1 p-6 overflow-auto lg:border-r border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Мои упаковки</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Управляйте заданиями на упаковку</p>
          </div>
          <Button onClick={onCreate} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Создать
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск..."
              className="pl-9 h-9 bg-secondary border-border text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 border-border bg-transparent">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {activePackagings.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Активные</h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {activePackagings.map((packaging) => (
              <PackagingCard key={packaging.id} packaging={packaging} onSelect={onSelect} />
            ))}
          </div>
        </section>
      )}

        {activePackagings.length === 0 && (
          <div className="border border-dashed border-border rounded-xl p-8 text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1 text-sm">Нет активных заданий</h3>
            <p className="text-muted-foreground text-xs mb-3">Создайте новое задание на упаковку</p>
            <Button onClick={onCreate} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Создать первое задание
            </Button>
          </div>
        )}

        {archivedPackagings.length > 0 && (
          <section>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">История</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {archivedPackagings.map((packaging) => (
                <PackagingCard
                  key={packaging.id}
                  packaging={packaging}
                  onSelect={onSelect}
                  isArchived
                  isSelected={selectedId === packaging.id}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {!selectedId && (
        <div className="w-full lg:w-80 p-6 bg-secondary/30">
          <h2 className="text-sm font-medium text-foreground mb-4">Обзор</h2>

          <div className="space-y-3">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Всего упаковок</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-card border-border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-lg font-semibold text-foreground">{stats.active}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Ищут исполнителя</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Hourglass className="w-4 h-4 text-accent" />
                    <span className="text-lg font-semibold text-foreground">{stats.inProgress}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">В работе</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
                    <p className="text-xs text-muted-foreground">Завершено</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Откликов получено</span>
                  <span className="text-sm font-medium text-foreground">{stats.totalResponses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Непрочитанных</span>
                  <Badge
                    variant="secondary"
                    className={stats.unreadMessages > 0 ? 'bg-destructive/20 text-destructive' : ''}
                  >
                    {stats.unreadMessages}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-xs text-muted-foreground mb-2">Совет</p>
            <p className="text-sm text-foreground">
              Чем подробнее описание задания, тем качественнее будут отклики исполнителей.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function PackagingCard({ packaging, onSelect, isArchived = false, isSelected = false }) {
  const status = statusConfig[packaging.status] || { label: packaging.status, className: 'bg-muted text-muted-foreground' };

  return (
    <button
      onClick={() => onSelect(packaging)}
      className={cn(
        'w-full text-left bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-all group',
        isArchived && 'opacity-70 hover:opacity-100',
        isSelected && 'border-primary ring-1 ring-primary/20'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1">
          {packaging.title}
        </h3>
        {packaging.unreadMessages > 0 && (
          <span className="flex-shrink-0 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
            {packaging.unreadMessages}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Badge className={cn('text-xs px-2 py-0', status.className)}>{status.label}</Badge>
        {packaging.responsesCount > 0 && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {packaging.responsesCount}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Package className="w-3 h-3" />
          {packaging.articlesCount || 0} арт.
        </span>
        {packaging.deadline && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(packaging.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
          </span>
        )}
        <span className="font-medium text-foreground">{packaging.budget || 'Не указан'}</span>
      </div>
    </button>
  );
}

