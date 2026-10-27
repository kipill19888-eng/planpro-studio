import { useState } from 'react';
import { Play, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import ShieldConfigurator from './ShieldConfigurator';

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

      // 4. Расчет потери напряжения
      let voltageDrop = 0;
      const R = cable.resistance / 1000; // Ом/м
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
        message
      });

    } catch (err) {
      setError('Ошибка расчета. Проверьте данные.');
      console.error(err);
    }
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Мощность нагрузки (кВт)</label>
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
                  <label className="block text-sm text-gray-600 mb-1">cos φ</label>
                  <input type="number" step="0.01" value={cosPhi} onChange={(e) => setCosPhi(e.target.value)} className="w-full p-2.5 border rounded-md" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1 flex items-center gap-1">Длина линии (м) <Info size={14} className="text-gray-400" /></label>
                <input type="number" value={length} onChange={(e) => setLength(e.target.value)} className="w-full p-2.5 border rounded-md" />
                <p className="text-xs text-gray-400 mt-1">* Если не чертили план, оставьте 20 м (среднее расстояние).</p>
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
                  <div className={`flex items-center gap-2 mt-4 p-3 rounded-lg text-sm font-medium ${result.status === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {result.status === 'ok' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    {result.message}
                  </div>
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