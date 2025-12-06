"use client"

import { Package, Plus, History, Settings, HelpCircle, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ViewType } from "@/app/page"

interface SidebarProps {
  currentView: ViewType
  onNavigate: (view: ViewType) => void
}

const notifications = {
  packagings: 2, // непрочитанные отклики
  messages: 3, // непрочитанные сообщения
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const totalNotifications = notifications.packagings + notifications.messages

  const navItems = [
    {
      id: "list" as const,
      icon: Package,
      label: "Мои упаковки",
      badge: notifications.packagings,
    },
    { id: "create" as const, icon: Plus, label: "Создать задание" },
  ]

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Биржа упаковки</h1>
            <p className="text-xs text-muted-foreground">Личный кабинет</p>
          </div>
        </div>
      </div>

      {totalNotifications > 0 && (
        <div className="px-4 pt-4">
          <div className="p-3 bg-primary/10 rounded-lg flex items-center gap-3">
            <div className="relative">
              <Bell className="w-5 h-5 text-primary" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {totalNotifications}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground font-medium">Новые уведомления</p>
              <p className="text-xs text-muted-foreground">
                {notifications.packagings > 0 && `${notifications.packagings} откликов`}
                {notifications.packagings > 0 && notifications.messages > 0 && ", "}
                {notifications.messages > 0 && `${notifications.messages} сообщений`}
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  currentView === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Архив</p>
          <button
            onClick={() => onNavigate("list")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <History className="w-5 h-5" />
            История заданий
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-border space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <HelpCircle className="w-5 h-5" />
          Помощь
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <Settings className="w-5 h-5" />
          Настройки
        </button>
      </div>
    </aside>
  )
}
