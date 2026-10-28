import { useState, useRef, useEffect } from 'react';
import {
  Plus, Minus, Zap, Trash2, Download, FileText, Settings, LayoutPanelLeft,
  Flame, Droplets, AirVent, ShieldCheck, PlusCircle
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useEstimateStore } from '../../storeEstimate';
import { useToastStore } from '../../storeToast';
import { useWorksStore } from '../../storeWorks'; // 👈 Добавлен импорт
import { PRICES } from '../../constants/prices';

const applianceTypes = {
  stove: { name: 'Варочная панель', icon: Flame, wet: false },
  oven: { name: 'Духовой шкаф', icon: Flame, wet: false },
  washer: { name: 'Стиральная машина', icon: Droplets, wet: true },
  dishwasher: { name: 'Посудомоечная машина', icon: Droplets, wet: true },
  boiler: { name: 'Бойлер', icon: Droplets, wet: true },
  ac: { name: 'Кондиционер', icon: AirVent, wet: false },
};

const calcBreaker = (powerWatts, material = 'copper') => {
  if (!powerWatts || powerWatts <= 0) return { breaker: 6, cable: 1.5, modules: 1 };
  const current = powerWatts / 220;

  let cableData = [
    { breaker: 6, cable: 1.5, maxCurrent: 19, r: 12.1 },
    { breaker: 10, cable: 1.5, maxCurrent: 19, r: 12.1 },
    { breaker: 16, cable: 2.5, maxCurrent: 27, r: 7.41 },
    { breaker: 25, cable: 4.0, maxCurrent: 38, r: 4.61 },
    { breaker: 32, cable: 6.0, maxCurrent: 50, r: 3.08 },
    { breaker: 40, cable: 10.0, maxCurrent: 70, r: 1.83 },
  ];

  if (material === 'aluminum') {
    cableData = [
      { breaker: 6, cable: 2.5, maxCurrent: 20, r: 12.1 },
      { breaker: 10, cable: 2.5, maxCurrent: 20, r: 12.1 },
      { breaker: 16, cable: 4.0, maxCurrent: 28, r: 7.41 },
      { breaker: 25, cable: 6.0, maxCurrent: 35, r: 4.61 },
      { breaker: 32, cable: 10.0, maxCurrent: 45, r: 3.08 },
      { breaker: 40, cable: 16.0, maxCurrent: 60, r: 1.83 },
    ];
  }

  const selected = cableData.find(d => d.breaker >= current * 1.1) || cableData[cableData.length - 1];
  return { breaker: selected.breaker, cable: selected.cable, modules: 1 };
};

const initialFloors = [
  {
    id: 'floor-1',
    name: '1 Этаж',
    rooms: [
      { id: 'room-1', name: 'Гостиная', sockets: 6, switches: 2, appliances: [] },
      {
        id: 'room-2',
        name: 'Кухня',
        sockets: 4,
        switches: 1,
        appliances: [
          { id: 'app-1', type: 'stove', power: 3500 },
          { id: 'app-2', type: 'oven', power: 2000 }
        ]
      },
      {
        id: 'room-3',
        name: 'Ванная',
        sockets: 2,
        switches: 1,
        appliances: [{ id: 'app-3', type: 'washer', power: 2000 }]
      },
    ]
  }
];

export default function ShieldConfigurator() {
  const { addItem } = useEstimateStore();
  const { addToast } = useToastStore();
  const { getWorkPrice } = useWorksStore(); // 👈 Получаем метод для работы

  const [floors, setFloors] = useState(() => {
    const saved = localStorage.getItem('planpro-shield-floors');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialFloors;
  });

  useEffect(() => {
    localStorage.setItem('planpro-shield-floors', JSON.stringify(floors));
  }, [floors]);

  const [socketPower, setSocketPower] = useState(300);
  const [switchPower, setSwitchPower] = useState(100);
  
  const [viewTab, setViewTab] = useState('settings');
  const [cableMaterial, setCableMaterial] = useState('copper');
  const [hasMeter, setHasMeter] = useState(true);
  const [hasMainBreaker, setHasMainBreaker] = useState(true);
  const [hasFireRCD, setHasFireRCD] = useState(true);

  const schemaRef = useRef(null);

  const addFloor = () => setFloors([...floors, { id: `floor-${Date.now()}`, name: `${floors.length + 1} Этаж`, rooms: [] }]);
  const updateFloorName = (id, name) => setFloors(floors.map(f => f.id === id ? { ...f, name } : f));
  const deleteFloor = (id) => {
    if (floors.length === 1) { 
      addToast('Нельзя удалить единственный этаж', 'error'); 
      return; 
    }
    if (window.confirm('Удалить этаж и все комнаты?')) {
      setFloors(floors.filter(f => f.id !== id));
    }
  };

  const addRoom = (floorId) => setFloors(floors.map(f => f.id === floorId
    ? { ...f, rooms: [...f.rooms, { id: `room-${Date.now()}`, name: 'Новая комната', sockets: 1, switches: 1, appliances: [] }] }
    : f));

  const updateRoom = (floorId, roomId, field, value) => setFloors(floors.map(f =>
    f.id === floorId ? { ...f, rooms: f.rooms.map(r => r.id === roomId ? { ...r, [field]: value } : r) } : f
  ));

  const deleteRoom = (floorId, roomId) => setFloors(floors.map(f =>
    f.id === floorId ? { ...f, rooms: f.rooms.filter(r => r.id !== roomId) } : f
  ));

  const addAppliance = (floorId, roomId, type) => {
    setFloors(floors.map(f => {
      if (f.id === floorId) {
        return {
          ...f,
          rooms: f.rooms.map(r => r.id === roomId
            ? { ...r, appliances: [...r.appliances, { id: `app-${Date.now()}-${Math.random()}`, type, power: 2000 }] }
            : r)
        };
      }
      return f;
    }));
  };

  const updateAppliancePower = (floorId, roomId, appId, newPower) => {
    setFloors(floors.map(f => {
      if (f.id === floorId) {
        return {
          ...f,
          rooms: f.rooms.map(r => r.id === roomId
            ? { ...r, appliances: r.appliances.map(a => a.id === appId ? { ...a, power: newPower } : a) }
            : r)
        };
      }
      return f;
    }));
  };

  const removeAppliance = (floorId, roomId, appId) => {
    setFloors(floors.map(f => {
      if (f.id === floorId) {
        return {
          ...f,
          rooms: f.rooms.map(r => r.id === roomId
            ? { ...r, appliances: r.appliances.filter(a => a.id !== appId) }
            : r)
        };
      }
      return f;
    }));
  };

  const calculateSystem = () => {
    let totalModules = 0;
    let totalPower = 0;
    const schemaNodes = [];

    floors.forEach(floor => {
      floor.rooms.forEach(room => {
        if (room.switches > 0) {
          const lightPower = room.switches * switchPower;
          const info = calcBreaker(lightPower, cableMaterial);
          totalPower += lightPower;
          totalModules += info.modules;
          schemaNodes.push({ id: `${room.id}-light`, name: `Свет (${room.name})`, power: lightPower, ...info, type: 'light' });
        }
        if (room.sockets > 0) {
          const socketLoad = room.sockets * socketPower;
          const info = calcBreaker(socketLoad, cableMaterial);
          totalPower += socketLoad;
          totalModules += 2;
          schemaNodes.push({ id: `${room.id}-sockets`, name: `Розетки (${room.name})`, power: socketLoad, ...info, type: 'socket', hasRCD: true, modules: 2 });
        }
        room.appliances.forEach((app, idx) => {
          const appInfo = applianceTypes[app.type];
          const info = calcBreaker(app.power, cableMaterial);
          totalPower += app.power;
          const needsRCD = appInfo.wet;
          const modules = needsRCD ? 2 : 1;
          totalModules += modules;

          const sameTypeTotal = room.appliances.filter(a => a.type === app.type).length;
          const sameTypeIdx = room.appliances.slice(0, idx).filter(a => a.type === app.type).length + 1;
          const suffix = sameTypeTotal > 1 ? ` #${sameTypeIdx}` : '';

          schemaNodes.push({
            id: app.id,
            name: `${appInfo.name}${suffix} (${room.name})`,
            power: app.power,
            ...info,
            type: 'heavy',
            hasRCD: needsRCD,
            modules
          });
        });
      });
    });

    const totalCurrent = totalPower / 220;
    const mainBreakers = [25, 32, 40, 50, 63, 80, 100];
    const mainBreakerRating = mainBreakers.find(b => b >= totalCurrent * 1.1) || 100;
    const rcdRatings = [40, 63, 80, 100, 125];
    const fireRCDRating = rcdRatings.find(r => r > mainBreakerRating) || 125;
    const fireRCDLeakage = '100 мА';

    let inputModules = 0;
    if (hasMeter) inputModules += 1;
    if (hasMainBreaker) inputModules += 1;
    if (hasFireRCD) inputModules += 2;
    totalModules += inputModules;

    return {
      schemaNodes, totalModules, totalPower,
      inputParams: { current: totalCurrent.toFixed(1), mainBreaker: `${mainBreakerRating} А`, fireRCD: `${fireRCDRating} А / ${fireRCDLeakage}` }
    };
  };

  const { schemaNodes, totalModules, totalPower, inputParams } = calculateSystem();

  const addAllToEstimate = () => {
    if (schemaNodes.length === 0) {
      addToast('Сначала добавьте комнаты и приборы', 'error');
      return;
    }

    // 👇 Получаем цену работы из нового стора
    const workPrice = getWorkPrice('w-electric') || PRICES.electric.workLine;

    schemaNodes.forEach(node => {
      addItem({
        name: `Кабель ${node.cable} мм² (${node.name})`,
        unit: 'м',
        quantity: 20,
        materialPrice: PRICES.electric.cable[Number(node.cable)] || 100,
        workPrice: 0
      });

      addItem({
        name: `Автомат ${node.breaker}А (${node.name})`,
        unit: 'шт',
        quantity: 1,
        materialPrice: PRICES.electric.breaker,
        workPrice: 0
      });

      if (node.hasRCD) {
        addItem({
          name: `Дифавтомат 30мА (${node.name})`,
          unit: 'шт',
          quantity: 1,
          materialPrice: PRICES.electric.dif,
          workPrice: 0
        });
      }

      addItem({
        name: `Работа: Монтаж линии ${node.name}`,
        unit: 'точка',
        quantity: 1,
        materialPrice: 0,
        workPrice: workPrice
      });
    });

    if (hasMeter) {
      addItem({ name: 'Счетчик электроэнергии', unit: 'шт', quantity: 1, materialPrice: PRICES.electric.meter, workPrice: 0 });
    }
    if (hasMainBreaker) {
      addItem({ name: `Вводной автомат ${inputParams.mainBreaker}`, unit: 'шт', quantity: 1, materialPrice: PRICES.electric.mainBreaker, workPrice: 0 });
    }
    if (hasFireRCD) {
      addItem({ name: `Противопожарное УЗО ${inputParams.fireRCD}`, unit: 'шт', quantity: 1, materialPrice: PRICES.electric.fireRCD, workPrice: 0 });
    }

    addToast('Все позиции щита добавлены в смету');
  };

  const downloadPDF = async () => {
    if (!schemaRef.current) return;
    const canvas = await html2canvas(schemaRef.current, { scale: 2, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.text('Однолинейная схема электрощита', 10, 10);
    pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);
    pdf.save('electrical-schema.pdf');
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex gap-2 border-b border-gray-200 pb-4">
        <button
          onClick={() => setViewTab('settings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition text-base ${viewTab === 'settings' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <Settings size={18} /> Настройка
        </button>
        <button
          onClick={() => setViewTab('schema')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition text-base ${viewTab === 'schema' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <LayoutPanelLeft size={18} /> Схема
        </button>
      </div>

      {viewTab === 'settings' && (
        <>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-5 flex items-center gap-2 text-gray-800">
              <Settings className="text-primary" size={22} /> Параметры
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center gap-4">
                <label className="text-base text-gray-700 font-medium">Мощность на 1 розетку (Вт):</label>
                <input
                  type="number" value={socketPower}
                  onChange={(e) => setSocketPower(Number(e.target.value))}
                  className="w-24 p-2 border rounded-md text-base"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <label className="text-base text-gray-700 font-medium">Мощность на 1 светильник (Вт):</label>
                <input
                  type="number" value={switchPower}
                  onChange={(e) => setSwitchPower(Number(e.target.value))}
                  className="w-24 p-2 border rounded-md text-base"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="text-base text-gray-700 font-medium flex items-center gap-2">Материал жилы:</label>
                <select
                  value={cableMaterial}
                  onChange={(e) => setCableMaterial(e.target.value)}
                  className="p-2 border rounded-md font-medium text-base"
                >
                  <option value="copper">Медь (Cu)</option>
                  <option value="aluminum">Алюминий (Al)</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-5 rounded-lg mb-6">
              <h4 className="text-base font-bold text-blue-800 mb-3 flex items-center gap-2">
                <ShieldCheck size={18} /> Расчетный ввод
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-base">
                <div><span className="text-blue-600 block mb-1">Общий ток:</span><span className="font-bold text-xl">{inputParams.current} А</span></div>
                <div><span className="text-blue-600 block mb-1">Вводной автомат:</span><span className="font-bold text-xl">{inputParams.mainBreaker}</span></div>
                <div><span className="text-blue-600 block mb-1">Противопожарное УЗО:</span><span className="font-bold text-xl">{inputParams.fireRCD}</span></div>
              </div>
            </div>

            <div className="border-t pt-5 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={hasMeter} onChange={(e) => setHasMeter(e.target.checked)} className="w-5 h-5 text-primary rounded" />
                <span className="text-base font-medium text-gray-700">Установить счетчик электроэнергии</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={hasMainBreaker} onChange={(e) => setHasMainBreaker(e.target.checked)} className="w-5 h-5 text-primary rounded" />
                <span className="text-base font-medium text-gray-700">Вводной автоматический выключатель (рубильник)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={hasFireRCD} onChange={(e) => setHasFireRCD(e.target.checked)} className="w-5 h-5 text-primary rounded" />
                <span className="text-base font-medium text-gray-700">Противопожарное УЗО (селективное)</span>
              </label>
            </div>
          </div>

          {floors.map(floor => (
            <div key={floor.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                  <input
                    type="text" value={floor.name}
                    onChange={(e) => updateFloorName(floor.id, e.target.value)}
                    className="text-xl font-bold text-gray-800 border-b border-transparent hover:border-gray-300 outline-none"
                  />
                  <button onClick={() => deleteFloor(floor.id)} className="text-gray-400 hover:text-red-500" title="Удалить этаж">
                    <Trash2 size={18} />
                  </button>
                </div>
                <button onClick={() => addRoom(floor.id)} className="text-base text-primary flex items-center gap-1 font-medium hover:text-blue-700">
                  <Plus size={18} /> Комната
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {floor.rooms.map(room => (
                  <div key={room.id} className="border border-gray-200 rounded-lg p-5 bg-gray-50/50">
                    <div className="flex justify-between items-center mb-4">
                      <input
                        type="text" value={room.name}
                        onChange={(e) => updateRoom(floor.id, room.id, 'name', e.target.value)}
                        className="font-bold text-lg text-gray-800 border-b border-transparent hover:border-gray-300 outline-none"
                      />
                      <button onClick={() => deleteRoom(floor.id, room.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="space-y-3 mb-5">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-medium text-gray-700">Розетки</span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateRoom(floor.id, room.id, 'sockets', Math.max(0, room.sockets - 1))} className="p-1.5 bg-white border rounded shadow-sm hover:bg-gray-50"><Minus size={14} /></button>
                          <span className="w-8 text-center text-base font-bold">{room.sockets}</span>
                          <button onClick={() => updateRoom(floor.id, room.id, 'sockets', room.sockets + 1)} className="p-1.5 bg-white border rounded shadow-sm hover:bg-gray-50"><Plus size={14} /></button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-base font-medium text-gray-700">Свет</span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateRoom(floor.id, room.id, 'switches', Math.max(0, room.switches - 1))} className="p-1.5 bg-white border rounded shadow-sm hover:bg-gray-50"><Minus size={14} /></button>
                          <span className="w-8 text-center text-base font-bold">{room.switches}</span>
                          <button onClick={() => updateRoom(floor.id, room.id, 'switches', room.switches + 1)} className="p-1.5 bg-white border rounded shadow-sm hover:bg-gray-50"><Plus size={14} /></button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {Object.entries(applianceTypes).map(([key, app]) => {
                          const Icon = app.icon;
                          return (
                            <button
                              key={key}
                              onClick={() => addAppliance(floor.id, room.id, key)}
                              className="flex items-center gap-1.5 text-sm px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-gray-700 hover:border-primary hover:text-primary transition shadow-sm font-medium"
                            >
                              <Icon size={14} /> + {app.name}
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-2">
                        {room.appliances.map(app => (
                          <div key={app.id} className="flex items-center justify-between bg-white p-2.5 rounded-md border border-gray-200 text-base shadow-sm">
                            <span className="font-medium text-gray-800">{applianceTypes[app.type].name}</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="number" value={app.power}
                                onChange={(e) => updateAppliancePower(floor.id, room.id, app.id, Number(e.target.value))}
                                className="w-20 p-1.5 text-right border rounded text-sm font-medium"
                              />
                              <span className="text-gray-600 text-sm">Вт</span>
                              <button onClick={() => removeAppliance(floor.id, room.id, app.id)} className="text-gray-400 hover:text-red-500 ml-1">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button onClick={addFloor} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary hover:text-primary transition flex items-center justify-center gap-2 font-medium text-base">
            <Plus size={22} /> Добавить этаж
          </button>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mt-8">
            <h3 className="text-xl font-bold mb-5 flex items-center gap-2 text-gray-800">
              <FileText className="text-primary" size={22} /> Ведомость
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-base text-left">
                <thead className="bg-gray-100 text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Линия</th>
                    <th className="py-3 px-4 font-semibold">Нагрузка</th>
                    <th className="py-3 px-4 font-semibold">Автомат</th>
                    <th className="py-3 px-4 font-semibold">Кабель</th>
                    <th className="py-3 px-4 font-semibold">УЗО (мА)</th>
                  </tr>
                </thead>
                <tbody>
                  {schemaNodes.map((node, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{node.name}</td>
                      <td className="py-3 px-4 text-gray-700">{node.power} Вт</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded text-sm font-bold ${node.type === 'light' ? 'bg-yellow-100 text-yellow-800' : node.type === 'socket' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                          {node.breaker} А
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700 font-medium">{node.cable} мм²</td>
                      <td className="py-3 px-4">
                        {node.hasRCD
                          ? <span className="text-green-700 font-bold text-sm bg-green-100 px-2.5 py-1 rounded">30 мА</span>
                          : <span className="text-gray-400 text-sm">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 bg-gray-100 p-5 rounded-lg border border-gray-200 w-full">
                <div className="text-sm text-gray-600 font-medium mb-1">Общая мощность</div>
                <div className="text-2xl font-bold text-gray-800">{(totalPower / 1000).toFixed(1)} кВт</div>
              </div>
              <div className="flex-1 bg-blue-50 p-5 rounded-lg border border-blue-200 w-full">
                <div className="text-sm text-blue-600 font-medium mb-1">Требуется модулей (вкл. ввод)</div>
                <div className="text-2xl font-bold text-primary">{totalModules} шт</div>
              </div>

              <button
                onClick={addAllToEstimate}
                className="px-6 py-5 bg-green-600 text-white rounded-lg font-medium text-base hover:bg-green-700 transition shadow-md shadow-green-500/20 flex items-center gap-2 whitespace-nowrap"
              >
                <PlusCircle size={22} /> В смету (всё)
              </button>
            </div>
          </div>
        </>
      )}

      {viewTab === 'schema' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
              <Zap className="text-primary" size={22} /> Схема
            </h3>
            <button onClick={downloadPDF} className="flex items-center gap-2 bg-gray-800 text-white px-5 py-2.5 rounded-lg hover:bg-gray-900 transition font-medium">
              <Download size={18} /> Скачать PDF
            </button>
          </div>

          <div ref={schemaRef} className="bg-white p-8 border-2 border-gray-300 rounded-lg flex flex-col items-center overflow-x-auto" style={{ minWidth: '800px', minHeight: '600px' }}>
            <div className="flex flex-col items-center mb-6">
              <div className="flex flex-col items-center border-2 border-gray-800 rounded-lg overflow-hidden bg-gray-50 mb-2 min-w-[250px]">
                {hasMeter && (<div className="px-6 py-2.5 border-b border-gray-800 font-bold text-sm bg-white w-full text-center">Счетчик</div>)}
                {hasMainBreaker && (<div className="px-6 py-2.5 border-b border-gray-800 font-bold text-sm bg-white w-full text-center">Вводной автомат <span className="text-primary">{inputParams.mainBreaker}</span></div>)}
                {hasFireRCD && (<div className="px-6 py-2.5 font-bold text-sm bg-white w-full text-center flex items-center justify-center gap-1"><ShieldCheck size={16} /> Противопожарное УЗО <span className="text-primary">{inputParams.fireRCD}</span></div>)}
              </div>
              <div className="h-6 w-0.5 bg-gray-800"></div>
            </div>

            <div className="w-full h-0.5 bg-gray-800 relative">
              <div className="absolute top-0 w-full flex justify-center gap-x-6 px-4">
                {schemaNodes.map((node, idx) => (
                  <div key={idx} className="flex flex-col items-center relative w-36">
                    <div className="w-0.5 h-4 bg-gray-800"></div>
                    <div className={`border-2 border-gray-800 px-3 py-1.5 rounded text-sm font-bold mb-1 z-10 text-center w-full ${node.type === 'light' ? 'bg-yellow-50' : node.type === 'socket' ? 'bg-blue-50' : 'bg-red-50'}`}>
                      {node.breaker}А
                      {node.hasRCD && <span className="block text-[10px] text-green-600 font-bold mt-0.5">УЗО 30мА</span>}
                    </div>
                    <div className="h-3 w-0.5 bg-gray-800"></div>
                    <div className="border border-gray-400 bg-white px-2 py-1.5 rounded text-xs text-center w-full shadow-sm break-words font-medium">
                      <div className="font-bold leading-tight mb-1 text-gray-800">{node.name}</div>
                      <div className="text-gray-600">{node.power}Вт / {node.cable}мм²</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-40 pt-10 text-center text-base text-gray-500 w-full border-t border-gray-200">PlanPro Studio</div>
          </div>
        </div>
      )}
    </div>
  );
}