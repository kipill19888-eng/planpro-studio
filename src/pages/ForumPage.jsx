import { useState } from 'react';
import { MessageSquare, Plus, ArrowLeft, Send, Trash2, Tag } from 'lucide-react';
import { useForumStore } from '../storeForum';
import { useUserStore } from '../storeUser';
import { useToastStore } from '../storeToast';

const categories = ['Вопросы', 'Идеи', 'Покажите ремонт'];

export default function ForumPage() {
  const { topics, addTopic, addMessage, deleteTopic } = useForumStore();
  const { userName } = useUserStore();
  const { addToast } = useToastStore();

  const [activeTopicId, setActiveTopicId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Форма создания темы
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState('Вопросы');

  // Форма ответа
  const [replyText, setReplyText] = useState('');

  const activeTopic = topics.find(t => t.id === activeTopicId);

  const handleCreateTopic = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) {
      addToast('Заполните заголовок и текст', 'error');
      return;
    }
    const newId = addTopic(newTitle, newText, newCategory, userName);
    addToast('Тема создана!', 'success');
    setNewTitle('');
    setNewText('');
    setIsCreating(false);
    setActiveTopicId(newId);
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    addMessage(activeTopicId, replyText, userName);
    setReplyText('');
    addToast('Ответ добавлен');
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  // === ПРОСМОТР ТЕМЫ ===
  if (activeTopic) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setActiveTopicId(null)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-6 transition"
          >
            <ArrowLeft size={16} /> Назад к списку тем
          </button>

          <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-6">
            <div className="p-5 md:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f172a]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  {activeTopic.category}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">{activeTopic.title}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Автор: {activeTopic.author} • {formatDate(activeTopic.createdAt)}</p>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {activeTopic.messages.map((msg, idx) => (
                <div key={msg.id} className="p-4 md:p-6 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {msg.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-gray-900 dark:text-white">{msg.author}</span>
                      <span className="text-[10px] text-gray-400">{formatDate(msg.createdAt)}</span>
                      {idx === 0 && <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">Автор темы</span>}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Форма ответа */}
          <form onSubmit={handleSendReply} className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Написать ответ..."
              className="flex-1 p-3 bg-gray-50 dark:bg-[#0f172a] border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary outline-none text-sm text-gray-900 dark:text-white"
            />
            <button type="submit" className="px-5 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2">
              <Send size={16} /> <span className="hidden md:inline">Отправить</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // === СПИСОК ТЕМ ===
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <MessageSquare className="text-primary" size={32} /> Форум
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Обсуждайте ремонт, делитесь опытом и задавайте вопросы.</p>
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-md w-full md:w-auto justify-center"
          >
            <Plus size={18} /> {isCreating ? 'Отменить' : 'Новая тема'}
          </button>
        </div>

        {/* Форма создания темы */}
        {isCreating && (
          <form onSubmit={handleCreateTopic} className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4 md:p-6 mb-8 space-y-4 animate-fade-in">
            <h3 className="font-bold text-gray-900 dark:text-white">Создать новую тему</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Заголовок</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full p-2.5 border rounded-md bg-white dark:bg-[#0f172a] border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="О чем хотите спросить?" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Категория</label>
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full p-2.5 border rounded-md bg-white dark:bg-[#0f172a] border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Сообщение</label>
                <textarea value={newText} onChange={(e) => setNewText(e.target.value)} rows={4} className="w-full p-2.5 border rounded-md bg-white dark:bg-[#0f172a] border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white resize-none" placeholder="Опишите вашу ситуацию..." />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 transition">Опубликовать</button>
            </div>
          </form>
        )}

        {/* Список тем */}
        <div className="space-y-3">
          {topics.length === 0 ? (
            <div className="text-center py-20 text-gray-400 bg-white dark:bg-[#1e293b] rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
              <p>Пока нет ни одной темы. Создайте первую!</p>
            </div>
          ) : (
            topics.map(topic => (
              <div 
                key={topic.id}
                onClick={() => setActiveTopicId(topic.id)}
                className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary/50 transition cursor-pointer group"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Tag size={12} className="text-blue-500" />
                      <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">{topic.category}</span>
                    </div>
                    <h3 className="font-bold text-base md:text-lg text-gray-900 dark:text-white group-hover:text-primary transition mb-1">{topic.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Автор: <span className="font-medium text-gray-700 dark:text-gray-300">{topic.author}</span> • {formatDate(topic.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 dark:bg-[#0f172a] px-2 py-1 rounded-md">
                      <MessageSquare size={12} /> {topic.messages.length}
                    </div>
                    {topic.author === userName && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteTopic(topic.id); }}
                        className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                        title="Удалить тему"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}