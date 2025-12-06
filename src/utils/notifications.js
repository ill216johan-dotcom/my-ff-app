import { supabase } from '../supabaseClient.js';

/**
 * Notification utilities
 * Handles counting unread messages and new bids
 */

/**
 * Count unread messages for a user in specific orders
 */
export async function countUnreadMessages(userId, orderIds = []) {
  if (!userId || !orderIds || orderIds.length === 0) return {};

  try {
    // Get all messages for these orders
    const { data: messages, error } = await supabase
      .from('messages')
      .select('id, order_id, sender_id, created_at')
      .in('order_id', orderIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages for notifications:', error);
      return {};
    }

    // For now, we'll consider messages as unread if:
    // 1. They are not from the current user
    // 2. They were created after the user's last activity (simplified: last 24 hours)
    // In a full implementation, you'd track read receipts

    const unreadCounts = {};
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    (messages || []).forEach((msg) => {
      if (msg.sender_id !== userId && new Date(msg.created_at) > oneDayAgo) {
        unreadCounts[msg.order_id] = (unreadCounts[msg.order_id] || 0) + 1;
      }
    });

    return unreadCounts;
  } catch (error) {
    console.error('Error in countUnreadMessages:', error);
    return {};
  }
}

/**
 * Count new pending bids for client orders
 */
export async function countNewBids(clientId, orderIds = []) {
  if (!clientId || !orderIds || orderIds.length === 0) return {};

  try {
    const { data: bids, error } = await supabase
      .from('bids')
      .select('order_id, created_at')
      .in('order_id', orderIds)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bids for notifications:', error);
      return {};
    }

    // Count bids per order (considering last 24 hours as "new")
    const bidCounts = {};
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    (bids || []).forEach((bid) => {
      if (new Date(bid.created_at) > oneDayAgo) {
        bidCounts[bid.order_id] = (bidCounts[bid.order_id] || 0) + 1;
      }
    });

    return bidCounts;
  } catch (error) {
    console.error('Error in countNewBids:', error);
    return {};
  }
}

/**
 * Get notification summary for a user
 */
export async function getNotificationSummary(userId, userRole) {
  if (!userId) return { messages: 0, bids: 0, total: 0 };

  try {
    let messages = 0;
    let bids = 0;

    if (userRole === 'client') {
      // Get client's orders
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('client_id', userId)
        .in('status', ['searching', 'open', 'booked', 'in_progress']);

      if (orders && orders.length > 0) {
        const orderIds = orders.map((o) => o.id);
        const unreadMessages = await countUnreadMessages(userId, orderIds);
        messages = Object.values(unreadMessages).reduce((sum, count) => sum + count, 0);

        const newBids = await countNewBids(userId, orderIds);
        bids = Object.values(newBids).reduce((sum, count) => sum + count, 0);
      }
    } else if (userRole === 'packer') {
      // Get packer's active orders
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('accepted_packer_id', userId)
        .in('status', ['booked', 'in_progress']);

      if (orders && orders.length > 0) {
        const orderIds = orders.map((o) => o.id);
        const unreadMessages = await countUnreadMessages(userId, orderIds);
        messages = Object.values(unreadMessages).reduce((sum, count) => sum + count, 0);
      }

      // Count new available orders
      const { count: newOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['searching', 'open'])
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      bids = newOrdersCount || 0;
    } else if (userRole === 'manager' || userRole === 'admin') {
      // Count arbitration requests
      const { count: arbitrationCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('is_disputed', true);

      bids = arbitrationCount || 0;

      // Count unread messages across all active orders
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .in('status', ['searching', 'open', 'booked', 'in_progress', 'awaiting_payment']);

      if (orders && orders.length > 0) {
        const orderIds = orders.map((o) => o.id);
        const unreadMessages = await countUnreadMessages(userId, orderIds);
        messages = Object.values(unreadMessages).reduce((sum, count) => sum + count, 0);
      }
    }

    return {
      messages,
      bids,
      total: messages + bids,
    };
  } catch (error) {
    console.error('Error in getNotificationSummary:', error);
    return { messages: 0, bids: 0, total: 0 };
  }
}

