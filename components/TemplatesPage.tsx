
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout, ShoppingBag, MessageSquare, Wallet, Smartphone, Globe, ArrowRight, Zap, Code2, LayoutDashboard } from 'lucide-react';

interface TemplatesPageProps {
  onUseTemplate: (prompt: string, platform: 'web' | 'mobile') => void;
}

interface Template {
  id: string;
  title: string;
  desc: string;
  category: 'saas' | 'ecommerce' | 'mobile' | 'landing';
  platform: 'web' | 'mobile';
  prompt: string;
  icon: React.ReactNode;
  color: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'saas-dashboard',
    title: 'Modern SaaS Dashboard',
    desc: 'Analytics dashboard with sidebar navigation, charts, data tables, and user settings profile.',
    category: 'saas',
    platform: 'web',
    color: 'bg-blue-500',
    icon: <LayoutDashboard size={24} className="text-blue-400" />,
    prompt: "Build a modern SaaS dashboard. Features: 1) Sidebar navigation (Overview, Analytics, Customers, Settings). 2) Overview page with 4 stats cards (Revenue, Users, Active, Churn) and a large line chart area. 3) Recent Activity feed. 4) Top Customers table. 5) Glassmorphism effects on cards, dark mode UI, Inter font. Use Recharts for data visualization."
  },
  {
    id: 'ecommerce-store',
    title: 'E-commerce Storefront',
    desc: 'Sleek product listing with filtering, search, shopping cart drawer, and product details.',
    category: 'ecommerce',
    platform: 'web',
    color: 'bg-purple-500',
    icon: <ShoppingBag size={24} className="text-purple-400" />,
    prompt: "Create a sleek, high-end e-commerce store. Features: 1) Minimalist header with cart icon badge. 2) Hero section with large lifestyle image and CTA. 3) Product grid with filter sidebar (Category, Price, Color). 4) Product cards with hover effects (Quick View). 5) Shopping cart drawer overlay. 6) Modern typography, whitespace-heavy design."
  },
  {
    id: 'ai-chat',
    title: 'AI Chat Interface',
    desc: 'ChatGPT-style interface with message history, markdown support, and model switching.',
    category: 'saas',
    platform: 'web',
    color: 'bg-green-500',
    icon: <MessageSquare size={24} className="text-green-400" />,
    prompt: "Build an AI Chat interface similar to ChatGPT. Features: 1) Left sidebar for chat history (collapsible). 2) Main chat area with auto-scrolling. 3) Message bubbles: User (blue right), AI (gray left) with Markdown rendering support. 4) Sticky bottom input area with send button and attachment icon. 5) Model selector dropdown at top."
  },
  {
    id: 'crypto-wallet',
    title: 'Mobile Crypto Wallet',
    desc: 'Mobile-first wallet dashboard with asset tracking, send/receive flows, and transaction history.',
    category: 'mobile',
    platform: 'mobile',
    color: 'bg-orange-500',
    icon: <Wallet size={24} className="text-orange-400" />,
    prompt: "Design a mobile crypto wallet app. Features: 1) Total Balance card with percentage change. 2) Action buttons: Send, Receive, Swap, Buy. 3) Asset list (Bitcoin, Ethereum, Solana) with mini sparkline charts and current price. 4) Transaction history list below. 5) Bottom tab navigation. Dark theme with neon accents."
  },
  {
    id: 'social-feed',
    title: 'Social Media Feed',
    desc: 'Instagram-style feed with stories, infinite scroll posts, likes, comments, and profile view.',
    category: 'mobile',
    platform: 'mobile',
    color: 'bg-pink-500',
    icon: <Smartphone size={24} className="text-pink-400" />,
    prompt: "Create a social media feed app. Features: 1) Top bar with Stories circles. 2) Main feed of posts (User avatar, Image/Video, Action buttons: Heart, Comment, Share). 3) Caption and comment section preview. 4) Bottom tab bar (Home, Search, Reels, Shop, Profile). Modern, clean aesthetic."
  },
  {
    id: 'landing-page',
    title: 'SaaS Landing Page',
    desc: 'High-conversion landing page with hero, features, testimonials, pricing, and newsletter.',
    category: 'landing',
    platform: 'web',
    color: 'bg-indigo-500',
    icon: <Globe size={24} className="text-indigo-400" />,
    prompt: "Build a high-conversion SaaS landing page. Features: 1) Hero section with headline, subheadline, 2 CTA buttons, and a 3D-style app mockup image. 2) Logo ticker of trusted companies. 3) Feature grid (bento style) with icons. 4) Testimonials carousel. 5) Pricing table (Monthly/Yearly toggle). 6) Footer with links. Use Framer Motion for scroll animations."
  }
];

export const TemplatesPage: React.FC<TemplatesPageProps> = ({ onUseTemplate }) => {
  const [filter, setFilter] = useState<'all' | 'saas' | 'ecommerce' | 'mobile' | 'landing'>('all');

  const filteredTemplates = filter === 'all' 
    ? TEMPLATES 
    : TEMPLATES.filter(t => t.category === filter);

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-black custom-scrollbar text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Start with a Template</h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Don't start from scratch. Choose a professionally designed template and customize it to fit your needs in seconds.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {['all', 'saas', 'ecommerce', 'mobile', 'landing'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-all whitespace-nowrap ${
                filter === cat 
                  ? 'bg-white text-black' 
                  : 'bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {cat === 'all' ? 'All Templates' : cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative bg-zinc-900 border border-zinc-800 rounded-[24px] overflow-hidden hover:border-zinc-700 transition-all shadow-lg hover:shadow-xl"
            >
              <div className="p-8 h-full flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center border border-zinc-700 group-hover:scale-110 transition-transform">
                        {template.icon}
                    </div>
                    <div className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-bold uppercase tracking-wider text-zinc-400 border border-zinc-700">
                        {template.platform}
                    </div>
                </div>

                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{template.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-8 flex-1">
                    {template.desc}
                </p>

                <button
                    onClick={() => onUseTemplate(template.prompt, template.platform)}
                    className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
                >
                    <Zap size={16} className="fill-black" />
                    Use Template
                </button>
              </div>

              {/* Decorative Gradient Blob */}
              <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity ${template.color}`} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
