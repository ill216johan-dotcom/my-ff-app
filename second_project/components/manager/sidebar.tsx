"use client"

import { Package, CheckCircle, AlertTriangle, Calculator, Settings, HelpCircle, Bell, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ManagerView } from "@/app/manager/page"

interface ManagerSidebarProps {
  currentView: ManagerView
  onNavigate: (view: ManagerView) => void
  arbitrationCount: number
  unreadCount: number
}

export function ManagerSidebar({ currentView, onNavigate, arbitrationCount, unreadCount }: ManagerSidebarProps) {
  const navItems = [
    {
      id: "all-orders" as const,
      icon: Package,
      label: "Все упаковки",
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: "completed" as const,
      icon: CheckCircle,
      label: "Завершённые",
    },
    {
      id: "arbitration" as const,
      icon: AlertTriangle,
      label: "Арбитраж",
      badge: arbitrationCount > 0 ? arbitrationCount : undefined,
      badgeColor: "bg-orange-500",
    },
    {
      id: "estimation" as const,
      icon: Calculator,
      label: "Оценка стоимости",
    },
  ]

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Биржа упаковки</h1>
            <p className="text-xs text-muted-foreground">Панель менеджера</p>
          </div>
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
                {arbitrationCount > 0 && unreadCount > 0 && ", "}
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
              <button
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  currentView === item.id
                    ? "bg-orange-500/10 text-orange-500"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span
                    className={cn(
                      "w-5 h-5 text-white text-xs rounded-full flex items-center justify-center",
                      item.badgeColor || "bg-destructive",
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
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
