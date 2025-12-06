import React, { useState } from 'react';
import { ArrowLeft, Upload, Plus, Trash2, FileSpreadsheet, Calendar as CalendarIcon, Coins, Info } from 'lucide-react';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Label } from './ui/label.jsx';
import { Textarea } from './ui/textarea.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs.jsx';

function CreatePackaging({ onBack, onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [articles, setArticles] = useState([{ id: '1', sku: '', name: '', quantity: 0, packagingType: '' }]);
  const [inputMethod, setInputMethod] = useState('manual');

  const addArticle = () => {
    setArticles([...articles, { id: Date.now().toString(), sku: '', name: '', quantity: 0, packagingType: '' }]);
  };

  const removeArticle = (id) => {
    if (articles.length > 1) {
      setArticles(articles.filter((a) => a.id !== id));
    }
  };

  const updateArticle = (id, field, value) => {
    setArticles(articles.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({ title, description, budget, deadline, articles });
    }
  };

  return (
    <div className="p-8 max-w-5xl">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад к списку
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Создание задания</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Заполните информацию о задании на упаковку</p>
      </div>

      <div className="space-y-6">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
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
                className="mt-1.5 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <Label htmlFor="description">Описание и требования</Label>
              <Textarea
                id="description"
                placeholder="Опишите особые требования к упаковке, материалы, брендирование и т.д."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5 bg-slate-50 dark:bg-slate-800 min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Артикулы для упаковки</CardTitle>
            <CardDescription>Добавьте товары вручную или загрузите Excel файл</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={inputMethod} onValueChange={setInputMethod}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="manual">Вручную</TabsTrigger>
                <TabsTrigger value="excel">Загрузить Excel</TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-4">
                {articles.map((article) => (
                  <div key={article.id} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex-1 grid grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs text-slate-500">Артикул (SKU)</Label>
                        <Input
                          placeholder="ABC-123"
                          value={article.sku}
                          onChange={(e) => updateArticle(article.id, 'sku', e.target.value)}
                          className="mt-1 bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Название</Label>
                        <Input
                          placeholder="Крем для лица"
                          value={article.name}
                          onChange={(e) => updateArticle(article.id, 'name', e.target.value)}
                          className="mt-1 bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Количество</Label>
                        <Input
                          type="number"
                          placeholder="100"
                          value={article.quantity || ''}
                          onChange={(e) => updateArticle(article.id, 'quantity', Number.parseInt(e.target.value, 10) || 0)}
                          className="mt-1 bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Тип упаковки</Label>
                        <Input
                          placeholder="Коробка"
                          value={article.packagingType}
                          onChange={(e) => updateArticle(article.id, 'packagingType', e.target.value)}
                          className="mt-1 bg-white dark:bg-slate-900"
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArticle(article.id)}
                      className="mt-6 text-slate-500 hover:text-red-600"
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
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <FileSpreadsheet className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="font-medium text-slate-900 dark:text-white mb-2">Загрузите Excel файл</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Перетащите файл сюда или нажмите для выбора</p>
                  <div className="flex items-center justify-center gap-3">
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Выбрать файл
                    </Button>
                    <Button variant="ghost" className="text-orange-600">
                      Скачать шаблон
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Условия выполнения</CardTitle>
            <CardDescription>Укажите желаемые сроки и бюджет</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="deadline" className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-slate-500" />
                  Желаемый срок выполнения
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1.5 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <Label htmlFor="budget" className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-slate-500" />
                  Бюджет
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="budget"
                    placeholder="50 000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">₽</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Бюджет и сроки являются ориентировочными. Исполнители могут предложить свои условия, и вы сможете выбрать наиболее
                подходящий вариант.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            Отмена
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="outline">Сохранить черновик</Button>
            <Button className="gap-2" onClick={handleSubmit}>
              Отправить в работу
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePackaging;
