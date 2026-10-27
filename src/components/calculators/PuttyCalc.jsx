import { useState, useEffect } from 'react';
import { Play, PlusCircle } from 'lucide-react';
import { useHouseStore, useRooms } from '../../store';
import { useEstimateStore } from '../../storeEstimate';
import { useToastStore } from '../../storeToast';
import { useMaterialsStore } from '../../storeMaterials';
import { useWorksStore } from '../../storeWorks';
import { useDraftsStore } from '../../storeDrafts';
import RoomSelector from './RoomSelector';

export default function PuttyCalc() {
  const { rooms, getCalculatedAreas } = useHouseStore();
  const { addItem } = useEstimateStore();
  const { addToast } = useToastStore();
  const { getMaterialPrice } = useMaterialsStore();
  const { getWorkPrice } = useWorksStore();
  const { drafts, saveDraft, clearDraft } = useDraftsStore();
  const areas = getCalculatedAreas();

  const draftKey = 'calc-putty';
  const draft = drafts[draftKey] || {};

  const [selectedId, setSelectedId] = useState(draft.selectedId || 'all');
  const [area, setArea] = useState(draft.area || areas.wallsArea.toFixed(1));
  const [startLayers, setStartLayers] = useState(draft.startLayers || '1');
  const [finishLayers, setFinishLayers] = useState(draft.finishLayers || '2');
  const [result, setResult] = useState(null);

  useEffect(() => {
    saveDraft(draftKey, { selectedId, area, startLayers, finishLayers });
  }, [selectedId, area, startLayers, finishLayers, saveDraft]);

  useEffect(() => {
    if (selectedId === 'all' && !draft.area) {
      setArea(areas.wallsArea.toFixed(1));
    }
    setResult(null);
  }, [selectedId, rooms, areas.wallsArea]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoomSelect = (id, newArea) => {
    setSelectedId(id);
    if (newArea) setArea(newArea);
  };

  const handleCalc = () => {
    const a = parseFloat(area) || 0;
    const sL = parseInt(startLayers) || 0;
    const fL = parseInt(finishLayers) || 0;

    const startKg = a * sL * 1.5;
    const finishKg = a * fL * 0.8;
    const totalKg = startKg + finishKg;
    
    const startBags = Math.ceil(startKg / 20);
    const finishBags = Math.ceil(finishKg / 20);

    setResult({ startKg, finishKg, totalKg, startBags, finishBags, cleanArea: a });
  };

  const addToEstimate = () => {
    if (!result) {
      addToast('Сначала нажмите «Рассчитать»', 'error');
      return;
    }
    
    const startPrice = getMaterialPrice('шпаклевка стартовая', 'putty', 'start');
    const finishPrice = getMaterialPrice('шпаклевка финишная', 'putty', 'finish');
    const workPrice = getWorkPrice('putty');
    
    if (result.startBags > 0) addItem({ name: `Шпаклевка стартовая`, unit: `меш. (20 кг)`, quantity: result.startBags, materialPrice: startPrice, workPrice: 0 });
    if (result.finishBags > 0) addItem({ name: `Шпаклевка финишная`, unit: `меш. (20 кг)`, quantity: result.finishBags, materialPrice: finishPrice, workPrice: 0 });
    
    const totalLayers = parseInt(startLayers) + parseInt(finishLayers);
    addItem({ name: `Работа: Шпаклевка стен (${totalLayers} слоя)`, unit: 'м²', quantity: result.cleanArea, materialPrice: 0, workPrice: workPrice });
    
    clearDraft(draftKey);
    setResult(null);
    setStartLayers('1');
    setFinishLayers('2');
    addToast('Шпаклевка добавлена в смету.');
  };

  return (
    <div className="max-w-2xl space-y-4 pb-24 md:pb-4">
      <RoomSelector selectedId={selectedId} onSelect={handleRoomSelect} surface="walls" />

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm text-gray-600 mb-1 font-medium">Площадь стен для расчета (м²)</label>
          <input type="number" value={area} onChange={(e) => setArea(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-md focus:border-primary outline-none font-bold text-lg text-primary" />
        </div>
        <div><label className="block text-sm text-gray-600 mb-1">Слоев стартовой</label><input type="number" value={startLayers} onChange={(e) => setStartLayers(e.target.value)} className="w-full p-2.5 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-600 mb-1">Слоев финишной</label><input type="number" value={finishLayers} onChange={(e) => setFinishLayers(e.target.value)} className="w-full p-2.5 border rounded-md" /></div>
      </div>

      <button type="button" onClick={handleCalc} className="w-full py-3 bg-primary text-white rounded-md mt-4 flex items-center justify-center gap-2 font-bold hover:bg-blue-700 transition shadow-md">
        <Play size={18}/> Рассчитать
      </button>

      {result && (
        <div className="p-4 bg-gray-50 rounded-lg mt-4 border border-gray-200 space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <span className="text-xs text-gray-500 uppercase font-semibold mb-2 block">Стартовая</span>
              <div className="text-2xl font-bold text-gray-700 mb-1">{result.startKg.toFixed(1)} кг</div>
              <div className="text-sm text-gray-500">{result.startBags} меш. по 20 кг</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <span className="text-xs text-gray-500 uppercase font-semibold mb-2 block">Финишная</span>
              <div className="text-2xl font-bold text-gray-700 mb-1">{result.finishKg.toFixed(1)} кг</div>
              <div className="text-sm text-gray-500">{result.finishBags} меш. по 20 кг</div>
            </div>
          </div>
          <button onClick={addToEstimate} className="w-full py-2.5 bg-green-600 text-white rounded-md mt-2 flex items-center justify-center gap-2 font-medium hover:bg-green-700 transition">
            <PlusCircle size={18}/> Добавить в смету
          </button>
        </div>
      )}
    </div>
  );
}