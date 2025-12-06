"use client"

import { useState } from "react"
import { ArrowLeft, Clock, Calendar, Package, Star, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import type { AvailableOrder } from "@/app/executor/page"

interface OrderDetailProps {
  order: AvailableOrder
  onBack: () => void
}

export function OrderDetail({ order, onBack }: OrderDetailProps) {
  const [price, setPrice] = useState("")
  const [deadline, setDeadline] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!price || !deadline) return
    setIsSubmitting(true)
    // Имитация отправки
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 1000)
  }

  const getDaysUntilDeadline = (deadlineDate: string) => {
    const date = new Date(deadlineDate)
    const now = new Date()
    return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  const daysLeft = getDaysUntilDeadline(order.deadline)

  return (
    <div className="flex h-full">
      {/* Информация о заказе */}
      <div className="flex-1 p-8 overflow-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к заказам
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-foreground">{order.title}</h1>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {order.clientName.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span>{order.clientName}</span>
              <span className="flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                {order.clientRating}
              </span>
            </div>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Создано {new Date(order.createdAt).toLocaleDateString("ru-RU")}
            </span>
          </div>
        </div>

        {/* Ключевые параметры */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Артикулов</p>
                  <p className="text-xl font-semibold text-foreground">{order.articlesCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Clock className={`w-5 h-5 ${daysLeft <= 5 ? "text-orange-400" : "text-accent"}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">До дедлайна</p>
                  <p className={`text-xl font-semibold ${daysLeft <= 5 ? "text-orange-400" : "text-foreground"}`}>
                    {daysLeft} дней
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <span className="text-green-500 font-semibold text-sm">₽</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Бюджет клиента</p>
                  <p className="text-xl font-semibold text-foreground">{order.budget}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Описание */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Описание задания</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{order.description}</p>
          </CardContent>
        </Card>

        {/* Список артикулов */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Список артикулов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left p-3 text-muted-foreground font-medium">SKU</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Название</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Кол-во</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Тип упаковки</th>
                  </tr>
                </thead>
                <tbody>
                  {order.articles.map((article, index) => (
                    <tr key={article.sku} className={index > 0 ? "border-t border-border" : ""}>
                      <td className="p-3 text-foreground font-mono text-sm">{article.sku}</td>
                      <td className="p-3 text-foreground">{article.name}</td>
                      <td className="p-3 text-foreground">{article.quantity}</td>
                      <td className="p-3 text-foreground">{article.packagingType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Панель отклика */}
      <div className="w-96 border-l border-border bg-card p-6 overflow-auto">
        <h2 className="text-lg font-semibold text-foreground mb-6">Откликнуться на заказ</h2>

        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-medium text-foreground mb-2">Отклик отправлен!</h3>
            <p className="text-sm text-muted-foreground mb-4">Клиент получит уведомление и сможет связаться с вами</p>
            <Button variant="outline" onClick={onBack} className="bg-transparent">
              Вернуться к заказам
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <Label className="text-foreground mb-2 block">
                Ваша цена <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="45 000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-secondary border-border pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">₽</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Бюджет клиента: {order.budget}</p>
            </div>

            <div>
              <Label className="text-foreground mb-2 block">
                Срок выполнения <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-secondary border-border"
                max={order.deadline}
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Дедлайн клиента: {new Date(order.deadline).toLocaleDateString("ru-RU")}
              </p>
            </div>

            <div>
              <Label className="text-foreground mb-2 block">
                Комментарий
                <span className="text-muted-foreground font-normal ml-1">(необязательно)</span>
              </Label>
              <Textarea
                placeholder="Опишите ваш опыт, материалы, условия работы..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="bg-secondary border-border min-h-[100px] resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1.5">Хороший комментарий повышает шансы на выбор</p>
            </div>

            <Button className="w-full gap-2" onClick={handleSubmit} disabled={!price || !deadline || isSubmitting}>
              {isSubmitting ? (
                "Отправка..."
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Отправить отклик
                </>
              )}
            </Button>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                После отклика клиент может начать с вами чат для уточнения деталей
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
