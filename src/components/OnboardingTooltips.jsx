import { useState, useEffect } from 'react';
import { MousePointer2, Move3D, ZoomIn, X } from 'lucide-react';

export default function OnboardingTooltips() {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Показываем подсказки только если пользователь их еще не видел
    const hasSeen = localStorage.getItem('planpro-3d-onboarding');
    if (!hasSeen) {
      // Небольшая задержка, чтобы 3D-сцена успела загрузиться
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('planpro-3d-onboarding', 'true');
    setIsVisible(false);
  };

  const nextStep = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  if (!isVisible) return null;

  const steps = [
    {
      icon: <Move3D size={32} className="text-primary" />,
      title: 'Вращение и перемещение',
      text: 'Зажмите правую кнопку мыши (или два пальца на тачпаде), чтобы вращать 3D-сцену. Левая кнопка — для выделения комнат.',
    },
    {
      icon: <ZoomIn size={32} className="text-primary" />,
      title: 'Масштабирование',
      text: 'Используйте колесико мыши (или щипок двумя пальцами на экране), чтобы приблизить или отдалить план.',
    },
    {
      icon: <MousePointer2 size={32} className="text-primary" />,
      title: 'Стены и проемы',
      text: 'Кликните по любой стене, чтобы открыть панель «Свойства» справа. Там можно добавить окна, двери или удалить стену.',
    }
  ];

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in pointer-events-auto">
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl max-w-sm w-full p-6 relative border border-gray-200 dark:border-gray-700">
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            {steps[step].icon}
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{steps[step].title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {steps[step].text}
          </p>
        </div>

        <div className="flex items-center justify-between mt-8">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
              />
            ))}
          </div>
          
          <button 
            onClick={nextStep}
            className="px-6 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition shadow-md"
          >
            {step === 2 ? 'Понятно' : 'Далее'}
          </button>
        </div>
      </div>
    </div>
  );
}