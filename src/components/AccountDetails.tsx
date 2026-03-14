import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, Compass, Library, User, LayoutTemplate, Youtube, Palette,
  Signal as SignalIcon, Sparkles as SparklesIcon, Settings as SettingsIcon,
  CheckCircle as CheckmarkIcon
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';

export interface GalleryItem {
  id: string;
  prompt: string;
  model?: string;
  source?: string;
  timestamp?: { seconds: number };
}

interface AccountDetailsProps {
  user: any;
  onNavigate: (view: string) => void;
  galleryCount?: number;
  gallery?: GalleryItem[];
}

export const AccountDetails: React.FC<AccountDetailsProps> = ({ 
  user, onNavigate, galleryCount = 0, gallery: propGallery = [] 
}) => {
  const [balance, setBalance] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [gallery, setGallery] = useState<GalleryItem[]>(propGallery);
  const [fetchedGalleryCount, setFetchedGalleryCount] = useState(galleryCount);

  useEffect(() => {
    const fetchWalletData = async () => {
      if (!auth.currentUser) return;
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setBalance(userSnap.data().walletBalance || 0);
        }
      } catch (error) {
        console.error("Error fetching user doc:", error);
        handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser?.uid}`);
      }

      try {
        const q = query(
          collection(db, 'users', auth.currentUser.uid, 'transactions'),
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        let spent = 0;
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (!data.isCredit) {
            spent += Math.abs(data.amount);
          }
        });
        setTotalSpent(spent);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        handleFirestoreError(error, OperationType.LIST, `users/${auth.currentUser?.uid}/transactions`);
      }

      try {
        const q = query(
          collection(db, 'users', auth.currentUser.uid, 'purchases'),
          orderBy('purchasedAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedImages: GalleryItem[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedImages.push({ 
            id: doc.id, 
            prompt: data.prompt || 'Generated Image',
            source: data.source,
            timestamp: data.purchasedAt
          });
        });
        setGallery(fetchedImages);
        setFetchedGalleryCount(fetchedImages.length);
      } catch (error) {
        console.error("Error fetching gallery:", error);
      }
    };

    fetchWalletData();
  }, []);

  const stats = [
    { label: 'Balance', value: `₹ ${balance.toFixed(2)}`, icon: <SparklesIcon className="w-5 h-5" />, action: 'Top up →', view: 'Wallet' },
    { label: 'Total Jobs', value: fetchedGalleryCount.toString(), icon: <ImageIcon className="w-5 h-5" />, action: 'Gallery →', view: 'Library' },
    { label: 'Success Rate', value: '100%', icon: <SignalIcon className="w-5 h-5" />, progress: 100 },
    { label: 'Total Spent', value: `₹ ${totalSpent.toFixed(2)}`, icon: <SparklesIcon className="w-5 h-5" /> },
  ];

  const quickAccess = [
    { label: 'AI Influencer', icon: <User className="w-8 h-8 text-pink-500" />, view: 'AI Influencer' },
    { label: 'Ad Studio', icon: <LayoutTemplate className="w-8 h-8 text-blue-500" />, view: 'Ad Studio' },
    { label: 'Thumbnail', icon: <Youtube className="w-8 h-8 text-red-500" />, view: 'Thumbnail' },
    { label: 'Logo Generator', icon: <Palette className="w-8 h-8 text-emerald-500" />, view: 'Logo Image' },
    { label: 'Explore', icon: <Compass className="w-8 h-8 text-indigo-500" />, view: 'Explore' },
    { label: 'Library', icon: <Library className="w-8 h-8 text-violet-500" />, view: 'Library' },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 custom-scrollbar bg-black text-white">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden shrink-0">
              {user?.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : (user?.name ? user.name.charAt(0).toUpperCase() : 'U')}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter">{user?.name || 'User Profile'}</h1>
              <p className="text-zinc-400 font-medium">{user?.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
             <button onClick={() => onNavigate('Settings')} className="px-5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 font-bold text-sm shadow-sm hover:bg-zinc-700 transition-all flex items-center gap-2 text-white">
               <SettingsIcon className="w-4 h-4" /> Settings
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="p-6 rounded-[24px] bg-zinc-900 border border-white/10 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</span>
                <div className="text-zinc-500">{stat.icon}</div>
              </div>
              <div className="text-4xl font-black tracking-tighter mb-4">{stat.value}</div>
              {stat.action && (
                <button 
                  onClick={() => stat.view && onNavigate(stat.view)}
                  className="text-sm font-bold text-indigo-400 hover:underline"
                >
                  {stat.action}
                </button>
              )}
              {stat.progress !== undefined && (
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mt-4">
                  <div className="h-full bg-indigo-600" style={{ width: `${stat.progress}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Access */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black tracking-tighter">Quick Access</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickAccess.map((item, i) => (
              <button 
                key={i} 
                onClick={() => onNavigate(item.view)}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-900 border border-white/10 shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all group"
              >
                <div className="mb-3 transition-transform group-hover:scale-110">{item.icon}</div>
                <span className="text-[11px] font-bold text-center leading-tight text-zinc-300">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="p-8 rounded-[32px] bg-zinc-900 border border-white/10 shadow-sm min-h-[300px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black tracking-tighter">Recent Activity</h2>
              <button onClick={() => onNavigate('Library')} className="text-sm font-bold text-zinc-400 hover:text-indigo-400 transition-colors">View all</button>
            </div>
            <div className="flex-1 space-y-4">
              {gallery.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <CheckmarkIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm truncate max-w-[200px]">{item.prompt}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{item.model || 'Gemini 2.5 Flash'}</p>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500 font-medium">
                    {item.timestamp ? new Date(item.timestamp as any).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </span>
                </div>
              ))}
              {gallery.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                  <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-bold">No jobs yet. Try a tool to get started!</p>
                </div>
              )}
            </div>
          </div>

          {/* Most Used Tools */}
          <div className="p-8 rounded-[32px] bg-zinc-900 border border-white/10 shadow-sm min-h-[300px] flex flex-col">
            <h2 className="text-xl font-black tracking-tighter mb-8">Most Used Tools</h2>
            <div className="flex-1 space-y-6">
              {['AI Influencer', 'Ad Studio', 'YouTube Thumbnail', 'Logo Generator', 'Icon Assets'].map((tool) => {
                const getToolSource = (t: string) => {
                  if (t === 'AI Influencer') return 'Model';
                  if (t === 'Ad Studio') return 'AddImage';
                  if (t === 'YouTube Thumbnail') return 'YoutubeThumbnail';
                  if (t === 'Logo Generator') return 'IconImage';
                  if (t === 'Icon Assets') return 'IconImage';
                  return t;
                };
                const count = gallery.filter(i => i.source === getToolSource(tool)).length;
                const percentage = gallery.length > 0 ? (count / gallery.length) * 100 : 0;
                return (
                  <div key={tool} className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-zinc-300">{tool}</span>
                      <span className="text-zinc-500">{count} jobs</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
