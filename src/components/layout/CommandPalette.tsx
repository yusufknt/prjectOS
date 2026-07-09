import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Folder, 
  CheckSquare, 
  FileText, 
  X, 
  ArrowRight 
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { NavTab } from './Sidebar';

interface CommandPaletteProps {
  onNavigate: (tab: NavTab) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onNavigate }) => {
  const { 
    isCommandPaletteOpen, 
    setCommandPaletteOpen, 
    projects, 
    tasks, 
    notes, 
    selectProject 
  } = useProjectStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase()) ||
      p.local_path.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase())
  );

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.content.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectProject = (projectId: string) => {
    selectProject(projectId);
    onNavigate('dashboard');
    setCommandPaletteOpen(false);
    setQuery('');
  };

  const handleSelectTask = (projectId: string) => {
    selectProject(projectId);
    onNavigate('tasks');
    setCommandPaletteOpen(false);
    setQuery('');
  };

  const handleSelectNote = (projectId: string) => {
    selectProject(projectId);
    onNavigate('notes');
    setCommandPaletteOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-apple-lg border border-neutral-200/80 dark:border-neutral-800 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-neutral-200/60 dark:border-neutral-800/60">
          <Search className="w-5 h-5 text-neutral-400 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Proje, görev, not veya yerel dizin ara..."
            className="w-full bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Projects Section */}
          {filteredProjects.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Projeler ({filteredProjects.length})
              </div>
              <div className="space-y-1">
                {filteredProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleSelectProject(project.id)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-all text-left"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                        <Folder className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                          {project.name}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono truncate">
                          {project.local_path}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Section */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Görevler ({filteredTasks.length})
              </div>
              <div className="space-y-1">
                {filteredTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleSelectTask(task.project_id)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-all text-left"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                        <CheckSquare className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                          {task.title}
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate">
                          {task.description}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                      Göreve Git
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes Section */}
          {filteredNotes.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Notlar ({filteredNotes.length})
              </div>
              <div className="space-y-1">
                {filteredNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => handleSelectNote(note.project_id)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-all text-left"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                          {note.title}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                      Notu Aç
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredProjects.length === 0 &&
            filteredTasks.length === 0 &&
            filteredNotes.length === 0 && (
              <div className="py-12 text-center text-xs text-neutral-400">
                "{query}" ile eşleşen proje, görev veya not bulunamadı.
              </div>
            )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-5 py-3 bg-neutral-50 dark:bg-[#141416] border-t border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-500">
          <div className="flex items-center space-x-4">
            <span>Yön tuşları ile gezin</span>
            <span>Esc ile çık</span>
          </div>
          <span>ProjectOS Hızlı Arama</span>
        </div>
      </div>
    </div>
  );
};
