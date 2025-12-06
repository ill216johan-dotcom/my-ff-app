import React, { useState } from 'react';
import { ArrowLeft, Clock, Calendar, Package, Star, Send } from 'lucide-react';
import { supabase } from '../../../supabaseClient.js';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Textarea from '../ui/Textarea.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card.jsx';
import { Avatar, AvatarFallback } from '../ui/Avatar.jsx';
import Label from '../ui/Label.jsx';
import Badge from '../ui/Badge.jsx';
import OrderChat from '../../OrderChat.jsx';

export default function OrderDetail({ order, onBack, user, profile, onBidSubmitted }) {
  const [price, setPrice] = useState('');
  const [deadline, setDeadline] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(order.hasBid);
  const isEstimation = order.isEstimation;

  const handleSubmit = async () => {
    // For estimation orders, only comment is required
    if (isEstimation) {
      if (!comment.trim()) {
        alert('Пожалуйста, добавьте комментарий для оценки.');
        return;
      }
    } else {
      if (!price || !deadline) {
        alert('Пожалуйста, укажите цену и срок выполнения.');
        return;
      }
    }

    if (!user) {
      alert('Вы должны войти в систему.');
      return;
    }

    setIsSubmitting(true);
    try {
      let bidData = {
        order_id: order.id,
        packer_id: user.id,
        comment: comment.trim() || null,
        status: 'pending',
      };

      if (!isEstimation) {
        const deadlineDate = new Date(deadline);
        const now = new Date();
        const daysToComplete = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysToComplete <= 0) {
          alert('Срок выполнения должен быть в будущем.');
          return;
        }

        bidData.price = parseFloat(price);
        bidData.days_to_complete = daysToComplete;
      }

      const { data, error } = await supabase
        .from('bids')
        .insert([bidData])
        .select();

      if (error) {
        console.error('Error submitting bid:', error);
        alert('Не удалось отправить отклик. Попробуйте еще раз.');
      } else {
        alert(isEstimation ? 'Комментарий отправлен! 🎉' : 'Отклик успешно отправлен! 🎉');
        setIsSubmitted(true);
        if (onBidSubmitted) onBidSubmitted();
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert('Произошла ошибка.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDaysUntilDeadline = (deadlineDate) => {
    if (!deadlineDate) return 0;
    const date = new Date(deadlineDate);
    const now = new Date();
    return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysUntilDeadline(order.deadline);

  return (
    <div className="flex h-full">
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
            {isEstimation && (
              <Badge className="bg-orange-500/20 text-orange-400">Оценка</Badge>
            )}
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
              Создано {new Date(order.createdAt).toLocaleDateString('ru-RU')}
            </span>
          </div>
        </div>

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
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${daysLeft <= 5 ? 'bg-orange-500/10' : 'bg-accent/10'}`}>
                  <Clock className={`w-5 h-5 ${daysLeft <= 5 ? 'text-orange-400' : 'text-accent'}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">До дедлайна</p>
                  <p className="text-xl font-semibold text-foreground">{daysLeft} дней</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Бюджет</p>
                  <p className="text-xl font-semibold text-foreground">{order.budget}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Описание задания</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground whitespace-pre-wrap">{order.description || 'Описание не указано'}</p>
          </CardContent>
        </Card>

        {!isSubmitted ? (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">{isEstimation ? 'Комментарий для оценки' : 'Отклик на задание'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEstimation ? (
                <div className="bg-orange-500/10 p-3 rounded-lg mb-4">
                  <p className="text-sm text-orange-500">
                    Это запрос на оценку. Укажите только комментарий. Цена и сроки не обязательны.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Цена за услугу *</Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="price"
                        type="number"
                        placeholder="50000"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="bg-secondary border-border pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">₽</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="deadline">Срок выполнения *</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="mt-1.5 bg-secondary border-border"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="comment">Комментарий {isEstimation ? '*' : '(необязательно)'}</Label>
                <Textarea
                  id="comment"
                  placeholder={isEstimation ? "Опишите примерную стоимость и сроки выполнения..." : "Добавьте уточняющий комментарий для клиента..."}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mt-1.5 bg-secondary border-border min-h-[100px]"
                  required={isEstimation}
                />
              </div>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full gap-2">
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Отправка...' : isEstimation ? 'Отправить комментарий' : 'Отправить отклик'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <p className="text-foreground font-medium mb-2">Вы уже откликнулись на это задание</p>
              <p className="text-sm text-muted-foreground">Ожидайте ответа от клиента</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="w-96 border-l border-border bg-card">
        <OrderChat order={order.order} currentUser={user} currentUserProfile={profile} selectedPackerId={user?.id} />
      </div>
    </div>
  );
}

