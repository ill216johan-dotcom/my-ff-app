"use client"

import { useState } from "react"
import { Search, Package, CheckCircle, Users, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { ManagerOrder } from "@/app/manager/page"

interface CompletedOrdersProps {
  orders: ManagerOrder[]
  onSelect: (order: ManagerOrder) => void
}

export function CompletedOrders({ orders, onSelect }: CompletedOrdersProps) {
  const [search, setSearch] = useState("")

  const filteredOrders = orders.filter((order) => {
    return (
      order.title.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (order.executorName && order.executorName.toLowerCase().includes(search.toLowerCase()))
    )
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Завершённые упаковки</h1>
        <p className="text-muted-foreground">Архив выполненных заказов</p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по номеру, клиенту или исполнителю..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
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
                      <Badge variant="outline" className="bg-green-500/10 text-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Завершено
                      </Badge>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {order.clientName}
                      </span>
                      <span className="text-foreground">→ {order.executorName}</span>
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {order.articlesCount} артикулов
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Итого</p>
                    <p className="font-semibold text-foreground">{order.price}</p>
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
