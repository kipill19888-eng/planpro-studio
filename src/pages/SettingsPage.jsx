import { useState } from 'react';
import { Settings, User, CreditCard, ShieldAlert, CheckCircle2, Crown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../storeUser';
import { useToastStore } from '../storeToast';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { isPro, userName, setPro, setUserName } = useUserStore();
  const { addToast } = useToastStore();

  const [nameInput, setNameInput] = useState(userName);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
      addToast('Имя успешно сохранено', 'success');
    }
  };

  const handleClearData = () => {
    if (window.confirm('Вы уверены, что хотите удалить ВСЕ данные (проекты, сметы, настройки)? Это действие нельзя отменить.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 animate-fade-in">
      <div className="max-w-3xl mx-auto pb-20">
        
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition mb-6"
        >
          <ArrowLeft size={16} /> Вернуться назад
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <Settings className="text-primary" size={32} /> Настройки
        </h1>

        <div className="space-y-6">
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex items-center gap-2">
              <User className="text-gray-500" size={20} />
              <h2 className="font-bold text-gray-800">Профиль</h2>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ваше имя</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={nameInput} 
                  onChange={(e) => setNameInput(e.target.value)}
                  className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:border-primary outline-none text-sm" 
                  placeholder="Введите ваше имя"
                />
                <button 
                  onClick={handleSaveName}
                  className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm"
                >
                  Сохранить
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Это имя будет отображаться в боковом меню.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex items-center gap-2">
              <CreditCard className="text-gray-500" size={20} />
              <h2 className="font-bold text-gray-800">Ваш тариф</h2>
            </div>
            <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 font-bold text-lg text-gray-800 mb-1">
                  {isPro ? <><Crown className="text-yellow-500" size={20}/> PRO Мастер</> : 'Базовый тариф'}
                </div>
                <p className="text-sm text-gray-500">
                  {isPro ? 'У вас открыты все возможности сервиса.' : 'Ограниченный функционал.'}
                </p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={() => setPro(!isPro)}
                  className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-medium text-sm transition border ${
                    isPro ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                  }`}
                >
                  {isPro ? 'Отменить PRO (тест)' : 'Включить PRO (тест)'}
                </button>
                {!isPro && (
                  <button 
                    onClick={() => navigate('/pricing')}
                    className="flex-1 md:flex-none px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition"
                  >
                    Купить PRO
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-red-100 bg-red-50 flex items-center gap-2">
              <ShieldAlert className="text-red-500" size={20} />
              <h2 className="font-bold text-red-800">Опасная зона</h2>
            </div>
            <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <div className="font-bold text-gray-800 mb-1">Сброс всех данных</div>
                <p className="text-sm text-gray-500">Удалит все проекты, комнаты, сметы и настройки из этого браузера.</p>
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