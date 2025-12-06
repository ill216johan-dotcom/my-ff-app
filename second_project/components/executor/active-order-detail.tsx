"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Upload,
  FileText,
  Plus,
  Trash2,
  CheckCircle,
  MessageSquare,
  Send,
  Shield,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { MyOrder } from "@/app/executor/page"

interface ActiveOrderDetailProps {
  order: MyOrder
  onBack: () => void
}

interface ServiceItem {
  id: string
  description: string
  quantity: number
  price: number
}

export function ActiveOrderDetail({ order, onBack }: ActiveOrderDetailProps) {
  const [showCompleteForm, setShowCompleteForm] = useState(false)
  const [invoiceFile, setInvoiceFile] = useState<string | null>(null)
  const [services, setServices] = useState<ServiceItem[]>([{ id: "1", description: "", quantity: 0, price: 0 }])
  const [chatMessage, setChatMessage] = useState("")
  const [isCompleting, setIsCompleting] = useState(false)

  const [showArbitrationModal, setShowArbitrationModal] = useState(false)
  const [arbitrationRequested, setArbitrationRequested] = useState(false)
  const [invoiceSentAt, setInvoiceSentAt] = useState<Date | null>(new Date(Date.now() - 30 * 60 * 60 * 1000)) // Моковые данные: счёт отправлен 30 часов назад

  const isCompleted = order.status === "completed"
  const isAwaitingPayment = order.status === "awaiting_payment"

  // Исполнитель может вызвать арбитраж через сутки после выставления счёта
  const hoursSinceInvoice = invoiceSentAt ? (new Date().getTime() - invoiceSentAt.getTime()) / (1000 * 60 * 60) : 0
  const canRequestArbitration = isAwaitingPayment && hoursSinceInvoice >= 24

  const getTimeRemaining = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const diffMs = deadlineDate.getTime() - now.getTime()

    if (diffMs < 0) return { text: "Просрочено", isOverdue: true }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (diffDays === 0) {
      return { text: `${diffHours} часов`, isOverdue: false, isUrgent: true }
    }
    if (diffDays <= 2) {
      return { text: `${diffDays}д ${diffHours}ч`, isOverdue: false, isUrgent: true }
    }
    return { text: `${diffDays} дней`, isOverdue: false, isUrgent: false }
  }

  const addServiceItem = () => {
    setServices([
      ...services,
      {
        id: Date.now().toString(),
        description: "",
        quantity: 0,
        price: 0,
      },
    ])
  }

  const removeServiceItem = (id: string) => {
    if (services.length > 1) {
      setServices(services.filter((s) => s.id !== id))
    }
  }

  const updateServiceItem = (id: string, field: keyof ServiceItem, value: string | number) => {
    setServices(services.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const totalAmount = services.reduce((sum, s) => sum + s.quantity * s.price, 0)

  const handleComplete = () => {
    if (!invoiceFile || services.some((s) => !s.description || s.quantity <= 0 || s.price <= 0)) {
      return
    }
    setIsCompleting(true)
    setTimeout(() => {
      setIsCompleting(false)
      onBack()
    }, 1500)
  }

  const handleRequestArbitration = () => {
    setArbitrationRequested(true)
    setShowArbitrationModal(false)
  }

  const remaining = !isCompleted && !isAwaitingPayment ? getTimeRemaining(order.deadline) : null

  // Моковые данные для завершённого заказа
  const completedServices = [
    { description: "Упаковка в пакеты (футболки)", quantity: 400, price: 15 },
    { description: "Упаковка в пакеты (джинсы)", quantity: 200, price: 20 },
    { description: "Упаковка в коробки (куртки)", quantity: 100, price: 45 },
    { description: "Маркировка штрих-кодами", quantity: 700, price: 5 },
  ]

  const arbitrationChat = [
    {
      id: "arb1",
      sender: "moderator",
      name: "Модератор",
      message:
        "Здравствуйте! Я подключился к диалогу. Вижу, что счёт был выставлен более 24 часов назад. Свяжусь с клиентом для уточнения статуса оплаты.",
      time: "16:45",
    },
  ]

  return (
    <div className="flex h-full">
      {/* Основная информация */}
      <div className="flex-1 p-8 overflow-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к упаковкам
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-foreground">{order.title}</h1>
            <Badge
              className={cn(
                isCompleted
                  ? "bg-muted text-muted-foreground"
                  : isAwaitingPayment
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-accent/20 text-accent",
              )}
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Завершено
                </>
              ) : isAwaitingPayment ? (
                <>
                  <Clock className="w-3 h-3 mr-1" />
                  Ожидает оплаты
                </>
              ) : (
                "В работе"
              )}
            </Badge>
            {arbitrationRequested && (
              <Badge className="bg-orange-500/20 text-orange-400 gap-1">
                <Shield className="w-3 h-3" />
                Арбитраж
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">Клиент: {order.clientName}</p>
        </div>

        {isAwaitingPayment && !arbitrationRequested && (
          <div
            className={cn(
              "mb-6 p-4 rounded-lg border flex items-start gap-3",
              canRequestArbitration ? "bg-orange-500/10 border-orange-500/30" : "bg-yellow-500/10 border-yellow-500/30",
            )}
          >
            <Clock className={cn("w-5 h-5 mt-0.5", canRequestArbitration ? "text-orange-400" : "text-yellow-400")} />
            <div className="flex-1">
              <p className={cn("font-medium", canRequestArbitration ? "text-orange-400" : "text-yellow-400")}>
                {canRequestArbitration ? "Оплата задерживается" : "Счёт выставлен"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {canRequestArbitration
                  ? "Прошло более 24 часов с момента выставления счёта. Вы можете запросить арбитраж."
                  : `Счёт выставлен ${Math.floor(hoursSinceInvoice)} ч. назад. Арбитраж доступен через ${Math.ceil(24 - hoursSinceInvoice)} ч.`}
              </p>
            </div>
            {canRequestArbitration && (
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                onClick={() => setShowArbitrationModal(true)}
              >
                <Shield className="w-4 h-4 mr-2" />
                Запросить арбитраж
              </Button>
            )}
          </div>
        )}

        {/* Статус и сроки */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Стоимость</p>
              <p className="text-xl font-semibold text-foreground">{order.price}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Артикулов</p>
              <p className="text-xl font-semibold text-foreground">{order.articlesCount}</p>
            </CardContent>
          </Card>

          {remaining && (
            <Card
              className={cn(
                "border",
                remaining.isOverdue
                  ? "bg-destructive/10 border-destructive/30"
                  : remaining.isUrgent
                    ? "bg-orange-500/10 border-orange-500/30"
                    : "bg-card border-border",
              )}
            >
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Осталось времени</p>
                <p
                  className={cn(
                    "text-xl font-semibold",
                    remaining.isOverdue
                      ? "text-destructive"
                      : remaining.isUrgent
                        ? "text-orange-400"
                        : "text-foreground",
                  )}
                >
                  {remaining.text}
                </p>
              </CardContent>
            </Card>
          )}

          {(isCompleted || isAwaitingPayment) && (
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">
                  {isAwaitingPayment ? "Счёт выставлен" : "Завершено"}
                </p>
                <p className="text-xl font-semibold text-foreground">
                  {isAwaitingPayment && invoiceSentAt
                    ? invoiceSentAt.toLocaleDateString("ru-RU")
                    : order.completedAt && new Date(order.completedAt).toLocaleDateString("ru-RU")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Список артикулов */}
        <Card className="bg-card border-border mb-8">
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

        {/* Детализация для завершённого заказа */}
        {(isCompleted || isAwaitingPayment) && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Детализация услуг</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="text-left p-3 text-muted-foreground font-medium">Услуга</th>
                      <th className="text-right p-3 text-muted-foreground font-medium">Кол-во</th>
                      <th className="text-right p-3 text-muted-foreground font-medium">Цена</th>
                      <th className="text-right p-3 text-muted-foreground font-medium">Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedServices.map((service, index) => (
                      <tr key={index} className={index > 0 ? "border-t border-border" : ""}>
                        <td className="p-3 text-foreground">{service.description}</td>
                        <td className="p-3 text-foreground text-right">{service.quantity}</td>
                        <td className="p-3 text-foreground text-right">{service.price} ₽</td>
                        <td className="p-3 text-foreground text-right font-medium">
                          {(service.quantity * service.price).toLocaleString()} ₽
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-secondary">
                    <tr>
                      <td colSpan={3} className="p-3 text-foreground font-medium text-right">
                        Итого:
                      </td>
                      <td className="p-3 text-foreground font-semibold text-right">
                        {completedServices.reduce((sum, s) => sum + s.quantity * s.price, 0).toLocaleString()} ₽
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="mt-4 p-4 bg-secondary rounded-lg flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Счёт на оплату</p>
                  <p className="text-xs text-muted-foreground">invoice_fashionhub_nov2024.pdf</p>
                </div>
                <Button variant="outline" size="sm" className="bg-transparent">
                  Скачать
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Боковая панель */}
      <div className="w-96 border-l border-border bg-card flex flex-col">
        {!isCompleted && !isAwaitingPayment && !showCompleteForm && (
          <>
            {/* Чат с клиентом */}
            <div className="p-4 border-b border-border">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Чат с клиентом
                <span className="w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center ml-auto">
                  1
                </span>
              </h3>
            </div>

            <div className="flex-1 p-4 overflow-auto">
              <div className="space-y-4">
                <div className="flex gap-3 justify-end">
                  <div className="bg-accent text-accent-foreground rounded-lg rounded-tr-none p-3 max-w-[85%]">
                    <p className="text-sm">Добрый день! Приступил к работе, ожидайте обновлений</p>
                    <p className="text-xs opacity-70 mt-1">28 ноя, 10:15</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">ФХ</AvatarFallback>
                  </Avatar>
                  <div className="bg-secondary rounded-lg rounded-tl-none p-3 max-w-[85%]">
                    <p className="text-sm text-foreground">Отлично, спасибо! Если будут вопросы — пишите</p>
                    <p className="text-xs text-muted-foreground mt-1">28 ноя, 10:20</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Написать клиенту..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="bg-secondary border-border"
                />
                <Button size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              <Button
                className="w-full gap-2 bg-transparent"
                variant="outline"
                onClick={() => setShowCompleteForm(true)}
              >
                <CheckCircle className="w-4 h-4" />
                Завершить работу
              </Button>
            </div>
          </>
        )}

        {!isCompleted && !isAwaitingPayment && showCompleteForm && (
          <div className="flex-1 p-6 overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Завершение работы</h2>
              <button
                onClick={() => setShowCompleteForm(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Отмена
              </button>
            </div>

            <div className="space-y-6">
              {/* Загрузка счёта */}
              <div>
                <Label className="text-foreground mb-2 block">
                  Счёт на оплату <span className="text-destructive">*</span>
                </Label>
                {invoiceFile ? (
                  <div className="p-3 bg-secondary rounded-lg flex items-center gap-3">
                    <FileText className="w-5 h-5 text-accent" />
                    <span className="flex-1 text-sm text-foreground truncate">{invoiceFile}</span>
                    <button
                      onClick={() => setInvoiceFile(null)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center cursor-pointer hover:border-accent/50 transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Загрузить PDF или изображение</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setInvoiceFile(e.target.files[0].name)
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Детализация услуг */}
              <div>
                <Label className="text-foreground mb-2 block">
                  Детализация услуг <span className="text-destructive">*</span>
                </Label>

                <div className="space-y-3">
                  {services.map((service, index) => (
                    <div key={service.id} className="p-3 bg-secondary rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                        {services.length > 1 && (
                          <button
                            onClick={() => removeServiceItem(service.id)}
                            className="ml-auto text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <Input
                        placeholder="Описание услуги"
                        value={service.description}
                        onChange={(e) => updateServiceItem(service.id, "description", e.target.value)}
                        className="bg-card border-border"
                      />
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            type="number"
                            placeholder="Кол-во"
                            value={service.quantity || ""}
                            onChange={(e) =>
                              updateServiceItem(service.id, "quantity", Number.parseInt(e.target.value) || 0)
                            }
                            className="bg-card border-border"
                          />
                        </div>
                        <div className="flex-1 relative">
                          <Input
                            type="number"
                            placeholder="Цена"
                            value={service.price || ""}
                            onChange={(e) =>
                              updateServiceItem(service.id, "price", Number.parseInt(e.target.value) || 0)
                            }
                            className="bg-card border-border pr-6"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            ₽
                          </span>
                        </div>
                      </div>
                      {service.quantity > 0 && service.price > 0 && (
                        <p className="text-xs text-muted-foreground text-right">
                          = {(service.quantity * service.price).toLocaleString()} ₽
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 bg-transparent gap-2"
                  onClick={addServiceItem}
                >
                  <Plus className="w-4 h-4" />
                  Добавить услугу
                </Button>
              </div>

              {/* Итого */}
              {totalAmount > 0 && (
                <div className="p-4 bg-accent/10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Итого:</span>
                    <span className="text-xl font-semibold text-foreground">{totalAmount.toLocaleString()} ₽</span>
                  </div>
                </div>
              )}

              <Button
                className="w-full gap-2"
                onClick={handleComplete}
                disabled={
                  !invoiceFile ||
                  services.some((s) => !s.description || s.quantity <= 0 || s.price <= 0) ||
                  isCompleting
                }
              >
                {isCompleting ? (
                  "Завершение..."
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Завершить и отправить
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {isAwaitingPayment && (
          <>
            <div className="p-4 border-b border-border">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Чат с клиентом
                {arbitrationRequested && (
                  <Badge className="bg-orange-500/20 text-orange-400 text-xs ml-auto">
                    <Shield className="w-3 h-3 mr-1" />
                    Арбитраж
                  </Badge>
                )}
              </h3>
            </div>

            <div className="flex-1 p-4 overflow-auto">
              <div className="space-y-4">
                <div className="flex gap-3 justify-end">
                  <div className="bg-accent text-accent-foreground rounded-lg rounded-tr-none p-3 max-w-[85%]">
                    <p className="text-sm">Работа завершена. Счёт на оплату прикреплён к заказу.</p>
                    <p className="text-xs opacity-70 mt-1">Вчера, 14:30</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">ФХ</AvatarFallback>
                  </Avatar>
                  <div className="bg-secondary rounded-lg rounded-tl-none p-3 max-w-[85%]">
                    <p className="text-sm text-foreground">Спасибо! Проверю и оплачу в ближайшее время.</p>
                    <p className="text-xs text-muted-foreground mt-1">Вчера, 15:10</p>
                  </div>
                </div>

                {/* Сообщения модератора при арбитраже */}
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
          </>
        )}

        {/* Для завершённого заказа */}
        {isCompleted && (
          <div className="p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-medium text-foreground mb-2">Заказ завершён</h3>
              <p className="text-sm text-muted-foreground">
                Оплата получена {order.completedAt && new Date(order.completedAt).toLocaleDateString("ru-RU")}
              </p>
            </div>
          </div>
        )}
      </div>

      {showArbitrationModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Запрос арбитража</h3>
                <p className="text-sm text-muted-foreground">Проблема с оплатой</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              К вашему диалогу с клиентом будет подключен модератор платформы для решения вопроса с оплатой. Модератор
              свяжется с клиентом и поможет урегулировать ситуацию.
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
