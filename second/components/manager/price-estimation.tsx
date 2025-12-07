"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Calculator, Package, MessageSquare, Clock, FileText, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { ManagerOrder } from "@/app/manager/page"

interface PriceEstimationProps {
  estimations: ManagerOrder[]
  selectedId?: string
  onSelect: (order: ManagerOrder) => void
}

export function PriceEstimation({ estimations, selectedId, onSelect }: PriceEstimationProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    articlesCount: "",
    approximateBudget: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowCreate(false)
    setFormData({ title: "", description: "", articlesCount: "", approximateBudget: "" })
  }

  const stats = {
    total: estimations.length,
    withResponses: estimations.filter((e) => e.unreadMessages > 0).length,
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 overflow-auto border-r border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Оценка стоимости</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Запросы для потенциальных клиентов</p>
          </div>

          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Создать
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
                    placeholder="Опишите что нужно упаковать..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="articlesCount">Кол-во артикулов</Label>
                    <Input
                      id="articlesCount"
                      type="number"
                      placeholder="100"
                      value={formData.articlesCount}
                      onChange={(e) => setFormData({ ...formData, articlesCount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Ориентир бюджета</Label>
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
                    Исполнители смогут оставить только комментарий без обязательного указания цены и сроков.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="flex-1">
                    Отмена
                  </Button>
                  <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                    Создать
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {estimations.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-8 text-center">
            <Calculator className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm mb-3">Нет активных запросов</p>
            <Button onClick={() => setShowCreate(true)} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Создать первый
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {estimations.map((estimation) => (
              <button
                key={estimation.id}
                onClick={() => onSelect(estimation)}
                className={cn(
                  "w-full text-left bg-card border border-border rounded-lg p-4 hover:border-orange-500/50 transition-all group",
                  selectedId === estimation.id && "border-orange-500 ring-1 ring-orange-500/20",
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <h3 className="font-medium text-foreground text-sm line-clamp-1">{estimation.title}</h3>
                  </div>
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-xs">
                    Оценка
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Package className="w-3 h-3" />~{estimation.articlesCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(estimation.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Ориентир: {estimation.budget}</span>
                  {estimation.unreadMessages > 0 && (
                    <span className="flex items-center gap-1 text-destructive">
                      <MessageSquare className="w-3 h-3" />
                      {estimation.unreadMessages}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {!selectedId && (
        <div className="w-80 p-6 bg-secondary/30">
          <h2 className="text-sm font-medium text-foreground mb-4">Обзор оценок</h2>

          <div className="space-y-3">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Активных запросов</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.withResponses}</p>
                    <p className="text-xs text-muted-foreground">С откликами</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-orange-500/5 border border-orange-500/10">
            <p className="text-xs text-muted-foreground mb-2">Для чего это</p>
            <p className="text-sm text-foreground">
              Запросы на оценку помогают потенциальным клиентам понять примерную стоимость услуг до заключения договора.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
