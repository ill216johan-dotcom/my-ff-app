import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { supabase } from '../../supabaseClient.js';
import { getNotificationSummary } from '../../utils/notifications.js';
import ManagerSidebar from './manager/ManagerSidebar.jsx';
import AllOrders from './manager/AllOrders.jsx';
import CompletedOrders from './manager/CompletedOrders.jsx';
import ArbitrationList from './manager/ArbitrationList.jsx';
import PriceEstimation from './manager/PriceEstimation.jsx';
import ManagerOrderDetail from './manager/ManagerOrderDetail.jsx';
import ThemeToggle from '../ThemeToggle.jsx';
import Button from './ui/Button.jsx';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      // Optimized: Single query with JOINs for profiles and bids
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          client:profiles!orders_client_id_fkey (
            id,
            full_name
          ),
          executor:profiles!orders_accepted_packer_id_fkey (
            id,
            full_name
          ),
          bids:bids!bids_order_id_fkey (
            order_id,
            price,
            status
          )
        `)
        .in('status', ['searching', 'open', 'booked', 'in_progress', 'awaiting_payment'])
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching all orders:', ordersError);
        setAllOrders([]);
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        console.log('No orders found with statuses:', ['searching', 'open', 'booked', 'in_progress', 'awaiting_payment']);
        setAllOrders([]);
        return;
      }

      // Transform orders with joined data
      const transformed = ordersData.map((order) => {
        // Find accepted bid from the bids array
        const acceptedBid = Array.isArray(order.bids) 
          ? order.bids.find(bid => bid.status === 'accepted')
          : null;

        return {
          id: order.id,
          title: order.title,
          clientName: order.client?.full_name || 'Клиент',
          clientId: order.client?.id || order.client_id || '',
          executorName: order.executor?.full_name || null,
          executorId: order.executor?.id || order.accepted_packer_id || null,
          status: mapOrderStatus(order.status),
          budget: order.budget ? `${order.budget.toLocaleString('ru-RU')} ₽` : 'Не указан',
          price: acceptedBid?.price ? `${acceptedBid.price.toLocaleString('ru-RU')} ₽` : null,
          deadline: order.deadline,
          createdAt: order.created_at,
          articlesCount: order.items ? (Array.isArray(order.items) ? order.items.length : 0) : 0,
          unreadMessages: 0, // Will be calculated
          hasArbitration: order.is_disputed || false,
          arbitrationRequestedBy: null, // Will be determined
          arbitrationRequestedAt: null,
          isEstimation: order.is_estimation || false,
          order: order,
        };
      });

      console.log('Fetched orders for manager:', transformed.length);
      setAllOrders(transformed);
    } catch (error) {
      console.error('Error in fetchAllOrders:', error);
      setAllOrders([]);
    }
  };

  const fetchCompletedOrders = async () => {
    try {
      // Optimized: Single query with JOINs for profiles and bids
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          client:profiles!orders_client_id_fkey (
            id,
            full_name
          ),
          executor:profiles!orders_accepted_packer_id_fkey (
            id,
            full_name
          ),
          bids:bids!bids_order_id_fkey (
            order_id,
            price,
            status
          )
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(100);

      if (ordersError) {
        console.error('Error fetching completed orders:', ordersError);
        setCompletedOrders([]);
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        setCompletedOrders([]);
        return;
      }

      // Transform orders with joined data
      const transformed = ordersData.map((order) => {
        // Find accepted bid from the bids array
        const acceptedBid = Array.isArray(order.bids) 
          ? order.bids.find(bid => bid.status === 'accepted')
          : null;

        return {
          id: order.id,
          title: order.title,
          clientName: order.client?.full_name || 'Клиент',
          clientId: order.client?.id || order.client_id || '',
          executorName: order.executor?.full_name || 'Исполнитель',
          executorId: order.executor?.id || order.accepted_packer_id || '',
          status: 'completed',
          budget: order.budget ? `${order.budget.toLocaleString('ru-RU')} ₽` : 'Не указан',
          price: acceptedBid?.price ? `${acceptedBid.price.toLocaleString('ru-RU')} ₽` : 'Не указана',
          deadline: order.deadline,
          createdAt: order.created_at,
          articlesCount: order.items ? (Array.isArray(order.items) ? order.items.length : 0) : 0,
          unreadMessages: 0,
          hasArbitration: false,
          order: order,
        };
      });

      setCompletedOrders(transformed);
    } catch (error) {
      console.error('Error in fetchCompletedOrders:', error);
      setCompletedOrders([]);
    }
  };

  const fetchArbitrationOrders = async () => {
    try {
      // Optimized: Single query with JOINs for profiles
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          client:profiles!orders_client_id_fkey (
            id,
            full_name
          ),
          executor:profiles!orders_accepted_packer_id_fkey (
            id,
            full_name
          )
        `)
        .eq('is_disputed', true)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching arbitration orders:', ordersError);
        setArbitrationOrders([]);
        setArbitrationCount(0);
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        setArbitrationOrders([]);
        setArbitrationCount(0);
        return;
      }

      // Transform orders with joined data
      const transformed = ordersData.map((order) => {
        return {
          id: order.id,
          title: order.title,
          clientName: order.client?.full_name || 'Клиент',
          clientId: order.client?.id || order.client_id || '',
          executorName: order.executor?.full_name || 'Исполнитель',
          executorId: order.executor?.id || order.accepted_packer_id || '',
          status: mapOrderStatus(order.status),
          budget: order.budget ? `${order.budget.toLocaleString('ru-RU')} ₽` : 'Не указан',
          deadline: order.deadline,
          createdAt: order.created_at,
          articlesCount: order.items ? (Array.isArray(order.items) ? order.items.length : 0) : 0,
          unreadMessages: 0,
          hasArbitration: true,
          arbitrationRequestedBy: 'client', // TODO: Determine from messages or order metadata
          arbitrationRequestedAt: order.created_at, // Using created_at since updated_at may not exist
          order: order,
        };
      });

      setArbitrationOrders(transformed);
      setArbitrationCount(transformed.length);
    } catch (error) {
      console.error('Error in fetchArbitrationOrders:', error);
      setArbitrationOrders([]);
      setArbitrationCount(0);
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
        profile={profile}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="flex-1 overflow-hidden relative">
        {currentView !== 'order-detail' && (
          <>
            <div className="sticky top-0 z-30 lg:static flex items-center justify-between p-4 lg:p-0 lg:absolute lg:top-4 lg:right-4 bg-background lg:bg-transparent border-b lg:border-0 border-border">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="lg:block">
                <ThemeToggle />
              </div>
            </div>
            <div className="overflow-auto">
              {currentView === 'all-orders' && <AllOrders orders={allOrders} onSelect={handleSelectOrder} selectedId={selectedOrder?.id} />}
              {currentView === 'completed' && <CompletedOrders orders={completedOrders} onSelect={handleSelectOrder} selectedId={selectedOrder?.id} />}
              {currentView === 'arbitration' && <ArbitrationList orders={arbitrationOrders} onSelect={handleSelectOrder} />}
              {currentView === 'estimation' && (
                <PriceEstimation estimations={estimationOrders} onSelect={handleSelectOrder} user={user} onCreate={fetchAllData} />
              )}
            </div>
          </>
        )}
        {currentView === 'order-detail' && selectedOrder && (
          <ManagerOrderDetail order={selectedOrder} onBack={handleBack} user={user} profile={profile} onUpdate={handleOrderUpdated} />
        )}
      </main>
    </div>
  );
}

export default ManagerExchange;

