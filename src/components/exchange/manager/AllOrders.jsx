import React, { useState } from 'react';
import { Search, Filter, Package, Clock, AlertTriangle, Users, TrendingUp, DollarSign } from 'lucide-react';
import Input from '../ui/Input.jsx';
import Badge from '../ui/Badge.jsx';
import { Card, CardContent } from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';

const statusLabels = {
  active: 'Поиск исполнителя',
  in_progress: 'В работе',
  awaiting_payment: 'Ожидает оплаты',
  completed: 'Завершено',
};

const statusColors = {
  active: 'bg-blue-500/10 text-blue-500',
  in_progress: 'bg-yellow-500/10 text-yellow-500',
  awaiting_payment: 'bg-purple-500/10 text-purple-500',
  completed: 'bg-green-500/10 text-green-500',
};

export default function AllOrders({ orders, onSelect, selectedId }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.title.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    active: orders.filter((o) => o.status === 'active').length,
    inProgress: orders.filter((o) => o.status === 'in_progress').length,
    awaitingPayment: orders.filter((o) => o.status === 'awaiting_payment').length,
    withArbitration: orders.filter((o) => o.hasArbitration).length,
    unreadMessages: orders.reduce((acc, o) => acc + (o.unreadMessages || 0), 0),
  };

  return (
    <div className="flex flex-col lg:flex-row lg:h-full">
      <div className="flex-1 p-6 overflow-auto lg:border-r border-border">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Все упаковки</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Мониторинг всех активных заказов</p>
        </div>

        <div className="flex gap-2 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по номеру, названию или клиенту..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-secondary text-foreground text-sm h-9"
          >
            <option value="all">Все статусы</option>
            <option value="active">Поиск исполнителя</option>
            <option value="in_progress">В работе</option>
            <option value="awaiting_payment">Ожидает оплаты</option>
          </select>
        </div>

      {filteredOrders.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-8 text-center">
          <Package className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">Упаковки не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {filteredOrders.map((order) => (
            <button
              key={order.id}
              onClick={() => onSelect(order)}
              className={`w-full text-left bg-card border border-border rounded-lg p-4 hover:border-orange-500/50 transition-all group ${
                selectedId === order.id ? 'border-orange-500 ring-1 ring-orange-500/20' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-medium text-foreground text-sm group-hover:text-orange-500 transition-colors line-clamp-1">
                  {order.title}
                </h3>
                {order.unreadMessages > 0 && (
                  <span className="flex-shrink-0 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {order.unreadMessages}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge variant="outline" className={`text-xs ${statusColors[order.status]}`}>
                  {statusLabels[order.status]}
                </Badge>
                {order.hasArbitration && (
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Арбитраж
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {order.clientName}
                </span>
                {order.executorName && (
                  <>
                    <span>→</span>
                    <span className="text-foreground">{order.executorName}</span>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {order.articlesCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(order.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <span className="font-semibold text-foreground">{order.price || order.budget}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      </div>

      {!selectedId && (
        <div className="w-full lg:w-80 p-6 bg-secondary/30">
          <h2 className="text-sm font-medium text-foreground mb-4">Панель управления</h2>

          <div className="space-y-3">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-orange-500" />
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
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="text-lg font-semibold text-foreground">{stats.active}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Ищут исполнителя</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-lg font-semibold text-foreground">{stats.inProgress}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">В работе</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.awaitingPayment}</p>
                    <p className="text-xs text-muted-foreground">Ожидают оплаты</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {stats.withArbitration > 0 && (
              <Card className="bg-orange-500/5 border-orange-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-500">{stats.withArbitration}</p>
                      <p className="text-xs text-muted-foreground">Требуют арбитража</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Непрочитанных сообщений</span>
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

          <div className="mt-6 p-4 rounded-lg bg-orange-500/5 border border-orange-500/10">
            <p className="text-xs text-muted-foreground mb-2">Быстрые действия</p>
            <p className="text-sm text-foreground">Выберите заказ слева для просмотра деталей и подключения к чату.</p>
          </div>
        </div>
      )}
    </div>
  );
}

