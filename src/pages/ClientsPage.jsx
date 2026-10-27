import { useState } from 'react';
import { Users, Plus, Trash2, Phone, MapPin, X, Edit2 } from 'lucide-react';
import { useClientsStore } from '../storeClients';
import { useToastStore } from '../storeToast';

export default function ClientsPage() {
  const { clients, addClient, removeClient, updateClient } = useClientsStore();
  const { addToast } = useToastStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Введите имя клиента', 'error');
      return;
    }

    if (editingId) {
      updateClient(editingId, formData);
      addToast('Данные клиента обновлены');
    } else {
      addClient(formData);
      addToast('Клиент добавлен');
    }

    setFormData({ name: '', phone: '', address: '' });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (client) => {
    setFormData({ name: client.name, phone: client.phone, address: client.address });
    setEditingId(client.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Удалить клиента?')) {
      removeClient(id);
      addToast('Клиент удален');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 animate-fade-in">
      <div className="max-w-4xl mx-auto pb-20">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Users className="text-primary" size={32} /> Клиенты
            </h1>
            <p className="text-gray-500 mt-2">База ваших заказчиков и адресов объектов.</p>
          </div>
          <button 
            onClick={() => { setIsFormOpen(true); setEditingId(null); setFormData({name:'', phone:'', address:''}); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
          >
            <Plus size={18} /> Новый клиент
          </button>
        </div>

        {isFormOpen && (
          <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm mb-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-800">
                {editingId ? 'Редактировать клиента' : 'Новый клиент'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-red-500">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Имя клиента *</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-primary outline-none"
                  placeholder="Иван Иванов"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                <input 
                  type="text" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-primary outline-none"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Адрес объекта</label>
                <input 
                  type="text" 
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-primary outline-none"
                  placeholder="ул. Ленина, д. 12"
                />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button type="submit" className="px-6 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 transition">
                  {editingId ? 'Сохранить изменения' : 'Добавить клиента'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {clients.length === 0 ? (
            <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center">
              <Users size={48} className="mb-4 opacity-30" />
              <p className="text-lg font-medium">Список клиентов пуст</p>
              <p className="text-sm mt-1">Нажмите «Новый клиент», чтобы добавить первого заказчика.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 font-semibold text-sm">Имя</th>
                  <th className="py-3 px-4 font-semibold text-sm">Контакты</th>
                  <th className="py-3 px-4 font-semibold text-sm">Объект</th>
                  <th className="py-3 px-4 font-semibold text-sm w-24 text-center">Действия</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-bold text-gray-800 text-sm">{client.name}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {client.phone ? (
                        <span className="flex items-center gap-2"><Phone size={14} className="text-gray-400"/> {client.phone}</span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {client.address ? (
                        <span className="flex items-center gap-2"><MapPin size={14} className="text-gray-400"/> {client.address}</span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(client)} className="text-gray-400 hover:text-primary transition p-1">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(client.id)} className="text-gray-400 hover:text-red-500 transition p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}