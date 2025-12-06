import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, MessageSquare, Star, Send, Check, X, AlertTriangle, Shield } from 'lucide-react';
import { supabase } from '../../../supabaseClient.js';
import { USER_ROLES } from '../../../db_schema.js';
import Button from '../ui/Button.jsx';
import Badge from '../ui/Badge.jsx';
import Input from '../ui/Input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs.jsx';
import { Avatar, AvatarFallback } from '../ui/Avatar.jsx';
import OrderChat from '../../OrderChat.jsx';

export default function PackagingDetail({ packaging, onBack, user, profile, onUpdate }) {
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArbitrationModal, setShowArbitrationModal] = useState(false);
  const [arbitrationRequested, setArbitrationRequested] = useState(packaging.order?.is_disputed || false);

  const isInProgress = packaging.status === 'in_progress';
  const deadlineDate = packaging.deadline ? new Date(packaging.deadline) : null;
  const now = new Date();
  const hoursSinceDeadline = deadlineDate ? (now.getTime() - deadlineDate.getTime()) / (1000 * 60 * 60) : 0;
  const canRequestArbitration = isInProgress && hoursSinceDeadline >= 24 && !arbitrationRequested;

  useEffect(() => {
    if (packaging.order?.status === 'searching' || packaging.order?.status === 'open') {
      fetchBids();
    } else {
      setLoading(false);
    }
  }, [packaging]);

  const fetchBids = async () => {
    if (!packaging.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          profiles:packer_id (
            full_name,
            id
          )
        `)
        .eq('order_id', packaging.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bids:', error);
      } else {
        const transformed = (data || []).map(bid => ({
          id: bid.id,
          executorName: bid.profiles?.full_name || 'Исполнитель',
          executorRating: 4.5, // TODO: Add rating system
          price: `${bid.price.toLocaleString('ru-RU')} ₽`,
          deadline: new Date(Date.now() + (bid.days_to_complete * 24 * 60 * 60 * 1000)).toISOString(),
          message: bid.comment || '',
          createdAt: bid.created_at,
          hasChat: false, // TODO: Check if chat exists
          unreadCount: 0, // TODO: Implement read tracking
          packerId: bid.packer_id,
          bid: bid
        }));
        setResponses(transformed);
      }
    } catch (error) {
      console.error('Error in fetchBids:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBid = async (response) => {
    if (!confirm(`Принять предложение от ${response.executorName} за ${response.price}?`)) {
      return;
    }

    try {
      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'booked',
          accepted_packer_id: response.packerId
        })
        .eq('id', packaging.id);

      if (orderError) {
        console.error('Error updating order:', orderError);
        alert('Не удалось обновить заказ.');
        return;
      }

      // Update bid status
      const { error: bidError } = await supabase
        .from('bids')
        .update({ status: 'accepted' })
        .eq('id', response.id);

      if (bidError) {
        console.error('Error updating bid:', bidError);
      }

      // Reject other bids
      await supabase
        .from('bids')
        .update({ status: 'rejected' })
        .eq('order_id', packaging.id)
        .neq('id', response.id);

      // Send system message
      await supabase.from('messages').insert([
        {
          order_id: packaging.id,
          sender_id: user.id,
          content: `Клиент принял предложение от исполнителя ${response.executorName} за ${response.price}`,
          is_system_message: true,
        },
      ]);

      alert('Предложение принято! Заказ забронирован. 🎉');
      if (onUpdate) onUpdate();
      onBack();
    } catch (error) {
      console.error('Error in handleAcceptBid:', error);
      alert('Произошла ошибка.');
    }
  };

  const handleRequestArbitration = async () => {
    if (!user || !packaging.id) return;

    try {
      // Update order to disputed
      const { error: orderError } = await supabase
        .from('orders')
        .update({ is_disputed: true })
        .eq('id', packaging.id);

      if (orderError) {
        console.error('Error requesting arbitration:', orderError);
        alert('Не удалось запросить арбитраж.');
        return;
      }

      // Send system message
      const { error: messageError } = await supabase.from('messages').insert([
        {
          order_id: packaging.id,
          sender_id: user.id,
          content: 'Арбитраж запрошен клиентом. Дедлайн просрочен более 24 часов.',
          is_system_message: true,
        },
      ]);

      if (messageError) {
        console.error('Error sending arbitration message:', messageError);
      }

      setArbitrationRequested(true);
      setShowArbitrationModal(false);
      alert('Арбитраж запрошен. Модератор будет подключен к диалогу.');
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error in handleRequestArbitration:', error);
      alert('Произошла ошибка.');
    }
  };

  // If order is in progress, show only details and chat with selected packer
  if (isInProgress && packaging.order?.accepted_packer_id) {
    return (
      <div className="flex h-full">
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
              <Badge className="bg-accent/20 text-accent">В работе</Badge>
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
                Создано {new Date(packaging.createdAt).toLocaleDateString('ru-RU')}
              </span>
              {deadlineDate && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Дедлайн: {deadlineDate.toLocaleDateString('ru-RU')}
                </span>
              )}
            </div>
          </div>

          {canRequestArbitration && !arbitrationRequested && (
            <div className="mb-6 p-4 rounded-lg border bg-destructive/10 border-destructive/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 mt-0.5 text-destructive" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Дедлайн просрочен</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Прошло более 24 часов с момента дедлайна. Вы можете запросить арбитраж.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-destructive/50 text-destructive hover:bg-destructive/10"
                onClick={() => setShowArbitrationModal(true)}
              >
                <Shield className="w-4 h-4 mr-2" />
                Запросить арбитраж
              </Button>
            </div>
          )}

          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Детали задания</CardTitle>
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
                {deadlineDate && (
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Срок</p>
                    <p className="text-xl font-semibold text-foreground">
                      {deadlineDate.toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                )}
              </div>

              {packaging.order?.items && Array.isArray(packaging.order.items) && packaging.order.items.length > 0 && (
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
                        {packaging.order.items.slice(0, 10).map((item, idx) => (
                          <tr key={idx} className="border-t border-border">
                            <td className="p-3 text-foreground">{item.sku || '-'}</td>
                            <td className="p-3 text-foreground">{item.name || '-'}</td>
                            <td className="p-3 text-foreground">{item.quantity || 0}</td>
                            <td className="p-3 text-foreground">{item.packagingType || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="w-96 border-l border-border bg-card">
          <OrderChat
            order={packaging.order}
            currentUser={user}
            currentUserProfile={profile}
            selectedPackerId={packaging.order?.accepted_packer_id}
          />
        </div>
      </div>
    );
  }

  // If order is active (searching), show bids and details
  return (
    <div className="flex h-full">
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
            <Badge className="bg-primary/20 text-primary">Активно</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Создано {new Date(packaging.createdAt).toLocaleDateString('ru-RU')}
            </span>
            {deadlineDate && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Дедлайн: {deadlineDate.toLocaleDateString('ru-RU')}
              </span>
            )}
          </div>
        </div>

        <Tabs defaultValue="responses">
          <TabsList>
            <TabsTrigger value="responses" className="gap-2">
              Отклики
              {responses.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {responses.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="details">Детали задания</TabsTrigger>
          </TabsList>

          <TabsContent value="responses" className="mt-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : responses.length === 0 ? (
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
                {responses.map((response) => (
                  <ResponseCard
                    key={response.id}
                    response={response}
                    isSelected={selectedResponse?.id === response.id}
                    onSelect={() => setSelectedResponse(response)}
                    onAccept={() => handleAcceptBid(response)}
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
                  {deadlineDate && (
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Срок</p>
                      <p className="text-xl font-semibold text-foreground">
                        {deadlineDate.toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  )}
                </div>

                {packaging.order?.items && Array.isArray(packaging.order.items) && packaging.order.items.length > 0 && (
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
                          {packaging.order.items.map((item, idx) => (
                            <tr key={idx} className="border-t border-border">
                              <td className="p-3 text-foreground">{item.sku || '-'}</td>
                              <td className="p-3 text-foreground">{item.name || '-'}</td>
                              <td className="p-3 text-foreground">{item.quantity || 0}</td>
                              <td className="p-3 text-foreground">{item.packagingType || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

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
              <button
                onClick={() => setSelectedResponse(null)}
                className="text-muted-foreground hover:text-foreground"
              >
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
                  {new Date(selectedResponse.deadline).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button className="flex-1 gap-2" onClick={() => handleAcceptBid(selectedResponse)}>
                <Check className="w-4 h-4" />
                Принять
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                Отклонить
              </Button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-auto">
            <OrderChat
              order={packaging.order}
              currentUser={user}
              currentUserProfile={profile}
              selectedPackerId={selectedResponse.packerId}
            />
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
              <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white dark:text-white" onClick={handleRequestArbitration}>
                Подтвердить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResponseCard({ response, isSelected, onSelect, onAccept }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left bg-card border rounded-xl p-5 transition-all ${
        isSelected ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/50'
      }`}
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
            <p className="font-medium text-foreground">{new Date(response.deadline).toLocaleDateString('ru-RU')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-primary">
          <MessageSquare className="w-4 h-4" />
          Открыть чат
        </div>
      </div>
    </button>
  );
}

