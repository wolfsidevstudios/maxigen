
import React, { useState } from 'react';
import { UserProfile, Project } from '../types';
import { Edit2, Grid, MapPin, Link as LinkIcon, Smartphone, Monitor, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProjectsPageProps {
  profile: UserProfile;
  projects: Project[];
  onUpdateProfile: (p: UserProfile) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ profile, projects, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);

  const handleSave = () => {
    onUpdateProfile(editForm);
    setIsEditing(false);
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-black custom-scrollbar text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 mb-16">
          {/* Avatar */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600">
            <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-zinc-900">
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col items-center md:items-start gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
                <h1 className="text-2xl font-light text-white">{profile.handle}</h1>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} className="px-4 py-1.5 bg-white text-black text-sm font-medium rounded-lg">Save</button>
                            <button onClick={() => setIsEditing(false)} className="px-4 py-1.5 bg-zinc-800 text-white text-sm font-medium rounded-lg">Cancel</button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-sm font-medium rounded-lg transition-colors">Edit Profile</button>
                    )}
                    <button className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg transition-colors"><SettingsIcon size={16} /></button>
                </div>
            </div>

            <div className="flex gap-8 text-sm md:text-base text-zinc-300">
                <div><span className="font-semibold text-white">{projects.length}</span> projects</div>
                <div><span className="font-semibold text-white">0</span> followers</div>
                <div><span className="font-semibold text-white">0</span> following</div>
            </div>

            {isEditing ? (
                <div className="w-full space-y-2">
                    <input 
                        value={editForm.name} 
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-sm text-white outline-none focus:border-white" placeholder="Name"
                    />
                    <textarea 
                        value={editForm.bio} 
                        onChange={e => setEditForm({...editForm, bio: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-sm text-white outline-none focus:border-white" placeholder="Bio"
                    />
                </div>
            ) : (
                <div className="text-center md:text-left text-sm text-zinc-400">
                    <div className="font-semibold text-white mb-1">{profile.name}</div>
                    <p className="whitespace-pre-wrap">{profile.bio}</p>
                </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-zinc-800 flex justify-center mb-6">
            <div className="flex gap-12 -mt-px">
                <button className="flex items-center gap-2 py-3 border-t border-white text-xs font-semibold tracking-widest uppercase text-white">
                    <Grid size={12} /> Posts
                </button>
                <button className="flex items-center gap-2 py-3 border-t border-transparent text-zinc-500 text-xs font-semibold tracking-widest uppercase hover:text-zinc-300 transition-colors">
                    <MapPin size={12} /> Saved
                </button>
            </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-4">
            {projects.map((project) => (
                <motion.div 
                    key={project.id} 
                    className="aspect-square bg-zinc-900 relative group overflow-hidden cursor-pointer rounded-sm border border-zinc-800"
                    whileHover={{ opacity: 0.95 }}
                >
                    {/* Placeholder for project thumbnail */}
                    <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-zinc-900">
                        {project.platform === 'web' ? <Monitor size={48} strokeWidth={1} /> : <Smartphone size={48} strokeWidth={1} />}
                    </div>
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4 text-center z-10">
                        <span className="font-bold text-sm">{project.name}</span>
                        <span className="text-xs opacity-75 mt-1">{project.lastEdited}</span>
                    </div>

                    {/* Settings Button */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button className="p-1.5 bg-black/50 text-white rounded-full hover:bg-black hover:scale-105 transition-all">
                            <Settings size={14} />
                        </button>
                    </div>
                </motion.div>
            ))}
            {projects.length === 0 && (
                <div className="col-span-full py-20 text-center text-zinc-600">
                    <div className="w-16 h-16 border-2 border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Smartphone size={32} className="text-zinc-700" />
                    </div>
                    <p>No projects yet.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

const SettingsIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
);