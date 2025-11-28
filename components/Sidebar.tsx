
import React from 'react';
import { Home, Layers, Clock, Settings, Zap, Plus, Hammer, LayoutTemplate } from 'lucide-react';
import { Page, Project } from '../types';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  recentProjects: Project[];
  onNewProject: () => void;
  credits: number;
}

// Deterministic Abstract Icon Generator based on string hash
const GeneratedIcon: React.FC<{ name: string }> = ({ name }) => {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate colors from hash
    const c1 = `hsl(${Math.abs(hash) % 360}, 70%, 60%)`;
    const c2 = `hsl(${Math.abs(hash >> 8) % 360}, 70%, 60%)`;
    
    // Choose a shape type
    const type = Math.abs(hash) % 3;

    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-lg bg-zinc-800">
            {type === 0 && <circle cx="12" cy="12" r="6" fill={c1} fillOpacity="0.5" />}
            {type === 1 && <rect x="8" y="8" width="8" height="8" rx="2" fill={c2} fillOpacity="0.5" />}
            {type === 2 && <path d="M12 6L17 18H7L12 6Z" fill={c1} fillOpacity="0.5" />}
        </svg>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, recentProjects, onNewProject, credits }) => {
  return (
    <div className="w-[60px] md:w-[72px] h-screen bg-black border-r border-zinc-800 flex flex-col items-center py-6 z-50 flex-shrink-0">
      {/* Logo */}
      <div className="mb-6 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/10 cursor-pointer" onClick={() => onNavigate('home')}>
        <Zap size={20} className="fill-black text-black" />
      </div>

      {/* New Project Button */}
      <button 
        onClick={onNewProject}
        className="mb-6 p-3 bg-zinc-900 text-white rounded-xl shadow-md border border-zinc-800 hover:bg-zinc-800 hover:scale-105 transition-all active:scale-95"
        title="New Project"
      >
        <Plus size={24} />
      </button>

      {/* Main Nav */}
      <div className="flex flex-col gap-6 w-full items-center">
        <button 
            onClick={() => onNavigate('home')}
            className={`p-3 rounded-xl transition-all ${activePage === 'home' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
            title="Design Home"
        >
            <Home size={24} strokeWidth={activePage === 'home' ? 2.5 : 2} />
        </button>
        <button 
            onClick={() => onNavigate('templates')}
            className={`p-3 rounded-xl transition-all ${activePage === 'templates' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
            title="Templates"
        >
            <LayoutTemplate size={24} strokeWidth={activePage === 'templates' ? 2.5 : 2} />
        </button>
        <button 
            onClick={() => onNavigate('build')}
            className={`p-3 rounded-xl transition-all ${activePage === 'build' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
            title="Build & Deploy"
        >
            <Hammer size={24} strokeWidth={activePage === 'build' ? 2.5 : 2} />
        </button>
        <button 
            onClick={() => onNavigate('projects')}
            className={`p-3 rounded-xl transition-all ${activePage === 'projects' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
            title="My Projects"
        >
            <Layers size={24} strokeWidth={activePage === 'projects' ? 2.5 : 2} />
        </button>
      </div>

      {/* Recent Projects Separator */}
      <div className="w-8 h-px bg-zinc-800 my-6"></div>

      {/* Recent Projects (Icons) */}
      <div className="flex flex-col gap-4 w-full items-center flex-1 overflow-y-auto custom-scrollbar">
        {recentProjects.slice(0, 5).map(project => (
            <button key={project.id} className="group relative w-10 h-10" title={project.name}>
                {project.icon ? (
                    <div 
                        className="w-full h-full rounded-lg bg-zinc-900 border border-zinc-800 p-1 hover:border-zinc-700 transition-colors"
                        dangerouslySetInnerHTML={{ __html: project.icon }} 
                    />
                ) : (
                    <GeneratedIcon name={project.name} />
                )}
                
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50 shadow-lg border border-zinc-700">
                    {project.name}
                </div>
            </button>
        ))}
        {recentProjects.length === 0 && (
            <div className="text-zinc-700">
                <Clock size={20} />
            </div>
        )}
      </div>

      {/* Credits Indicator */}
      <div className="mt-auto mb-4 w-full px-2 flex flex-col items-center">
          <div className="bg-zinc-900 rounded-lg p-2 w-full flex flex-col items-center border border-zinc-800">
              <Zap size={16} className={credits > 0 ? "text-yellow-400 fill-yellow-400" : "text-zinc-600"} />
              <span className="text-[10px] font-bold mt-1 text-zinc-300">{credits}</span>
          </div>
      </div>

      {/* Settings */}
      <button 
        onClick={() => onNavigate('settings')}
        className={`mb-2 p-3 rounded-xl transition-all ${activePage === 'settings' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
      >
        <Settings size={24} />
      </button>
    </div>
  );
};
