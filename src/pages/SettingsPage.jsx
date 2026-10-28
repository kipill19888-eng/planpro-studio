import { useState, useEffect } from 'react';
import { Settings, User, CreditCard, ShieldAlert, Crown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../storeUser';
import { useToastStore } from '../storeToast';

const PLAN_LABELS = {
  demo: 'Демо (2 дня)',
  finisher: 'Мастер Отделки',
  master: 'Мастер Стройки',
  corporate: 'Корпоративный',
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  const {
    userName, setUserName,
    subscriptionType, setSubscriptionType,
    trialStartedAt, isDemoExpired,
  } = useUserStore();

  const [nameInput, setNameInput] = useState(userName);

  // Синхронизация, если имя поменяли в другом месте (Sidebar/Forum)
  useEffect(() => {
    setNameInput(userName);
  }, [userName]);

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      addToast('Имя не может быть пустым', 'error');
      return;
    }
    setUserName(trimmed);
    addToast('Имя успешно сохранено', 'success');
  };

  const handleClearData = () => {
    if (window.confirm('Вы уверены, что хотите удалить ВСЕ данные (проекты, сметы, настройки)? Это действие нельзя отменить.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleResetTrial = () => {
    if (window.confirm('Сбросить демо-таймер? Демо-режим начнётся заново.')) {
      setSubscriptionType('demo');
      useUserStore.setState({ trialStartedAt: null });
      addToast('Демо-таймер сброшен', 'success');
    }
  };

  const isPaid = subscriptionType !== 'demo';
  const demoExpired = isDemoExpired();

  // Сколько дней осталось
  const daysLeft = (() => {
    if (subscriptionType !== 'demo' || !trialStartedAt) return null;
    const twoDays = 2 * 24 * 60 * 60 * 1000;
    const left = twoDays - (Date.now() - trialStartedAt);
    return Math.max(0, Math.ceil(left / (24 * 60 * 60 * 1000)));
  })();

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 animate-fade-in">
      <div className="max-w-3xl mx-auto pb-20">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition mb-6"
        >
          <ArrowLeft size={16} /> Вернуться назад
        </button>

        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 flex items-center gap-3">
          <Settings className="text-primary" size={32} /> Настройки
        </h1>

        <div className="space-y-6">

          {/* Профиль */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#0f172a]/50 flex items-center gap-2">
              <User className="text-gray-500" size={20} />
              <h2 className="font-bold text-gray-800 dark:text-white">Профиль</h2>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ваше имя</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="flex-1 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary outline-none text-sm bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white"
                  placeholder="Введите ваше имя"
                />
                <button
                  onClick={handleSaveName}
                  className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm"
                >
                  Сохранить
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Это имя будет отображаться в боковом меню и на форуме.
              </p>
            </div>
          </div>

          {/* Тариф */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#0f172a]/50 flex items-center gap-2">
              <CreditCard className="text-gray-500" size={20} />
              <h2 className="font-bold text-gray-800 dark:text-white">Ваш тариф</h2>
            </div>
            <div className="p-6 space-y-5">

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 font-bold text-lg text-gray-800 dark:text-white mb-1">
                    {isPaid ? <><Crown className="text-yellow-500" size={20}/> {PLAN_LABELS[subscriptionType]}</> : 'Демо-доступ'}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isPaid
                      ? 'У вас открыты все возможности тарифа.'
                      : demoExpired
                        ? 'Демо-режим истёк. Доступен только просмотр.'
                        : `Осталось ${daysLeft} ${daysLeft === 1 ? 'день' : 'дн.'} пробного доступа.`}
                  </p>
                </div>

                {!isPaid && (
                  <button
                    onClick={() => navigate('/pricing')}
                    className="px-5 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition shadow-md"
                  >
                    Выбрать тариф
                  </button>
                )}
              </div>

              {/* Тестовый переключатель тарифов (пока нет оплаты) */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">
                  Тестовый режим (без оплаты)
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PLAN_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSubscriptionType(key);
                        if (key === 'demo') useUserStore.setState({ trialStartedAt: null });
                        addToast(`Тариф переключён: ${label}`, 'success');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                        subscriptionType === key
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white dark:bg-[#0f172a] text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-primary'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Кнопки нужны только для разработки, пока не подключена оплата.
                </p>
              </div>

              {!isPaid && (
                <button
                  onClick={handleResetTrial}
                  className="w-full md:w-auto px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm font-medium hover:bg-yellow-100 transition"
                >
                  Сбросить демо-таймер
                </button>
              )}
            </div>
          </div>

          {/* Опасная зона */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-red-200 dark:border-red-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-red-100 dark:border-red-800 bg-red-50 dark:bg-red-900/20 flex items-center gap-2">
              <ShieldAlert className="text-red-500" size={20} />
              <h2 className="font-bold text-red-800 dark:text-red-300">Опасная зона</h2>
            </div>
            <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <div className="font-bold text-gray-800 dark:text-white mb-1">Сброс всех данных</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Удалит все проекты, комнаты, сметы и настройки из этого браузера.
                </p>
              </div>
              <button
                onClick={handleClearData}
                className="w-full md:w-auto px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition text-sm"
              >
                Удалить всё
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}