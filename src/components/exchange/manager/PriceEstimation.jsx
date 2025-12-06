import React, { useState } from 'react';
import { Plus, Calculator, Package, MessageSquare, Clock } from 'lucide-react';
import { supabase } from '../../../supabaseClient.js';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Label from '../ui/Label.jsx';
import Textarea from '../ui/Textarea.jsx';
import Badge from '../ui/Badge.jsx';
import { Card, CardContent } from '../ui/Card.jsx';

export default function PriceEstimation({ estimations, onSelect, user, onCreate }) {
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    articlesCount: '',
    approximateBudget: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Вы должны войти в систему.');
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        client_id: user.id, // Manager creates on behalf of system
        title: formData.title.trim(),
        description: formData.description.trim(),
        budget: formData.approximateBudget ? parseFloat(formData.approximateBudget.replace(/\s/g, '')) : null,
        deadline: null,
        items: null,
        status: 'searching',
        is_estimation: true, // Mark as estimation request
      };

      const { data, error } = await supabase.from('orders').insert([orderData]).select();

      if (error) {
        console.error('Error creating estimation:', error);
        alert('Не удалось создать запрос на оценку.');
      } else {
        alert('Запрос на оценку создан!');
        setShowCreate(false);
        setFormData({ title: '', description: '', articlesCount: '', approximateBudget: '' });
        if (onCreate) onCreate();
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert('Произошла ошибка.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Оценка стоимости</h1>
          <p className="text-muted-foreground">Запросы для потенциальных клиентов</p>
        </div>

        <Button className="bg-orange-500 hover:bg-orange-600 text-white dark:text-white" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Создать запрос
        </Button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-4">Новый запрос на оценку</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Название</Label>
                <Input
                  id="title"
                  placeholder="Например: Оценка партии косметики"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="description">Описание задачи</Label>
                <Textarea
                  id="description"
                  placeholder="Опишите что нужно упаковать, особенности товара, требования..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="articlesCount">Примерное кол-во артикулов</Label>
                  <Input
                    id="articlesCount"
                    type="number"
                    placeholder="100"
                    value={formData.articlesCount}
                    onChange={(e) => setFormData({ ...formData, articlesCount: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="budget">Ориентировочный бюджет</Label>
                  <Input
                    id="budget"
                    placeholder="~50 000 ₽"
                    value={formData.approximateBudget}
                    onChange={(e) => setFormData({ ...formData, approximateBudget: e.target.value })}
                    className="mt-1.5"
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
                <Button type="submit" disabled={submitting} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white dark:text-white">
                  {submitting ? 'Создание...' : 'Создать запрос'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                        Создано {new Date(estimation.createdAt).toLocaleDateString('ru-RU')}
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
  );
}

