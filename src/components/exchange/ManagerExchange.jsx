import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { getNotificationSummary } from '../../utils/notifications.js';
import ManagerSidebar from './manager/ManagerSidebar.jsx';
import AllOrders from './manager/AllOrders.jsx';
import CompletedOrders from './manager/CompletedOrders.jsx';
import ArbitrationList from './manager/ArbitrationList.jsx';
import PriceEstimation from './manager/PriceEstimation.jsx';
import ManagerOrderDetail from './manager/ManagerOrderDetail.jsx';
import ThemeToggle from '../ThemeToggle.jsx';

/**
 * Manager Exchange Dashboard
 * Full manager interface with all orders, completed orders, arbitration, and price estimation
 */
function ManagerExchange({ user, profile }) {
  const [currentView, setCurrentView] = useState('all-orders');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [arbitrationOrders, setArbitrationOrders] = useState([]);
  const [estimationOrders, setEstimationOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [arbitrationCount, setArbitrationCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAllOrders(),
        fetchCompletedOrders(),
        fetchArbitrationOrders(),
        fetchEstimationOrders(),
        fetchNotifications(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          client:profiles!orders_client_id_fkey (
            full_name,
            id
          ),
          executor:profiles!orders_accepted_packer_id_fkey (
            full_name,
            id
          )
        `)
        .in('status', ['searching', 'open', 'booked', 'in_progress', 'awaiting_payment'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all orders:', error);
      } else {
        const transformed = (data || []).map((order) => ({
          id: order.id,
          title: order.title,
          clientName: order.client?.full_name || 'Клиент',
          clientId: order.client?.id || '',
          executorName: order.executor?.full_name,
          executorId: order.executor?.id,
          status: mapOrderStatus(order.status),
          budget: order.budget ? `${order.budget.toLocaleString('ru-RU')} ₽` : 'Не указан',
          price: null, // Will be fetched from accepted bid
          deadline: order.deadline,
          createdAt: order.created_at,
          articlesCount: order.items ? (Array.isArray(order.items) ? order.items.length : 0) : 0,
          unreadMessages: 0, // Will be calculated
          hasArbitration: order.is_disputed || false,
          arbitrationRequestedBy: null, // Will be determined
          arbitrationRequestedAt: null,
          isEstimation: order.is_estimation || false,
          order: order,
        }));

        // Fetch prices from accepted bids
        const orderIds = transformed.map((o) => o.id);
        const { data: bids } = await supabase
          .from('bids')
          .select('order_id, price')
          .eq('status', 'accepted')
          .in('order_id', orderIds);

        const bidMap = {};
        (bids || []).forEach((bid) => {
          bidMap[bid.order_id] = bid.price;
        });

        const ordersWithPrices = transformed.map((order) => ({
          ...order,
          price: bidMap[order.id] ? `${bidMap[order.id].toLocaleString('ru-RU')} ₽` : null,
        }));

        setAllOrders(ordersWithPrices);
      }
    } catch (error) {
      console.error('Error in fetchAllOrders:', error);
    }
  };

  const fetchCompletedOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          client:profiles!orders_client_id_fkey (
            full_name,
            id
          ),
          executor:profiles!orders_accepted_packer_id_fkey (
            full_name,
            id
          )
        `)
        .eq('status', 'completed')
        .order('updated_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching completed orders:', error);
      } else {
        const transformed = (data || []).map((order) => {
          return {
            id: order.id,
            title: order.title,
            clientName: order.client?.full_name || 'Клиент',
            clientId: order.client?.id || '',
            executorName: order.executor?.full_name || 'Исполнитель',
            executorId: order.executor?.id || '',
            status: 'completed',
            budget: order.budget ? `${order.budget.toLocaleString('ru-RU')} ₽` : 'Не указан',
            price: null,
            deadline: order.deadline,
            createdAt: order.created_at,
            articlesCount: order.items ? (Array.isArray(order.items) ? order.items.length : 0) : 0,
            unreadMessages: 0,
            hasArbitration: false,
            order: order,
          };
        });

        // Fetch prices
        const orderIds = transformed.map((o) => o.id);
        const { data: bids } = await supabase
          .from('bids')
          .select('order_id, price')
          .eq('status', 'accepted')
          .in('order_id', orderIds);

        const bidMap = {};
        (bids || []).forEach((bid) => {
          bidMap[bid.order_id] = bid.price;
        });

        const ordersWithPrices = transformed.map((order) => ({
          ...order,
          price: bidMap[order.id] ? `${bidMap[order.id].toLocaleString('ru-RU')} ₽` : 'Не указана',
        }));

        setCompletedOrders(ordersWithPrices);
      }
    } catch (error) {
      console.error('Error in fetchCompletedOrders:', error);
    }
  };

  const fetchArbitrationOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          client:profiles!orders_client_id_fkey (
            full_name,
            id
          ),
          executor:profiles!orders_accepted_packer_id_fkey (
            full_name,
            id
          )
        `)
        .eq('is_disputed', true)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching arbitration orders:', error);
      } else {
        const transformed = (data || []).map((order) => ({
          id: order.id,
          title: order.title,
          clientName: order.client?.full_name || 'Клиент',
          clientId: order.client?.id || '',
          executorName: order.executor?.full_name || 'Исполнитель',
          executorId: order.executor?.id || '',
          status: mapOrderStatus(order.status),
          budget: order.budget ? `${order.budget.toLocaleString('ru-RU')} ₽` : 'Не указан',
          deadline: order.deadline,
          createdAt: order.created_at,
          articlesCount: order.items ? (Array.isArray(order.items) ? order.items.length : 0) : 0,
          unreadMessages: 0,
          hasArbitration: true,
          arbitrationRequestedBy: 'client', // TODO: Determine from messages or order metadata
          arbitrationRequestedAt: order.updated_at,
          order: order,
        }));

        setArbitrationOrders(transformed);
        setArbitrationCount(transformed.length);
      }
    } catch (error) {
      console.error('Error in fetchArbitrationOrders:', error);
    }
  };

  const fetchEstimationOrders = async () => {
    try {
      // Fetch orders marked as estimation (if we have that field)
      // For now, we'll fetch orders with a specific pattern in title or a flag
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          client:profiles!orders_client_id_fkey (
            full_name,
            id
          )
        `)
        .eq('status', 'searching')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching estimation orders:', error);
      } else {
        // Filter or mark estimation orders (for now, we'll use title pattern)
        const estimation = (data || [])
          .filter((order) => order.title.toLowerCase().includes('оценка') || order.is_estimation)
          .map((order) => ({
            id: order.id,
            title: order.title,
            clientName: order.client?.full_name || 'Потенциальный клиент',
            clientId: order.client?.id || '',
            status: 'active',
            budget: order.budget ? `~${order.budget.toLocaleString('ru-RU')} ₽` : '~100 000 ₽',
            deadline: order.deadline,
            createdAt: order.created_at,
            articlesCount: order.items ? (Array.isArray(order.items) ? order.items.length : 0) : 0,
            unreadMessages: 0,
            hasArbitration: false,
            isEstimation: true,
            order: order,
          }));

        setEstimationOrders(estimation);
      }
    } catch (error) {
      console.error('Error in fetchEstimationOrders:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!user || !profile) return;
    
    try {
      const summary = await getNotificationSummary(user.id, profile.role);
      setUnreadCount(summary.messages);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const mapOrderStatus = (status) => {
    switch (status) {
      case 'searching':
      case 'open':
        return 'active';
      case 'booked':
      case 'in_progress':
        return 'in_progress';
      case 'awaiting_payment':
        return 'awaiting_payment';
      case 'completed':
        return 'completed';
      default:
        return 'active';
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setCurrentView('order-detail');
  };

  const handleBack = () => {
    setCurrentView('all-orders');
    setSelectedOrder(null);
  };

  const handleOrderUpdated = () => {
    fetchAllData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ManagerSidebar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setSelectedOrder(null);
        }}
        arbitrationCount={arbitrationCount}
        unreadCount={unreadCount}
      />

      <main className="flex-1 overflow-auto relative">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        {currentView === 'all-orders' && <AllOrders orders={allOrders} onSelect={handleSelectOrder} />}
        {currentView === 'completed' && <CompletedOrders orders={completedOrders} onSelect={handleSelectOrder} />}
        {currentView === 'arbitration' && <ArbitrationList orders={arbitrationOrders} onSelect={handleSelectOrder} />}
        {currentView === 'estimation' && (
          <PriceEstimation estimations={estimationOrders} onSelect={handleSelectOrder} user={user} onCreate={fetchAllData} />
        )}
        {currentView === 'order-detail' && selectedOrder && (
          <ManagerOrderDetail order={selectedOrder} onBack={handleBack} user={user} profile={profile} onUpdate={handleOrderUpdated} />
        )}
      </main>
    </div>
  );
}

export default ManagerExchange;

