import React, { useState } from 'react';
import { Search, Filter, Clock, Package, Users, ChevronRight, Star } from 'lucide-react';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import Badge from '../ui/Badge.jsx';
import { Avatar, AvatarFallback } from '../ui/Avatar.jsx';
import { cn } from '../../../lib/utils.js';

export default function AvailableOrders({ orders, onSelect, user }) {
  const [searchQuery, setSearchQuery] = useState('');

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'только что';
    if (diffHours < 24) return `${diffHours}ч назад`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}д назад`;
  };

  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredOrders = orders.filter((order) => {
    const clientName = order.clientName || '';
    return (
      order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Доступные заказы</h1>
        <p className="text-muted-foreground mt-1">Найдите подходящие заказы на упаковку</p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию или клиенту..."
            className="pl-10 bg-secondary border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="border-border bg-transparent">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
          Все
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-secondary bg-transparent">
          Косметика
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-secondary bg-transparent">
          Электроника
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-secondary bg-transparent">
          Одежда
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-secondary bg-transparent">
          Подарки
        </Badge>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-2">Нет доступных заказов</h3>
            <p className="text-muted-foreground text-sm">
              Новые заказы появляются регулярно. Проверьте позже или настройте уведомления.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const daysLeft = getDaysUntilDeadline(order.deadline);

            return (
              <button
                key={order.id}
                onClick={() => onSelect(order)}
                className="w-full text-left bg-card border border-border rounded-xl p-5 hover:border-accent/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium text-foreground group-hover:text-accent transition-colors">
                        {order.title}
                      </h3>
                      {order.responsesCount > 3 && (
                        <Badge className="bg-orange-500/20 text-orange-400 text-xs">Популярный</Badge>
                      )}
                      {order.isEstimation && (
                        <Badge className="bg-orange-500/20 text-orange-400 text-xs">Оценка</Badge>
                      )}
                      {order.hasBid && (
                        <Badge className="bg-blue-500/20 text-blue-400 text-xs">Вы откликнулись</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
                          {order.clientName?.slice(0, 2) || 'КЛ'}
                        </AvatarFallback>
                      </Avatar>
                      <span>{order.clientName || 'Клиент'}</span>
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        {order.clientRating || 'N/A'}
                      </span>
                      <span className="text-muted-foreground/50">•</span>
                      <span>{getTimeAgo(order.createdAt)}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{order.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Package className="w-4 h-4" />
                      {order.articlesCount || 0} артикулов
                    </span>
                    {daysLeft !== null && (
                      <span
                        className={cn(
                          'flex items-center gap-1.5',
                          daysLeft <= 5 ? 'text-orange-400' : 'text-muted-foreground'
                        )}
                      >
                        <Clock className="w-4 h-4" />
                        {daysLeft} дней до дедлайна
                      </span>
                    )}
                    {order.responsesCount > 0 && (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {order.responsesCount} откликов
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{order.budget || 'Не указан'}</p>
                    <p className="text-xs text-muted-foreground">бюджет</p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

