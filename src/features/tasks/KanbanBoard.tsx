import React, { useState } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  Circle, 
  ArrowRight, 
  ArrowLeft, 
  Trash2, 
  X,
  Flag
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { TaskStatus, TaskPriority } from '../../types';

export const KanbanBoard: React.FC = () => {
  const { projects, selectedProjectId, tasks, addTask, updateTaskStatus, deleteTask } = useProjectStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const projectTasks = selectedProjectId
    ? tasks.filter((t) => t.project_id === selectedProjectId)
    : tasks;

  const todoTasks = projectTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = projectTasks.filter((t) => t.status === 'in_progress');
  const doneTasks = projectTasks.filter((t) => t.status === 'done');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedProjectId) return;

    addTask({
      project_id: selectedProjectId,
      title,
      description,
      priority,
      status,
    });

    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('todo');
    setIsModalOpen(false);
  };

  const columns = [
    {
      id: 'todo' as TaskStatus,
      label: 'Yapılacaklar (Todo)',
      icon: Circle,
      color: 'text-neutral-500',
      bgColor: 'bg-neutral-500/10',
      items: todoTasks,
    },
    {
      id: 'in_progress' as TaskStatus,
      label: 'Devam Edenler (In Progress)',
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      items: inProgressTasks,
    },
    {
      id: 'done' as TaskStatus,
      label: 'Tamamlananlar (Done)',
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      items: doneTasks,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Kanban Görev Tahtası
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {selectedProject
              ? `"${selectedProject.name}" projesi için görev yönetimi`
              : 'Lütfen görev eklemek için sol menüden bir proje seçin'}
          </p>
        </div>

        {selectedProject && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-500/20 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Görev Ekle</span>
          </button>
        )}
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {columns.map((column) => {
          const Icon = column.icon;
          return (
            <div
              key={column.id}
              className="p-4 rounded-3xl glass-panel flex flex-col space-y-4 min-h-[480px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-2.5">
                  <div className={`p-2 rounded-xl ${column.bgColor} ${column.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    {column.label}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-200/70 dark:bg-neutral-800 text-xs font-mono font-semibold">
                  {column.items.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {column.items.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#1A1A1D] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3 group transition-all hover:shadow-apple"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">
                        {task.title}
                      </p>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 rounded-lg text-neutral-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Görevi Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg flex items-center space-x-1 ${
                          task.priority === 'high'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : task.priority === 'medium'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-neutral-500/10 text-neutral-500'
                        }`}
                      >
                        <Flag className="w-2.5 h-2.5 mr-1" />
                        <span>
                          {task.priority === 'high'
                            ? 'Yüksek Öncelik'
                            : task.priority === 'medium'
                              ? 'Orta'
                              : 'Düşük'}
                        </span>
                      </span>

                      {/* Move Buttons */}
                      <div className="flex items-center space-x-1">
                        {column.id === 'in_progress' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'todo')}
                            className="p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                            title="Yapılacaklar'a Taşı"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        )}

                        {column.id === 'done' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'in_progress')}
                            className="p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                            title="Devam Edenler'e Taşı"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        )}

                        {column.id === 'todo' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'in_progress')}
                            className="p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                            title="Devam Edenler'e Taşı"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {column.id === 'in_progress' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'done')}
                            className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                            title="Tamamlandı'ya Taşı"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {column.items.length === 0 && (
                  <div className="py-12 text-center text-xs text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
                    Bu kolonda görev yok
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-apple-lg border border-neutral-200/80 dark:border-neutral-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200/60 dark:border-neutral-800/60">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Yeni Görev Ekle
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Görev Başlığı <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Git durumunu periyodik okuma servisini bağla"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Detay / Açıklama
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Yapılacak işin detayları..."
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Öncelik
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  >
                    <option value="high">Yüksek</option>
                    <option value="medium">Orta</option>
                    <option value="low">Düşük</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Durum
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  >
                    <option value="todo">Yapılacaklar</option>
                    <option value="in_progress">Devam Edenler</option>
                    <option value="done">Tamamlandı</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-500/20"
                >
                  Görevi Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
