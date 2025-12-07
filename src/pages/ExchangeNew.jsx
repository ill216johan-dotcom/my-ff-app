import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.js';
import { USER_ROLES } from '../db_schema.js';

// Import role-specific components
import ClientExchange from '../components/exchange/ClientExchange.jsx';
import ExecutorExchange from '../components/exchange/ExecutorExchange.jsx';
import ManagerExchange from '../components/exchange/ManagerExchange.jsx';

/**
 * New Exchange Page with V0 UI Integration
 * 
 * Role-based routing:
 * - client -> ClientExchange (components from V0 client view)
 * - packer -> ExecutorExchange (components from V0 executor view)
 * - manager/admin -> ManagerExchange (components from V0 manager view)
 */
function ExchangeNew() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Оптимизация: используем Promise.all для параллельной загрузки session и профиля
        // Используем getSession() вместо getUser() - он быстрее (кешируется)
        // Запрос к профилю использует RLS с auth.uid(), поэтому может выполняться параллельно
        const [sessionResult, profileResult] = await Promise.all([
          supabase.auth.getSession(),
          // Запрос профиля через RLS (auth.uid() автоматически применяется RLS политикой)
          // Если RLS требует явного фильтра, этот запрос вернет ошибку и выполнится fallback
          supabase
            .from('profiles')
            .select('id, role, full_name') // Выбираем только нужные поля вместо select('*')
            .single()
        ]);

        const { data: { session }, error: sessionError } = sessionResult;
        const { data: profileData, error: profileError } = profileResult;

        if (sessionError || !session?.user) {
          setLoading(false);
          return;
        }

        const userId = session.user.id;
        setUser(session.user);

        // Если профиль получен успешно через RLS, используем его
        // Иначе делаем fallback с явным userId
        if (!profileError && profileData?.id === userId) {
          setProfile(profileData);
        } else {
          // Fallback: явный запрос с userId (если RLS не позволила получить профиль)
          const { data: fallbackProfile, error: fallbackError } = await supabase
            .from('profiles')
            .select('id, role, full_name') // Выбираем только нужные поля
            .eq('id', userId)
            .single();

          if (fallbackError) {
            console.error('Error fetching profile:', fallbackError);
          } else {
            setProfile(fallbackProfile);
          }
        }
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">Ошибка: Пользователь не найден. Пожалуйста, войдите в систему.</p>
        </div>
      </div>
    );
  }

  // Role-based routing
  if (profile.role === USER_ROLES.CLIENT) {
    return <ClientExchange user={user} profile={profile} />;
  } else if (profile.role === USER_ROLES.PACKER) {
    return <ExecutorExchange user={user} profile={profile} />;
  } else if (profile.role === USER_ROLES.MANAGER || profile.role === USER_ROLES.ADMIN) {
    return <ManagerExchange user={user} profile={profile} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-slate-600 dark:text-slate-400">Ваша роль еще не назначена. Пожалуйста, свяжитесь с администратором.</p>
      </div>
    </div>
  );
}

export default ExchangeNew;

