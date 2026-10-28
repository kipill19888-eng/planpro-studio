import { useState, useEffect } from 'react';
import { Play, PlusCircle, Check } from 'lucide-react';
import { useHouseStore, useRooms } from '../../store';
import { useEstimateStore } from '../../storeEstimate';
import { useToastStore } from '../../storeToast';
import { useMaterialsStore } from '../../storeMaterials';
import { useWorksStore } from '../../storeWorks';
import { useDraftsStore } from '../../storeDrafts';
import { useAddToEstimate } from '../../hooks/useAddToEstimate';
import RoomSelector from './RoomSelector';

export default function PlasterCalc() {
  const { rooms, getCalculatedAreas } = useHouseStore();
  const { addItem } = useEstimateStore();
  const { addToast } = useToastStore();
  const { getMaterialPrice } = useMaterialsStore();
  const { getWorkPrice } = useWorksStore();
  const { drafts, saveDraft, clearDraft } = useDraftsStore();
  const { isAdded, triggerAdd } = useAddToEstimate();
  const areas = getCalculatedAreas();

  const draftKey = 'calc-plaster';
  const draft = drafts[draftKey] || {};

  const [selectedId, setSelectedId] = useState(draft.selectedId || 'all');
  const [area, setArea] = useState(draft.area || areas.wallsArea.toFixed(1));
  const [thickness, setThickness] = useState(draft.thickness || '2');
  const [plasterType, setPlasterType] = useState(draft.plasterType || 'gypsum');
  const [bagWeight, setBagWeight] = useState(draft.bagWeight || '30');
  const [result, setResult] = useState(null);

  useEffect(() => {
    saveDraft(draftKey, { selectedId, area, thickness, plasterType, bagWeight });
  }, [selectedId, area, thickness, plasterType, bagWeight, saveDraft]);

  const consumptionData = {
    gypsum: { name: 'Гипсовая', rate: 0.9, searchStr: 'штукатурка гипсовая' },
    cement: { name: 'Цементная', rate: 1.5, searchStr: 'штукатурка цементная' },
  };

  useEffect(() => {
    if (selectedId === 'all' && !draft.area) {
      setArea(areas.wallsArea.toFixed(1));
    }
    setResult(null);
  }, [selectedId, rooms, areas.wallsArea]);

  const handleRoomSelect = (id, newArea) => {
    setSelectedId(id);
    if (newArea && typeof newArea === 'string') setArea(newArea);
  };

  const handleCalc = () => {
    try {
      const a = parseFloat(area) || 0;
      const t = parseFloat(thickness) || 0;
      const bw = parseFloat(bagWeight) || 30;
      
      if (a <= 0 || t <= 0) {
        addToast('Площадь и толщина должны быть больше 0', 'error');
        return;
      }

      const baseConsumption = consumptionData[plasterType].rate;
      const cleanKg = a * t * baseConsumption;
      const totalKg = cleanKg * 1.2; 
      const cleanBags = Math.ceil(cleanKg / bw);
      const totalBags = Math.ceil(totalKg / bw);
      
      setResult({ cleanKg, totalKg, cleanBags, totalBags, bagWeight: bw, area: a });
      addToast('Расчет выполнен успешно');
    } catch (error) {
      console.error(error);
      addToast('Ошибка при расчете', 'error');
    }
  };

  const addToEstimate = () => {
    if (!result) {
      addToast('Сначала нажмите «Рассчитать»', 'error');
      return;
    }

    triggerAdd(() => {
      const searchStr = consumptionData[plasterType].searchStr;
      const currentMaterialPrice = getMaterialPrice(searchStr, 'plaster', plasterType);
      const currentWorkPrice = getWorkPrice('w-plaster');

      addItem({
        name: `Штукатурка ${consumptionData[plasterType].name}`,
        unit: `меш. (${result.bagWeight} кг)`,
        quantity: result.totalBags,
        materialPrice: currentMaterialPrice,
        workPrice: 0
      });

      addItem({
        name: `Работа: Штукатурка стен (${plasterType === 'gypsum' ? 'гипсовая' : 'цементная'})`,
        unit: 'м²',
        quantity: result.area,
        materialPrice: 0,
        workPrice: currentWorkPrice
      });

      clearDraft(draftKey);
    });
  };

  return (
    <div className="max-w-2xl space-y-4 pb-24 md:pb-4">
      <RoomSelector selectedId={selectedId} onSelect={handleRoomSelect} surface="walls" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div className="col-span-1 sm:col-span-2">
          <label className="block text-sm text-gray-600 mb-1 font-medium">Площадь стен для расчета (м²)</label>
          <input type="number" value={area} onChange={(e) => setArea(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md focus:border-primary outline-none font-bold text-lg text-primary" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Толщина слоя (мм)</label>
          <input type="number" step="1" value={thickness} onChange={(e) => setThickness(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md focus:border-primary outline-none" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Тип смеси</label>
          <select value={plasterType} onChange={(e) => setPlasterType(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md focus:border-primary outline-none bg-white">
            <option value="gypsum">Гипсовая</option>
            <option value="cement">Цементная</option>
          </select>
          <p className="text-xs text-primary mt-1 font-medium">
            Цена: {getMaterialPrice(consumptionData[plasterType].searchStr, 'plaster', plasterType)} ₽ / меш.
          </p>
        </div>
        <div>
           <label className="block text-sm text-gray-600 mb-1">Фасовка</label>
           <select value={bagWeight} onChange={(e) => setBagWeight(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md focus:border-primary outline-none bg-white">
            <option value="30">30 кг</option>
            <option value="25">25 кг</option>
          </select>
        </div>
      </div>

      <button type="button" onClick={handleCalc} className="w-full py-4 bg-primary text-white rounded-lg mt-4 flex items-center justify-center gap-2 font-bold hover:bg-blue-700 transition shadow-md relative z-10">
        <Play size={20}/> Рассчитать
      </button>

      {result && (
        <div className="p-4 bg-gray-50 rounded-lg mt-4 border border-gray-200 space-y-3 animate-fade-in">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <span className="text-xs text-gray-500 uppercase font-semibold mb-2 block">Идеальный расход</span>
              <div className="text-2xl font-bold text-gray-700 mb-1">{result.cleanKg.toFixed(1)} кг</div>
              <div className="text-sm text-gray-500">{result.cleanBags} меш. по {result.bagWeight} кг</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <span className="text-xs text-blue-600 uppercase font-semibold mb-2 block">К закупке (+20%)</span>
              <div className="text-2xl font-bold text-primary mb-1">{result.totalKg.toFixed(1)} кг</div>
              <div className="text-sm font-bold text-blue-700">{result.totalBags} меш. по {result.bagWeight} кг</div>
            </div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-xs text-yellow-800">
            <strong>Запас +20%</strong> заложен автоматически (15% на кривизну, 5% на потери).
          </div>
          
          <button onClick={addToEstimate} disabled={isAdded} className={`w-full py-3 rounded-md mt-2 flex items-center justify-center gap-2 font-medium transition shadow-sm ${isAdded ? 'bg-green-100 text-green-700 border border-green-300 cursor-default' : 'bg-green-600 text-white hover:bg-green-700'}`}>
            {isAdded ? <><Check size={18}/> Добавлено!</> : <><PlusCircle size={18}/> Добавить в смету</>}
          </button>
        </div>
      )}
    </div>
  );
}