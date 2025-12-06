"use client"

import { useState } from "react"
import { ArrowLeft, Upload, Plus, Trash2, FileSpreadsheet, Calendar, Coins, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CreatePackagingProps {
  onBack: () => void
}

interface Article {
  id: string
  sku: string
  name: string
  quantity: number
  packagingType: string
}

export function CreatePackaging({ onBack }: CreatePackagingProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [budget, setBudget] = useState("")
  const [deadline, setDeadline] = useState("")
  const [articles, setArticles] = useState<Article[]>([{ id: "1", sku: "", name: "", quantity: 0, packagingType: "" }])
  const [inputMethod, setInputMethod] = useState<"manual" | "excel">("manual")

  const addArticle = () => {
    setArticles([...articles, { id: Date.now().toString(), sku: "", name: "", quantity: 0, packagingType: "" }])
  }

  const removeArticle = (id: string) => {
    if (articles.length > 1) {
      setArticles(articles.filter((a) => a.id !== id))
    }
  }

  const updateArticle = (id: string, field: keyof Article, value: string | number) => {
    setArticles(articles.map((a) => (a.id === id ? { ...a, [field]: value } : a)))
  }

  return (
    <div className="p-8 max-w-4xl">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад к списку
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Создание задания</h1>
        <p className="text-muted-foreground mt-1">Заполните информацию о задании на упаковку</p>
      </div>

      <div className="space-y-6">
        {/* Основная информация */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Основная информация</CardTitle>
            <CardDescription>Название и описание задания</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Название задания</Label>
              <Input
                id="title"
                placeholder="Например: Упаковка партии косметики"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 bg-secondary border-border"
              />
            </div>
            <div>
              <Label htmlFor="description">Описание и требования</Label>
              <Textarea
                id="description"
                placeholder="Опишите особые требования к упаковке, материалы, брендирование и т.д."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5 bg-secondary border-border min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Артикулы */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Артикулы для упаковки</CardTitle>
            <CardDescription>Добавьте товары вручную или загрузите Excel файл</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as "manual" | "excel")}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="manual">Вручную</TabsTrigger>
                <TabsTrigger value="excel">Загрузить Excel</TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-4">
                {articles.map((article, index) => (
                  <div key={article.id} className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
                    <div className="flex-1 grid grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Артикул (SKU)</Label>
                        <Input
                          placeholder="ABC-123"
                          value={article.sku}
                          onChange={(e) => updateArticle(article.id, "sku", e.target.value)}
                          className="mt-1 bg-card border-border"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Название</Label>
                        <Input
                          placeholder="Крем для лица"
                          value={article.name}
                          onChange={(e) => updateArticle(article.id, "name", e.target.value)}
                          className="mt-1 bg-card border-border"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Количество</Label>
                        <Input
                          type="number"
                          placeholder="100"
                          value={article.quantity || ""}
                          onChange={(e) => updateArticle(article.id, "quantity", Number.parseInt(e.target.value) || 0)}
                          className="mt-1 bg-card border-border"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Тип упаковки</Label>
                        <Input
                          placeholder="Коробка"
                          value={article.packagingType}
                          onChange={(e) => updateArticle(article.id, "packagingType", e.target.value)}
                          className="mt-1 bg-card border-border"
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArticle(article.id)}
                      className="mt-6 text-muted-foreground hover:text-destructive"
                      disabled={articles.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                <Button variant="outline" onClick={addArticle} className="w-full border-dashed bg-transparent">
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить артикул
                </Button>
              </TabsContent>

              <TabsContent value="excel">
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                    <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-foreground mb-2">Загрузите Excel файл</h3>
                  <p className="text-muted-foreground text-sm mb-4">Перетащите файл сюда или нажмите для выбора</p>
                  <div className="flex items-center justify-center gap-3">
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Выбрать файл
                    </Button>
                    <Button variant="ghost" className="text-primary">
                      Скачать шаблон
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Условия */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Условия выполнения</CardTitle>
            <CardDescription>Укажите желаемые сроки и бюджет</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="deadline" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Желаемый срок выполнения
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1.5 bg-secondary border-border"
                />
              </div>
              <div>
                <Label htmlFor="budget" className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-muted-foreground" />
                  Бюджет
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="budget"
                    placeholder="50 000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="bg-secondary border-border pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">₽</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Бюджет и сроки являются ориентировочными. Исполнители могут предложить свои условия, и вы сможете
                выбрать наиболее подходящий вариант.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Действия */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            Отмена
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="outline">Сохранить черновик</Button>
            <Button className="gap-2">Отправить в работу</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
