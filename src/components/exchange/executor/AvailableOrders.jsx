import React, { useState } from 'react';
import { Search, Filter, Clock, Package, Users, Star, TrendingUp, Briefcase, DollarSign } from 'lucide-react';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import Badge from '../ui/Badge.jsx';
import { Avatar, AvatarFallback } from '../ui/Avatar.jsx';
import { Card, CardContent } from '../ui/Card.jsx';
import { cn } from '../../../lib/utils.js';

export default function AvailableOrders({ orders, onSelect, user, selectedId }) {
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

  const stats = {
    totalOrders: orders.length,
    avgBudget:
      orders.length > 0
        ? Math.round(orders.reduce((acc, o) => acc + Number.parseInt((o.budget || '0').replace(/\D/g, '')), 0) / orders.length)
        : 0,
    urgentOrders: orders.filter((o) => {
      const days = getDaysUntilDeadline(o.deadline);
      return days !== null && days <= 7;
    }).length,
    popularOrders: orders.filter((o) => (o.responsesCount || 0) > 3).length,
  };

  return (
    <div className="flex flex-col lg:flex-row lg:h-full">
      <div className="flex-1 p-6 overflow-auto lg:border-r border-border">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Доступные заказы</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Найдите подходящие заказы на упаковку</p>
        </div>

        <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию или клиенту..."
              className="pl-9 h-9 bg-secondary border-border text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 border-border bg-transparent">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 text-xs">
            Все
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-secondary bg-transparent text-xs">
            Косметика
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-secondary bg-transparent text-xs">
            Электроника
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-secondary bg-transparent text-xs">
            Одежда
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-secondary bg-transparent text-xs">
            Подарки
          </Badge>
        </div>

      {filteredOrders.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-1 text-sm">Нет доступных заказов</h3>
          <p className="text-muted-foreground text-xs">Новые заказы появляются регулярно</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {filteredOrders.map((order) => {
            const daysLeft = getDaysUntilDeadline(order.deadline);

            return (
              <button
                key={order.id}
                onClick={() => onSelect(order)}
                className={cn(
                  'w-full text-left bg-card border border-border rounded-lg p-4 hover:border-accent/50 transition-all group',
                  selectedId === order.id && 'border-accent ring-1 ring-accent/20'
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-foreground text-sm group-hover:text-accent transition-colors line-clamp-1">
                    {order.title}
                  </h3>
                  {order.responsesCount > 3 && (
                    <Badge className="bg-orange-500/20 text-orange-400 text-xs flex-shrink-0">Популярный</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Avatar className="h-4 w-4">
                    <AvatarFallback className="bg-primary/20 text-primary text-[8px]">
                      {order.clientName?.slice(0, 2) || 'КЛ'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="line-clamp-1">{order.clientName || 'Клиент'}</span>
                  <span className="flex items-center gap-0.5 flex-shrink-0">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    {order.clientRating || 'N/A'}
                  </span>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="flex-shrink-0">{getTimeAgo(order.createdAt)}</span>
                </div>

                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{order.description}</p>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {order.articlesCount || 0}
                    </span>
                    {daysLeft !== null && (
                      <span className={cn('flex items-center gap-1', daysLeft <= 5 ? 'text-orange-400' : '')}>
                        <Clock className="w-3 h-3" />
                        {daysLeft}д
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {order.responsesCount || 0}
                    </span>
                  </div>
                  <span className="font-semibold text-foreground">{order.budget || 'Не указан'}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
      </div>

      {!selectedId && (
        <div className="w-full lg:w-80 p-6 bg-secondary/30">
          <h2 className="text-sm font-medium text-foreground mb-4">Обзор рынка</h2>

          <div className="space-y-3">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
                    <p className="text-xs text-muted-foreground">Доступно заказов</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-card border-border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span className="text-lg font-semibold text-foreground">{stats.urgentOrders}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Срочных</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    <span className="text-lg font-semibold text-foreground">{stats.popularOrders}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Популярных</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.avgBudget.toLocaleString()} ₽</p>
                    <p className="text-xs text-muted-foreground">Средний бюджет</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-2">Рекомендация</p>
                <p className="text-sm text-foreground">
                  Откликайтесь на заказы с меньшим количеством конкурентов для повышения шансов.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-accent/5 border border-accent/10">
            <p className="text-xs text-muted-foreground mb-2">Статус</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <p className="text-sm text-foreground">Вы можете принимать заказы</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

