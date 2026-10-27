import { useRef, useState, useMemo } from 'react';
import { Trash2, FileText, Download, Loader2, ArrowUpDown, Lock, User, X } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { useEstimateStore } from '../storeEstimate';
import { useUserStore } from '../storeUser';
import { useClientsStore } from '../storeClients';
import { useProjectsStore } from '../storeProjects';
import UpgradeModal from './UpgradeModal';

export default function Estimate() {
  const { projects, activeProjectId } = useProjectsStore();
  const activeProject = projects.find(p => p.id === activeProjectId);

  const { removeItem, updateItem, clearEstimate } = useEstimateStore();
  const projectEstimates = useEstimateStore(s => s.projectEstimates);

  // Вычисляем элементы реактивно, без useEffect
  const items = useMemo(
    () => projectEstimates[activeProjectId] || [],
    [projectEstimates, activeProjectId]
  );

  const { isPro } = useUserStore();
  const { clients } = useClientsStore();

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');

  const printRef = useRef(null);
  const activeClient = clients.find(c => c.id === selectedClientId);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const totalA = ((a.materialPrice || 0) + (a.workPrice || 0)) * (a.quantity || 0);
      const totalB = ((b.materialPrice || 0) + (b.workPrice || 0)) * (b.quantity || 0);
      if (sortBy === 'price-desc') return totalB - totalA;
      if (sortBy === 'price-asc') return totalA - totalB;
      return 0;
    });
  }, [items, sortBy]);

  const handleDownloadClick = () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }
    downloadPDF();
  };

  const downloadPDF = async () => {
    if (items.length === 0 || !printRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = printRef.current;
      const opt = {
        margin: 10,
        filename: `Смета_${activeProject?.name || 'Проект'}${activeClient ? '_' + activeClient.name : ''}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
      };
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Ошибка при создании PDF:", error);
      alert("Не удалось создать PDF. Попробуйте еще раз.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const totals = useMemo(() => {
    let materials = 0, work = 0;
    items.forEach(item => {
      materials += (item.materialPrice || 0) * (item.quantity || 0);
      work += (item.workPrice || 0) * (item.quantity || 0);
    });
    return { materials, work, grandTotal: materials + work };
  }, [items]);

  return (
    <>
      <div className="flex flex-col w-full bg-white rounded-xl border border-gray-200 p-3 md:p-6 print:border-0 print:rounded-none print:p-0 animate-fade-in">

        {/* Ультра-компактная шапка */}
        <div className="flex items-center justify-between gap-2 mb-3 print:hidden">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-1 shrink-0">
              <FileText className="text-primary" size={18} /> Смета
            </h2>
            {activeProject && (
              <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded truncate max-w-[80px] md:max-w-[150px]">
                {activeProject.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button onClick={clearEstimate} className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition" title="Очистить">
              <X size={16} />
            </button>
            <button
              onClick={handleDownloadClick}
              disabled={isGeneratingPdf || items.length === 0}
              className={`p-2 rounded-lg transition text-white flex items-center justify-center ${
                isGeneratingPdf || items.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isPro
                    ? 'bg-gray-800 hover:bg-gray-900'
                    : 'bg-yellow-500 hover:bg-yellow-600'
              }`}
              title="Скачать PDF"
            >
              {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : (isPro ? <Download size={16}/> : <Lock size={16}/>)}
            </button>
          </div>
        </div>

        {/* Селекты в одну строку (тоже компактные) */}
        <div className="flex gap-2 mb-3 print:hidden">
          <div className="flex-1 flex items-center gap-1 bg-gray-50 rounded-md px-2 py-1 border text-xs">
            <User size={12} className="text-gray-400 shrink-0" />
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-transparent border-none text-gray-700 outline-none w-full font-medium cursor-pointer"
            >
              <option value="">Без клиента</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {items.length > 1 && (
            <div className="flex items-center gap-1 bg-gray-50 rounded-md px-2 py-1 border text-xs">
              <ArrowUpDown size={12} className="text-gray-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-gray-600 outline-none cursor-pointer font-medium"
              >
                <option value="default">По умолч.</option>
                <option value="price-desc">Дорогие</option>
                <option value="price-asc">Дешевые</option>
              </select>
            </div>
          )}
        </div>

        {/* Таблица со скроллом */}
        <div className="w-full overflow-x-auto border border-gray-200 rounded-lg">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-400 py-10">
              <FileText size={40} className="mb-3 opacity-50" />
              <p className="text-sm">Смета пуста</p>
            </div>
          ) : (
            <div className="max-h-[50vh] md:max-h-[60vh] overflow-y-auto">
              <table className="w-full text-xs md:text-sm text-left border-collapse min-w-[600px]">
                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="py-2 px-2 font-semibold w-8 text-center">№</th>
                    <th className="py-2 px-2 font-semibold min-w-[150px]">Наименование</th>
                    <th className="py-2 px-2 font-semibold w-16 text-center">Кол-во</th>
                    <th className="py-2 px-2 font-semibold w-20 text-right">Мат-л (₽)</th>
                    <th className="py-2 px-2 font-semibold w-20 text-right">Работа (₽)</th>
                    <th className="py-2 px-2 font-semibold w-24 text-right">Итого (₽)</th>
                    <th className="py-2 px-2 w-8 print:hidden"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedItems.map((item, index) => {
                    const lineTotal = ((item.materialPrice || 0) + (item.workPrice || 0)) * (item.quantity || 0);

                    return (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="py-2 px-2 text-center text-gray-500">{index + 1}</td>
                        <td className="py-2 px-2 font-medium text-gray-800">
                          {item.name}
                          {item.unit && <span className="text-gray-400 text-[10px] ml-1 block sm:inline">({item.unit})</span>}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.quantity || ''}
                            onChange={(e) => updateItem(item.id, 'quantity', Math.max(0, Number(e.target.value)))}
                            className="w-12 p-1 text-center border border-gray-200 rounded text-xs focus:border-primary outline-none print:border-0 print:p-0"
                            placeholder="0"
                          />
                        </td>
                        <td className="py-2 px-2 text-right">
                          <input
                            type="number"
                            min="0"
                            value={item.materialPrice || ''}
                            onChange={(e) => updateItem(item.id, 'materialPrice', Math.max(0, Number(e.target.value)))}
                            className="w-16 p-1 text-right border border-gray-200 rounded text-xs focus:border-primary outline-none print:border-0 print:p-0"
                            placeholder="0"
                          />
                        </td>
                        <td className="py-2 px-2 text-right">
                          <input
                            type="number"
                            min="0"
                            value={item.workPrice || ''}
                            onChange={(e) => updateItem(item.id, 'workPrice', Math.max(0, Number(e.target.value)))}
                            className="w-16 p-1 text-right border border-gray-200 rounded text-xs focus:border-primary outline-none bg-blue-50/30 print:border-0 print:p-0 print:bg-transparent"
                            placeholder="0"
                          />
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-gray-800">
                          {lineTotal.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-center print:hidden">
                          <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition">
                            <Trash2 size={14}/>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Итоги */}
        {items.length > 0 && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 flex flex-col gap-1.5 print:hidden shrink-0">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Материалы:</span>
              <span className="font-bold text-gray-800">{totals.materials.toLocaleString()} ₽</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Работы:</span>
              <span className="font-bold text-gray-800">{totals.work.toLocaleString()} ₽</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-300 pt-1.5 mt-0.5">
              <span className="text-sm font-bold text-gray-800">ИТОГО:</span>
              <span className="text-lg font-bold text-primary">{totals.grandTotal.toLocaleString()} ₽</span>
            </div>
          </div>
        )}

        {/* Скрытый блок для PDF */}
        <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div ref={printRef} className="bg-white w-[210mm] text-black box-border pdf-text-fix" style={{ fontFamily: 'Arial, sans-serif', padding: '10px' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #1f2937', paddingBottom: '16px', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0, marginBottom: '4px' }}>СМЕТА ПРОЕКТА</h1>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb', marginBottom: '4px' }}>PlanPro Studio</div>
              <p style={{ fontSize: '12px', color: '#4b5563', margin: 0 }}>
                {activeProject ? `Проект: ${activeProject.name} | ` : ''}
                Дата: {new Date().toLocaleDateString('ru-RU')}
              </p>
            </div>

            {activeClient && (
              <div style={{ marginBottom: '16px', backgroundColor: '#f9fafb', padding: '12px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#1f2937', margin: 0, marginBottom: '4px', textTransform: 'uppercase' }}>Заказчик:</h3>
                <div style={{ fontSize: '12px', color: '#374151' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '14px', margin: 0 }}>{activeClient.name}</p>
                  {activeClient.phone && <p style={{ margin: 0 }}>Тел: {activeClient.phone}</p>}
                  {activeClient.address && <p style={{ margin: 0 }}>Объект: {activeClient.address}</p>}
                </div>
              </div>
            )}

            <table className="w-full text-[10px] border-collapse mb-4">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="border border-gray-300 py-1 px-1 text-center w-8">№</th>
                  <th className="border border-gray-300 py-1 px-2 text-left">Наименование</th>
                  <th className="border border-gray-300 py-1 px-1 text-center w-12">Кол-во</th>
                  <th className="border border-gray-300 py-1 px-1 text-right w-16">Мат-л (₽)</th>
                  <th className="border border-gray-300 py-1 px-1 text-right w-16">Работа (₽)</th>
                  <th className="border border-gray-300 py-1 px-1 text-right w-20">Сумма (₽)</th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.map((item, index) => {
                  const lineTotal = ((item.materialPrice || 0) + (item.workPrice || 0)) * (item.quantity || 0);
                  return (
                    <tr key={item.id} className="page-break-inside-avoid">
                      <td className="border border-gray-300 py-1 px-1 text-center text-gray-500">{index + 1}</td>
                      <td className="border border-gray-300 py-1 px-2 text-gray-800 break-words">
                        {item.name} {item.unit && <span className="text-gray-500 text-[8px]">({item.unit})</span>}
                      </td>
                      <td className="border border-gray-300 py-1 px-1 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 py-1 px-1 text-right">{(item.materialPrice || 0).toLocaleString()}</td>
                      <td className="border border-gray-300 py-1 px-1 text-right">{(item.workPrice || 0).toLocaleString()}</td>
                      <td className="border border-gray-300 py-1 px-1 text-right font-bold">{lineTotal.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ pageBreakBefore: 'always', marginTop: '20px', backgroundColor: '#ffffff', color: '#000000', paddingBottom: '20px' }}>
              <div style={{ marginTop: '20px', fontSize: '13px', lineHeight: '1.6' }}>
                <div>Итого за материалы: <span style={{ fontWeight: 'bold' }}>{totals.materials.toLocaleString()} ₽</span></div>
                <div>Итого за работы: <span style={{ fontWeight: 'bold' }}>{totals.work.toLocaleString()} ₽</span></div>
                <div style={{ borderTop: '2px solid #000', paddingTop: '8px', marginTop: '4px', fontSize: '15px' }}>
                  <span style={{ fontWeight: 'bold' }}>ВСЕГО: {totals.grandTotal.toLocaleString()} ₽</span>
                </div>
              </div>

              <div style={{ marginTop: '60px', fontSize: '13px', color: '#000000', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p>Исполнитель: _______________________</p>
                  <p style={{ marginTop: '20px' }}>Подпись: _______________________</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p>Заказчик: {activeClient ? activeClient.name : '_______________________'}</p>
                  <p style={{ marginTop: '20px' }}>Подпись: _______________________</p>
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: '11px', color: '#666666', marginTop: '40px', borderTop: '1px solid #cccccc', paddingTop: '10px' }}>
                Смета сформирована автоматически в PlanPro Studio
              </div>
            </div>
          </div>
        </div>
      </div>

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </>
  );
}