import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { KanbanBoard } from './features/tasks/KanbanBoard';
import { NotesEditor } from './features/notes/NotesEditor';
import { TimelineView } from './features/timeline/TimelineView';
import { useProjectStore } from './store/projectStore';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const loadInitialData = useProjectStore((state) => state.loadInitialData);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            onNavigate={setActiveTab}
            onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
          />
        );
      case 'projects':
        return (
          <ProjectsPage
            onNavigate={setActiveTab}
            isNewModalOpen={isNewProjectModalOpen}
            onCloseNewModal={() => setIsNewProjectModalOpen(false)}
            onOpenNewModal={() => setIsNewProjectModalOpen(true)}
          />
        );
      case 'tasks':
        return <KanbanBoard />;
      case 'notes':
        return <NotesEditor />;
      case 'timeline':
        return <TimelineView />;
      default:
        return (
          <DashboardPage
            onNavigate={setActiveTab}
            onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FBFBFD] dark:bg-[#0D0D0E] text-[#1D1D1F] dark:text-[#F5F5F7] selection:bg-blue-500 selection:text-white">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette onNavigate={setActiveTab} />
    </div>
  );
};

export default App;
