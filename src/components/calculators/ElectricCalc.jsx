import { useState, useMemo } from 'react';
import { Play, CheckCircle2, AlertTriangle, Info, Zap, Home, Lightbulb, PlusCircle } from 'lucide-react';
import ShieldConfigurator from './ShieldConfigurator';
import { useRooms } from '../../store';
import { useEstimateStore } from '../../storeEstimate';
import { useToastStore } from '../../storeToast';
import { useMaterialsStore } from '../../storeMaterials';
import { useWorksStore } from '../../storeWorks';

const Tooltip = ({ text }) => (
  <span className="relative group inline-flex items-center justify-center ml-1 cursor-help">
    <Info size={14} className="text-gray-400 hover:text-primary transition" />
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-center pointer-events-none">
      {text}
      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></span>
    </span>
  </span>
);

const cables = {
  1: { label: '1.5', current: 19, resistance: 12.1 },
  2: { label: '2.5', current: 27, resistance: 7.41 },
  4: { label: '4.0', current: 38, resistance: 4.61 },
  6: { label: '6.0', current: 50, resistance: 3.08 },
  10: { label: '10.0', current: 70, resistance: 1.83 },
  16: { label: '16.0', current: 90, resistance: 1.15 },
};

export default function ElectricCalc() {
  const [tab, setTab] = useState('cable');

  const [power, setPower] = useState('6.6');
  const [voltage, setVoltage] = useState(220);
  const [cosPhi, setCosPhi] = useState('0.95');
  const [length, setLength] = useState('20');

  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const rooms = useRooms();
  const { addItem } = useEstimateStore();
  const { addToast } = useToastStore();
  const { getMaterialPrice } = useMaterialsStore();
  const { getWorkPrice } = useWorksStore();

  const roomStats = useMemo(() => {
    let totalSockets = 0;
    let totalLights = 0;
    let totalArea = 0;

    rooms.forEach(room => {
      const area = (room.length || 0) * (room.width || 0);
      totalArea += area;
      totalSockets += Math.ceil(area / 2);
      totalLights += Math.ceil(area / 5);
    });

    return { totalSockets, totalLights, totalArea, roomsCount: rooms.length };
  }, [rooms]);

  const handleCalculate = () => {
    setError('');
    setResult(null);

    const numPower = parseFloat(power);
    const numCosPhi = parseFloat(cosPhi);
    const numLength = parseFloat(length);

    if (isNaN(numPower) || numPower <= 0) {
      setError('Введите корректную мощность (больше 0)');
      return;
    }

    try {
      let current = 0;
      if (voltage === 220) {
        current = (numPower * 1000) / (220 * (numCosPhi || 1));
      } else {
        current = (numPower * 1000) / (1.732 * 380 * (numCosPhi || 1));
      }

      const breakers = [6, 10, 16, 20, 25, 32, 40, 50, 63];
      let breaker = null;
      for (let b of breakers) {
        if (b >= current) { breaker = b; break; }
      }
      if (!breaker) breaker = 63;

      let selectedKey = null;
      const sortedKeys = Object.keys(cables).map(Number).sort((a, b) => a - b);
      for (let key of sortedKeys) {
        if (cables[key].current >= breaker) { selectedKey = key; break; }
      }

      if (!selectedKey) {
        setResult({
          current: current.toFixed(2),
          cable: '>16 мм²',
          breaker: `${breaker} А`,
          voltageDrop: null,
          status: 'error',
          message: 'Требуется кабель больше 16 мм²'
        });
        return;
      }

      const cable = cables[selectedKey];

      let voltageDrop = 0;
      const R = cable.resistance / 1000;
      if (voltage === 220) {
        voltageDrop = ((numPower * 1000 * numLength * R) / (220 * 220)) * 100;
      } else {
        voltageDrop = ((numPower * 1000 * numLength * R) / (380 * 380)) * 100;
      }
      if (!Number.isFinite(voltageDrop)) voltageDrop = 0;

      const isCableOk = cable.current >= breaker;
      const isVoltageOk = voltageDrop < 5;

      let status = 'ok';
      let message = 'Кабель согласован с автоматом';

      if (!isCableOk) {
        status = 'warning';
        message = 'Ошибка подбора: кабель не соответствует автомату';
      } else if (!isVoltageOk) {
        status = 'warning';
        message = 'Потеря напряжения выше 5% — увеличьте сечение или сократите линию';
      }

      setResult({
        current: current.toFixed(2),
        cable: `${cable.label} мм²`,
        breaker: `${breaker} А`,
        voltageDrop: voltageDrop,
        status,
        message,
        cableKey: selectedKey,
        breakerValue: breaker
      });

    } catch (err) {
      setError('Ошибка расчета. Проверьте данные.');
      console.error(err);
    }
  };

  const addCalculatedCableToEstimate = () => {
    if (!result || result.status === 'error') return;

    const cablePrice = getMaterialPrice(`кабель ${result.cableKey}`, 'electric', `cable_${result.cableKey}`) || 
                       getMaterialPrice('кабель', 'electric', 'cable') || 45;
    const breakerPrice = getMaterialPrice('автомат', 'electric', 'breaker') || 450;
    const workPrice = getWorkPrice('w-electric') || 1000;

    addItem({
      name: `Кабель ${result.cable} (${result.current} А)`,
      unit: 'м',
      quantity: Math.ceil(parseFloat(length) * 1.1),
      materialPrice: cablePrice,
      workPrice: 0
    });

    addItem({
      name: `Автомат ${result.breaker}`,
      unit: 'шт',
      quantity: 1,
      materialPrice: breakerPrice,
      workPrice: 0
    });

    addItem({
      name: `Работа: Монтаж линии`,
      unit: 'точка',
      quantity: 1,
      materialPrice: 0,
      workPrice: workPrice
    });

    addToast(`Добавлено: кабель ${result.cable}, автомат ${result.breaker}`);
  };

  const handleCalcRooms = () => {
    if (rooms.length === 0) {
      addToast('Нет комнат для расчета. Создайте комнату в 3D.', 'error');
      return;
    }

    const socketNormPerSqm = 1.5;
    const lightNormPerSqm = 1.0;

    let totalSocketLength = 0;
    let totalLightLength = 0;

    rooms.forEach(room => {
      const area = (room.length || 0) * (room.width || 0);
      totalSocketLength += area * socketNormPerSqm;
      totalLightLength += area * lightNormPerSqm;
    });

    const socketPrice = getMaterialPrice('кабель', 'electric', 'cable') || 45; 
    const lightPrice = getMaterialPrice('кабель', 'electric', 'cable') || 45;
    const workPrice = getWorkPrice('w-electric') || 1000;

    addItem({ name: `Кабель ВВГнг 3х2.5 (розетки, оценочно)`, unit: 'м', quantity: Math.ceil(totalSocketLength), materialPrice: socketPrice, workPrice: 0 });
    addItem({ name: `Кабель ВВГнг 3х1.5 (освещение, оценочно)`, unit: 'м', quantity: Math.ceil(totalLightLength), materialPrice: lightPrice, workPrice: 0 });
    addItem({ name: `Работа: Прокладка кабеля (оценочно)`, unit: 'м', quantity: Math.ceil(totalSocketLength + totalLightLength), materialPrice: 0, workPrice: workPrice / 100 });

    addToast(`Добавлено в смету: ${Math.ceil(totalSocketLength)}м (розетки) + ${Math.ceil(totalLightLength)}м (свет)`);
  };

  return (
    <div>
      <div className="flex gap-2 border-b border-gray-200 pb-4 mb-6">
        <button onClick={() => setTab('cable')} className={`px-6 py-2 rounded-lg font-medium transition ${tab === 'cable' ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          Расчет кабеля
        </button>
        <button onClick={() => setTab('shield')} className={`px-6 py-2 rounded-lg font-medium transition ${tab === 'shield' ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          Сборка щита
        </button>
      </div>

      {tab === 'cable' ? (
        <div className="max-w-4xl space-y-4">
          
          <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-3">
              <div>
                <h4 className="font-bold text-teal-900 dark:text-teal-300 flex items-center gap-2">
                  <Home size={18}/> Расчет провода по комнатам
                </h4>
                <p className="text-xs text-teal-700 dark:text-teal-400 mt-1">
                  Оценочный расчет на основе площади {roomStats.roomsCount} комнат из 3D-планировщика.
                </p>
              </div>
              <button 
                onClick={handleCalcRooms}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition shadow-sm flex items-center gap-2 w-full md:w-auto justify-center shrink-0"
              >
                <Zap size={16}/> Добавить в смету
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 pt-3 border-t border-teal-200 dark:border-teal-800">
              <div className="bg-white dark:bg-[#0f172a] p-2 rounded-lg border border-teal-100 dark:border-teal-800 text-center">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase block">Площадь</span>
                <span className="text-base font-bold text-gray-800 dark:text-white">{roomStats.totalArea.toFixed(1)} м²</span>
              </div>
              <div className="bg-white dark:bg-[#0f172a] p-2 rounded-lg border border-teal-100 dark:border-teal-800 text-center">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase block flex items-center justify-center gap-1"><Zap size={10}/> Розетки</span>
                <span className="text-base font-bold text-gray-800 dark:text-white">{roomStats.totalSockets} шт</span>
              </div>
              <div className="bg-white dark:bg-[#0f172a] p-2 rounded-lg border border-teal-100 dark:border-teal-800 text-center">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase block flex items-center justify-center gap-1"><Lightbulb size={10}/> Свет</span>
                <span className="text-base font-bold text-gray-800 dark:text-white">{roomStats.totalLights} шт</span>
              </div>
              <div className="bg-white dark:bg-[#0f172a] p-2 rounded-lg border border-teal-100 dark:border-teal-800 text-center">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase block">Кабель</span>
                <span className="text-base font-bold text-gray-800 dark:text-white">~{Math.ceil(roomStats.totalArea * 2.5)} м</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1 flex items-center">
                  Выделенная мощность (кВт) 
                  <Tooltip text="Мощность, которая подается в дом или квартиру по договору (обычно указана в документах или на вводном автомате)" />
                </label>
                <input type="number" step="0.1" value={power} onChange={(e) => setPower(e.target.value)} className="w-full p-2.5 border rounded-md" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Напряжение (В)</label>
                  <select value={voltage} onChange={(e) => setVoltage(Number(e.target.value))} className="w-full p-2.5 border rounded-md">
                    <option value={220}>220 (1 фаза)</option>
                    <option value={380}>380 (3 фазы)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1 flex items-center">
                    cos φ
                    <Tooltip text="Коэффициент мощности. Для бытовых приборов обычно 0.95" />
                  </label>
                  <input type="number" step="0.01" value={cosPhi} onChange={(e) => setCosPhi(e.target.value)} className="w-full p-2.5 border rounded-md" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1 flex items-center">
                  Длина линии (м) 
                  <Tooltip text="Расстояние от щитка до самой дальней розетки" />
                </label>
                <input type="number" value={length} onChange={(e) => setLength(e.target.value)} className="w-full p-2.5 border rounded-md" />
              </div>

              {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

              <button onClick={handleCalculate} className="w-full py-3 bg-primary text-white rounded-md flex items-center justify-center gap-2 font-medium hover:bg-blue-700 transition mt-4">
                <Play size={18} /> Рассчитать
              </button>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Результаты</h3>
              {!result ? (
                <div className="text-gray-400 text-center py-10">Нажмите «Рассчитать»</div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-gray-200 pb-2 text-sm">
                    <span className="text-gray-600">Расчетный ток:</span>
                    <span className="font-bold text-gray-800">{result.current} А</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2 text-sm">
                    <span className="text-gray-600">Сечение кабеля:</span>
                    <span className="font-bold text-gray-800">{result.cable}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2 text-sm">
                    <span className="text-gray-600">Автомат:</span>
                    <span className="font-bold text-gray-800">{result.breaker}</span>
                  </div>
                  {result.voltageDrop !== null && (
                    <div className="flex justify-between border-b border-gray-200 pb-2 text-sm">
                      <span className="text-gray-600">Потеря напряжения:</span>
                      <span className={`font-bold ${result.voltageDrop < 5 ? 'text-green-600' : 'text-red-600'}`}>{result.voltageDrop.toFixed(2)} %</span>
                    </div>
                  )}
                  
                  <div className={`flex items-start gap-2 mt-4 p-3 rounded-lg text-sm font-medium ${result.status === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {result.status === 'ok' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertTriangle size={18} className="shrink-0 mt-0.5" />}
                    <div>
                      <div>{result.message}</div>
                      <div className="text-xs font-normal opacity-80 mt-1">
                        {result.status === 'ok' 
                          ? `Для выделенной мощности ${power} кВт подобран кабель ${result.cable} и автомат ${result.breaker}. Потери в норме.`
                          : 'Рекомендуется увеличить сечение кабеля или уменьшить длину линии.'}
                      </div>
                    </div>
                  </div>

                  {result.status === 'ok' && (
                    <button 
                      onClick={addCalculatedCableToEstimate}
                      className="w-full mt-3 py-2.5 bg-green-600 text-white rounded-md flex items-center justify-center gap-2 font-medium hover:bg-green-700 transition shadow-sm"
                    >
                      <PlusCircle size={18}/> Добавить в смету
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <ShieldConfigurator />
      )}
    </div>
  );
}