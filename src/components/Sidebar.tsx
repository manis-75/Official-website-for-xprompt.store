import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Library, 
  Compass, 
  User as UserIcon,
  PlusCircle,
  LayoutGrid,
  Youtube,
  Box, 
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ChevronRight,
  Type,
  Palette,
  Sparkles,
  TrendingUp,
  LayoutList,
  LogOut,
  Settings,
  LayoutTemplate,
  Moon,
  Sun,
  Bug,
  Shield,
  Wallet,
  CreditCard,
  Wand2
} from 'lucide-react';
import { cn } from '../lib/utils';
import React, { useState, useRef, useEffect } from 'react';

interface User {
  name: string;
  email: string;
  role?: string;
  photoURL?: string | null;
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  user: User;
  onLogout: () => void;
}

export const Sidebar = ({ activeTab, onTabChange, isOpen, onToggle, user, onLogout }: SidebarProps) => {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check initial mode
    setIsLightMode(document.body.classList.contains('light-mode'));

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLightMode = () => {
    const newMode = !isLightMode;
    setIsLightMode(newMode);
    if (newMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  };

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => 
      prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
    );
  };

  const navItems = [
    { icon: Home, label: 'Home' },
    { icon: Library, label: 'Library' },
    { icon: Compass, label: 'Explore' },
    { 
      icon: UserIcon, 
      label: 'Model',
      isExpandable: true,
      subItems: [
        {
          label: 'AI Influencer',
          icon: Sparkles,
          options: [
            "Fashion Model", "Fitness Model", "Glamour Model", "Traditional Model", "Casual Lifestyle"
          ]
        }
      ]
    },
    { 
      icon: PlusCircle, 
      label: 'Ad Studio',
      isExpandable: true,
      subItems: [
        {
          label: 'Ad Templates',
          icon: LayoutTemplate,
          options: [
            "Product Ads", "Fashion Ads", "Fitness Ads", "Beauty Ads", "Food Ads", "Tech Ads", "Business Ads", "Social Ads", "Story Ads", "Global Style", "Luxury Ads", "Ecom Ads"
          ]
        }
      ]
    },
    { 
      icon: LayoutGrid, 
      label: 'Logo Image',
      isExpandable: true,
      subItems: [
        { 
          label: 'Logo Prompt', 
          icon: Palette,
          options: [
            "3D", "Animal", "Business & Startup", "Cartoon", "Cute", "Food", "Lettered", "Hand-drawn", "Minimalist", "Modern", "Painted", "Styled"
          ]
        },
        { 
          label: 'Icon Prompt', 
          icon: Sparkles,
          options: [
            "3D", "Animal", "Clipart", "Cute", "Flat Graphic", "Pixel Art", "Styled", "UI"
          ]
        }
      ]
    },
    { 
      icon: Youtube, 
      label: 'Thumbnail',
      isExpandable: true,
      subItems: [
        {
          label: 'Trending',
          icon: TrendingUp,
          options: [
            "Gaming", "Stock Market", "Personal Finance", "Tech", "Vlogging", "Cricket", "Movies", "Web Series", "Comedy", "Podcast", "Fitness", "Motivation", "Education", "Online Earning", "Business Ideas", "Automobile", "Cooking", "Real Estate", "Spirituality", "Fashion", "Beauty", "Parenting", "Coding", "Graphic Design", "Photography", "Travel", "News", "Science", "AI", "Government Schemes"
          ]
        },
        {
          label: 'All Category',
          icon: LayoutList,
          options: [
            "Business Ideas", "Automobile", "Cooking", "Real Estate", "Spirituality", "Fashion", "Beauty", "Parenting", "Coding", "Graphic Design", "Photography", "Travel", "Science", "Government Schemes", "Comedy"
          ]
        }
      ]
    },
    { 
      icon: Wallet, 
      label: 'Wallet',
      isExpandable: false
    },
    { 
      icon: CreditCard, 
      label: 'Plans',
      isExpandable: false
    },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 256 : 80 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="h-screen bg-black border-r border-zinc-800 flex flex-col p-4 fixed left-0 top-0 z-50 shadow-2xl shadow-black/50 overflow-hidden"
    >
      <div className={cn("flex items-center mb-8 px-2", isOpen ? "justify-between" : "justify-center")}>
        {isOpen ? (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="flex items-center justify-center w-10 h-10">
              <img src="https://ybclafjjnjdkecmegtyk.supabase.co/storage/v1/object/public/images/3a08db9a-f6b1-4f94-8af3-2ca494fc8833/1773399312194-9kt7gbydp86.png" alt="Xprompt Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Xprompt</span>
          </motion.div>
        ) : null}
        
        <button 
          onClick={onToggle}
          className={cn(
            "text-zinc-400 hover:text-white p-2 bg-zinc-900/50 border border-zinc-800 rounded-xl transition-all hover:bg-zinc-800 hover:border-zinc-700 shadow-lg",
            !isOpen && "mb-2"
          )}
        >
          {isOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>
      </div>

      <nav className={cn(
        "flex-1 space-y-2 overflow-y-auto overflow-x-hidden",
        isOpen ? "custom-scrollbar -mr-3 pr-3" : "scrollbar-hide"
      )}>
        {navItems.map((item) => (
          <div key={item.label}>
            <button
              onClick={() => {
                onTabChange(item.label);
                if (item.isExpandable && isOpen) {
                  toggleMenu(item.label);
                }
              }}
              className={cn(
                "flex items-center w-full gap-3 rounded-xl transition-all duration-200 group relative",
                isOpen ? "px-4 py-3" : "w-12 h-12 mx-auto justify-center",
                activeTab === item.label || (item.isExpandable && expandedMenus.includes(item.label))
                  ? "bg-zinc-800/50 text-white" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/30"
              )}
            >
              <item.icon size={22} className={cn(activeTab === item.label ? "text-blue-400" : "group-hover:text-white")} />
              {isOpen && (
                <>
                  <span className="font-medium whitespace-nowrap flex-1 text-left">{item.label}</span>
                  {item.isExpandable && (
                    expandedMenus.includes(item.label) ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                  )}
                </>
              )}
              {!isOpen && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>

            {/* Sub-menus for Logo Image */}
            <AnimatePresence>
              {isOpen && item.isExpandable && expandedMenus.includes(item.label) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden ml-4 mt-1 space-y-1"
                >
                  {item.subItems?.map((sub) => (
                    <div key={sub.label}>
                      <button
                        onClick={() => {
                          onTabChange(sub.label);
                          toggleMenu(sub.label);
                        }}
                        className={cn(
                          "flex items-center w-full gap-2 px-4 py-2 rounded-lg text-sm transition-colors",
                          expandedMenus.includes(sub.label) ? "text-white bg-zinc-800/30" : "text-zinc-400 hover:text-white hover:bg-zinc-800/20"
                        )}
                      >
                        <sub.icon size={16} />
                        <span className="flex-1 text-left">{sub.label}</span>
                        {sub.options && (expandedMenus.includes(sub.label) ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                      </button>

                      <AnimatePresence>
                        {expandedMenus.includes(sub.label) && sub.options && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden ml-6 pl-3 border-l border-zinc-800 flex flex-col gap-1 mt-1 pb-2"
                          >
                            {sub.options.map((option) => (
                              <button
                                key={option}
                                onClick={() => onTabChange(`${sub.label}: ${option}`)}
                                className={cn(
                                  "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                  activeTab === `${sub.label}: ${option}`
                                    ? "bg-zinc-800/80 text-white"
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                                )}
                              >
                                {option}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      <div className="mt-auto space-y-4">


        <div className="relative" ref={menuRef}>
          <AnimatePresence>
            {isProfileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full mb-2 left-0 w-full bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50"
              >
                <div className="p-2 space-y-1">
                  <button 
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onTabChange('Account Details');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <UserIcon size={18} />
                    <span>Account Details</span>
                  </button>
                  {user.role === 'admin' && (
                    <button 
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onTabChange('Admin Panel');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                    >
                      <Shield size={18} />
                      <span>Admin Panel</span>
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onTabChange('Settings');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </button>
                  <button 
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      toggleLightMode();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    {isLightMode ? <Sun size={18} /> : <Moon size={18} />}
                    <span>{isLightMode ? 'Dark Mode' : 'Light Mode'}</span>
                  </button>
                  <button 
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      // Handle report issue click
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Bug size={18} />
                    <span>Report Issue</span>
                  </button>
                  <div className="h-px bg-zinc-800 my-1" />
                  <button 
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <LogOut size={18} />
                    <span>Log out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className={cn(
              "flex items-center rounded-xl hover:bg-zinc-800/30 transition-colors cursor-pointer group",
              isOpen ? "gap-3 p-2" : "w-12 h-12 mx-auto justify-center"
            )}
          >
            <div className={cn("rounded-full bg-pink-600 flex items-center justify-center text-white font-bold uppercase overflow-hidden shrink-0", isOpen ? "w-10 h-10 text-sm" : "w-10 h-10 text-sm")}>
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            {isOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogout();
                  }}
                  className="p-2 hover:bg-zinc-700/50 rounded-lg transition-colors text-zinc-400 hover:text-red-400"
                  title="Log out"
                >
                  <LogOut size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.aside>
  );
};
