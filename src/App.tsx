import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Home } from './components/Home';
import { Library } from './components/Library';
import { Explore } from './components/Explore';
import { Model } from './components/Model';
import { AddImage } from './components/AddImage';
import { IconImage } from './components/IconImage';
import { YoutubeThumbnail } from './components/YoutubeThumbnail';
import { Auth } from './components/Auth';
import { AdminPanel } from './components/AdminPanel';
import { Settings } from './components/Settings';
import { AccountDetails } from './components/AccountDetails';
import Pricing from './components/Pricing';
import Wallet from './components/Wallet';
import { cn } from './lib/utils';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: string;
  photoURL?: string | null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Global Image Protection & Security
    // 1. Disable right-click globally
    const handleContextMenu = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'IMG' || (e.target as HTMLElement).tagName === 'CANVAS' || (e.target as HTMLElement).tagName === 'VIDEO') {
        e.preventDefault();
      }
    };

    // 2. Disable keyboard shortcuts (Ctrl+U, Ctrl+S, Ctrl+Shift+I, F12)
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
      }
      // Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
      }
      // Ctrl+S (Save Page)
      if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
      }
    };

    // 3. Detect DevTools open (basic heuristic) and blur images
    const detectDevTools = () => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      
      if (widthDiff || heightDiff) {
        document.body.classList.add('devtools-open');
      } else {
        document.body.classList.remove('devtools-open');
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', detectDevTools);
    
    // Initial check
    detectDevTools();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        let role = 'user';
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            role = userDoc.data().role || 'user';
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }

        setUser({
          uid: currentUser.uid,
          name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
          email: currentUser.email || '',
          role: role,
          photoURL: currentUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', detectDevTools);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (showAuth) {
    return <Auth onLogin={() => setShowAuth(false)} onClose={() => setShowAuth(false)} />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex overflow-x-hidden">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        user={user}
        onLogout={handleLogout}
        onLoginClick={() => setShowAuth(true)}
      />
      <main className={cn(
        "flex-1 overflow-y-auto transition-all duration-300 ease-in-out",
        isSidebarOpen ? "ml-64" : "ml-20"
      )}>
        {activeTab === 'Home' && <Home onTabChange={setActiveTab} />}
        {activeTab === 'Library' && <Library />}
        {activeTab === 'Explore' && <Explore />}
        {(activeTab.startsWith('AI Influencer') || activeTab === 'Model') && <Model activeTab={activeTab} />}
        {(activeTab.startsWith('Ad Templates') || activeTab === 'Ad Studio') && <AddImage activeTab={activeTab} />}
        {(activeTab.startsWith('Trending') || activeTab.startsWith('All Category') || activeTab === 'Thumbnail') && <YoutubeThumbnail activeTab={activeTab} />}
        {(activeTab.startsWith('Logo Prompt') || activeTab.startsWith('Icon Prompt') || activeTab === 'Logo Image') && <IconImage activeTab={activeTab} />}
        {activeTab === 'Admin Panel' && user?.role === 'admin' && <AdminPanel />}
        {activeTab === 'Settings' && user && <Settings user={user} />}
        {activeTab === 'Account Details' && user && <AccountDetails user={user} onNavigate={setActiveTab} />}
        {activeTab === 'Plans' && <Pricing />}
        {activeTab === 'Wallet' && <Wallet />}
        {activeTab !== 'Home' && activeTab !== 'Library' && activeTab !== 'Explore' && !activeTab.startsWith('AI Influencer') && activeTab !== 'Model' && !activeTab.startsWith('Ad Templates') && activeTab !== 'Ad Studio' && 
         !activeTab.startsWith('Trending') && !activeTab.startsWith('All Category') && activeTab !== 'Thumbnail' && 
         !activeTab.startsWith('Logo Prompt') && !activeTab.startsWith('Icon Prompt') && activeTab !== 'Logo Image' && activeTab !== 'Admin Panel' && activeTab !== 'Settings' && activeTab !== 'Account Details' && activeTab !== 'Plans' && activeTab !== 'Wallet' && (
          <div className="flex items-center justify-center h-full text-zinc-500">
            <p className="text-xl font-medium">{activeTab} Section Coming Soon</p>
          </div>
        )}
      </main>
    </div>
  );
}
