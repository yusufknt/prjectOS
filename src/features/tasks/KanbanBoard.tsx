import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle,
  AlertCircle
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';

export const KanbanBoard: React.FC = () => {
  const { tasks, addTask, updateTaskStatus, deleteTask } = useProjectStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      project_id: 'global',
      title: newTaskTitle.trim(),
      description: '',
      status: 'todo',
      priority: 'medium',
    });

    setNewTaskTitle('');
  };

  const todoTasks = tasks.filter((t) => t.status !== 'done');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center space-x-2.5">
            <CheckSquare className="w-6 h-6 text-blue-500" />
            <span>Yapılacaklar & Notlar</span>
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Projeleriniz için genel not defteri ve yapılacaklar listesi
          </p>
        </div>
      </div>

      {/* Quick Add Bar (Apple Reminders Style) */}
      <form
        onSubmit={handleCreateTask}
        className="flex items-center space-x-3 p-2 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-neutral-200/80 dark:border-neutral-800 shadow-sm"
      >
        <div className="pl-3 text-neutral-400">
          <Plus className="w-5 h-5 text-blue-500" />
        </div>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Yeni yapılacak veya not ekle (Enter)..."
          className="flex-1 py-2 bg-transparent text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!newTaskTitle.trim()}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-sm"
        >
          Ekle
        </button>
      </form>

      {/* Todo Tasks List */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-1">
          Yapılacaklar ({todoTasks.length})
        </h3>

        {todoTasks.map((task) => (
          <div
            key={task.id}
            className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between space-x-3 hover:border-blue-500/40 transition-all shadow-sm group"
          >
            <div
              onClick={() => updateTaskStatus(task.id, 'done')}
              className="flex items-center space-x-3.5 flex-1 cursor-pointer min-w-0"
            >
              <button
                type="button"
                className="w-5 h-5 rounded-full border-2 border-neutral-300 dark:border-neutral-600 hover:border-blue-500 flex items-center justify-center transition-colors"
              />
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                {task.title}
              </span>
            </div>

            <button
              onClick={() => deleteTask(task.id)}
              className="p-1.5 rounded-xl hover:bg-rose-500/10 text-neutral-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
              title="Sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {todoTasks.length === 0 && (
          <div className="py-10 text-center rounded-2xl bg-white/50 dark:bg-[#1C1C1E]/50 border border-neutral-200/50 dark:border-neutral-800/50">
            <CheckSquare className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
            <p className="text-xs text-neutral-500">Bekleyen yapılacak görev yok.</p>
          </div>
        )}
      </div>

      {/* Completed Tasks List */}
      {doneTasks.length > 0 && (
        <div className="space-y-2 pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-1">
            Tamamlananlar ({doneTasks.length})
          </h3>

          {doneTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-2xl bg-neutral-100/60 dark:bg-[#141416] border border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between space-x-3 group"
            >
              <div
                onClick={() => updateTaskStatus(task.id, 'todo')}
                className="flex items-center space-x-3.5 flex-1 cursor-pointer min-w-0"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 line-through truncate">
                  {task.title}
                </span>
              </div>

              <button
                onClick={() => deleteTask(task.id)}
                className="p-1.5 rounded-xl hover:bg-rose-500/10 text-neutral-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                title="Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
