import { useState } from 'react';
import { Check, X, Crown, ShieldCheck, ArrowLeft, Users, Zap, PaintRoller, HardHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToastStore } from '../storeToast';

export default function PricingPage() {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const [isYearly, setIsYearly] = useState(false);

  const handleSubscribe = (plan) => {
    addToast(`Оплата тарифа "${plan}" скоро появится!`, 'success');
  };

  const getPrice = (basePrice) => {
    if (basePrice === 0) return '0 ₽';
    return isYearly 
      ? `${Math.round(basePrice * 0.8)} ₽` 
      : `${basePrice} ₽`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 animate-fade-in">
      <div className="max-w-6xl mx-auto pb-20">
        
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition mb-6"
        >
          <ArrowLeft size={16} /> Вернуться назад
        </button>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">
            Выберите свой тариф
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Начните с бесплатного демо-доступа на 2 дня. Затем выберите тариф под свои задачи.
          </p>

          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-medium ${!isYearly ? 'text-gray-800 dark:text-white' : 'text-gray-400'}`}>Ежемесячно</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-full relative transition-colors focus:outline-none"
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${isYearly ? 'translate-x-8' : 'translate-x-1'} shadow-sm`}></div>
            </button>
            <span className={`text-sm font-medium flex items-center gap-1 ${isYearly ? 'text-gray-800 dark:text-white' : 'text-gray-400'}`}>
              Ежегодно <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">-20%</span>
            </span>
          </div>
        </div>

        {/* Сетка тарифов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 1. Демо (2 дня) */}
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="text-gray-400" size={24} />
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Демо</h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 h-8">Бесплатно на 2 дня после регистрации.</p>
            
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-800 dark:text-white">0 ₽</span>
              <span className="text-gray-500 text-sm">/ 2 дня</span>
            </div>

            <ul className="space-y-2 mb-8 flex-1 text-sm">
              <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" /> 1 проект
              </li>
              <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" /> 3D-планировщик
              </li>
              <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" /> PDF без знака
              </li>
              <li className="flex items-start gap-2 text-gray-400">
                <X size={16} className="text-gray-300 flex-shrink-0 mt-0.5" /> После 2 дней — только просмотр
              </li>
            </ul>

            <button 
              onClick={() => navigate('/')}
              className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 transition text-sm"
            >
              Текущий тариф
            </button>
          </div>

          {/* 2. Отделочник */}
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <PaintRoller className="text-blue-500" size={24} />
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Отделочник</h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 h-8">Для мастеров по отделке.</p>
            
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-800 dark:text-white">{getPrice(500)}</span>
              <span className="text-gray-500 text-sm">/ мес</span>
              {isYearly && <div className="text-xs text-green-500 mt-1">Списывается 4800 ₽ раз в год</div>}
            </div>

            <ul className="space-y-2 mb-8 flex-1 text-sm">
              <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" /> <strong>1 активный проект</strong>
              </li>
              <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" /> 3D-планировщик
              </li>
              <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" /> Все калькуляторы
              </li>
              <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" /> PDF без знака
              </li>
              <li className="flex items-start gap-2 text-gray-400">
                <X size={16} className="text-gray-300 flex-shrink-0 mt-0.5" /> Без Excel и CRM
              </li>
            </ul>

            <button 
              onClick={() => handleSubscribe('Отделочник')}
              className="w-full py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-bold hover:bg-blue-100 transition text-sm"
            >
              Оплатить
            </button>
          </div>

          {/* 3. Мастер (Выделенный) */}
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl border border-gray-700 shadow-xl p-6 flex flex-col relative overflow-hidden transform lg:-translate-y-2">
            <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg">
              Популярный
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <Crown className="text-yellow-500" size={24} />
              <h2 className="text-lg font-bold text-white">Мастер</h2>
            </div>
            <p className="text-xs text-gray-400 mb-6 h-8">Для строителей под ключ.</p>
            
            <div className="mb-6">
              <span className="text-3xl font-bold text-white">{getPrice(2000)}</span>
              <span className="text-gray-400 text-sm">/ мес</span>
              {isYearly && <div className="text-xs text-green-400 mt-1">Списывается 19 200 ₽ раз в год</div>}
            </div>

            <ul className="space-y-2 mb-8 flex-1 text-sm">
              <li className="flex items-start gap-2 text-gray-200">
                <Check size={16} className="text-green-400 flex-shrink-0 mt-0.5" /> <strong>Неограниченно</strong> проектов
              </li>
              <li className="flex items-start gap-2 text-gray-200">
                <Check size={16} className="text-green-400 flex-shrink-0 mt-0.5" /> Всё из «Отделочника»
              </li>
              <li className="flex items-start gap-2 text-gray-200">
                <Check size={16} className="text-green-400 flex-shrink-0 mt-0.5" /> <strong>Excel</strong> (выгрузка)
              </li>
              <li className="flex items-start gap-2 text-gray-200">
                <Check size={16} className="text-green-400 flex-shrink-0 mt-0.5" /> <strong>CRM</strong> (клиенты)
              </li>
              <li className="flex items-start gap-2 text-gray-200">
                <Check size={16} className="text-green-400 flex-shrink-0 mt-0.5" /> Приоритетная поддержка
              </li>
            </ul>

            <button 
              onClick={() => handleSubscribe('Мастер')}
              className="w-full py-2.5 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition text-sm shadow-lg shadow-yellow-500/20"
            >
              Оплатить PRO
            </button>
          </div>

          {/* 4. Корпоративный */}
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-purple-200 dark:border-purple-800 shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-purple-500" size={24} />
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Корпоративный</h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 h-8">Для бригад и компаний.</p>
            
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-800 dark:text-white">{getPrice(7000)}</span>
              <span className="text-gray-500 text-sm">/ мес</span>
              {isYearly && <div className="text-xs text-green-500 mt-1">Списывается 67 200 ₽ раз в год</div>}
            </div>

            <ul className="space-y-2 mb-8 flex-1 text-sm">
              <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" /> Всё из тарифа «Мастер»
              </li>
              <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" /> <strong>5 учетных записей</strong>
              </li>
              <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" /> Общая база клиентов
              </li>
              <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" /> Приоритетная поддержка
              </li>
            </ul>

            <button 
              onClick={() => handleSubscribe('Корпоративный')}
              className="w-full py-2.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl font-bold hover:bg-purple-100 transition text-sm"
            >
              Связаться с нами
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}