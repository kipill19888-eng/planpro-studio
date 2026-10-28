import { useState, useRef } from 'react';
import { useProjectsStore } from '../storeProjects';
import { useGalleryStore } from '../storeGallery';
import { useHouseStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { Folder, Plus, ArrowRight, Trash2, Camera, X } from 'lucide-react';
import { useToastStore } from '../storeToast';

export default function ProjectsPage() {
  const { projects, activeProjectId, setActiveProject, addProject, removeProject } = useProjectsStore();
  const { projectRooms } = useHouseStore();
  const { getPhotos, addPhoto, removePhoto } = useGalleryStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const [activeUpload, setActiveUpload] = useState(null); // { projectId, type }

  const handleCreateProject = () => {
    const name = prompt('Введите название нового проекта:', 'Новый проект');
    if (name) {
      addProject(name);
    }
  };

  const handleOpenProject = (id) => {
    setActiveProject(id);
    navigate('/project');
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (projects.length === 1) {
      addToast('Нельзя удалить единственный проект', 'error');
      return;
    }
    if (window.confirm('Удалить проект? Все данные будут потеряны.')) {
      removeProject(id);
    }
  };

  // Открываем диалог выбора файла
  const handleAddPhotoClick = (projectId, type) => {
    setActiveUpload({ projectId, type });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeUpload) return;

    if (!file.type.startsWith('image/')) {
      addToast('Выберите файл изображения', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      addPhoto(activeUpload.projectId, activeUpload.type, reader.result);
      addToast(`Фото добавлено в "${activeUpload.type === 'before' ? 'До' : 'После'}"`, 'success');
      setActiveUpload(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 animate-fade-in">
      <div className="max-w-6xl mx-auto pb-20">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Folder className="text-primary" size={32} /> Мои проекты
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Альбом работ, фото «До/После» и переход к планировке.
            </p>
          </div>
          <button
            onClick={handleCreateProject}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
          >
            <Plus size={20} /> Новый проект
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => {
            const rooms = projectRooms[project.id] || [];
            const beforePhotos = getPhotos(project.id, 'before');
            const afterPhotos = getPhotos(project.id, 'after');

            return (
              <div
                key={project.id}
                className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition"
              >
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-[#0f172a]/50 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{project.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {rooms.length > 0 ? `Комнат: ${rooms.length}` : 'Нет комнат'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, project.id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="p-5 flex-1 flex flex-col gap-4">
                  {/* ДО */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Фото «До»</span>
                      <button
                        onClick={() => handleAddPhotoClick(project.id, 'before')}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <Camera size={14} /> Добавить
                      </button>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {beforePhotos.length === 0 ? (
                        <div className="w-full h-16 bg-gray-100 dark:bg-[#0f172a] rounded-lg border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs text-gray-400">
                          Нет фото
                        </div>
                      ) : (
                        beforePhotos.map((url, i) => (
                          <div key={i} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden group">
                            <img src={url} alt="Before" className="w-full h-full object-cover" />
                            <button
                              onClick={() => removePhoto(project.id, 'before', i)}
                              className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* ПОСЛЕ */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Фото «После»</span>
                      <button
                        onClick={() => handleAddPhotoClick(project.id, 'after')}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <Camera size={14} /> Добавить
                      </button>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {afterPhotos.length === 0 ? (
                        <div className="w-full h-16 bg-gray-100 dark:bg-[#0f172a] rounded-lg border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs text-gray-400">
                          Нет фото
                        </div>
                      ) : (
                        afterPhotos.map((url, i) => (
                          <div key={i} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden group">
                            <img src={url} alt="After" className="w-full h-full object-cover" />
                            <button
                              onClick={() => removePhoto(project.id, 'after', i)}
                              className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-[#0f172a]/50">
                  <button
                    onClick={() => handleOpenProject(project.id)}
                    className="w-full py-2 bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center justify-center gap-2 text-sm"
                  >
                    Открыть 3D-модель <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Один скрытый input, общий для всех карточек */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
}