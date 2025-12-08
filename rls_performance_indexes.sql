-- ============================================
-- RLS PERFORMANCE OPTIMIZATION INDEXES
-- ============================================
-- Этот скрипт создает все необходимые индексы для оптимизации
-- производительности Row Level Security (RLS) политик.
-- 
-- Выполните этот скрипт в Supabase SQL Editor.
-- Индексы создаются с IF NOT EXISTS, поэтому можно запускать несколько раз.
-- ============================================

-- ============================================
-- 1. Индексы для таблицы orders
-- ============================================

-- Индекс на client_id для быстрой проверки в RLS политиках messages
-- Используется в: EXISTS (SELECT 1 FROM orders WHERE orders.id = messages.order_id AND orders.client_id = auth.uid())
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);

-- Индекс на accepted_packer_id для быстрой проверки в RLS политиках messages
-- Используется в: EXISTS (SELECT 1 FROM orders WHERE orders.id = messages.order_id AND orders.accepted_packer_id = auth.uid())
CREATE INDEX IF NOT EXISTS idx_orders_accepted_packer_id ON orders(accepted_packer_id);

-- Композитный индекс для оптимизации запросов с фильтрацией по client_id и status
-- Используется в: .eq('client_id', user.id).in('status', [...])
CREATE INDEX IF NOT EXISTS idx_orders_client_status ON orders(client_id, status);

-- Композитный индекс для оптимизации запросов с фильтрацией по accepted_packer_id и status
-- Используется в: .eq('accepted_packer_id', user.id).in('status', [...])
CREATE INDEX IF NOT EXISTS idx_orders_packer_status ON orders(accepted_packer_id, status);

-- Индекс на is_disputed (частичный индекс для спорных заказов)
-- Уже может существовать, но добавляем для уверенности
CREATE INDEX IF NOT EXISTS idx_orders_is_disputed ON orders(is_disputed) WHERE is_disputed = TRUE;

-- ============================================
-- 2. Индексы для таблицы messages
-- ============================================

-- Индекс на sender_id для быстрой проверки в RLS политиках
-- Используется в: sender_id = auth.uid()
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- Индекс на relevant_packer_id для быстрой проверки в RLS политиках
-- Используется в: relevant_packer_id = auth.uid()
-- (Может уже существовать из database_migrations.sql)
CREATE INDEX IF NOT EXISTS idx_messages_relevant_packer_id ON messages(relevant_packer_id);

-- Индекс на order_id для быстрой проверки в RLS политиках и JOIN запросах
-- Используется в: EXISTS (SELECT 1 FROM orders WHERE orders.id = messages.order_id ...)
-- (Может уже существовать из database_migrations.sql)
CREATE INDEX IF NOT EXISTS idx_messages_order_id ON messages(order_id);

-- Композитный индекс для оптимизации фильтрации по order_id и relevant_packer_id
-- Используется в: .eq('order_id', orderId).eq('relevant_packer_id', packerId)
-- (Может уже существовать из database_migrations.sql)
CREATE INDEX IF NOT EXISTS idx_messages_order_packer ON messages(order_id, relevant_packer_id);

-- Индекс на created_at для сортировки сообщений
-- (Может уже существовать из database_migrations.sql)
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Композитный индекс для оптимизации запросов с фильтрацией по order_id и сортировкой по created_at
CREATE INDEX IF NOT EXISTS idx_messages_order_created ON messages(order_id, created_at);

-- ============================================
-- 3. Индексы для таблицы profiles
-- ============================================

-- Индекс на id для быстрой проверки в RLS политиках
-- Используется в: EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('manager', 'admin'))
-- Примечание: id уже является PRIMARY KEY, но добавляем для явности
-- (PRIMARY KEY уже создает индекс автоматически, но оставляем для документации)

-- Композитный индекс на id и role для оптимизации проверки ролей в RLS политиках
-- Используется в: profiles.id = auth.uid() AND profiles.role IN ('manager', 'admin')
CREATE INDEX IF NOT EXISTS idx_profiles_id_role ON profiles(id, role);

-- Индекс на role для фильтрации по ролям
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================
-- 4. Индексы для таблицы bids
-- ============================================

-- Индекс на order_id для быстрых JOIN запросов
-- Используется в: .in('order_id', orderIds)
CREATE INDEX IF NOT EXISTS idx_bids_order_id ON bids(order_id);

-- Индекс на packer_id для фильтрации по упаковщику
-- Используется в: .eq('packer_id', user.id)
CREATE INDEX IF NOT EXISTS idx_bids_packer_id ON bids(packer_id);

-- Индекс на status для фильтрации по статусу
-- Используется в: .eq('status', 'pending'), .eq('status', 'accepted')
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);

-- Композитный индекс для оптимизации запросов с фильтрацией по order_id и status
-- Используется в: .in('order_id', orderIds).eq('status', 'pending')
CREATE INDEX IF NOT EXISTS idx_bids_order_status ON bids(order_id, status);

-- Композитный индекс для оптимизации запросов с фильтрацией по packer_id и status
-- Используется в: .eq('packer_id', user.id).eq('status', 'accepted')
CREATE INDEX IF NOT EXISTS idx_bids_packer_status ON bids(packer_id, status);

-- Композитный индекс для оптимизации запросов с фильтрацией по order_id, packer_id и status
CREATE INDEX IF NOT EXISTS idx_bids_order_packer_status ON bids(order_id, packer_id, status);

-- ============================================
-- 5. Дополнительные индексы для оптимизации частых запросов
-- ============================================

-- Индекс на created_at в orders для сортировки по дате создания
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Композитный индекс для оптимизации запросов менеджера (все заказы с сортировкой)
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at);

-- Примечание: updated_at может отсутствовать в таблице orders
-- Если вам нужен индекс на updated_at, сначала добавьте колонку:
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
-- CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at);

-- ============================================
-- 6. Проверка созданных индексов
-- ============================================

-- Вывести список всех созданных индексов для проверки
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('orders', 'messages', 'profiles', 'bids', 'image_captions')
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ============================================
-- ГОТОВО!
-- ============================================
-- Все индексы созданы. Теперь RLS политики должны работать значительно быстрее.
-- 
-- Рекомендации:
-- 1. Проверьте производительность запросов после создания индексов
-- 2. Используйте EXPLAIN ANALYZE для анализа планов выполнения запросов
-- 3. Мониторьте размер базы данных (индексы занимают место)
-- ============================================

