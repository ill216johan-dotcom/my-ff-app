import React from 'react';
import { Clock, Package, CheckCircle, AlertTriangle, DollarSign, Hourglass } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import { Card, CardContent } from '../ui/Card.jsx';
import { cn } from '../../../lib/utils.js';

export default function MyOrders({ orders, onSelect, selectedId }) {
  const activeOrders = orders.filter((o) => o.status === 'in_progress' || o.status === 'awaiting_payment');
  const completedOrders = orders.filter((o) => o.status === 'completed');

  const stats = {
    total: orders.length,
    inProgress: orders.filter((o) => o.status === 'in_progress').length,
    awaitingPayment: orders.filter((o) => o.status === 'awaiting_payment').length,
    completed: completedOrders.length,
    totalEarned: completedOrders.reduce((acc, o) => {
      const priceStr = o.price || '0';
      const priceNum = Number.parseInt(priceStr.replace(/\D/g, '')) || 0;
      return acc + priceNum;
    }, 0),
  };

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
    <div className="flex flex-col lg:flex-row lg:h-full">
      <div className="flex-1 p-6 overflow-auto lg:border-r border-border">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Мои упаковки</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Активные и завершённые заказы</p>
        </div>

      {activeOrders.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            В работе ({activeOrders.length})
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {activeOrders.map((order) => {
              const remaining = getTimeRemaining(order.deadline);

              return (
                <button
                  key={order.id}
                  onClick={() => onSelect(order)}
                  className={`w-full text-left bg-card border border-border rounded-lg p-4 hover:border-accent/50 transition-all group ${
                    selectedId === order.id ? 'border-accent ring-1 ring-accent/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-foreground text-sm group-hover:text-accent transition-colors line-clamp-1">
                      {order.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={cn(
                      'text-xs',
                      order.status === 'in_progress' ? 'bg-accent/20 text-accent' :
                      order.status === 'awaiting_payment' ? 'bg-purple-500/20 text-purple-500' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {order.status === 'in_progress' ? 'В работе' :
                       order.status === 'awaiting_payment' ? 'Ожидает оплаты' :
                       'Активно'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                    <span className="truncate">Клиент: {order.clientName || 'Клиент'}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {order.articlesCount || 0}
                      </span>
                    </div>
                    <span className="font-semibold text-foreground">{order.price || 'Не указана'}</span>
                  </div>

                  <div
                    className={cn(
                      'inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-medium',
                      remaining.isOverdue
                        ? 'bg-destructive/20 text-destructive'
                        : remaining.isUrgent
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-accent/10 text-accent'
                    )}
                  >
                    {remaining.isOverdue ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {remaining.isOverdue ? 'Срок истёк' : remaining.text}
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {completedOrders.map((order) => (
              <button
                key={order.id}
                onClick={() => onSelect(order)}
                className={`w-full text-left bg-card border border-border rounded-lg p-4 opacity-70 hover:opacity-100 hover:border-accent/50 transition-all group ${
                  selectedId === order.id ? 'border-accent ring-1 ring-accent/20' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-foreground text-sm group-hover:text-accent transition-colors line-clamp-1">
                    {order.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-muted text-muted-foreground text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Завершено
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                  <span>Клиент: {order.clientName || 'Клиент'}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {order.articlesCount || 0}
                    </span>
                    {order.completedAt && (
                      <span>{new Date(order.completedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                    )}
                  </div>
                  <span className="font-semibold text-foreground">{order.price || 'Не указана'}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
      </div>

      {!selectedId && (
        <div className="w-full lg:w-80 p-6 bg-secondary/30">
          <h2 className="text-sm font-medium text-foreground mb-4">Моя статистика</h2>

          <div className="space-y-3">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Всего заказов</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-card border-border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Hourglass className="w-4 h-4 text-accent" />
                    <span className="text-lg font-semibold text-foreground">{stats.inProgress}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">В работе</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="text-lg font-semibold text-foreground">{stats.awaitingPayment}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Ждут оплаты</p>
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
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalEarned.toLocaleString()} ₽</p>
                    <p className="text-xs text-muted-foreground">Заработано всего</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-accent/5 border border-accent/10">
            <p className="text-xs text-muted-foreground mb-2">Совет</p>
            <p className="text-sm text-foreground">Завершайте заказы вовремя для поддержания высокого рейтинга.</p>
          </div>
        </div>
      )}
    </div>
  );
}







