"use client"

import { useState } from "react"
import { Search, Package, CheckCircle, Users, Calendar, DollarSign, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ManagerOrder } from "@/app/manager/page"

interface CompletedOrdersProps {
  orders: ManagerOrder[]
  selectedId?: string
  onSelect: (order: ManagerOrder) => void
}

export function CompletedOrders({ orders, selectedId, onSelect }: CompletedOrdersProps) {
  const [search, setSearch] = useState("")

  const filteredOrders = orders.filter((order) => {
    return (
      order.title.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (order.executorName && order.executorName.toLowerCase().includes(search.toLowerCase()))
    )
  })

  const stats = {
    total: orders.length,
    totalRevenue: orders.reduce((acc, o) => acc + Number.parseInt((o.price || "0").replace(/\D/g, "")), 0),
    uniqueClients: new Set(orders.map((o) => o.clientId)).size,
    uniqueExecutors: new Set(orders.map((o) => o.executorId)).size,
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 overflow-auto border-r border-border">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Завершённые упаковки</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Архив выполненных заказов</p>
        </div>

        <div className="mb-5">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по номеру, клиенту или исполнителю..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-8 text-center">
            <CheckCircle className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">Упаковки не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {filteredOrders.map((order) => (
              <button
                key={order.id}
                onClick={() => onSelect(order)}
                className={cn(
                  "w-full text-left bg-card border border-border rounded-lg p-4 hover:border-orange-500/50 transition-all group",
                  selectedId === order.id && "border-orange-500 ring-1 ring-orange-500/20",
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-foreground text-sm group-hover:text-orange-500 transition-colors line-clamp-1">
                    {order.title}
                  </h3>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 text-xs flex-shrink-0">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Готово
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span>{order.clientName}</span>
                  <span>→</span>
                  <span className="text-foreground">{order.executorName}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {order.articlesCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(order.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <span className="font-semibold text-foreground">{order.price}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {!selectedId && (
        <div className="w-80 p-6 bg-secondary/30">
          <h2 className="text-sm font-medium text-foreground mb-4">Статистика</h2>

          <div className="space-y-3">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Завершено всего</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalRevenue.toLocaleString()} ₽</p>
                    <p className="text-xs text-muted-foreground">Общий оборот</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-card border-border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-lg font-semibold text-foreground">{stats.uniqueClients}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Клиентов</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span className="text-lg font-semibold text-foreground">{stats.uniqueExecutors}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Исполнителей</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
