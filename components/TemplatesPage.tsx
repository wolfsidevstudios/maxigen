
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout, ShoppingBag, MessageSquare, Wallet, Smartphone, Globe, ArrowRight, Zap, Code2, LayoutDashboard, Copy, Check, Sparkles } from 'lucide-react';

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

interface PromptItem {
    id: number;
    title: string;
    text: string;
    tags: string[];
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

const PROMPTS: PromptItem[] = [
    { id: 1, title: "Personal Finance Tracker", tags: ["Finance", "Dashboard"], text: "Develop a personal finance tracking application that helps users manage their budget. The app should allow users to input daily expenses and income, categorize transactions (Food, Transport, Utilities), and set monthly budget limits. Include a dashboard with a doughnut chart for expense breakdown and a bar chart for monthly spending trends. The UI should be clean, using a card-based layout with soft shadows and a calming color palette." },
    { id: 2, title: "Recipe Finder & Planner", tags: ["Lifestyle", "Search"], text: "Create a recipe discovery app where users can search for meals based on ingredients they have at home. The app should display high-quality food images in a masonry grid. Clicking a recipe opens a detailed view with ingredients, step-by-step instructions, and nutritional info. Include a 'Weekly Meal Planner' feature where users can drag and drop recipes into a calendar view." },
    { id: 3, title: "Task Management Board", tags: ["Productivity", "Kanban"], text: "Build a Kanban-style task management tool similar to Trello. Users should be able to create multiple boards, add lists (To Do, In Progress, Done), and drag-and-drop task cards between lists. Each task card should support labels, due dates, and assignee avatars. The design should be modern and spacious, with a dark mode option." },
    { id: 4, title: "Fitness Workout Logger", tags: ["Health", "Mobile"], text: "Design a mobile-first workout logger for gym enthusiasts. The main screen should list the user's active workout routine with checkboxes for sets and reps. Include a timer feature for rest periods between sets. The app should also have a 'History' tab showing a calendar view of past workouts and a 'Progress' tab plotting 1RM strength gains over time." },
    { id: 5, title: "Real Estate Listing Platform", tags: ["Marketplace", "Map"], text: "Create a real estate marketplace web app. The search page should feature a split view: a list of property cards on the left and an interactive map on the right showing pins. Property cards should display price, beds/baths, and a carousel of images. Include advanced filters for price range, property type, and amenities." },
    { id: 6, title: "Language Learning Flashcards", tags: ["Education", "Gamification"], text: "Build a language learning app focused on vocabulary flashcards. The interface should be simple and focused, showing a word in the target language. Users tap to flip the card for the translation. Include 'Spaced Repetition' logic where difficult words appear more often. Add a gamification element with streaks and daily goals." },
    { id: 7, title: "Event Ticket Booking", tags: ["Ecommerce", "Events"], text: "Design an event booking platform for concerts and conferences. The homepage should feature a hero slider of trending events. The event detail page needs a date picker, a seat selection map (interactive SVG), and a checkout flow. Use a vibrant, high-energy color scheme with dark backgrounds and neon accents." },
    { id: 8, title: "Meditate & Sleep App", tags: ["Health", "Audio"], text: "Create a mindfulness and sleep aid application. The home screen should recommend daily meditations based on the time of day. Include an audio player with play/pause, seek, and background nature sounds mixer. The visual style should be extremely minimal, using soft gradients, rounded shapes, and slow, calming animations." },
    { id: 9, title: "Code Snippet Manager", tags: ["DevTool", "Utility"], text: "Build a developer tool for storing and organizing code snippets. The app needs a syntax-highlighted code editor (Monaco or similar style). Users can tag snippets by language (JS, Python, CSS) and search through them instantly. Include a 'Copy to Clipboard' button for every snippet and a dark-themed UI inspired by VS Code." },
    { id: 10, title: "Weather Forecast Dashboard", tags: ["Utility", "Data"], text: "Develop a comprehensive weather dashboard. The main view should show current conditions (temp, humidity, wind) with a large animated weather icon. Below, display a 24-hour hourly forecast scroll and a 7-day list. Use dynamic background gradients that change based on the weather condition (e.g., grey for rain, blue for sunny)." },
    { id: 11, title: "Remote Job Board", tags: ["Jobs", "List"], text: "Create a curated job board for remote work. The main list should display job cards with company logos, role titles, and tags (Full-time, Contract, Geo). Include a sticky sidebar for filtering by salary range and tech stack. The design should be professional and trustworthy, utilizing a clean grid layout." },
    { id: 12, title: "NFT Marketplace", tags: ["Web3", "Gallery"], text: "Design a futuristic NFT marketplace. The explore page should feature a grid of digital art cards with countdown timers for auctions. The detail page needs to show the bid history, creator profile, and properties of the NFT. Use a 'Cyberpunk' aesthetic with dark backgrounds, glitch effects, and neon borders." },
    { id: 13, title: "Podcast Player", tags: ["Media", "Audio"], text: "Build a web-based podcast player. The interface should have a persistent bottom player bar that continues playing while users browse episodes. The explore page should categorize podcasts by genre with square cover art. Include a 'Listen Later' playlist feature and variable playback speed controls." },
    { id: 14, title: "Travel Itinerary Planner", tags: ["Travel", "Timeline"], text: "Create a travel planning app that allows groups to collaborate on itineraries. The main view should be a timeline of the trip, broken down by day and time slots. Users can add activities, flights, and hotel reservations. Include a map view that plots all the locations for the day." },
    { id: 15, title: "Inventory Management System", tags: ["B2B", "Dashboard"], text: "Develop an inventory management dashboard for small businesses. Features include a data table of products with stock levels, low-stock alerts, and a barcode scanner input simulation. Include charts showing sales velocity and inventory value over time. The UI should be dense and data-heavy but readable." },
    { id: 16, title: "Blog / CMS Platform", tags: ["Content", "Editor"], text: "Build a minimal blogging platform. The public view should list articles with large typography and read-time estimates. The admin view needs a rich text editor (WYSIWYG) for writing posts, managing tags, and uploading cover images. Use a serif font for the body text to evoke a newspaper feel." },
    { id: 17, title: "Smart Home Controller", tags: ["IoT", "Dashboard"], text: "Design a dashboard for controlling smart home devices. The UI should be divided into rooms (Living Room, Bedroom, Kitchen). Each room card displays active devices like lights (with brightness sliders), thermostat (with temperature dial), and locks. Use a glassmorphism style to make it look modern." },
    { id: 18, title: "CRM for Sales Teams", tags: ["SaaS", "B2B"], text: "Create a Customer Relationship Management (CRM) tool. The pipeline view should allow dragging leads between stages (New, Contacted, Qualified, Won). Clicking a lead opens a modal with contact info, interaction history timeline, and notes. The aesthetic should be clean and corporate." },
    { id: 19, title: "Online Course Platform", tags: ["Education", "Video"], text: "Build an e-learning platform similar to Udemy. The course player should have a video player on the left and a lesson curriculum list on the right. Include a progress bar for course completion and a quiz module at the end of each section." },
    { id: 20, title: "Digital Whiteboard", tags: ["Collaboration", "Canvas"], text: "Develop a collaborative digital whiteboard. Users should be able to draw freehand, add sticky notes, and create shapes on an infinite canvas. Include a toolbar floating on the left with tools (Pen, Eraser, Text, Image). The UI should be minimal to maximize the drawing area." },
    { id: 21, title: "Stock Trading Simulator", tags: ["Finance", "Chart"], text: "Create a stock market simulator app. The dashboard should show a real-time (simulated) candlestick chart for selected stocks. Include a 'Buy/Sell' panel where users can execute trades with virtual money. Display a portfolio summary with daily P&L and total equity." },
    { id: 22, title: "Movie Recommendation Engine", tags: ["Entertainment", "AI"], text: "Build a movie discovery app. Users answer a few questions about their mood (e.g., 'Want to laugh?', 'On the edge of my seat?'), and the app suggests 3 movies. The movie details should include the trailer, Rotten Tomatoes score, and streaming availability." },
    { id: 23, title: "Habit Tracker", tags: ["Self-Improvement", "Grid"], text: "Design a habit tracking app inspired by GitHub's contribution graph. Users define habits (e.g., 'Drink Water', 'Read 30 mins') and check them off daily. The profile view shows a heatmap grid of consistency over the last year. Use a gamified style with badges and streaks." },
    { id: 24, title: "Food Delivery App", tags: ["Gig Economy", "Mobile"], text: "Create a food delivery app interface. The home screen should show horizontal scrolling categories (Burger, Pizza, Sushi) and a list of popular restaurants. The restaurant page lists menu items with add-on options. The checkout flow should include address selection and payment method." },
    { id: 25, title: "Customer Support Helpdesk", tags: ["SaaS", "Tickets"], text: "Build a helpdesk ticketing system. The agent view should show a list of open tickets sorted by priority. The ticket detail view allows the agent to reply via email, add internal notes, and change the ticket status. Include a sidebar with customer details and past ticket history." },
    { id: 26, title: "Influencer Marketing Platform", tags: ["Marketing", "Search"], text: "Design a platform to find Instagram influencers. The search page allows filtering by niche, follower count, and engagement rate. Search results display influencer cards with their latest 3 photos and key metrics. Include a 'Campaign' feature to organize shortlisted influencers." },
    { id: 27, title: "Virtual Event Hall", tags: ["Events", "Video"], text: "Create a virtual conference platform. The lobby should be a visual map where users can click to enter different 'stages' or 'networking rooms'. The stage view embeds a live video stream with a live chat sidebar. The networking area uses a grid of user webcams." },
    { id: 28, title: "Pet Adoption Finder", tags: ["Social", "Gallery"], text: "Build an app to connect pets with adopters. The feed should show swipable cards of dogs and cats available for adoption nearby. Each card shows the pet's name, age, breed, and bio. Include a messaging feature to contact the shelter directly." },
    { id: 29, title: "File Transfer Service", tags: ["Utility", "Upload"], text: "Develop a simple file transfer tool like WeTransfer. The center of the screen should be a large drop zone for files. Once uploaded, generate a shareable link. Include settings for link expiration (e.g., 1 day, 1 week) and password protection. Use a very clean, airy design." },
    { id: 30, title: "Video Conferencing App", tags: ["Communication", "Video"], text: "Design a video call interface similar to Zoom or Google Meet. The screen should show a grid of participants. The bottom control bar includes Mute, Stop Video, Share Screen, and Chat toggles. Include a 'Speaker View' that highlights the person currently talking." },
    { id: 31, title: "Expense Splitter", tags: ["Finance", "Social"], text: "Create an app for splitting bills with friends. Users create a group (e.g., 'Trip to Vegas') and add expenses, specifying who paid and who it was for. The app calculates the simplest set of debts to settle up. The UI should be colorful and friendly to reduce money awkwardness." },
    { id: 32, title: "Online Code Editor (IDE)", tags: ["DevTool", "Editor"], text: "Build a browser-based code editor. It should have a file explorer sidebar on the left, a tabbed code editing area in the middle, and a terminal/preview pane at the bottom. The editor needs to support syntax highlighting and line numbers. Use a dark theme by default." },
    { id: 33, title: "Music Streaming Service", tags: ["Media", "Player"], text: "Design a music streaming app like Spotify. The home page features 'Made for You' playlists and 'Recently Played'. The library page lists liked songs and albums. The player bar should include shuffle, repeat, and lyrics display. Use a dark gradient background." },
    { id: 34, title: "Note Taking App", tags: ["Productivity", "Notes"], text: "Create a note-taking app that supports Markdown. The left sidebar lists folders and tags. The main area is a distraction-free typing surface. Include a 'Zen Mode' that hides all UI elements. Notes should auto-save and support embedding images." },
    { id: 35, title: "Car Rental Booking", tags: ["Travel", "Booking"], text: "Build a car rental reservation system. The search allows entering pickup/drop-off locations and dates. Results show available cars with daily rates, specs (automatic/manual, seats), and user ratings. Include an 'Extras' step for insurance and GPS." },
    { id: 36, title: "Dating App", tags: ["Social", "Mobile"], text: "Design a modern dating app. The main interaction is a card stack where users swipe right or left. Tapping the card expands to show the full profile with bio and prompts. Include a 'Matches' screen that lists conversations with matched users." },
    { id: 37, title: "Crowdfunding Platform", tags: ["Fintech", "Social"], text: "Create a crowdfunding site like Kickstarter. The project page should have a video header, a funding progress bar, and a 'Back this Project' button. Below, display the campaign story and a list of reward tiers. Include a comment section for backer updates." },
    { id: 38, title: "Issue Tracker", tags: ["DevTool", "List"], text: "Develop a bug tracking tool. The main view is a list of issues with ID, title, status (Open, Closed), and priority tags. Users can filter by assignee or project component. The issue creation form supports markdown descriptions and file attachments." },
    { id: 39, title: "Recipe Box & Grocery List", tags: ["Lifestyle", "Utility"], text: "Build an app that converts recipes into grocery lists. Users save recipes from the web. The app parses ingredients and adds them to a shopping list categorized by aisle (Produce, Dairy, etc.). The shopping list view allows checking off items as they are bought." },
    { id: 40, title: "Interior Design Visualizer", tags: ["Design", "Gallery"], text: "Create an app for visualizing furniture in a room. Users upload a photo of their room. The app overlays 3D models of furniture (sofa, lamp, table) that can be resized and moved. Include a catalog of products from different brands with purchase links." },
    { id: 41, title: "Parking Spot Finder", tags: ["Map", "Utility"], text: "Design an app to find and book parking spots. The map view shows available lots with price pins. Clicking a pin shows details like opening hours, height restrictions, and realtime occupancy. Users can reserve a spot and pay via the app." },
    { id: 42, title: "Gym Membership Management", tags: ["SaaS", "Admin"], text: "Build an admin panel for gym owners. The dashboard shows active members, new signups, and monthly revenue. The member management page allows checking in members via QR code, updating payment info, and assigning personal trainers." },
    { id: 43, title: "Language Translation Tool", tags: ["Utility", "Text"], text: "Create a translator app. The UI features two large text areas for input and output. Include a microphone button for voice input and a speaker button for text-to-speech output. Add a history tab of recent translations and a 'Phrasebook' for saving common phrases." },
    { id: 44, title: "Voting & Polling App", tags: ["Social", "Data"], text: "Develop a polling application. Users can create polls with multiple choice options and share them via link. The results page updates in real-time with animated bar charts. No login required for voting, but required for creating polls." },
    { id: 45, title: "Freelance Marketplace", tags: ["Gig Economy", "Search"], text: "Design a platform connecting freelancers with clients. The freelancer profile shows a portfolio grid, hourly rate, and client reviews. Clients can post job listings. Include a secure message inbox for negotiating terms." },
    { id: 46, title: "Medication Reminder", tags: ["Health", "Mobile"], text: "Build a pill reminder app. Users add their medications, dosage, and frequency. The home screen shows a timeline of today's upcoming doses. The app sends push notifications when it's time to take meds. Include a tracker for refill dates." },
    { id: 47, title: "Subscription Manager", tags: ["Finance", "Utility"], text: "Create an app to track monthly subscriptions (Netflix, Spotify, etc.). Users input the cost and billing cycle. The dashboard shows total monthly spend and upcoming bill dates. Include alerts for when a free trial is about to end." },
    { id: 48, title: "Meme Generator", tags: ["Entertainment", "Editor"], text: "Develop a meme creation tool. Users select a template image or upload their own. The editor allows adding top/bottom text, resizing fonts, and adding stickers. Include a 'Trending' tab showing popular templates." },
    { id: 49, title: "Public Transport Tracker", tags: ["Transport", "Map"], text: "Design a bus and train tracker. The map shows live vehicle positions. Users tap a stop to see upcoming arrival times. Include a route planner that suggests the best combination of walking and transit." },
    { id: 50, title: "Wedding Planner", tags: ["Events", "List"], text: "Build a comprehensive wedding planning app. Features include a guest list manager (RSVP tracking), a budget calculator, a vendor contact list, and a month-by-month checklist timeline. The design should be elegant and floral." }
];

export const TemplatesPage: React.FC<TemplatesPageProps> = ({ onUseTemplate }) => {
  const [filter, setFilter] = useState<'all' | 'saas' | 'ecommerce' | 'mobile' | 'landing'>('all');
  const [copiedPromptId, setCopiedPromptId] = useState<number | null>(null);

  const filteredTemplates = filter === 'all' 
    ? TEMPLATES 
    : TEMPLATES.filter(t => t.category === filter);

  const handleCopyPrompt = (id: number, text: string) => {
      navigator.clipboard.writeText(text);
      setCopiedPromptId(id);
      setTimeout(() => setCopiedPromptId(null), 2000);
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
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

        {/* PROMPT GALLERY SECTION */}
        <div className="border-t border-zinc-800 pt-16">
            <div className="mb-12 flex items-center gap-3">
                <Sparkles className="text-purple-400" size={32} />
                <div>
                    <h2 className="text-3xl font-bold">Prompt Gallery</h2>
                    <p className="text-zinc-400 mt-1">Copy and paste these detailed prompts to build complex apps instantly.</p>
                </div>
            </div>

            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {PROMPTS.map((item) => (
                    <div key={item.id} className="break-inside-avoid bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-600 transition-all shadow-sm hover:shadow-lg relative group">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-white text-lg">{item.title}</h3>
                            <div className="flex gap-1">
                                {item.tags.map((tag, tIdx) => (
                                    <span key={tIdx} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">{tag}</span>
                                ))}
                            </div>
                        </div>
                        
                        <p className="text-sm text-zinc-300 leading-relaxed font-light mb-12">
                            {item.text}
                        </p>

                        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleCopyPrompt(item.id, item.text)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg ${copiedPromptId === item.id ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-zinc-200'}`}
                            >
                                {copiedPromptId === item.id ? (
                                    <>
                                        <Check size={14} /> Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy size={14} /> Copy Prompt
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};
