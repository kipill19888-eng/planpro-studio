import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useToastStore } from '../storeToast';
import { useState, useEffect } from 'react';

// Компонент одного тоста для управления анимацией исчезновения
function ToastItem({ toast, onRemove }) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onRemove(toast.id), 300); // Ждем окончания анимации
  };

  // Автоматическое закрытие с анимацией
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 3200); // Чуть меньше, чем в сторе, чтобы анимация успела пройти

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border transition-all duration-300 transform ${
        isClosing ? 'opacity-0 translate-y-2 scale-95' : 'opacity-100 translate-y-0 scale-100'
      } ${
        toast.type === 'error'
          ? 'bg-red-50 border-red-200 text-red-800'
          : 'bg-green-50 border-green-200 text-green-800'
      }`}
    >
      {toast.type === 'error' ? (
        <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
      ) : (
        <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
      )}
      <span className="font-medium text-sm">{toast.message}</span>
      <button
        onClick={handleClose}
        className="ml-2 text-gray-400 hover:text-gray-600 transition"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default function Toast() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 print:hidden">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}