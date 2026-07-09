import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Search, 
  CloudUpload,
  CloudDownload,
  Cloud,
  CheckCircle2,
  ExternalLink,
  Settings,
  X
} from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useProjectStore } from '../../store/projectStore';
import { githubSyncService } from '../../services/githubSync';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { 
    projects, 
    selectedProjectId, 
    syncToCloud,
    syncFromCloud,
    setCommandPaletteOpen 
  } = useProjectStore();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);

  // Cloud Settings state
  const [token, setToken] = useState('');
  const [gistId, setGistId] = useState('');

  useEffect(() => {
    const settings = githubSyncService.getSettings();
    if (settings.token) setToken(settings.token);
    if (settings.gistId) setGistId(settings.gistId);
  }, [isCloudModalOpen]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handlePushToCloud = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    const res = await syncToCloud();
    setIsSyncing(false);
    setSyncMessage(res.message);
    setTimeout(() => setSyncMessage(null), 4000);
  };

  const handlePullFromCloud = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    const res = await syncFromCloud();
    setIsSyncing(false);
    setSyncMessage(res.message);
    setTimeout(() => setSyncMessage(null), 4000);
  };

  const handleSaveCloudSettings = (e: React.FormEvent) => {
    e.preventDefault();
    githubSyncService.saveSettings({ token: token.trim(), gistId: gistId.trim() });
    setIsCloudModalOpen(false);
  };

  return (
    <>
      <header className="h-16 px-6 glass-header flex items-center justify-between z-10 select-none">
        {/* Left: Project Info */}
        <div className="flex items-center space-x-4 min-w-0">
          {selectedProject ? (
            <div className="flex items-center space-x-3 min-w-0">
              <div className="min-w-0">
                <div className="flex items-center space-x-2.5">
                  <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {selectedProject.name}
                  </h2>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      selectedProject.pushed
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {selectedProject.pushed ? 'GitHub’a Pushlandı ✅' : 'Push Bekliyor ⏳'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                  <span className="truncate">{selectedProject.description || 'Not eklenmemiş.'}</span>
                  {selectedProject.repository && (
                    <a
                      href={selectedProject.repository}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-500 transition-colors flex items-center space-x-0.5 ml-1"
                      title="GitHub Deposu"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm font-medium text-neutral-500">
              ProjectOS — Proje & Not Takip
            </div>
          )}
        </div>

        {/* Sync message banner if active */}
        {syncMessage && (
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center space-x-2.5">
          {/* Command Palette Trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center space-x-3 px-3.5 py-1.5 rounded-2xl bg-neutral-100 dark:bg-[#1C1C1E] border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-all shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Hızlı Ara...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded-lg bg-white dark:bg-neutral-800 text-[10px] font-mono text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
              Ctrl K
            </kbd>
          </button>

          {/* Cloud Sync Buttons */}
          <div className="flex items-center space-x-1 p-0.5 rounded-2xl bg-neutral-100 dark:bg-[#1C1C1E] border border-neutral-200/80 dark:border-neutral-800">
            <button
              onClick={handlePushToCloud}
              disabled={isSyncing}
              title="Tüm verileri GitHub Bulutuna Yükle (Push)"
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 transition-all flex items-center space-x-1.5"
            >
              <CloudUpload className={`w-3.5 h-3.5 text-blue-500 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">GitHub'a Yükle</span>
            </button>

            <button
              onClick={handlePullFromCloud}
              disabled={isSyncing}
              title="GitHub Bulutundaki Verileri İndir / Eşitle (Pull)"
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 transition-all flex items-center space-x-1.5"
            >
              <CloudDownload className={`w-3.5 h-3.5 text-emerald-500 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">Buluttan Çek</span>
            </button>

            <button
              onClick={() => setIsCloudModalOpen(true)}
              title="GitHub Eşitleme Ayarları"
              className="p-1.5 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-white dark:hover:bg-neutral-800 transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
            className="p-2 rounded-2xl bg-neutral-100 dark:bg-[#1C1C1E] border border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition-all shadow-sm"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-700" />
            )}
          </button>
        </div>
      </header>

      {/* Cloud Sync Settings Modal */}
      {isCloudModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-apple-lg border border-neutral-200/80 dark:border-neutral-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200/60 dark:border-neutral-800/60">
              <div className="flex items-center space-x-2">
                <Cloud className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  GitHub Bulut Senkronizasyonu
                </h3>
              </div>
              <button
                onClick={() => setIsCloudModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCloudSettings} className="p-6 space-y-4">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Macbook ve Windows bilgisayarınız arasında verilerinizi senkronize etmek için GitHub Personal Access Token bilginizi girebilirsiniz. Gist otomatik oluşturulacaktır.
              </p>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  GitHub Personal Access Token (PAT)
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxx..."
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 text-xs font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Mevcut Gist ID (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  value={gistId}
                  onChange={(e) => setGistId(e.target.value)}
                  placeholder="Otomatik oluşur (veya diğer bilgisayardaki ID'yi yapıştırın)"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 text-xs font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCloudModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20"
                >
                  Ayarları Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
