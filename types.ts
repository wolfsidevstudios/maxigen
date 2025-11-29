

export type Platform = 'mobile' | 'web';

export type GenerationMode = 'default' | 'redesign' | 'copy' | 'agentic' | 'team';

export type ViewMode = 'design' | 'prototype' | 'deploy';

export type AIModel = 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gemini-3-pro-preview';

export interface EdgeFunction {
  name: string;
  trigger: 'http' | 'schedule' | 'db_event';
  code: string; // Node.js serverless code
  description: string;
}

export interface ProjectFile {
    path: string; // e.g., "src/components/Button.tsx"
    content: string;
}

export interface ProjectPlan {
  title: string;
  targetAudience: string;
  features: string[];
  techStack: string[];
  fileStructureSummary: string[];
  colorPalette: string[];
}

export interface GeneratedApp {
  reactNativeCode: string; // Legacy field, now used as fallback or main entry
  webCompatibleCode: string; // Single-file preview version
  files?: ProjectFile[]; // New Multi-file structure
  explanation: string;
  name: string;
  platform: Platform;
  icon?: string; // SVG String
  edgeFunctions?: EdgeFunction[];
}

export interface Agent {
  name: string;
  role: string;
  avatar: string;
  color: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  appData?: GeneratedApp;
  plan?: ProjectPlan; // New Plan field
  attachment?: string; // Base64 image
  timestamp: number;
  sources?: { title: string; uri: string }[];
  suggestedIntegrations?: string[];
  agent?: Agent; // Agent persona if applicable
}

export enum AppState {
  IDLE = 'IDLE',
  PLANNING = 'PLANNING', // New State
  GENERATING = 'GENERATING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

export interface CanvasApp {
  id: string;
  data: GeneratedApp;
  x: number;
  y: number;
  zIndex: number;
}

export interface BuildJob {
  id: string;
  status: string;
  logs: string[];
  buildUrl?: string;
  createdAt: number;
}

export type Page = 'marketing' | 'home' | 'projects' | 'settings' | 'build' | 'templates';

export interface UserProfile {
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string;
  credits: number;
}

export interface Project {
  id: string;
  name: string;
  platform: Platform;
  lastEdited: string;
  icon?: string;
}