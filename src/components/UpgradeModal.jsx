import { Crown, Check, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UpgradeModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGoToPricing = () => {
    onClose();
    navigate('/pricing');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка с градиентом */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-center relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="text-yellow-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Экспорт в PDF — это PRO</h2>
          <p className="text-gray-300 text-sm">
            Чтобы скачать смету без водяных знаков и в высоком качестве, оформите подписку.
          </p>
        </div>

        {/* Список преимуществ */}
        <div className="p-6 bg-white">
          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check size={12} className="text-green-600" />
              </div>
              Неограниченное число проектов
            </li>
            <li className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check size={12} className="text-green-600" />
              </div>
              Экспорт смет в PDF без ограничений
            </li>
            <li className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check size={12} className="text-green-600" />
              </div>
              Облачное сохранение (скоро)
            </li>
          </ul>

          <button 
            onClick={handleGoToPricing}
            className="w-full py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
          >
            Перейти на PRO <ArrowRight size={18} />
          </button>
          
          <button 
            onClick={onClose}
            className="w-full py-3 mt-2 text-gray-500 text-sm font-medium hover:text-gray-800 transition"
          >
            Остаться на бесплатном тарифе
          </button>
        </div>
      </div>
    </div>
  );
}