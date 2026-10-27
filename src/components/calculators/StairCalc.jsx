import { useState, useEffect } from 'react';
import { Play, PlusCircle, Ruler, TriangleRight } from 'lucide-react';
import { useEstimateStore } from '../../storeEstimate';
import { useToastStore } from '../../storeToast';
import { useMaterialsStore } from '../../storeMaterials';
import { useWorksStore } from '../../storeWorks';
import { useDraftsStore } from '../../storeDrafts';

export default function StairCalc() {
  const { addItem } = useEstimateStore();
  const { addToast } = useToastStore();
  const { getMaterialPrice } = useMaterialsStore();
  const { getWorkPrice } = useWorksStore();
  const { drafts, saveDraft, clearDraft } = useDraftsStore();

  const draftKey = 'calc-stair';
  const draft = drafts[draftKey] || {};

  const [totalHeight, setTotalHeight] = useState(draft.totalHeight || '3000');
  const [stepHeight, setStepHeight] = useState(draft.stepHeight || '150');
  const [stepWidth, setStepWidth] = useState(draft.stepWidth || '300');
  const [stairWidth, setStairWidth] = useState(draft.stairWidth || '1000');
  const [stairType, setStairType] = useState(draft.stairType || 'wood');
  const [result, setResult] = useState(null);

  useEffect(() => {
    saveDraft(draftKey, { totalHeight, stepHeight, stepWidth, stairWidth, stairType });
  }, [totalHeight, stepHeight, stepWidth, stairWidth, stairType, saveDraft]);

  const handleCalc = () => {
    const H = parseFloat(totalHeight) || 0;
    const h = parseFloat(stepHeight) || 0;
    const w = parseFloat(stepWidth) || 0;
    const L = parseFloat(stairWidth) || 0;

    if (H <= 0 || h <= 0 || w <= 0) {
      addToast('Все параметры должны быть больше 0', 'error');
      return;
    }

    const steps = Math.ceil(H / h);
    const exactStepHeight = H / steps;
    const treads = steps - 1;
    const projectionLength = treads * w;
    const angle = Math.atan(H / projectionLength) * (180 / Math.PI);
    const stringerLength = Math.sqrt(H * H + projectionLength * projectionLength);
    const comfort = 2 * exactStepHeight + w;
    
    let comfortStatus = 'ok';
    let comfortMsg = 'Удобный шаг';

    if (comfort < 600) { comfortStatus = 'steep'; comfortMsg = 'Слишком крутая'; }
    else if (comfort > 660) { comfortStatus = 'flat'; comfortMsg = 'Слишком пологая'; }

    setResult({
      steps,
      treads,
      exactStepHeight: exactStepHeight.toFixed(1),
      projectionLength: projectionLength.toFixed(0),
      angle: angle.toFixed(1),
      stringerLength: stringerLength.toFixed(0),
      stairWidth: L,
      comfort,
      comfortStatus,
      comfortMsg,
      stairType,
    });
  };

  const addToEstimate = () => {
    if (!result) {
      addToast('Сначала нажмите «Рассчитать»', 'error');
      return;
    }

    if (result.stairType === 'wood') {
      const woodPrice = getMaterialPrice('лестница деревянная', 'stair', 'wood');
      const workPrice = getWorkPrice('stairWork');

      addItem({
        name: `Деревянная лестница (${result.steps} ступеней)`,
        unit: 'шт',
        quantity: result.steps,
        materialPrice: woodPrice,
        workPrice: 0
      });

      addItem({
        name: `Работа: Монтаж лестницы`,
        unit: 'шт',
        quantity: 1,
        materialPrice: 0,
        workPrice: workPrice
      });
    } else if (result.stairType === 'concrete') {
      const concretePrice = getMaterialPrice('бетон для лестницы', 'stair', 'concrete');
      
      addItem({
        name: `Бетонная лестница (${result.steps} ступеней)`,
        unit: 'шт',
        quantity: result.steps,
        materialPrice: concretePrice,
        workPrice: 0
      });

      addItem({
        name: `Работа: Заливка бетонной лестницы`,
        unit: 'шт',
        quantity: 1,
        materialPrice: 0,
        workPrice: getWorkPrice('stairWork') * 1.5
      });
    } else if (result.stairType === 'metal') {
      const metalPrice = getMaterialPrice('лестница металлическая', 'stair', 'metal');
      
      addItem({
        name: `Металлическая лестница (${result.steps} ступеней)`,
        unit: 'шт',
        quantity: result.steps,
        materialPrice: metalPrice,
        workPrice: 0
      });

      addItem({
        name: `Работа: Монтаж металлической лестницы`,
        unit: 'шт',
        quantity: 1,
        materialPrice: 0,
        workPrice: getWorkPrice('stairWork') * 1.2
      });
    }

    clearDraft(draftKey);
    setResult(null);
    addToast('Лестница добавлена в смету.');
  };

  return (
    <div className="max-w-4xl space-y-6 pb-24 md:pb-4">
      
      {/* 👇 ИНФОРМАЦИОННЫЙ БЛОК (Исправлены цвета текста и иконки) */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 flex items-start gap-3">
        <Ruler className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-gray-800 dark:text-gray-200">
          <p className="font-bold mb-1">Стандарты удобства:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Высота ступени: <strong className="text-gray-900 dark:text-white">150–180 мм</strong></li>
            <li>Ширина проступи: <strong className="text-gray-900 dark:text-white">250–300 мм</strong></li>
            <li>Угол наклона: <strong className="text-gray-900 dark:text-white">25–45 градусов</strong></li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Левая колонка: параметры */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Высота этажа (мм)
            </label>
            <input
              type="number"
              value={totalHeight}
              onChange={(e) => setTotalHeight(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:border-primary outline-none font-bold text-lg bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white"
              placeholder="3000"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">От пола 1 этажа до пола 2 этажа</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Высота ступени (мм)
              </label>
              <input
                type="number"
                value={stepHeight}
                onChange={(e) => setStepHeight(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:border-primary outline-none bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ширина проступи (мм)
              </label>
              <input
                type="number"
                value={stepWidth}
                onChange={(e) => setStepWidth(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:border-primary outline-none bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ширина лестницы (мм)
            </label>
            <input
              type="number"
              value={stairWidth}
              onChange={(e) => setStairWidth(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:border-primary outline-none bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Материал лестницы
            </label>
            <select
              value={stairType}
              onChange={(e) => setStairType(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:border-primary outline-none bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white"
            >
              <option value="wood">Дерево (сосна/дуб)</option>
              <option value="concrete">Бетон (монолит)</option>
              <option value="metal">Металл (каркас + ступени)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleCalc}
            className="w-full py-3 bg-primary text-white rounded-lg flex items-center justify-center gap-2 font-bold hover:bg-blue-700 transition shadow-md"
          >
            <Play size={18}/> Рассчитать
          </button>
        </div>

        {/* Правая колонка: результаты */}
        <div>
          {!result ? (
            <div className="h-full bg-gray-50 dark:bg-[#0f172a] border border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-6 min-h-[200px] text-center">
              Нажмите «Рассчитать», чтобы увидеть параметры лестницы.
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0f172a] p-5 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="text-xs text-blue-600 dark:text-blue-400 block font-semibold">Ступеней</span>
                  <span className="text-2xl font-bold text-gray-800 dark:text-white">{result.steps} шт</span>
                  <span className="block text-[10px] text-gray-500 dark:text-gray-400 mt-1">Проступей: {result.treads}</span>
                </div>
                <div className="bg-gray-50 dark:bg-[#1e293b] p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400 block font-semibold">Длина лестницы</span>
                  <span className="text-2xl font-bold text-gray-800 dark:text-white">{result.projectionLength} мм</span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-[#1e293b] p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Точная высота ступени:</span>
                  <span className="font-bold text-gray-800 dark:text-white">{result.exactStepHeight} мм</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Угол наклона:</span>
                  <span className={`font-bold ${result.angle > 45 ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>{result.angle}°</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Длина косоура:</span>
                  <span className="font-bold text-gray-800 dark:text-white">{result.stringerLength} мм</span>
                </div>
              </div>

              <div className={`p-3 rounded-lg border text-sm font-medium flex items-center gap-2 ${
                result.comfortStatus === 'ok' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800/50 dark:text-green-400' :
                result.comfortStatus === 'steep' ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400' :
                'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800/50 dark:text-yellow-400'
              }`}>
                <TriangleRight size={18} className="shrink-0" />
                <div>
                  <div className="font-bold">{result.comfortMsg}</div>
                  <div className="text-xs opacity-80">Формула удобства: 2h + w = {Math.round(result.comfort)} мм (норма 600–660)</div>
                </div>
              </div>

              <button
                onClick={addToEstimate}
                className="w-full py-3 bg-green-600 text-white rounded-md flex items-center justify-center gap-2 font-medium hover:bg-green-700 transition shadow-md"
              >
                <PlusCircle size={18}/> Добавить в смету
              </button>

              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
                * Для создания чертежа лестницы используйте раздел «Карта раскладки» в плитке (экспорт в PDF).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}