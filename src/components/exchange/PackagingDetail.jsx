import React, { useMemo, useState } from 'react';
import { ArrowLeft, Clock, Calendar, MessageSquare, Star, Send, Check, X, AlertTriangle, Shield } from 'lucide-react';

const statusConfig = {
  active: { label: 'Активно', badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
  in_progress: { label: 'В работе', badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200' },
  completed: { label: 'Завершено', badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200' },
  cancelled: { label: 'Отменено', badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200' },
};

function ResponseCard({ response, isSelected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left border rounded-xl p-4 bg-white dark:bg-slate-900 transition shadow-sm ${isSelected ? 'border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-200 dark:ring-indigo-800' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-700'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-slate-900 dark:text-white">{response.executorName}</p>
            <span className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-300">
              <Star className="w-4 h-4 fill-current" />
              {response.executorRating.toFixed(1)}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{response.message}</p>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>{response.price}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>до {new Date(response.deadline).toLocaleDateString('ru-RU')}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>{new Date(response.createdAt).toLocaleDateString('ru-RU')}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {response.unreadCount > 0 && (
            <span className="text-xs px-2 py-1 rounded-full bg-rose-500 text-white">{response.unreadCount} новых</span>
          )}
          {response.hasChat && (
            <span className="text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 inline-flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              Чат открыт
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function ArbitrationBanner({ canRequestArbitration, hoursSinceDeadline, onRequest }) {
  return (
    <div
      className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
        canRequestArbitration
          ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-700'
          : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'
      }`}
    >
      <AlertTriangle className={`w-5 h-5 mt-0.5 ${canRequestArbitration ? 'text-rose-600 dark:text-rose-400' : 'text-amber-500'}`} />
      <div className="flex-1">
        <p className={`font-semibold ${canRequestArbitration ? 'text-rose-700 dark:text-rose-300' : 'text-amber-600 dark:text-amber-300'}`}>
          Дедлайн просрочен
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {canRequestArbitration
            ? 'Прошло более 24 часов с момента дедлайна. Вы можете запросить арбитраж для решения ситуации.'
            : `Осталось ${Math.ceil(24 - hoursSinceDeadline)} часов до возможности запросить арбитраж.`}
        </p>
      </div>
      {canRequestArbitration && (
        <button
          onClick={onRequest}
          className="px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-200 text-sm bg-white dark:bg-transparent hover:bg-rose-50 dark:hover:bg-rose-900/20"
        >
          <Shield className="w-4 h-4 inline mr-2" />
          Запросить арбитраж
        </button>
      )}
    </div>
  );
}

function PackagingDetail({ packaging, responses, onBack }) {
  const [selectedResponse, setSelectedResponse] = useState(responses[0] || null);
  const [chatMessage, setChatMessage] = useState('');
  const [arbitrationRequested, setArbitrationRequested] = useState(false);

  const isInProgress = packaging.status === 'in_progress';
  const deadlineDate = useMemo(() => new Date(packaging.deadline), [packaging.deadline]);
  const hoursSinceDeadline = useMemo(() => {
    const now = new Date();
    return (now.getTime() - deadlineDate.getTime()) / (1000 * 60 * 60);
  }, [deadlineDate]);
  const canRequestArbitration = isInProgress && hoursSinceDeadline >= 24;

  const status = statusConfig[packaging.status] || statusConfig.active;

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    // In a real app message would be sent to backend; here we simply clear input
    setChatMessage('');
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 md:p-8 overflow-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к списку
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{packaging.title}</h1>
            <span className={`px-3 py-1 rounded-md text-sm ${status.badgeClass}`}>{status.label}</span>
            {arbitrationRequested && (
              <span className="px-3 py-1 rounded-md text-sm bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200 flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Арбитраж
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Создано {new Date(packaging.createdAt).toLocaleDateString('ru-RU')}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Дедлайн: {new Date(packaging.deadline).toLocaleDateString('ru-RU')}
            </span>
          </div>
        </div>

        {isInProgress && hoursSinceDeadline > 0 && !arbitrationRequested && (
          <ArbitrationBanner
            canRequestArbitration={canRequestArbitration}
            hoursSinceDeadline={hoursSinceDeadline}
            onRequest={() => setArbitrationRequested(true)}
          />
        )}

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Отклики</h2>
              {responses.length > 0 && (
                <span className="text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {responses.length}
                </span>
              )}
            </div>

            {responses.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Пока нет откликов</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Исполнители изучают ваше задание. Обычно первые отклики приходят в течение часа.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-6">
                <div className="space-y-3">
                  {responses.map((response) => (
                    <ResponseCard
                      key={response.id}
                      response={response}
                      isSelected={selectedResponse?.id === response.id}
                      onSelect={() => setSelectedResponse(response)}
                    />
                  ))}
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm p-4 flex flex-col">
                  {selectedResponse ? (
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{selectedResponse.executorName}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{selectedResponse.message}</p>
                        </div>
                        <span className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-300">
                          <Star className="w-4 h-4 fill-current" />
                          {selectedResponse.executorRating}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-400 mt-4">
                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                          <p className="text-xs uppercase text-slate-500">Предложение</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{selectedResponse.price}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                          <p className="text-xs uppercase text-slate-500">Срок</p>
                          <p className="font-semibold text-slate-900 dark:text-white">до {new Date(selectedResponse.deadline).toLocaleDateString('ru-RU')}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-4">
                        <button className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          Принять предложение
                        </button>
                        <button className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2">
                          <X className="w-4 h-4" />
                          Отклонить
                        </button>
                      </div>

                      <div className="mt-6 flex-1 flex flex-col">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Чат с исполнителем</h3>
                        <div className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                          <p className="bg-white dark:bg-slate-900 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-700">
                            Исполнитель: Готовы приступить сразу, можем предложить тестовую упаковку нескольких SKU.
                          </p>
                          <p className="bg-indigo-600 text-white rounded-lg p-3 ml-auto max-w-[80%]">Клиент: Звучит хорошо, уточните пожалуйста сроки.</p>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <input
                            type="text"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            placeholder="Напишите сообщение..."
                            className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={handleSendMessage}
                            className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
                      Выберите отклик, чтобы увидеть детали
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Детали задания</h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700 dark:text-slate-200">
              <div>
                <p className="text-xs uppercase text-slate-500 mb-1">Бюджет</p>
                <p className="font-semibold">{packaging.budget}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500 mb-1">Количество артикулов</p>
                <p className="font-semibold">{packaging.articlesCount}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs uppercase text-slate-500 mb-1">Описание</p>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                  {packaging.description || 'Краткое описание задания появится здесь после заполнения при создании заявки.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PackagingDetail;
