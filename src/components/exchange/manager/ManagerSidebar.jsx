import React from 'react';
import { Package, CheckCircle, AlertTriangle, Calculator, Settings, HelpCircle, Bell, Shield, LogOut, User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient.js';
import Button from '../ui/Button.jsx';
import { cn } from '../../../lib/utils.js';

export default function ManagerSidebar({ currentView, onNavigate, arbitrationCount = 0, unreadCount = 0, profile, isMobileOpen, onMobileClose }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleHelp = () => {
    navigate('/');
  };

  const handleNavClick = (view) => {
    onNavigate(view);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const navItems = [
    {
      id: 'all-orders',
      icon: Package,
      label: 'Все упаковки',
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: 'completed',
      icon: CheckCircle,
      label: 'Завершённые',
    },
    {
      id: 'arbitration',
      icon: AlertTriangle,
      label: 'Арбитраж',
      badge: arbitrationCount > 0 ? arbitrationCount : undefined,
      badgeColor: 'bg-orange-500',
    },
    {
      id: 'estimation',
      icon: Calculator,
      label: 'Оценка стоимости',
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 border-r border-border bg-card flex flex-col transition-transform duration-300 ease-in-out",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
      <div className="p-4 lg:p-6 border-b border-border">
        <div className="flex items-center justify-between lg:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white dark:text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground text-sm lg:text-base">Биржа упаковки</h1>
              <p className="text-xs text-muted-foreground">Панель менеджера</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMobileClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {(arbitrationCount > 0 || unreadCount > 0) && (
        <div className="px-4 pt-4">
          <div className="p-3 bg-orange-500/10 rounded-lg flex items-center gap-3">
            <div className="relative">
              <Bell className="w-5 h-5 text-orange-500" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {arbitrationCount + (unreadCount > 0 ? 1 : 0)}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground font-medium">Требует внимания</p>
              <p className="text-xs text-muted-foreground">
                {arbitrationCount > 0 && `${arbitrationCount} арбитраж`}
                {arbitrationCount > 0 && unreadCount > 0 && ', '}
                {unreadCount > 0 && `${unreadCount} сообщ.`}
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <Button
                variant={currentView === item.id ? 'default' : 'ghost'}
                className={`w-full justify-start ${
                  currentView === item.id
                    ? 'bg-orange-500/10 text-orange-500'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
                onClick={() => handleNavClick(item.id)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span
                    className={`w-5 h-5 text-white dark:text-white text-xs rounded-full flex items-center justify-center ${
                      item.badgeColor || 'bg-destructive'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-border space-y-1">
        <div className="flex items-center gap-1 mb-3">
          <Button 
            variant="ghost" 
            className="flex-1 justify-start text-muted-foreground cursor-default hover:bg-transparent"
            disabled
          >
            <User className="w-5 h-5 mr-3" />
            <span className="flex-1 text-left truncate">{profile?.full_name || 'Пользователь'}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-muted-foreground hover:bg-secondary hover:text-foreground"
            onClick={handleSignOut}
            title="Выйти"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:bg-secondary hover:text-foreground"
          onClick={handleHelp}
        >
          <HelpCircle className="w-5 h-5 mr-3" />
          Помощь
        </Button>
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-secondary hover:text-foreground">
          <Settings className="w-5 h-5 mr-3" />
          Настройки
        </Button>
      </div>
    </aside>
    </>
  );
}

