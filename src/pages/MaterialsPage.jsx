import { useState } from 'react';
import { Package, Upload, Save, PlusCircle } from 'lucide-react';
import { useMaterialsStore } from '../storeMaterials';
import { useToastStore } from '../storeToast';
import * as pdfjsLib from 'pdfjs-dist';

import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function MaterialsPage() {
  const { prices, updatePrice, addCustomMaterial, customMaterials, removeCustomMaterial } = useMaterialsStore();
  const { addToast } = useToastStore();
  
  const [isUploading, setIsUploading] = useState(false);
  const [rawText, setRawText] = useState('');
  const [parsedItems, setParsedItems] = useState([]);

  const [manualName, setManualName] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [manualUnit, setManualUnit] = useState('шт');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setRawText('');
    setParsedItems([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        const items = [...textContent.items].sort((a, b) => {
          const yDiff = b.transform[5] - a.transform[5];
          if (Math.abs(yDiff) > 5) return yDiff;
          return a.transform[4] - b.transform[4];
        });

        let lastY = null;
        let pageText = '';
        
        items.forEach(item => {
          if (item.str.trim() === '') return;
          
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            pageText += '\n';
          } else if (lastY !== null) {
            pageText += ' ';
          }
          
          pageText += item.str;
          lastY = item.transform[5];
        });

        fullText += pageText + '\n\n';
      }

      setRawText(fullText);
      parseText(fullText);
      
    } catch (error) {
      console.error("Ошибка чтения PDF:", error);
      addToast('Не удалось прочитать PDF', 'error');
    } finally {
      setIsUploading(false);
      e.target.value = null; 
    }
  };

  const parseText = (text) => {
    const lines = text.split('\n');
    const items = [];

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      const matches = [...trimmedLine.matchAll(/\b(\d{2,6})\b/g)];
      
      if (matches.length > 0) {
        const lastMatch = matches[matches.length - 1];
        const price = parseInt(lastMatch[1]);
        let namePart = trimmedLine.substring(0, lastMatch.index).trim();
        namePart = namePart.replace(/^\d+[\s\.]*/, '').trim();
        namePart = namePart.replace(/(₽|руб|р\.)/gi, '').trim();

        if (namePart.length > 3) {
          items.push({
            id: `parsed-${Date.now()}-${Math.random()}`,
            name: namePart,
            price: price,
            unit: 'шт'
          });
        }
      }
    });

    const uniqueItems = items.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);

    if (uniqueItems.length === 0) {
      addToast('Не удалось автоматически найти цены. Добавьте вручную.', 'error');
    } else {
      setParsedItems(uniqueItems);
      addToast(`Найдено ${uniqueItems.length} позиций в прайсе`);
    }
  };

  const handleAddParsed = (item) => {
    addCustomMaterial({
      name: item.name,
      price: item.price,
      unit: item.unit
    });
    setParsedItems(parsedItems.filter(i => i.id !== item.id));
  };

  const handleManualAdd = (e) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPrice) return;
    
    addCustomMaterial({
      name: manualName.trim(),
      price: Number(manualPrice),
      unit: manualUnit
    });
    
    setManualName('');
    setManualPrice('');
    addToast('Материал добавлен');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 animate-fade-in">
      <div className="max-w-6xl mx-auto pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-primary" /> Мои материалы и цены
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-1 h-fit">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Upload size={20} className="text-primary" /> Импорт (PDF)
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Загрузите прайс. Мы попытаемся найти в нем цены автоматически.
            </p>
            
            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition ${isUploading ? 'bg-gray-50 border-gray-300' : 'border-blue-300 hover:bg-blue-50'}`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload size={24} className={`mb-2 ${isUploading ? 'text-gray-400' : 'text-primary'}`} />
                <p className="text-sm text-gray-600 font-medium">
                  {isUploading ? 'Чтение...' : 'Выбрать PDF'}
                </p>
              </div>
              <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
            </label>

            {rawText && (
              <details className="mt-4">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-primary">Показать распознанный текст</summary>
                <textarea 
                  readOnly 
                  value={rawText} 
                  className="w-full h-32 mt-2 p-2 border border-gray-200 rounded text-xs bg-gray-50 font-mono"
                />
              </details>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2 h-fit">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Найденные позиции</h2>
            
            {parsedItems.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                Загрузите PDF, чтобы увидеть результаты поиска.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-700 sticky top-0">
                    <tr>
                      <th className="py-2 px-3 border-b">Название</th>
                      <th className="py-2 px-3 border-b w-24">Цена</th>
                      <th className="py-2 px-3 border-b w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedItems.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-2 px-3 border-b text-gray-800">{item.name}</td>
                        <td className="py-2 px-3 border-b font-bold">{item.price} ₽</td>
                        <td className="py-2 px-3 border-b">
                          <button 
                            onClick={() => handleAddParsed(item)}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Добавить в мои материалы"
                          >
                            <PlusCircle size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2 flex flex-col">
             <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package size={20} className="text-primary" /> Мои материалы
            </h2>

            <form onSubmit={handleManualAdd} className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4 flex flex-wrap gap-2 items-end">
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">Название</label>
                <input type="text" value={manualName} onChange={(e) => setManualName(e.target.value)} required className="w-full p-2 border rounded-md text-sm" placeholder="Например, Грунтовка" />
              </div>
              <div className="w-24">
                <label className="block text-xs font-medium text-gray-700 mb-1">Цена</label>
                <input type="number" value={manualPrice} onChange={(e) => setManualPrice(e.target.value)} required min="0" className="w-full p-2 border rounded-md text-sm" placeholder="0" />
              </div>
              <div className="w-24">
                <label className="block text-xs font-medium text-gray-700 mb-1">Ед. изм.</label>
                <select value={manualUnit} onChange={(e) => setManualUnit(e.target.value)} className="w-full p-2 border rounded-md text-sm bg-white">
                  <option value="шт">шт</option>
                  <option value="м²">м²</option>
                  <option value="м">м</option>
                  <option value="кг">кг</option>
                  <option value="меш.">меш.</option>
                  <option value="рул.">рул.</option>
                </select>
              </div>
              <button type="submit" className="h-[38px] px-4 bg-primary text-white rounded-md text-sm font-medium hover:bg-blue-700 transition flex items-center gap-1">
                <PlusCircle size={16} /> Добавить
              </button>
            </form>

             {customMaterials.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-sm">Список пуст. Загрузите PDF или добавьте материал вручную.</div>
             ) : (
                <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {customMaterials.map(m => (
                    <li key={m.id} className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-100">
                      <div>
                        <span className="text-sm font-medium text-gray-800">{m.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({m.unit})</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-sm">{m.price} ₽</span>
                        <button onClick={() => removeCustomMaterial(m.id)} className="text-red-400 hover:text-red-600 text-xs font-medium">Удалить</button>
                      </div>
                    </li>
                  ))}
                </ul>
             )}
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-1">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Save size={20} className="text-primary" /> Базовые цены
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-xs text-gray-700">Штукатурка (меш)</span>
                <input type="number" value={prices.plaster.gypsum} onChange={(e) => updatePrice('plaster', 'gypsum', Number(e.target.value))} className="w-16 p-1 border rounded text-right text-xs" />
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-xs text-gray-700">Плитка (м²)</span>
                <input type="number" value={prices.tile.material} onChange={(e) => updatePrice('tile', 'material', Number(e.target.value))} className="w-16 p-1 border rounded text-right text-xs" />
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-xs text-gray-700">Ламинат (уп)</span>
                <input type="number" value={prices.laminate.pack} onChange={(e) => updatePrice('laminate', 'pack', Number(e.target.value))} className="w-16 p-1 border rounded text-right text-xs" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}