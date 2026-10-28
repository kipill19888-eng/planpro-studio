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

export default function WallpaperCalc() {
  const { rooms, getCalculatedAreas } = useHouseStore();
  const { addItem } = useEstimateStore();
  const { addToast } = useToastStore();
  const { getMaterialPrice } = useMaterialsStore();
  const { getWorkPrice } = useWorksStore();
  const { drafts, saveDraft, clearDraft } = useDraftsStore();
  const { isAdded, triggerAdd } = useAddToEstimate();
  const areas = getCalculatedAreas();

  const draftKey = 'calc-wallpaper';
  const draft = drafts[draftKey] || {};

  const [selectedId, setSelectedId] = useState(draft.selectedId || 'all');
  const [area, setArea] = useState(draft.area || areas.wallsArea.toFixed(1));
  const [perimeter, setPerimeter] = useState(draft.perimeter || areas.perimeter.toFixed(1));
  
  const [height, setHeight] = useState(draft.height || '2.7');
  const [rollWidth, setRollWidth] = useState(draft.rollWidth || '1.06');
  const [rollLength, setRollLength] = useState(draft.rollLength || '10');
  const [rapport, setRapport] = useState(draft.rapport || '0');
  const [result, setResult] = useState(null);

  useEffect(() => {
    saveDraft(draftKey, { selectedId, area, perimeter, height, rollWidth, rollLength, rapport });
  }, [selectedId, area, perimeter, height, rollWidth, rollLength, rapport, saveDraft]);

  useEffect(() => {
    if (selectedId === 'all' && !draft.area) {
      setArea(areas.wallsArea.toFixed(1));
      setPerimeter(areas.perimeter.toFixed(1));
    }
    setResult(null);
  }, [selectedId, rooms, areas.wallsArea, areas.perimeter]);

  const handleRoomSelect = (id, newArea) => {
    setSelectedId(id);
    if (newArea && typeof newArea === 'string') {
      setArea(newArea);
    }
  };

  const handleCalc = () => {
    const a = parseFloat(area) || 0;
    const per = parseFloat(perimeter) || 0;
    const h = parseFloat(height) || 1;
    const rw = parseFloat(rollWidth) || 1;
    const rl = parseFloat(rollLength) || 10;
    const rp = parseFloat(rapport) || 0;

    const stripsNeeded = Math.ceil(per / rw);
    const rapportM = rp / 100;
    const stripHeight = h + rapportM;
    const stripsPerRoll = Math.floor(rl / stripHeight) || 1;

    const baseRolls = Math.ceil(stripsNeeded / stripsPerRoll);
    const recommendedRolls = baseRolls + 1;
    const gluePacks = Math.ceil(a / 30);

    setResult({ baseRolls, recommendedRolls, gluePacks, cleanArea: a });
  };

  const addToEstimate = () => {
    if (!result) return;

    triggerAdd(() => {
      const rollPrice = getMaterialPrice('обои', 'wallpaper', 'roll');
      const gluePrice = getMaterialPrice('клей для обоев', 'wallpaper', 'glue');
      const workPrice = getWorkPrice('w-wallpaper');

      addItem({ name: `Обои (ширина ${rollWidth}м)`, unit: 'рулон', quantity: result.recommendedRolls, materialPrice: rollPrice, workPrice: 0 });
      addItem({ name: `Клей для обоев`, unit: 'упак', quantity: result.gluePacks, materialPrice: gluePrice, workPrice: 0 });
      addItem({ name: `Работа: Поклейка обоев`, unit: 'м²', quantity: result.cleanArea, materialPrice: 0, workPrice: workPrice });

      clearDraft(draftKey);
    });
  };

  return (
    <div className="max-w-2xl space-y-4 pb-24 md:pb-4">
      <RoomSelector selectedId={selectedId} onSelect={handleRoomSelect} surface="walls" showPerimeter={true} />

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm text-gray-600 mb-1 font-medium">Площадь стен (м²)</label>
          <input type="number" value={area} onChange={(e) => setArea(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-md focus:border-primary outline-none font-bold text-lg text-primary" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm text-gray-600 mb-1 font-medium">Периметр стен (м)</label>
          <input type="number" value={perimeter} onChange={(e) => setPerimeter(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-md focus:border-primary outline-none font-bold text-lg text-primary" />
        </div>
        <div><label className="block text-sm text-gray-600 mb-1">Высота (м)</label><input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full p-2.5 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-600 mb-1">Ширина рулона (м)</label><input type="number" step="0.01" value={rollWidth} onChange={(e) => setRollWidth(e.target.value)} className="w-full p-2.5 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-600 mb-1">Длина рулона (м)</label><input type="number" value={rollLength} onChange={(e) => setRollLength(e.target.value)} className="w-full p-2.5 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-600 mb-1">Раппорт (см)</label><input type="number" value={rapport} onChange={(e) => setRapport(e.target.value)} className="w-full p-2.5 border rounded-md" /></div>
      </div>

      <button type="button" onClick={handleCalc} className="w-full py-3 bg-primary text-white rounded-md mt-4 flex items-center justify-center gap-2 font-bold hover:bg-blue-700 transition shadow-md">
        <Play size={18}/> Рассчитать
      </button>

      {result && (
        <div className="p-4 bg-gray-50 rounded-lg mt-4 border border-gray-200 space-y-3 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
              <span className="text-xs text-gray-500 uppercase font-semibold">Математический расчет</span>
              <div className="text-lg font-bold text-gray-600 mt-1">{result.baseRolls} рулонов</div>
            </div>
            <div className="bg-blue-50 p-3 rounded border border-blue-200 shadow-sm">
              <span className="text-xs text-blue-600 uppercase font-semibold">Рекомендуется купить</span>
              <div className="text-xl font-bold text-primary mt-1">{result.recommendedRolls} рулонов</div>
              <span className="text-xs text-blue-500">(+1 на брак/подгон)</span>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm text-gray-500">Клей для обоев:</span>
            <span className="text-lg font-bold text-gray-800">{result.gluePacks} упаковок</span>
          </div>
          <button onClick={addToEstimate} disabled={isAdded} className={`w-full py-2.5 rounded-md mt-2 flex items-center justify-center gap-2 font-medium transition ${isAdded ? 'bg-green-100 text-green-700 border border-green-300 cursor-default' : 'bg-green-600 text-white hover:bg-green-700'}`}>
            {isAdded ? <><Check size={18}/> Добавлено!</> : <><PlusCircle size={18}/> Добавить в смету</>}
          </button>
        </div>
      )}
    </div>
  );
}