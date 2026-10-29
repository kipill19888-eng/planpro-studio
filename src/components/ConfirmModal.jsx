import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in">
      <div 
        className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={20} /> {title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5 text-gray-600 dark:text-gray-400">
          {message}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-[#0f172a] flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-[#1e293b] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium text-sm"
          >
            Отмена
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm shadow-sm"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}