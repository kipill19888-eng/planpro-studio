import { Zap, PaintRoller, HardHat, ArrowRight } from 'lucide-react';

export default function CalculatorsHub({ onNavigate }) {
  const calculators = [
    {
      id: 'calc-electric',
      title: 'Электрика',
      description: 'Расчет кабеля, автоматов и сборка электрощита.',
      icon: <Zap size={32} className="text-blue-500" />,
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      btnColor: 'text-blue-600 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-400'
    },
    {
      id: 'calc-finishing',
      title: 'Отделка',
      description: 'Плитка, обои, ламинат, штукатурка и шпаклевка.',
      icon: <PaintRoller size={32} className="text-green-500" />,
      color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      btnColor: 'text-green-600 bg-green-100 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-400'
    },
    {
      id: 'calc-construction',
      title: 'Строительство',
      description: 'Расчет лестниц, стяжки, арок и других конструкций.',
      icon: <HardHat size={32} className="text-orange-500" />,
      color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
      btnColor: 'text-orange-600 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-400'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 animate-fade-in bg-gray-50/50 dark:bg-[#0f172a]/50">
      <div className="max-w-4xl mx-auto pb-20">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Инженерные калькуляторы</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Выберите раздел для точного расчета материалов и работ.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {calculators.map((calc) => (
            <div 
              key={calc.id}
              onClick={() => onNavigate(calc.id)}
              className={`p-6 rounded-2xl border shadow-sm flex flex-col cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-md ${calc.color}`}
            >
              <div className="w-14 h-14 bg-white dark:bg-[#1e293b] rounded-xl flex items-center justify-center shadow-sm mb-4">
                {calc.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{calc.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 flex-1">{calc.description}</p>
              
              <div className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-between mt-auto transition ${calc.btnColor}`}>
                Перейти <ArrowRight size={16} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}