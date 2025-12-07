import React from 'react';
import { Clock, Package, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import { cn } from '../../../lib/utils.js';

export default function MyOrders({ orders, onSelect }) {
  const activeOrders = orders.filter((o) => o.status === 'in_progress' || o.status === 'awaiting_payment');
  const completedOrders = orders.filter((o) => o.status === 'completed');

  const getTimeRemaining = (deadline) => {
    if (!deadline) return { text: 'Не указан', isOverdue: false, isUrgent: false };
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffMs = deadlineDate.getTime() - now.getTime();

    if (diffMs < 0) return { text: 'Просрочено', isOverdue: true, days: 0, hours: 0 };

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays === 0) {
      return { text: `${diffHours}ч`, isOverdue: false, isUrgent: true, days: 0, hours: diffHours };
    }
    if (diffDays <= 2) {
      return { text: `${diffDays}д ${diffHours}ч`, isOverdue: false, isUrgent: true, days: diffDays, hours: diffHours };
    }
    return { text: `${diffDays} дней`, isOverdue: false, isUrgent: false, days: diffDays, hours: diffHours };
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-semibold text-foreground">Мои упаковки</h1>
        <p className="text-sm lg:text-base text-muted-foreground mt-1">Активные и завершённые заказы</p>
      </div>

      {activeOrders.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            В работе ({activeOrders.length})
          </h2>
          <div className="space-y-3">
            {activeOrders.map((order) => {
              const remaining = getTimeRemaining(order.deadline);

              return (
                <button
                  key={order.id}
                  onClick={() => onSelect(order)}
                  className="w-full text-left bg-card border border-border rounded-xl p-4 lg:p-5 hover:border-accent/50 transition-all group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-2">
                        <h3 className="font-medium text-sm lg:text-base text-foreground group-hover:text-accent transition-colors break-words">
                          {order.title}
                        </h3>
                        <Badge className={cn(
                          'text-xs lg:text-sm',
                          order.status === 'in_progress' ? 'bg-accent/20 text-accent' :
                          order.status === 'awaiting_payment' ? 'bg-purple-500/20 text-purple-500' :
                          'bg-muted text-muted-foreground'
                        )}>
                          {order.status === 'in_progress' ? 'В работе' :
                           order.status === 'awaiting_payment' ? 'Ожидает оплаты' :
                           'Активно'}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-xs lg:text-sm text-muted-foreground mb-3">
                        <span className="truncate">Клиент: {order.clientName || 'Клиент'}</span>
                        <span className="flex items-center gap-1.5">
                          <Package className="w-3 h-3 lg:w-4 lg:h-4" />
                          {order.articlesCount || 0} артикулов
                        </span>
                      </div>

                      <div
                        className={cn(
                          'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium',
                          remaining.isOverdue
                            ? 'bg-destructive/20 text-destructive'
                            : remaining.isUrgent
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-accent/10 text-accent'
                        )}
                      >
                        {remaining.isOverdue ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        {remaining.isOverdue ? 'Срок истёк' : `Осталось: ${remaining.text}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{order.price || 'Не указана'}</p>
                        <p className="text-xs text-muted-foreground">стоимость</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {activeOrders.length === 0 && (
        <div className="border border-dashed border-border rounded-xl p-12 text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-2">Нет активных заказов</h3>
          <p className="text-muted-foreground text-sm">Откликнитесь на доступные заказы, чтобы начать работу</p>
        </div>
      )}

      {completedOrders.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Завершённые ({completedOrders.length})
          </h2>
          <div className="space-y-3">
            {completedOrders.map((order) => (
              <button
                key={order.id}
                onClick={() => onSelect(order)}
                className="w-full text-left bg-card border border-border rounded-xl p-5 opacity-70 hover:opacity-100 hover:border-accent/50 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-foreground group-hover:text-accent transition-colors">
                        {order.title}
                      </h3>
                      <Badge className="bg-muted text-muted-foreground">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Завершено
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Клиент: {order.clientName || 'Клиент'}</span>
                      <span className="flex items-center gap-1.5">
                        <Package className="w-4 h-4" />
                        {order.articlesCount || 0} артикулов
                      </span>
                      {order.completedAt && (
                        <span>Завершено: {new Date(order.completedAt).toLocaleDateString('ru-RU')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{order.price || 'Не указана'}</p>
                      <p className="text-xs text-muted-foreground">получено</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

