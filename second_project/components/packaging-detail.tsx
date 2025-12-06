"use client"

import { useState } from "react"
import { ArrowLeft, Clock, Calendar, MessageSquare, Star, Send, Check, X, AlertTriangle, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { PackagingItem, Response } from "@/app/page"

interface PackagingDetailProps {
  packaging: PackagingItem
  onBack: () => void
}

const mockResponses: Response[] = [
  {
    id: "1",
    executorName: "ПакПро",
    executorRating: 4.8,
    price: "45 000 ₽",
    deadline: "2024-12-12",
    message:
      "Готовы выполнить заказ. Имеем опыт работы с косметикой, можем предоставить фирменные материалы для упаковки.",
    createdAt: "2024-12-02T10:30:00",
    hasChat: true,
    unreadCount: 2,
  },
  {
    id: "2",
    executorName: "УпаковкаПлюс",
    executorRating: 4.6,
    price: "48 000 ₽",
    deadline: "2024-12-14",
    message: "Можем выполнить в указанные сроки. Работаем с любыми объемами.",
    createdAt: "2024-12-02T14:15:00",
    hasChat: false,
    unreadCount: 0,
  },
  {
    id: "3",
    executorName: "FastPack",
    executorRating: 4.9,
    price: "52 000 ₽",
    deadline: "2024-12-10",
    message: "Можем сделать быстрее указанного срока. Специализируемся на премиум упаковке.",
    createdAt: "2024-12-03T09:00:00",
    hasChat: false,
    unreadCount: 0,
  },
]

export function PackagingDetail({ packaging, onBack }: PackagingDetailProps) {
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null)
  const [chatMessage, setChatMessage] = useState("")
  const [showArbitrationModal, setShowArbitrationModal] = useState(false)
  const [arbitrationRequested, setArbitrationRequested] = useState(false)

  // Клиент может вызвать арбитраж через сутки после дедлайна
  const isInProgress = packaging.status === "in_progress"
  const deadlineDate = new Date(packaging.deadline)
  const now = new Date()
  const hoursSinceDeadline = (now.getTime() - deadlineDate.getTime()) / (1000 * 60 * 60)
  const canRequestArbitration = isInProgress && hoursSinceDeadline >= 24

  const [arbitrationChat, setArbitrationChat] = useState([
    {
      id: "1",
      sender: "moderator",
      name: "Модератор",
      message:
        "Здравствуйте! Я подключился к вашему диалогу для разрешения спорной ситуации. Опишите, пожалуйста, суть проблемы.",
      time: "15:30",
    },
  ])

  const handleRequestArbitration = () => {
    setArbitrationRequested(true)
    setShowArbitrationModal(false)
  }

  return (
    <div className="flex h-full">
      {/* Основная информация */}
      <div className="flex-1 p-8 overflow-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к списку
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-foreground">{packaging.title}</h1>
            <Badge className={cn(isInProgress ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary")}>
              {isInProgress ? "В работе" : "Активно"}
            </Badge>
            {arbitrationRequested && (
              <Badge className="bg-orange-500/20 text-orange-400 gap-1">
                <Shield className="w-3 h-3" />
                Арбитраж
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Создано {new Date(packaging.createdAt).toLocaleDateString("ru-RU")}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Дедлайн: {new Date(packaging.deadline).toLocaleDateString("ru-RU")}
            </span>
          </div>
        </div>

        {isInProgress && hoursSinceDeadline > 0 && !arbitrationRequested && (
          <div
            className={cn(
              "mb-6 p-4 rounded-lg border flex items-start gap-3",
              canRequestArbitration
                ? "bg-destructive/10 border-destructive/30"
                : "bg-orange-500/10 border-orange-500/30",
            )}
          >
            <AlertTriangle
              className={cn("w-5 h-5 mt-0.5", canRequestArbitration ? "text-destructive" : "text-orange-400")}
            />
            <div className="flex-1">
              <p className={cn("font-medium", canRequestArbitration ? "text-destructive" : "text-orange-400")}>
                Дедлайн просрочен
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {canRequestArbitration
                  ? "Прошло более 24 часов с момента дедлайна. Вы можете запросить арбитраж для решения ситуации."
                  : `Осталось ${Math.ceil(24 - hoursSinceDeadline)} часов до возможности запросить арбитраж.`}
              </p>
            </div>
            {canRequestArbitration && (
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-destructive/50 text-destructive hover:bg-destructive/10"
                onClick={() => setShowArbitrationModal(true)}
              >
                <Shield className="w-4 h-4 mr-2" />
                Запросить арбитраж
              </Button>
            )}
          </div>
        )}

        <Tabs defaultValue="responses">
          <TabsList>
            <TabsTrigger value="responses" className="gap-2">
              Отклики
              {mockResponses.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {mockResponses.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="details">Детали задания</TabsTrigger>
          </TabsList>

          <TabsContent value="responses" className="mt-6">
            {mockResponses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">Пока нет откликов</h3>
                <p className="text-muted-foreground text-sm">
                  Исполнители изучают ваше задание. Обычно первые отклики приходят в течение часа.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {mockResponses.map((response) => (
                  <ResponseCard
                    key={response.id}
                    response={response}
                    isSelected={selectedResponse?.id === response.id}
                    onSelect={() => setSelectedResponse(response)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Информация о задании</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Артикулов</p>
                    <p className="text-xl font-semibold text-foreground">{packaging.articlesCount}</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Бюджет</p>
                    <p className="text-xl font-semibold text-foreground">{packaging.budget}</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Срок</p>
                    <p className="text-xl font-semibold text-foreground">
                      {new Date(packaging.deadline).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <h4 className="font-medium text-foreground mb-3">Список артикулов</h4>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary">
                        <tr>
                          <th className="text-left p-3 text-muted-foreground font-medium">SKU</th>
                          <th className="text-left p-3 text-muted-foreground font-medium">Название</th>
                          <th className="text-left p-3 text-muted-foreground font-medium">Кол-во</th>
                          <th className="text-left p-3 text-muted-foreground font-medium">Тип</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-border">
                          <td className="p-3 text-foreground">CRM-001</td>
                          <td className="p-3 text-foreground">Крем для лица</td>
                          <td className="p-3 text-foreground">500</td>
                          <td className="p-3 text-foreground">Коробка</td>
                        </tr>
                        <tr className="border-t border-border">
                          <td className="p-3 text-foreground">SER-002</td>
                          <td className="p-3 text-foreground">Сыворотка</td>
                          <td className="p-3 text-foreground">300</td>
                          <td className="p-3 text-foreground">Пакет</td>
                        </tr>
                        <tr className="border-t border-border">
                          <td className="p-3 text-foreground">MSK-003</td>
                          <td className="p-3 text-foreground">Маска тканевая</td>
                          <td className="p-3 text-foreground">200</td>
                          <td className="p-3 text-foreground">Пакет</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Панель чата */}
      {selectedResponse && (
        <div className="w-96 border-l border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {selectedResponse.executorName.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-foreground">{selectedResponse.executorName}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                    {selectedResponse.executorRating}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedResponse(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Цена: </span>
                <span className="font-medium text-foreground">{selectedResponse.price}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Срок: </span>
                <span className="font-medium text-foreground">
                  {new Date(selectedResponse.deadline).toLocaleDateString("ru-RU")}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button className="flex-1 gap-2">
                <Check className="w-4 h-4" />
                Принять
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                Отклонить
              </Button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-auto">
            <div className="space-y-4">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {selectedResponse.executorName.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-secondary rounded-lg rounded-tl-none p-3 max-w-[85%]">
                  <p className="text-sm text-foreground">{selectedResponse.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(selectedResponse.createdAt).toLocaleTimeString("ru-RU", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {selectedResponse.hasChat && (
                <>
                  <div className="flex gap-3 justify-end">
                    <div className="bg-primary text-primary-foreground rounded-lg rounded-tr-none p-3 max-w-[85%]">
                      <p className="text-sm">Спасибо за отклик! Какие материалы для упаковки вы используете?</p>
                      <p className="text-xs opacity-70 mt-1">12:45</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {selectedResponse.executorName.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-secondary rounded-lg rounded-tl-none p-3 max-w-[85%]">
                      <p className="text-sm text-foreground">
                        Мы работаем с крафт-картоном, гофрокартоном и полипропиленовыми пакетами. Также есть возможность
                        нанесения вашего логотипа.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">13:02</p>
                    </div>
                  </div>
                </>
              )}

              {arbitrationRequested &&
                arbitrationChat.map((msg) => (
                  <div key={msg.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-orange-500/20 text-orange-400 text-xs">
                        <Shield className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg rounded-tl-none p-3 max-w-[85%]">
                      <p className="text-xs text-orange-400 font-medium mb-1">{msg.name}</p>
                      <p className="text-sm text-foreground">{msg.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{msg.time}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Написать сообщение..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="bg-secondary border-border"
              />
              <Button size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {showArbitrationModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Запрос арбитража</h3>
                <p className="text-sm text-muted-foreground">Привлечение модератора</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              К вашему диалогу с исполнителем будет подключен модератор платформы для разрешения спорной ситуации.
              Модератор изучит историю переписки и поможет найти решение.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setShowArbitrationModal(false)}
              >
                Отмена
              </Button>
              <Button
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleRequestArbitration}
              >
                Подтвердить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ResponseCard({
  response,
  isSelected,
  onSelect,
}: {
  response: Response
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left bg-card border rounded-xl p-5 transition-all",
        isSelected ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/50",
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/20 text-primary">{response.executorName.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium text-foreground">{response.executorName}</h4>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
              {response.executorRating}
            </div>
          </div>
        </div>
        {response.unreadCount > 0 && (
          <span className="w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
            {response.unreadCount}
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{response.message}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Цена</p>
            <p className="font-semibold text-foreground">{response.price}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Срок</p>
            <p className="font-medium text-foreground">{new Date(response.deadline).toLocaleDateString("ru-RU")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-primary">
          <MessageSquare className="w-4 h-4" />
          Открыть чат
        </div>
      </div>
    </button>
  )
}
