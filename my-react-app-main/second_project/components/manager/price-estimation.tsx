"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Calculator, Package, MessageSquare, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { ManagerOrder } from "@/app/manager/page"

interface PriceEstimationProps {
  estimations: ManagerOrder[]
  onSelect: (order: ManagerOrder) => void
}

export function PriceEstimation({ estimations, onSelect }: PriceEstimationProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    articlesCount: "",
    approximateBudget: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // В реальном приложении здесь будет создание запроса на оценку
    setShowCreate(false)
    setFormData({ title: "", description: "", articlesCount: "", approximateBudget: "" })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Оценка стоимости</h1>
          <p className="text-muted-foreground">Запросы для потенциальных клиентов</p>
        </div>

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Создать запрос
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Новый запрос на оценку</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название</Label>
                <Input
                  id="title"
                  placeholder="Например: Оценка партии косметики"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание задачи</Label>
                <Textarea
                  id="description"
                  placeholder="Опишите что нужно упаковать, особенности товара, требования..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="articlesCount">Примерное кол-во артикулов</Label>
                  <Input
                    id="articlesCount"
                    type="number"
                    placeholder="100"
                    value={formData.articlesCount}
                    onChange={(e) => setFormData({ ...formData, articlesCount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Ориентировочный бюджет</Label>
                  <Input
                    id="budget"
                    placeholder="~50 000 ₽"
                    value={formData.approximateBudget}
                    onChange={(e) => setFormData({ ...formData, approximateBudget: e.target.value })}
                  />
                </div>
              </div>

              <div className="bg-orange-500/10 p-3 rounded-lg">
                <p className="text-sm text-orange-500">
                  Этот запрос будет помечен как "Оценка" и исполнители смогут оставить только комментарий без
                  обязательного указания цены и сроков.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="flex-1">
                  Отмена
                </Button>
                <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                  Создать запрос
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {estimations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calculator className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Нет активных запросов на оценку</p>
              <Button onClick={() => setShowCreate(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Создать первый запрос
              </Button>
            </CardContent>
          </Card>
        ) : (
          estimations.map((estimation) => (
            <Card
              key={estimation.id}
              className="cursor-pointer hover:border-orange-500/50 transition-colors"
              onClick={() => onSelect(estimation)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Calculator className="w-5 h-5 text-orange-500" />
                      <h3 className="font-semibold text-foreground truncate">{estimation.title}</h3>
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                        Оценка
                      </Badge>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />~{estimation.articlesCount} артикулов
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Создано {new Date(estimation.createdAt).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Ориентир</p>
                      <p className="font-semibold text-foreground">{estimation.budget}</p>
                    </div>
                    {estimation.unreadMessages > 0 && (
                      <div className="relative">
                        <MessageSquare className="w-5 h-5 text-muted-foreground" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                          {estimation.unreadMessages}
                        </span>
                      </div>
                    )}
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
