import React, { useMemo, useState } from 'react';
import CalculatorLayout from '../components/CalculatorLayout.jsx';
import ExchangeSidebar from '../components/exchange/ExchangeSidebar.jsx';
import PackagingList from '../components/exchange/PackagingList.jsx';
import CreatePackaging from '../components/exchange/CreatePackaging.jsx';
import PackagingDetail from '../components/exchange/PackagingDetail.jsx';

const initialPackagings = [
  {
    id: '1',
    title: 'Упаковка партии косметики',
    status: 'active',
    createdAt: '2024-12-01',
    deadline: '2024-12-15',
    budget: '50 000 ₽',
    articlesCount: 45,
    responsesCount: 3,
    unreadMessages: 2,
    description: 'Необходима аккуратная упаковка партии косметики с брендированием и проверкой комплектности.',
  },
  {
    id: '2',
    title: 'Подарочная упаковка к НГ',
    status: 'in_progress',
    createdAt: '2024-11-20',
    deadline: '2024-12-10',
    budget: '35 000 ₽',
    articlesCount: 120,
    responsesCount: 5,
    unreadMessages: 0,
    description: 'Упаковка подарочных наборов. Важно соблюдение сроков и наличие праздничных лент.',
  },
  {
    id: '3',
    title: 'Упаковка электроники',
    status: 'completed',
    createdAt: '2024-10-15',
    deadline: '2024-10-30',
    budget: '28 000 ₽',
    articlesCount: 30,
    responsesCount: 4,
    unreadMessages: 0,
    description: 'Плотная защита техники, амортизация и маркировка. Проект завершен.',
  },
  {
    id: '4',
    title: 'Сезонная упаковка одежды',
    status: 'completed',
    createdAt: '2024-09-01',
    deadline: '2024-09-20',
    budget: '42 000 ₽',
    articlesCount: 85,
    responsesCount: 6,
    unreadMessages: 0,
    description: 'Нужна упаковка с разделением по коллекциям. Работа завершена.',
  },
];

const initialResponses = {
  '1': [
    {
      id: '1',
      executorName: 'ПакПро',
      executorRating: 4.8,
      price: '45 000 ₽',
      deadline: '2024-12-12',
      message: 'Готовы выполнить заказ. Есть опыт с косметикой и брендированными материалами.',
      createdAt: '2024-12-02T10:30:00',
      hasChat: true,
      unreadCount: 2,
    },
    {
      id: '2',
      executorName: 'УпаковкаПлюс',
      executorRating: 4.6,
      price: '48 000 ₽',
      deadline: '2024-12-14',
      message: 'Сможем уложиться в сроки. Работаем с любыми объемами.',
      createdAt: '2024-12-02T14:15:00',
      hasChat: false,
      unreadCount: 0,
    },
    {
      id: '3',
      executorName: 'FastPack',
      executorRating: 4.9,
      price: '52 000 ₽',
      deadline: '2024-12-10',
      message: 'Сделаем быстрее указанного срока. Специализируемся на премиум упаковке.',
      createdAt: '2024-12-03T09:00:00',
      hasChat: false,
      unreadCount: 0,
    },
  ],
  '2': [
    {
      id: '4',
      executorName: 'HolidayPack',
      executorRating: 4.7,
      price: '37 000 ₽',
      deadline: '2024-12-09',
      message: 'Опыт сезонных кампаний, можем предложить варианты оформления.',
      createdAt: '2024-12-01T13:00:00',
      hasChat: true,
      unreadCount: 1,
    },
  ],
};

function Exchange() {
  const [packagings, setPackagings] = useState(initialPackagings);
  const [responsesMap, setResponsesMap] = useState(initialResponses);
  const [currentView, setCurrentView] = useState('list');
  const [selectedPackagingId, setSelectedPackagingId] = useState(null);

  const selectedPackaging = useMemo(
    () => packagings.find((item) => item.id === selectedPackagingId) || null,
    [packagings, selectedPackagingId],
  );

  const packagingsWithCounts = useMemo(
    () =>
      packagings.map((item) => ({
        ...item,
        responsesCount: responsesMap[item.id]?.length ?? item.responsesCount ?? 0,
      })),
    [packagings, responsesMap],
  );

  const selectedResponses = selectedPackaging ? responsesMap[selectedPackaging.id] || [] : [];

  const handleSelect = (packaging) => {
    setSelectedPackagingId(packaging.id);
    setCurrentView('detail');
  };

  const handleNavigate = (view) => {
    if (view === 'detail' && !selectedPackaging) return;
    setCurrentView(view);
  };

  const handleCreatePackaging = (payload) => {
    const newId = Date.now().toString();
    const newPackaging = {
      id: newId,
      title: payload.title || 'Новое задание',
      status: 'active',
      createdAt: new Date().toISOString(),
      deadline: payload.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      budget: payload.budget || '—',
      articlesCount: payload.articles?.length || 0,
      responsesCount: 0,
      unreadMessages: 0,
      description: payload.description,
    };

    setPackagings((prev) => [newPackaging, ...prev]);
    setResponsesMap((prev) => ({ ...prev, [newId]: [] }));
    setSelectedPackagingId(newId);
    setCurrentView('detail');
  };

  const goBackToList = () => {
    setCurrentView('list');
    setSelectedPackagingId(null);
  };

  return (
    <CalculatorLayout title="Биржа упаковки">
      <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950">
        <ExchangeSidebar currentView={currentView} onNavigate={handleNavigate} />

        <main className="bg-slate-50 dark:bg-slate-950">
          {currentView === 'list' && (
            <PackagingList
              packagings={packagingsWithCounts}
              onSelect={handleSelect}
              onCreate={() => setCurrentView('create')}
            />
          )}

          {currentView === 'create' && (
            <CreatePackaging onBack={() => setCurrentView(selectedPackaging ? 'detail' : 'list')} onSubmit={handleCreatePackaging} />
          )}

          {currentView === 'detail' && selectedPackaging && (
            <PackagingDetail packaging={selectedPackaging} responses={selectedResponses} onBack={goBackToList} />
          )}

          {currentView === 'detail' && !selectedPackaging && (
            <div className="p-8 text-slate-600 dark:text-slate-300">Выберите задачу из списка, чтобы увидеть детали.</div>
          )}
        </main>
      </div>
    </CalculatorLayout>
  );
}

export default Exchange;
