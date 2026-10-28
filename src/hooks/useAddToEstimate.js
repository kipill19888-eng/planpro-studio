import { useState } from 'react';
import { useToastStore } from '../storeToast';

export function useAddToEstimate() {
  const [isAdded, setIsAdded] = useState(false);
  const { addToast } = useToastStore();

  const triggerAdd = (callback) => {
    callback();
    setIsAdded(true);
    addToast('Добавлено в смету!', 'success');
    
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return { isAdded, triggerAdd };
}