"use client"

import { useState } from "react"
import { ArrowLeft, Package, Users, FileText, Send, AlertTriangle, Eye, UserPlus, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ManagerOrder } from "@/app/manager/page"

interface ManagerOrderDetailProps {
  order: ManagerOrder
  onBack: () => void
}

interface ChatMessage {
  id: string
  sender: "client" | "executor" | "moderator"
  senderName: string
  message: string
  timestamp: string
}

const mockMessages: ChatMessage[] = [
  {
    id: "1",
    sender: "client",
    senderName: "Клиент",
    message: "Здравствуйте! Когда планируете завершить упаковку?",
    timestamp: "2024-12-05 10:30",
  },
  {
    id: "2",
    sender: "executor",
    senderName: "Исполнитель",
    message: "Добрый день! Планируем закончить к концу недели, осталось около 30% работы.",
    timestamp: "2024-12-05 11:15",
  },
  {
    id: "3",
    sender: "client",
    senderName: "Клиент",
    message: "Хорошо, буду ждать. Пришлите фото готовой продукции когда закончите.",
    timestamp: "2024-12-05 11:20",
  },
  {
    id: "4",
    sender: "executor",
    senderName: "Исполнитель",
    message: "Обязательно! Также подготовлю детализацию по всем позициям.",
    timestamp: "2024-12-05 14:00",
  },
]

const mockArticles = [
  { sku: "CRM-001", name: "Крем для лица", quantity: 500, packagingType: "Коробка" },
  { sku: "SER-002", name: "Сыворотка", quantity: 300, packagingType: "Пакет" },
  { sku: "MSK-003", name: "Маска тканевая", quantity: 200, packagingType: "Пакет" },
]

const statusLabels = {
  active: "Поиск исполнителя",
  in_progress: "В работе",
  awaiting_payment: "Ожидает оплаты",
  completed: "Завершено",
}

const statusColors = {
  active: "bg-blue-500/10 text-blue-500",
  in_progress: "bg-yellow-500/10 text-yellow-500",
  awaiting_payment: "bg-purple-500/10 text-purple-500",
  completed: "bg-green-500/10 text-green-500",
}

export function ManagerOrderDetail({ order, onBack }: ManagerOrderDetailProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages)

  const handleConnect = () => {
    setIsConnected(true)
    // Добавляем системное сообщение о подключении модератора
    setMessages((prev) => [
      ...prev,
      {
        id: `mod-${Date.now()}`,
        sender: "moderator",
        senderName: "Модератор",
        message: "Модератор подключился к чату",
        timestamp: new Date().toLocaleString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ])
  }

  const handleSendMessage = () => {
    if (!message.trim() || !isConnected) return

    setMessages((prev) => [
      ...prev,
      {
        id: `mod-msg-${Date.now()}`,
        sender: "moderator",
        senderName: "Модератор",
        message: message.trim(),
        timestamp: new Date().toLocaleString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ])
    setMessage("")
  }

  const canConnect = order.status !== "completed" && order.status !== "active"

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">{order.title}</h1>
              <Badge variant="outline" className={statusColors[order.status]}>
                {statusLabels[order.status]}
              </Badge>
              {order.isEstimation && (
                <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                  Оценка
                </Badge>
              )}
              {order.hasArbitration && (
                <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Арбитраж
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Заказ #{order.id}</p>
          </div>

          {canConnect && !isConnected && (
            <Button onClick={handleConnect} className="bg-orange-500 hover:bg-orange-600 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Подключиться к чату
            </Button>
          )}
          {isConnected && (
            <Badge className="bg-orange-500 text-white">
              <Shield className="w-3 h-3 mr-1" />
              Вы в чате как модератор
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Order Info */}
        <div className="w-1/2 border-r border-border overflow-auto p-6">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="info">Информация</TabsTrigger>
              <TabsTrigger value="articles">Артикулы</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              {/* Участники */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Участники
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Клиент</p>
                      <p className="font-medium text-foreground">{order.clientName}</p>
                    </div>
                    <Badge variant="outline">ID: {order.clientId}</Badge>
                  </div>
                  {order.executorName && (
                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground">Исполнитель</p>
                        <p className="font-medium text-foreground">{order.executorName}</p>
                      </div>
                      <Badge variant="outline">ID: {order.executorId}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Детали заказа */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Детали заказа
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Бюджет клиента</p>
                      <p className="font-semibold text-foreground">{order.budget}</p>
                    </div>
                    {order.price && (
                      <div className="p-3 bg-secondary/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Согласованная цена</p>
                        <p className="font-semibold text-foreground">{order.price}</p>
                      </div>
                    )}
                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Дедлайн</p>
                      <p className="font-semibold text-foreground">
                        {new Date(order.deadline).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Артикулов</p>
                      <p className="font-semibold text-foreground">{order.articlesCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Арбитраж */}
              {order.hasArbitration && (
                <Card className="border-orange-500/30 bg-orange-500/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-orange-500">
                      <AlertTriangle className="w-4 h-4" />
                      Информация об арбитраже
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-muted-foreground">Запрошен: </span>
                        <span className="text-foreground">
                          {order.arbitrationRequestedBy === "client" ? "Клиентом" : "Исполнителем"}
                        </span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Причина: </span>
                        <span className="text-foreground">
                          {order.arbitrationRequestedBy === "client"
                            ? "Просрочка дедлайна более 24 часов"
                            : "Счёт не оплачен более 24 часов"}
                        </span>
                      </p>
                      {order.arbitrationRequestedAt && (
                        <p>
                          <span className="text-muted-foreground">Дата запроса: </span>
                          <span className="text-foreground">
                            {new Date(order.arbitrationRequestedAt).toLocaleString("ru-RU")}
                          </span>
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="articles">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Список артикулов
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockArticles.map((article, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{article.name}</p>
                          <p className="text-xs text-muted-foreground">SKU: {article.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">{article.quantity} шт.</p>
                          <p className="text-xs text-muted-foreground">{article.packagingType}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Chat */}
        <div className="w-1/2 flex flex-col bg-secondary/20">
          <div className="p-4 border-b border-border bg-card">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Shield className="w-5 h-5 text-orange-500" />
              ) : (
                <Eye className="w-5 h-5 text-muted-foreground" />
              )}
              <h2 className="font-semibold text-foreground">
                {isConnected ? "Чат (вы участвуете)" : "Чат (только просмотр)"}
              </h2>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "moderator" ? "justify-center" : ""}`}>
                  {msg.sender === "moderator" ? (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg px-4 py-2 max-w-[80%]">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-3 h-3 text-orange-500" />
                        <span className="text-xs font-medium text-orange-500">Модератор</span>
                        <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm text-foreground">{msg.message}</p>
                    </div>
                  ) : (
                    <div
                      className={`max-w-[80%] ${
                        msg.sender === "client" ? "bg-primary/10" : "bg-secondary ml-auto"
                      } rounded-lg px-4 py-2`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-foreground">{msg.senderName}</span>
                        <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm text-foreground">{msg.message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-border bg-card">
            {isConnected ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Написать как модератор..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-muted-foreground">
                  {canConnect ? "Подключитесь к чату, чтобы писать сообщения" : "Чат доступен только для просмотра"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
