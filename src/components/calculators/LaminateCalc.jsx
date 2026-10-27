import { useState, useEffect } from 'react';
import { Play, PlusCircle } from 'lucide-react';
import { useHouseStore, useRooms } from '../../store';
import { useEstimateStore } from '../../storeEstimate';
import { useToastStore } from '../../storeToast';
import { useMaterialsStore } from '../../storeMaterials';
import { useWorksStore } from '../../storeWorks';
import { useDraftsStore } from '../../storeDrafts';
import RoomSelector from './RoomSelector';

export default function LaminateCalc() {
  const rooms = useRooms();
  const { getCalculatedAreas } = useHouseStore();
  const { addItem } = useEstimateStore();
  const { addToast } = useToastStore();
  const { getMaterialPrice } = useMaterialsStore();
  const { getWorkPrice } = useWorksStore();
  const { drafts, saveDraft, clearDraft } = useDraftsStore();
  const areas = getCalculatedAreas();

  const draftKey = 'calc-laminate';
  const draft = drafts[draftKey] || {};

  const [selectedId, setSelectedId] = useState(draft.selectedId || 'all');
  const [area, setArea] = useState(draft.area || areas.floorArea.toFixed(1));
  const [perimeter, setPerimeter] = useState(draft.perimeter || areas.perimeter.toFixed(1));
  
  const [boardLength, setBoardLength] = useState(draft.boardLength || '1.28');
  const [boardWidth, setBoardWidth] = useState(draft.boardWidth || '0.19');
  const [layout, setLayout] = useState(draft.layout || 'straight');
  const [packArea, setPackArea] = useState(draft.packArea || '2.1');
  const [priceUnit, setPriceUnit] = useState(draft.priceUnit || 'pack');
  
  const [result, setResult] = useState(null);

  useEffect(() => {
    saveDraft(draftKey, { selectedId, area, perimeter, boardLength, boardWidth, layout, packArea, priceUnit });
  }, [selectedId, area, perimeter, boardLength, boardWidth, layout, packArea, priceUnit, saveDraft]);

  useEffect(() => {
    if (selectedId === 'all' && !draft.area) {
      setArea(areas.floorArea.toFixed(1));
      setPerimeter(areas.perimeter.toFixed(1));
    }
    setResult(null);
  }, [selectedId, rooms, areas.floorArea, areas.perimeter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoomSelect = (id, newArea) => {
    setSelectedId(id);
    if (newArea) {
      setArea(newArea);
      const selectedRooms = rooms.filter(r => (r.groupId || `single-${r.id}`) === id);
      const totalPerimeter = selectedRooms.reduce((sum, r) => sum + (2 * (r.length + r.width)), 0);
      setPerimeter(totalPerimeter.toFixed(1));
    }
  };

  const handleCalc = () => {
    const a = parseFloat(area) || 0;
    const p = parseFloat(packArea) || 1;
    const per = parseFloat(perimeter) || 0;
    
    let waste = layout === 'straight' ? 1.05 : 1.1;
    
    const bL = parseFloat(boardLength) || 0;
    const bW = parseFloat(boardWidth) || 0;
    const boardArea = bL * bW;
    const totalArea = a * waste;
    const totalBoards = boardArea > 0 ? Math.ceil(totalArea / boardArea) : 0;
    
    const packs = Math.ceil(totalArea / p);
    const underlayRolls = Math.ceil(a / 15);
    const plinthCount = Math.ceil((per * 1.05) / 2.5);

    setResult({ packs, totalBoards, underlayRolls, plinthCount, cleanArea: a, totalAreaWithWaste: totalArea });
  };

  const addToEstimate = () => {
    if (!result) {
      addToast('Сначала нажмите «Рассчитать»', 'error');
      return;
    }

    const basePrice = getMaterialPrice('ламинат', 'laminate', 'pack');
    const finalPackPrice = priceUnit === 'sqm' ? basePrice * parseFloat(packArea) : basePrice;

    const underlayPrice = getMaterialPrice('подложка', 'laminate', 'underlay');
    const plinthPrice = getMaterialPrice('плинтус', 'laminate', 'plinth');
    
    const workPrice = layout === 'straight' 
      ? getWorkPrice('laminateStraight')
      : getWorkPrice('laminateDiagonal');

    addItem({ name: `Ламинат (упаковка ${packArea} м²)`, unit: 'уп.', quantity: result.packs, materialPrice: Math.round(finalPackPrice), workPrice: 0 });
    addItem({ name: `Подложка под ламинат (рулон 15 м²)`, unit: 'рул.', quantity: result.underlayRolls, materialPrice: underlayPrice, workPrice: 0 });
    addItem({ name: `Плинтус (2.5 м)`, unit: 'шт', quantity: result.plinthCount, materialPrice: plinthPrice, workPrice: 0 });
    addItem({ name: `Работа: Укладка ламината (${layout === 'straight' ? 'прямая' : 'диагональ'})`, unit: 'м²', quantity: result.cleanArea, materialPrice: 0, workPrice: workPrice });

    clearDraft(draftKey);
    setResult(null);
    addToast('Ламинат добавлен в смету.');
  };

  const currentBasePrice = getMaterialPrice('ламинат', 'laminate', 'pack');
  const displayPrice = priceUnit === 'sqm' ? currentBasePrice : Math.round(currentBasePrice * parseFloat(packArea));

  return (
    <div className="max-w-2xl space-y-4 pb-24 md:pb-4">
      <RoomSelector selectedId={selectedId} onSelect={handleRoomSelect} surface="floor" showPerimeter={true} />

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm text-gray-600 mb-1 font-medium">Площадь пола (м²)</label>
          <input type="number" value={area} onChange={(e) => setArea(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-md focus:border-primary outline-none font-bold text-lg text-primary" />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Периметр (м)</label>
          <input type="number" value={perimeter} onChange={(e) => setPerimeter(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-md focus:border-primary outline-none" />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Способ укладки</label>
          <select value={layout} onChange={(e) => setLayout(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-md focus:border-primary outline-none">
            <option value="straight">Прямая</option>
            <option value="diagonal">Диагональная</option>
          </select>
        </div>

        <div className="col-span-2 mt-2 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-bold text-gray-800 mb-2">Размер ламината (для точности)</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Длина доски (м)</label>
              <input type="number" step="0.01" value={boardLength} onChange={(e) => setBoardLength(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Ширина доски (м)</label>
              <input type="number" step="0.01" value={boardWidth} onChange={(e) => setBoardWidth(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">В упаковке (м²)</label>
              <input type="number" step="0.1" value={packArea} onChange={(e) => setPackArea(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" />
            </div>
          </div>
        </div>

        <div className="col-span-2 mt-2 pt-4 border-t border-gray-200 bg-blue-50 p-3 rounded-lg border border-blue-100">
          <label className="block text-sm font-bold text-blue-900 mb-2">В какой единице указана цена в справочнике?</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="radio" value="pack" checked={priceUnit === 'pack'} onChange={() => setPriceUnit('pack')} className="text-primary focus:ring-primary" />
              За упаковку (уп.)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="radio" value="sqm" checked={priceUnit === 'sqm'} onChange={() => setPriceUnit('sqm')} className="text-primary focus:ring-primary" />
              За квадратный метр (м²)
            </label>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            Текущая цена в справочнике: <strong>{currentBasePrice} ₽ {priceUnit === 'sqm' ? 'за м²' : 'за упаковку'}</strong>
          </p>
        </div>
      </div>

      <button type="button" onClick={handleCalc} className="w-full py-3 bg-primary text-white rounded-md mt-4 flex items-center justify-center gap-2 font-bold hover:bg-blue-700 transition shadow-md">
        <Play size={18}/> Рассчитать
      </button>

      {result && (
        <div className="p-4 bg-gray-50 rounded-lg mt-4 border border-gray-200 space-y-3 animate-fade-in">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
              <span className="text-xs text-gray-500 uppercase font-semibold block mb-1">Ламинат:</span>
              <span className="text-xl font-bold text-gray-800">{result.packs} уп.</span>
              <span className="block text-xs text-blue-600 font-medium mt-1">≈ {result.totalBoards} шт. досок</span>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
              <span className="text-xs text-gray-500 uppercase font-semibold block mb-1">Подложка:</span>
              <span className="text-xl font-bold text-gray-800">{result.underlayRolls} рул.</span>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
              <span className="text-xs text-gray-500 uppercase font-semibold block mb-1">Плинтус:</span>
              <span className="text-xl font-bold text-gray-800">{result.plinthCount} шт</span>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded border border-gray-200 text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Цена ламината:</span>
              <span className="font-bold text-gray-800">{displayPrice} ₽ / {priceUnit === 'sqm' ? 'м²' : 'уп.'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Общая площадь с запасом:</span>
              <span className="font-bold text-gray-800">{result.totalAreaWithWaste.toFixed(1)} м²</span>
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