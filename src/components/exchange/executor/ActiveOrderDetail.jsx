import React, { useState } from 'react';
import { ArrowLeft, Upload, FileText, Plus, Trash2, CheckCircle, MessageSquare, Send, Shield, Clock, AlertTriangle, Package } from 'lucide-react';
import { supabase } from '../../../supabaseClient.js';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Badge from '../ui/Badge.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card.jsx';
import Label from '../ui/Label.jsx';
import OrderChat from '../../OrderChat.jsx';

export default function ActiveOrderDetail({ order, onBack, user, profile, onOrderUpdated }) {
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [services, setServices] = useState([{ id: '1', description: '', quantity: 0, price: 0 }]);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showArbitrationModal, setShowArbitrationModal] = useState(false);
  const [arbitrationRequested, setArbitrationRequested] = useState(order.order?.is_disputed || false);

  const isCompleted = order.status === 'completed';
  const isAwaitingPayment = order.status === 'awaiting_payment';

  // Исполнитель может вызвать арбитраж через сутки после выставления счёта
  const invoiceSentAt = order.invoiceSentAt ? new Date(order.invoiceSentAt) : null;
  const hoursSinceInvoice = invoiceSentAt ? (new Date().getTime() - invoiceSentAt.getTime()) / (1000 * 60 * 60) : 0;
  const canRequestArbitration = isAwaitingPayment && hoursSinceInvoice >= 24 && !arbitrationRequested;

  const getTimeRemaining = (deadline) => {
    if (!deadline) return { text: 'Не установлено', isOverdue: false };
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffMs = deadlineDate.getTime() - now.getTime();

    if (diffMs < 0) return { text: 'Просрочено', isOverdue: true };

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays === 0) {
      return { text: `${diffHours} часов`, isOverdue: false, isUrgent: true };
    }
    if (diffDays <= 2) {
      return { text: `${diffDays}д ${diffHours}ч`, isOverdue: false, isUrgent: true };
    }
    return { text: `${diffDays} дней`, isOverdue: false, isUrgent: false };
  };

  const addServiceItem = () => {
    setServices([...services, { id: Date.now().toString(), description: '', quantity: 0, price: 0 }]);
  };

  const removeServiceItem = (id) => {
    if (services.length > 1) {
      setServices(services.filter((s) => s.id !== id));
    }
  };

  const updateServiceItem = (id, field, value) => {
    setServices(services.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const totalAmount = services.reduce((sum, s) => sum + s.quantity * s.price, 0);

  const handleComplete = async () => {
    if (!invoiceFile || services.some((s) => !s.description || s.quantity <= 0 || s.price <= 0)) {
      alert('Пожалуйста, загрузите счет и заполните детализацию услуг.');
      return;
    }

    setIsCompleting(true);
    try {
      // Update order status to awaiting_payment
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'awaiting_payment',
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) {
        console.error('Error updating order:', error);
        alert('Не удалось завершить заказ.');
      } else {
        // Send system message about invoice
        await supabase.from('messages').insert([
          {
            order_id: order.id,
            sender_id: user.id,
            content: `Счет на сумму ${totalAmount.toLocaleString('ru-RU')} ₽ отправлен. Ожидается оплата.`,
            is_system_message: true,
          },
        ]);

        alert('Заказ завершен! Счет отправлен клиенту. Ожидайте оплаты.');
        setShowCompleteForm(false);
        if (onOrderUpdated) onOrderUpdated();
      }
    } catch (error) {
      console.error('Error in handleComplete:', error);
      alert('Произошла ошибка.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleRequestArbitration = async () => {
    if (!user || !order.id) return;

    try {
      // Update order to disputed
      const { error: orderError } = await supabase
        .from('orders')
        .update({ is_disputed: true })
        .eq('id', order.id);

      if (orderError) {
        console.error('Error requesting arbitration:', orderError);
        alert('Не удалось запросить арбитраж.');
        return;
      }

      // Send system message
      const { error: messageError } = await supabase.from('messages').insert([
        {
          order_id: order.id,
          sender_id: user.id,
          content: 'Арбитраж запрошен исполнителем. Счёт не оплачен более 24 часов.',
          is_system_message: true,
        },
      ]);

      if (messageError) {
        console.error('Error sending arbitration message:', messageError);
      }

      setArbitrationRequested(true);
      setShowArbitrationModal(false);
      alert('Арбитраж запрошен. Модератор будет подключен к диалогу.');
      
      if (onOrderUpdated) onOrderUpdated();
    } catch (error) {
      console.error('Error in handleRequestArbitration:', error);
      alert('Произошла ошибка.');
    }
  };

  const remaining = getTimeRemaining(order.deadline);

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
            <Badge className={isCompleted ? 'bg-muted text-muted-foreground' : 'bg-accent/20 text-accent'}>
              {isCompleted ? 'Завершено' : isAwaitingPayment ? 'Ожидает оплаты' : 'В работе'}
            </Badge>
            {arbitrationRequested && (
              <Badge className="bg-orange-500/20 text-orange-400 gap-1">
                <Shield className="w-3 h-3" />
                Арбитраж
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span>Клиент: {order.clientName}</span>
            <span className="flex items-center gap-1.5">
              <Package className="w-4 h-4" />
              {order.articlesCount} артикулов
            </span>
          </div>

          {!isCompleted && !isAwaitingPayment && (
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                remaining.isOverdue
                  ? 'bg-destructive/20 text-destructive'
                  : remaining.isUrgent
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-accent/10 text-accent'
              }`}
            >
              {remaining.isOverdue ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              {remaining.isOverdue ? 'Срок истёк' : `Осталось: ${remaining.text}`}
            </div>
          )}

          {isAwaitingPayment && !arbitrationRequested && (
            <div
              className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
                canRequestArbitration
                  ? 'bg-orange-500/10 border-orange-500/30'
                  : 'bg-yellow-500/10 border-yellow-500/30'
              }`}
            >
              <Clock className={`w-5 h-5 mt-0.5 ${canRequestArbitration ? 'text-orange-400' : 'text-yellow-400'}`} />
              <div className="flex-1">
                <p className={`font-medium ${canRequestArbitration ? 'text-orange-400' : 'text-yellow-400'}`}>
                  {canRequestArbitration ? 'Оплата задерживается' : 'Счёт выставлен'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {canRequestArbitration
                    ? 'Прошло более 24 часов с момента выставления счёта. Вы можете запросить арбитраж.'
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
        </div>

        {!isCompleted && !isAwaitingPayment && !showCompleteForm && (
          <Card className="bg-card border-border mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground mb-1">Завершение работы</h3>
                  <p className="text-sm text-muted-foreground">
                    После завершения упаковки загрузите счет и детализацию услуг
                  </p>
                </div>
                <Button onClick={() => setShowCompleteForm(true)} className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Завершить работу
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showCompleteForm && (
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Завершение работы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="invoice">Счет на оплату *</Label>
                <div className="mt-1.5 border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <input
                    type="file"
                    id="invoice"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setInvoiceFile(e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="invoice" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {invoiceFile ? invoiceFile.name : 'Нажмите для загрузки счета'}
                    </p>
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Детализация услуг *</Label>
                  <Button variant="outline" size="sm" onClick={addServiceItem} className="gap-1">
                    <Plus className="w-3 h-3" />
                    Добавить
                  </Button>
                </div>
                <div className="space-y-2">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                      <Input
                        placeholder="Описание услуги"
                        value={service.description}
                        onChange={(e) => updateServiceItem(service.id, 'description', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Кол-во"
                        value={service.quantity || ''}
                        onChange={(e) => updateServiceItem(service.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-24"
                      />
                      <Input
                        type="number"
                        placeholder="Цена"
                        value={service.price || ''}
                        onChange={(e) => updateServiceItem(service.id, 'price', parseFloat(e.target.value) || 0)}
                        className="w-32"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeServiceItem(service.id)}
                        disabled={services.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">Итого:</span>
                    <span className="text-xl font-semibold text-foreground">{totalAmount.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowCompleteForm(false)} className="flex-1">
                  Отмена
                </Button>
                <Button onClick={handleComplete} disabled={isCompleting} className="flex-1 gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {isCompleting ? 'Отправка...' : 'Завершить и отправить счет'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="w-96 border-l border-border bg-card">
        <OrderChat order={order.order} currentUser={user} currentUserProfile={profile} />
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
                <p className="text-sm text-muted-foreground">Привлечение модератора</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              К вашему диалогу с клиентом будет подключен модератор платформы для разрешения спорной ситуации.
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

