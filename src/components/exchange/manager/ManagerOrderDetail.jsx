import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Users, FileText, Send, AlertTriangle, Eye, UserPlus, Shield } from 'lucide-react';
import { supabase } from '../../../supabaseClient.js';
import { USER_ROLES } from '../../../db_schema.js';
import Button from '../ui/Button.jsx';
import Badge from '../ui/Badge.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card.jsx';
import Input from '../ui/Input.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs.jsx';
import OrderChat from '../../OrderChat.jsx';

const statusLabels = {
  active: 'Поиск исполнителя',
  in_progress: 'В работе',
  awaiting_payment: 'Ожидает оплаты',
  completed: 'Завершено',
};

const statusColors = {
  active: 'bg-blue-500/10 text-blue-500',
  in_progress: 'bg-yellow-500/10 text-yellow-500',
  awaiting_payment: 'bg-purple-500/10 text-purple-500',
  completed: 'bg-green-500/10 text-green-500',
};

export default function ManagerOrderDetail({ order, onBack, user, profile, onUpdate }) {
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    // Check if manager is already connected (has sent messages)
    checkManagerConnection();
  }, [order.id, user]);

  const fetchMessages = async () => {
    if (!order.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (
            full_name,
            role
          )
        `)
        .eq('order_id', order.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data || []);
        // Check if manager has sent messages
        const managerMessages = (data || []).filter(
          (msg) => msg.sender?.role === USER_ROLES.MANAGER || msg.sender?.role === USER_ROLES.ADMIN
        );
        if (managerMessages.length > 0) {
          setIsConnected(true);
        }
      }
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkManagerConnection = async () => {
    if (!order.id || !user) return;
    
    try {
      const { data } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('order_id', order.id)
        .eq('sender_id', user.id)
        .limit(1);

      if (data && data.length > 0) {
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const handleConnect = async () => {
    if (!user || !order.id) return;

    try {
      // Send system message about manager connection
      const { error } = await supabase.from('messages').insert([
        {
          order_id: order.id,
          sender_id: user.id,
          content: 'Модератор подключился к чату',
          is_system_message: true,
        },
      ]);

      if (error) {
        console.error('Error connecting:', error);
        alert('Не удалось подключиться к чату.');
      } else {
        setIsConnected(true);
        fetchMessages();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error in handleConnect:', error);
      alert('Произошла ошибка.');
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !isConnected || !user || !order.id) return;

    try {
      const { error } = await supabase.from('messages').insert([
        {
          order_id: order.id,
          sender_id: user.id,
          content: message.trim(),
          is_system_message: false,
        },
      ]);

      if (error) {
        console.error('Error sending message:', error);
        alert('Не удалось отправить сообщение.');
      } else {
        setMessage('');
        fetchMessages();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      alert('Произошла ошибка.');
    }
  };

  const canConnect = order.status !== 'completed' && order.status !== 'active';

  return (
    <div className="flex flex-col h-screen">
      <div className="p-6 border-b border-border bg-card">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">{order.title}</h1>
              <Badge variant="outline" className={statusColors[order.status]}>
                {statusLabels[order.status]}
              </Badge>
              {order.isEstimation && (
                <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                  Оценка
                </Badge>
              )}
              {order.hasArbitration && (
                <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Арбитраж
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Заказ #{order.id.slice(0, 8)}</p>
          </div>

          {canConnect && !isConnected && (
            <Button onClick={handleConnect} className="bg-orange-500 hover:bg-orange-600 text-white dark:text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Подключиться к чату
            </Button>
          )}
          {isConnected && (
            <Badge className="bg-orange-500 text-white dark:text-white">
              <Shield className="w-3 h-3 mr-1" />
              Вы в чате как модератор
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 border-r border-border overflow-auto p-6">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="info">Информация</TabsTrigger>
              <TabsTrigger value="articles">Артикулы</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Участники
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Клиент</p>
                      <p className="font-medium text-foreground">{order.clientName}</p>
                    </div>
                    <Badge variant="outline">ID: {order.clientId.slice(0, 8)}</Badge>
                  </div>
                  {order.executorName && (
                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground">Исполнитель</p>
                        <p className="font-medium text-foreground">{order.executorName}</p>
                      </div>
                      <Badge variant="outline">ID: {order.executorId?.slice(0, 8)}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Детали заказа
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Бюджет клиента</p>
                      <p className="font-semibold text-foreground">{order.budget}</p>
                    </div>
                    {order.price && (
                      <div className="p-3 bg-secondary/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Согласованная цена</p>
                        <p className="font-semibold text-foreground">{order.price}</p>
                      </div>
                    )}
                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Дедлайн</p>
                      <p className="font-semibold text-foreground">
                        {order.deadline ? new Date(order.deadline).toLocaleDateString('ru-RU') : 'Не установлен'}
                      </p>
                    </div>
                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Артикулов</p>
                      <p className="font-semibold text-foreground">{order.articlesCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {order.hasArbitration && (
                <Card className="border-orange-500/30 bg-orange-500/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-orange-500">
                      <AlertTriangle className="w-4 h-4" />
                      Информация об арбитраже
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-muted-foreground">Запрошен: </span>
                        <span className="text-foreground">
                          {order.arbitrationRequestedBy === 'client' ? 'Клиентом' : 'Исполнителем'}
                        </span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Причина: </span>
                        <span className="text-foreground">
                          {order.arbitrationRequestedBy === 'client'
                            ? 'Просрочка дедлайна более 24 часов'
                            : 'Счёт не оплачен более 24 часов'}
                        </span>
                      </p>
                      {order.arbitrationRequestedAt && (
                        <p>
                          <span className="text-muted-foreground">Дата запроса: </span>
                          <span className="text-foreground">
                            {new Date(order.arbitrationRequestedAt).toLocaleString('ru-RU')}
                          </span>
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="articles">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Список артикулов
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {order.order?.items && Array.isArray(order.order.items) && order.order.items.length > 0 ? (
                    <div className="space-y-2">
                      {order.order.items.map((article, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                          <div>
                            <p className="font-medium text-foreground">{article.name || 'Без названия'}</p>
                            <p className="text-xs text-muted-foreground">SKU: {article.sku || '-'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-foreground">{article.quantity || 0} шт.</p>
                            <p className="text-xs text-muted-foreground">{article.packagingType || '-'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Артикулы не указаны</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-1/2 flex flex-col bg-secondary/20">
          <div className="p-4 border-b border-border bg-card">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Shield className="w-5 h-5 text-orange-500" />
              ) : (
                <Eye className="w-5 h-5 text-muted-foreground" />
              )}
              <h2 className="font-semibold text-foreground">
                {isConnected ? 'Чат (вы участвуете)' : 'Чат (только просмотр)'}
              </h2>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {order.order ? (
              <OrderChat
                order={order.order}
                currentUser={user}
                currentUserProfile={profile}
                selectedPackerId={order.order.accepted_packer_id}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">Загрузка чата...</div>
            )}
          </div>

          {isConnected && (
            <div className="p-4 border-t border-border bg-card">
              <div className="flex gap-2">
                <Input
                  placeholder="Написать как модератор..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} className="bg-orange-500 hover:bg-orange-600 text-white dark:text-white">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

