import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 animate-fade-in">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-8 md:p-12 mb-20">
        
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition mb-8"
        >
          <ArrowLeft size={16} /> Вернуться назад
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <ShieldAlert className="text-primary" size={32} /> 
          Пользовательское соглашение
        </h1>
        <p className="text-sm text-gray-400 mb-8">Последнее обновление: 26 октября 2026 г.</p>

        <div className="prose prose-sm md:prose-base prose-gray max-w-none space-y-6">
          
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">1. Общие положения</h2>
            <p className="text-gray-600">
              Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между администрацией сервиса <strong>PlanPro Studio</strong> (далее — «Сервис») и любым лицом, использующим Сервис (далее — «Пользователь»).
            </p>
            <p className="text-gray-600 mt-2">
              Используя Сервис (включая калькуляторы, 3D-планировщик и формирование смет), Пользователь подтверждает, что ознакомился с условиями настоящего Соглашения и принимает их в полном объеме.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">2. Отказ от ответственности за расчеты</h2>
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-800 mb-4 font-medium">
              Внимание! Все расчеты, выполняемые Сервисом, носят исключительно ознакомительный и рекомендательный характер.
            </div>
            <p className="text-gray-600">
              Администрация Сервиса <strong>не несет ответственности</strong> за:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-600">
              <li>Любые прямые или косвенные убытки, возникшие в результате использования или невозможности использования результатов расчетов.</li>
              <li>Неточности, ошибки или несоответствия в расчетах, возникшие из-за неправильно введенных данных, ошибок в формулах или программных сбоев.</li>
              <li>Последствия закупки материалов или выполнения строительных работ на основе смет, сформированных в Сервисе.</li>
            </ul>
            <p className="text-gray-600 mt-3">
              Перед началом закупки материалов и проведением ремонтных работ Пользователь обязан самостоятельно перепроверить все расчеты или обратиться к квалифицированному специалисту.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">3. Использование Сервиса</h2>
            <p className="text-gray-600">
              Пользователь обязуется использовать Сервис только в законных целях. Запрещается пытаться взломать Сервис, нарушать его работу или использовать его для распространения вредоносного кода.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">4. Интеллектуальная собственность</h2>
            <p className="text-gray-600">
              Весь исходный код, дизайн, логотипы и алгоритмы Сервиса являются интеллектуальной собственностью Администрации. Любое копирование, распространение или коммерческое использование материалов Сервиса без письменного разрешения запрещено.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">5. Изменение условий</h2>
            <p className="text-gray-600">
              Администрация оставляет за собой право в любое время изменять условия настоящего Соглашения. Новая редакция вступает в силу с момента ее публикации на сайте. Продолжение использования Сервиса после публикации изменений означает согласие Пользователя с новыми условиями.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}