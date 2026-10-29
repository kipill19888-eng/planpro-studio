import { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, Sparkles, Calculator, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hasAgreed = localStorage.getItem('planpro-agreed');
    if (!hasAgreed) {
      setIsOpen(true);
    }
  }, []);

  const handleAgree = () => {
    localStorage.setItem('planpro-agreed', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700 animate-modal">
        
        <div className="bg-gradient-to-r from-blue-600 to-primary p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white/5 pattern-dots"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-inner">
              <Sparkles className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Добро пожаловать!</h2>
            <p className="text-blue-100 text-sm">Ваш личный помощник в мире ремонта</p>
          </div>
        </div>

        <div className="p-8">
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Calculator className="text-primary" size={20} />
              </div>
              <p className="text-sm font-medium">Точный расчет материалов и работ</p>
            </div>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <FileText className="text-primary" size={20} />
              </div>
              <p className="text-sm font-medium">Готовые сметы в PDF для заказчика</p>
            </div>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="text-primary" size={20} />
              </div>
              <p className="text-sm font-medium">Профессиональный подход к делу</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleAgree}
              className="w-full py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              Начать работу <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => navigate('/terms')}
              className="w-full py-3 text-gray-400 text-xs font-medium hover:text-primary transition"
            >
              Ознакомиться с условиями использования
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}