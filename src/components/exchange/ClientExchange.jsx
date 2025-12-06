import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { getNotificationSummary } from '../../utils/notifications.js';
import ClientSidebar from './client/ClientSidebar.jsx';
import PackagingList from './client/PackagingList.jsx';
import CreatePackaging from './client/CreatePackaging.jsx';
import PackagingDetail from './client/PackagingDetail.jsx';
import ThemeToggle from '../ThemeToggle.jsx';

/**
 * Client Exchange Dashboard
 * Uses V0 UI components adapted for React
 */
function ClientExchange({ user, profile }) {
  const [currentView, setCurrentView] = useState('list');
  const [selectedPackaging, setSelectedPackaging] = useState(null);
  const [packagings, setPackagings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({ packagings: 0, messages: 0 });

  useEffect(() => {
    if (user) {
      fetchPackagings();
    }
  }, [user]);

  useEffect(() => {
    if (user && profile && packagings.length > 0) {
      fetchNotifications();
    }
  }, [user, profile, packagings]);

  const fetchPackagings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        // Transform orders to packaging format
        const transformed = (data || []).map(order => ({
          id: order.id,
          title: order.title,
          status: mapOrderStatusToPackagingStatus(order.status),
          createdAt: order.created_at,
          deadline: order.deadline,
          budget: order.budget ? `${order.budget.toLocaleString('ru-RU')} ₽` : 'Не указан',
          articlesCount: order.items ? (Array.isArray(order.items) ? order.items.length : 0) : 0,
          responsesCount: 0, // Will be fetched separately
          unreadMessages: 0, // Will be fetched separately
          order: order // Keep original order data
        }));
        setPackagings(transformed);
        
        // Fetch bid counts and unread messages
        if (transformed.length > 0) {
          fetchBidCounts(transformed.map(p => p.id));
        }
      }
    } catch (error) {
      console.error('Error in fetchPackagings:', error);
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
        
        setPackagings(prev => prev.map(p => ({
          ...p,
          responsesCount: counts[p.id] || 0
        })));
      }
    } catch (error) {
      console.error('Error fetching bid counts:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!user || !profile) return;
    
    try {
      const summary = await getNotificationSummary(user.id, profile.role);
      
      setNotifications({
        packagings: summary.bids,
        messages: summary.messages
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const mapOrderStatusToPackagingStatus = (status) => {
    switch (status) {
      case 'searching':
      case 'open':
        return 'active';
      case 'booked':
      case 'in_progress':
        return 'in_progress';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'draft';
    }
  };

  const handleSelectPackaging = (packaging) => {
    setSelectedPackaging(packaging);
    setCurrentView('detail');
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedPackaging(null);
  };

  const handleCreate = () => {
    setCurrentView('create');
  };

  const handlePackagingCreated = () => {
    fetchPackagings();
    setCurrentView('list');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Загрузка упаковок...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ClientSidebar 
        currentView={currentView} 
        onNavigate={setCurrentView}
        notifications={notifications}
      />

      <main className="flex-1 overflow-auto relative">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        {currentView === 'list' && (
          <PackagingList
            packagings={packagings}
            onSelect={handleSelectPackaging}
            onCreate={handleCreate}
          />
        )}
        {currentView === 'create' && (
          <CreatePackaging 
            onBack={handleBack}
            onCreated={handlePackagingCreated}
            user={user}
          />
        )}
        {currentView === 'detail' && selectedPackaging && (
          <PackagingDetail 
            packaging={selectedPackaging}
            onBack={handleBack}
            user={user}
            profile={profile}
            onUpdate={fetchPackagings}
          />
        )}
      </main>
    </div>
  );
}

export default ClientExchange;

