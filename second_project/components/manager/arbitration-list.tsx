"use client"

import { AlertTriangle, Users, Clock, MessageSquare, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { ManagerOrder } from "@/app/manager/page"

interface ArbitrationListProps {
  orders: ManagerOrder[]
  onSelect: (order: ManagerOrder) => void
}

export function ArbitrationList({ orders, onSelect }: ArbitrationListProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffHours < 1) return "менее часа назад"
    if (diffHours < 24) return `${diffHours} ч. назад`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} дн. назад`
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Запросы на арбитраж</h1>
        <p className="text-muted-foreground">Спорные ситуации, требующие вмешательства</p>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Нет активных запросов на арбитраж</p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="border-orange-500/30 bg-orange-500/5">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      <h3 className="font-semibold text-foreground truncate">{order.title}</h3>
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                        Запрошен {order.arbitrationRequestedBy === "client" ? "клиентом" : "исполнителем"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm mb-3">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {order.clientName}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{order.executorName}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Запрошен {order.arbitrationRequestedAt && formatTimeAgo(order.arbitrationRequestedAt)}
                      </span>
                      {order.unreadMessages > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {order.unreadMessages} новых сообщений
                        </span>
                      )}
                    </div>

                    <div className="mt-3 p-3 bg-background/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Причина: </span>
                        {order.arbitrationRequestedBy === "client"
                          ? "Просрочка дедлайна более 24 часов"
                          : "Счёт не оплачен более 24 часов"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => onSelect(order)}>
                      Подключиться
                    </Button>
                    <Button variant="outline" onClick={() => onSelect(order)}>
                      Просмотреть
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
