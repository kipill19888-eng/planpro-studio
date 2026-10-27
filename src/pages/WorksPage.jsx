import { Hammer, Save } from 'lucide-react';
import { useWorksStore } from '../storeWorks';

export default function WorksPage() {
  const { works, updateWork } = useWorksStore();

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 animate-fade-in">
      {/* Увеличили max-w с 4xl до 6xl, чтобы занять больше места */}
      <div className="max-w-6xl mx-auto pb-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Hammer className="text-primary" size={36} /> База работ
          </h1>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Save size={24} className="text-primary" /> Стоимость работ
          </h2>
          <p className="text-base text-gray-600 mb-8">
            Укажите вашу стоимость работ за квадратный метр или точку. Эти цены будут автоматически подставляться в смету из калькуляторов.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="flex justify-between items-center p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/30 transition">
              <span className="text-base font-semibold text-gray-800">Штукатурка стен</span>
              <div className="flex items-center gap-3">
                <input type="number" value={works.plaster} onChange={(e) => updateWork('plaster', Number(e.target.value))} className="w-32 p-3 border border-gray-300 rounded-lg text-right text-lg font-medium focus:border-primary outline-none" />
                <span className="text-sm text-gray-500 w-12">₽/м²</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/30 transition">
              <span className="text-base font-semibold text-gray-800">Шпаклевка стен</span>
              <div className="flex items-center gap-3">
                <input type="number" value={works.putty} onChange={(e) => updateWork('putty', Number(e.target.value))} className="w-32 p-3 border border-gray-300 rounded-lg text-right text-lg font-medium focus:border-primary outline-none" />
                <span className="text-sm text-gray-500 w-12">₽/м²</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/30 transition">
              <span className="text-base font-semibold text-gray-800">Поклейка обоев</span>
              <div className="flex items-center gap-3">
                <input type="number" value={works.wallpaper} onChange={(e) => updateWork('wallpaper', Number(e.target.value))} className="w-32 p-3 border border-gray-300 rounded-lg text-right text-lg font-medium focus:border-primary outline-none" />
                <span className="text-sm text-gray-500 w-12">₽/м²</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/30 transition">
              <span className="text-base font-semibold text-gray-800">Укладка плитки</span>
              <div className="flex items-center gap-3">
                <input type="number" value={works.tile} onChange={(e) => updateWork('tile', Number(e.target.value))} className="w-32 p-3 border border-gray-300 rounded-lg text-right text-lg font-medium focus:border-primary outline-none" />
                <span className="text-sm text-gray-500 w-12">₽/м²</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/30 transition">
              <span className="text-base font-semibold text-gray-800">Укладка ламината (прямая)</span>
              <div className="flex items-center gap-3">
                <input type="number" value={works.laminateStraight} onChange={(e) => updateWork('laminateStraight', Number(e.target.value))} className="w-32 p-3 border border-gray-300 rounded-lg text-right text-lg font-medium focus:border-primary outline-none" />
                <span className="text-sm text-gray-500 w-12">₽/м²</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/30 transition">
              <span className="text-base font-semibold text-gray-800">Укладка ламината (диагональ)</span>
              <div className="flex items-center gap-3">
                <input type="number" value={works.laminateDiagonal} onChange={(e) => updateWork('laminateDiagonal', Number(e.target.value))} className="w-32 p-3 border border-gray-300 rounded-lg text-right text-lg font-medium focus:border-primary outline-none" />
                <span className="text-sm text-gray-500 w-12">₽/м²</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/30 transition col-span-1 md:col-span-2">
              <span className="text-base font-semibold text-gray-800">Монтаж линии (электрика)</span>
              <div className="flex items-center gap-3">
                <input type="number" value={works.electricLine} onChange={(e) => updateWork('electricLine', Number(e.target.value))} className="w-32 p-3 border border-gray-300 rounded-lg text-right text-lg font-medium focus:border-primary outline-none" />
                <span className="text-sm text-gray-500 w-12">₽/шт</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}