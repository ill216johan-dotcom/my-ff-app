"use client"

import { AlertTriangle, Users, Clock, MessageSquare, ArrowRight, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ManagerOrder } from "@/app/manager/page"

interface ArbitrationListProps {
  orders: ManagerOrder[]
  selectedId?: string
  onSelect: (order: ManagerOrder) => void
}

export function ArbitrationList({ orders, selectedId, onSelect }: ArbitrationListProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffHours < 1) return "менее часа назад"
    if (diffHours < 24) return `${diffHours} ч. назад`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} дн. назад`
  }

  const stats = {
    total: orders.length,
    byClient: orders.filter((o) => o.arbitrationRequestedBy === "client").length,
    byExecutor: orders.filter((o) => o.arbitrationRequestedBy === "executor").length,
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 overflow-auto border-r border-border">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Запросы на арбитраж</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Спорные ситуации, требующие вмешательства</p>
        </div>

        {orders.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-8 text-center">
            <AlertTriangle className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">Нет активных запросов на арбитраж</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => onSelect(order)}
                className={cn(
                  "w-full text-left border border-orange-500/30 bg-orange-500/5 rounded-lg p-4 hover:border-orange-500/50 transition-all group",
                  selectedId === order.id && "border-orange-500 ring-1 ring-orange-500/20",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <h3 className="font-medium text-foreground text-sm line-clamp-1">{order.title}</h3>
                      <Badge
                        variant="outline"
                        className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-xs flex-shrink-0"
                      >
                        {order.arbitrationRequestedBy === "client" ? "Клиент" : "Исполнитель"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Users className="w-3 h-3" />
                      <span>{order.clientName}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span className="text-foreground">{order.executorName}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {order.arbitrationRequestedAt && formatTimeAgo(order.arbitrationRequestedAt)}
                      </span>
                      {order.unreadMessages > 0 && (
                        <span className="flex items-center gap-1 text-destructive">
                          <MessageSquare className="w-3 h-3" />
                          {order.unreadMessages} новых
                        </span>
                      )}
                    </div>

                    <div className="mt-2 p-2 bg-background/50 rounded text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Причина: </span>
                      {order.arbitrationRequestedBy === "client"
                        ? "Просрочка дедлайна более 24ч"
                        : "Счёт не оплачен более 24ч"}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelect(order)
                    }}
                  >
                    Подключиться
                  </Button>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {!selectedId && (
        <div className="w-80 p-6 bg-secondary/30">
          <h2 className="text-sm font-medium text-foreground mb-4">Обзор арбитража</h2>

          <div className="space-y-3">
            <Card className="bg-orange-500/5 border-orange-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-500">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Требуют внимания</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-card border-border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-lg font-semibold text-foreground">{stats.byClient}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">От клиентов</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-accent" />
                    <span className="text-lg font-semibold text-foreground">{stats.byExecutor}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">От исполнителей</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-orange-500/5 border border-orange-500/10">
            <p className="text-xs text-muted-foreground mb-2">Рекомендация</p>
            <p className="text-sm text-foreground">
              Приоритизируйте запросы по времени ожидания. Чем дольше ждёт клиент, тем выше приоритет.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
