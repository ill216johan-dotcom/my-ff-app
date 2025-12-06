import React, { useState } from 'react';
import { Search, Filter, Package, MessageSquare, Clock, AlertTriangle, Users } from 'lucide-react';
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

export default function AllOrders({ orders, onSelect }) {
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Все упаковки</h1>
        <p className="text-muted-foreground">Мониторинг всех активных заказов</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по номеру, названию или клиенту..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-border bg-secondary text-foreground"
        >
          <option value="all">Все статусы</option>
          <option value="active">Поиск исполнителя</option>
          <option value="in_progress">В работе</option>
          <option value="awaiting_payment">Ожидает оплаты</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Упаковки не найдены</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="cursor-pointer hover:border-orange-500/50 transition-colors"
              onClick={() => onSelect(order)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground truncate">{order.title}</h3>
                      <Badge variant="outline" className={statusColors[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                      {order.hasArbitration && (
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Арбитраж
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {order.clientName}
                      </span>
                      {order.executorName && <span className="text-foreground">→ {order.executorName}</span>}
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {order.articlesCount} артикулов
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        до {new Date(order.deadline).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{order.price ? 'Согласовано' : 'Бюджет'}</p>
                      <p className="font-semibold text-foreground">{order.price || order.budget}</p>
                    </div>
                    {order.unreadMessages > 0 && (
                      <div className="relative">
                        <MessageSquare className="w-5 h-5 text-muted-foreground" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                          {order.unreadMessages}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

