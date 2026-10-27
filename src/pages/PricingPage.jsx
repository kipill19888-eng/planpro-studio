import { useState } from 'react';
import { Check, X, Crown, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToastStore } from '../storeToast';

export default function PricingPage() {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const [isYearly, setIsYearly] = useState(false);

  const handleSubscribe = (plan) => {
    addToast(`Оплата тарифа "${plan}" скоро появится!`, 'success');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 animate-fade-in">
      <div className="max-w-5xl mx-auto pb-20">
        
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition mb-6"
        >
          <ArrowLeft size={16} /> Вернуться назад
        </button>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Выберите свой тариф
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Начните бесплатно, а когда вашему бизнесу потребуется больше возможностей — переходите на PRO.
          </p>

          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-medium ${!isYearly ? 'text-gray-800' : 'text-gray-400'}`}>Ежемесячно</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="w-14 h-7 bg-gray-200 rounded-full relative transition-colors focus:outline-none"
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${isYearly ? 'translate-x-8' : 'translate-x-1'} shadow-sm`}></div>
            </button>
            <span className={`text-sm font-medium flex items-center gap-1 ${isYearly ? 'text-gray-800' : 'text-gray-400'}`}>
              Ежегодно <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">-20%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="text-gray-400" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Базовый</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">Для домашних мастеров и небольших задач.</p>
            
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-800">0 ₽</span>
              <span className="text-gray-500">/ навсегда</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <Check size={18} className="text-green-500 flex-shrink-0" /> 1 активный проект
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <Check size={18} className="text-green-500 flex-shrink-0" /> Все инженерные калькуляторы
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <X size={18} className="text-gray-300 flex-shrink-0" /> Экспорт сметы в PDF
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <X size={18} className="text-gray-300 flex-shrink-0" /> Облачное сохранение
              </li>
            </ul>

            <button 
              onClick={() => navigate('/')}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
            >
              Текущий тариф
            </button>
          </div>

          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl border border-gray-700 shadow-xl p-8 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-4 py-1 rounded-bl-lg">
              Популярный
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <Crown className="text-yellow-500" size={24} />
              <h2 className="text-xl font-bold text-white">PRO Мастер</h2>
            </div>
            <p className="text-sm text-gray-400 mb-6">Для профессионалов, которые делают ремонт на заказ.</p>
            
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">{isYearly ? '399 ₽' : '499 ₽'}</span>
              <span className="text-gray-400">/ в месяц</span>
              {isYearly && <div className="text-xs text-green-400 mt-1">Списывается 4788 ₽ раз в год</div>}
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-2 text-sm text-gray-200">
                <Check size={18} className="text-green-400 flex-shrink-0" /> <strong>Неограниченное</strong> число проектов
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-200">
                <Check size={18} className="text-green-400 flex-shrink-0" /> Экспорт в PDF <strong>без водяных знаков</strong>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-200">
                <Check size={18} className="text-green-400 flex-shrink-0" /> Облачная синхронизация (скоро)
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-200">
                <Check size={18} className="text-green-400 flex-shrink-0" /> Приоритетная поддержка
              </li>
            </ul>

            <button 
              onClick={() => handleSubscribe('PRO Мастер')}
              className="w-full py-3 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition shadow-lg shadow-yellow-500/20"
            >
              Оплатить PRO
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}