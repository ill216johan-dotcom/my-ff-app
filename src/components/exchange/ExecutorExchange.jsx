import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { supabase } from '../../supabaseClient.js';
import { getNotificationSummary } from '../../utils/notifications.js';
import ExecutorSidebar from './executor/ExecutorSidebar.jsx';
import AvailableOrders from './executor/AvailableOrders.jsx';
import MyOrders from './executor/MyOrders.jsx';
import OrderDetail from './executor/OrderDetail.jsx';
import ActiveOrderDetail from './executor/ActiveOrderDetail.jsx';
import ThemeToggle from '../ThemeToggle.jsx';
import Button from './ui/Button.jsx';

/**
 * Executor (Packer) Exchange Dashboard
 * Uses V0 UI components adapted for React
 */
function ExecutorExchange({ user, profile }) {
  const [currentView, setCurrentView] = useState('available');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedMyOrder, setSelectedMyOrder] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({ newOrders: 0, messages: 0, myOrders: 0 });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAvailableOrders();
      fetchMyOrders();
    }
  }, [user]);

  useEffect(() => {
    if (user && profile) {
      fetchNotifications();
    }
  }, [user, profile, availableOrders, myOrders]);

  const fetchAvailableOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Optimized query: exclude heavy items column, only fetch lightweight fields needed for list view
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          title,
          status,
          budget,
          deadline,
          created_at,
          description,
          is_estimation,
          profiles:client_id (
            full_name,
            id
          )
        `)
        .in('status', ['searching', 'open'])
        .order('created_at', { ascending: false })
        .range(0, 49);

      if (error) {
        console.error('Error fetching available orders:', error);
      } else {
        // Check which orders the user has already bid on
        const orderIds = (data || []).map(o => o.id);
        const { data: myBids } = await supabase
          .from('bids')
          .select('order_id')
          .eq('packer_id', user.id)
          .in('order_id', orderIds);

        const bidOrderIds = new Set((myBids || []).map(b => b.order_id));

        // Transform orders
        const transformed = (data || []).map(order => ({
          id: order.id,
          title: order.title,
          clientName: order.profiles?.full_name || 'Клиент',
          clientRating: 4.5, // TODO: Add rating system
          budget: order.budget ? `${order.budget.toLocaleString('ru-RU')} ₽` : 'Не указан',
          deadline: order.deadline,
          createdAt: order.created_at,
          articlesCount: 0, // Excluded items column for performance - will be loaded in detail view
          description: order.description || '',
          responsesCount: 0, // Will be fetched separately
          articles: [], // Excluded items for performance
          order: order,
          hasBid: bidOrderIds.has(order.id),
          isEstimation: order.is_estimation || false
        }));

        setAvailableOrders(transformed);
        
        // Fetch bid counts
        if (transformed.length > 0) {
          fetchBidCounts(transformed.map(o => o.id));
        }
      }
    } catch (error) {
      console.error('Error in fetchAvailableOrders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBidCounts = async (orderIds) => {
    if (!orderIds || orderIds.length === 0) return;
    
    try {
      const { data, error } = await supabase
        .from('bids')
        .select('order_id')
        .in('order_id', orderIds)
        .eq('status', 'pending');

      if (!error && data) {
        const counts = {};
        data.forEach(bid => {
          counts[bid.order_id] = (counts[bid.order_id] || 0) + 1;
        });
        
        setAvailableOrders(prev => prev.map(o => ({
          ...o,
          responsesCount: counts[o.id] || 0
        })));
      }
    } catch (error) {
      console.error('Error fetching bid counts:', error);
    }
  };

  const fetchMyOrders = async () => {
    if (!user) return;
    
    try {
      // Optimized query: exclude heavy items column, only fetch lightweight fields needed for list view
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          title,
          status,
          budget,
          deadline,
          created_at,
          updated_at,
          description,
          is_estimation,
          profiles:client_id (
            full_name,
            id
          )
        `)
        .eq('accepted_packer_id', user.id)
        .in('status', ['booked', 'in_progress', 'awaiting_payment', 'completed'])
        .order('created_at', { ascending: false })
        .range(0, 49);

      if (error) {
        console.error('Error fetching my orders:', error);
      } else {
        // Get accepted bid for each order to get price
        const orderIds = (data || []).map(o => o.id);
        const { data: bids } = await supabase
          .from('bids')
          .select('order_id, price, days_to_complete')
          .eq('packer_id', user.id)
          .eq('status', 'accepted')
          .in('order_id', orderIds);

        const bidMap = {};
        (bids || []).forEach(bid => {
          bidMap[bid.order_id] = bid;
        });

        const transformed = (data || []).map(order => {
          const bid = bidMap[order.id];
          return {
            id: order.id,
            title: order.title,
            clientName: order.profiles?.full_name || 'Клиент',
            status: mapOrderStatus(order.status),
            price: bid ? `${bid.price.toLocaleString('ru-RU')} ₽` : 'Не указана',
            deadline: order.deadline,
            startedAt: order.created_at,
            completedAt: order.status === 'completed' ? order.updated_at : null,
            articlesCount: 0, // Excluded items column for performance - will be loaded in detail view
            articles: [], // Excluded items for performance
            order: order,
            invoiceSentAt: order.status === 'awaiting_payment' ? order.updated_at : null
          };
        });

        setMyOrders(transformed);
      }
    } catch (error) {
      console.error('Error in fetchMyOrders:', error);
    }
  };

  const mapOrderStatus = (status) => {
    switch (status) {
      case 'booked':
      case 'in_progress':
        return 'in_progress';
      case 'awaiting_payment':
        return 'awaiting_payment';
      case 'completed':
        return 'completed';
      default:
        return 'in_progress';
    }
  };

  const fetchNotifications = async () => {
    if (!user || !profile) return;
    
    try {
      const summary = await getNotificationSummary(user.id, profile.role);
      
      // Count active orders
      const { count: myOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('accepted_packer_id', user.id)
        .in('status', ['booked', 'in_progress']);

      setNotifications({
        newOrders: summary.bids,
        messages: summary.messages,
        myOrders: myOrdersCount || 0
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setCurrentView('order-detail');
  };

  const handleSelectMyOrder = (order) => {
    setSelectedMyOrder(order);
    setCurrentView('active-detail');
  };

  const handleBack = () => {
    if (currentView === 'order-detail') {
      setCurrentView('available');
      setSelectedOrder(null);
    } else if (currentView === 'active-detail') {
      setCurrentView('my-orders');
      setSelectedMyOrder(null);
    }
  };

  const handleOrderUpdated = () => {
    fetchAvailableOrders();
    fetchMyOrders();
    fetchNotifications();
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
      <ExecutorSidebar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setSelectedOrder(null);
          setSelectedMyOrder(null);
        }}
        notifications={notifications}
        profile={profile}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="flex-1 overflow-auto relative">
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
        {currentView === 'available' && (
          <AvailableOrders 
            orders={availableOrders} 
            onSelect={handleSelectOrder}
            user={user}
          />
        )}
        {currentView === 'my-orders' && (
          <MyOrders 
            orders={myOrders} 
            onSelect={handleSelectMyOrder}
          />
        )}
        {currentView === 'order-detail' && selectedOrder && (
          <OrderDetail 
            order={selectedOrder} 
            onBack={handleBack}
            user={user}
            profile={profile}
            onBidSubmitted={handleOrderUpdated}
          />
        )}
        {currentView === 'active-detail' && selectedMyOrder && (
          <ActiveOrderDetail 
            order={selectedMyOrder} 
            onBack={handleBack}
            user={user}
            profile={profile}
            onOrderUpdated={handleOrderUpdated}
          />
        )}
      </main>
    </div>
  );
}

export default ExecutorExchange;

