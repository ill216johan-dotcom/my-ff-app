import React from 'react';
import { Package, Search, Briefcase, Settings, HelpCircle, User, Bell, MessageSquare } from 'lucide-react';
import { cn } from '../../../lib/utils.js';
import { Avatar, AvatarFallback } from '../ui/Avatar.jsx';
import Button from '../ui/Button.jsx';

export default function ExecutorSidebar({ currentView, onNavigate, notifications = { newOrders: 0, messages: 0, myOrders: 0 } }) {
  const totalNotifications = notifications.newOrders + notifications.messages + notifications.myOrders;

  const navItems = [
    {
      id: 'available',
      icon: Search,
      label: 'Доступные заказы',
      badge: notifications.newOrders,
    },
    {
      id: 'my-orders',
      icon: Briefcase,
      label: 'Мои упаковки',
      badge: notifications.myOrders + notifications.messages,
    },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
            <Package className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Биржа упаковки</h1>
            <p className="text-xs text-muted-foreground">Кабинет исполнителя</p>
          </div>
        </div>
      </div>

      {totalNotifications > 0 && (
        <div className="px-4 pt-4">
          <div className="p-3 bg-accent/10 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <Bell className="w-5 h-5 text-accent" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {totalNotifications}
                </span>
              </div>
              <p className="text-sm text-foreground font-medium">Уведомления</p>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              {notifications.newOrders > 0 && (
                <p className="flex items-center gap-2">
                  <Search className="w-3 h-3" />
                  {notifications.newOrders} новых заказов
                </p>
              )}
              {notifications.messages > 0 && (
                <p className="flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" />
                  {notifications.messages} сообщений
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <Button
                variant={currentView === item.id || (item.id === 'available' && currentView === 'order-detail') || (item.id === 'my-orders' && currentView === 'active-detail') ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  currentView === item.id ||
                    (item.id === 'available' && currentView === 'order-detail') ||
                    (item.id === 'my-orders' && currentView === 'active-detail')
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
                onClick={() => onNavigate(item.id)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-accent/20 text-accent text-sm">ПП</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground text-sm truncate">ПакПро</p>
            <p className="text-xs text-muted-foreground">Рейтинг: 4.8</p>
          </div>
        </div>

        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-secondary hover:text-foreground">
            <User className="w-5 h-5 mr-3" />
            Профиль
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-secondary hover:text-foreground">
            <HelpCircle className="w-5 h-5 mr-3" />
            Помощь
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-secondary hover:text-foreground">
            <Settings className="w-5 h-5 mr-3" />
            Настройки
          </Button>
        </div>
      </div>
    </aside>
  );
}

