import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Eye, Download, Share2, Sparkles, Copy, Check, Wallet } from 'lucide-react';
import { ImageItem, AI_WEBSITE_LOGOS } from '../constants';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { ProtectedImage } from './ProtectedImage';
import { cn } from '../lib/utils';

interface ImageModalProps {
  image: ImageItem | null;
  onClose: () => void;
  systemType?: 'Model' | 'Ad' | 'Logo' | 'Thumbnail' | 'Explore' | 'Library';
  activeTab?: string;
}

export const ImageModal = ({ image, onClose, systemType = 'Explore', activeTab }: ImageModalProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedVar, setCopiedVar] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isDeducted, setIsDeducted] = useState(false);

  if (!image) return null;

  // Check if this item should be paid
  const isPaid = image.aiModels && image.aiModels.length > 0 && 
                 image.version && image.seed && 
                 !image.aiModels.some(m => m.toLowerCase().includes('gemini'));

  useEffect(() => {
    const fetchWallet = async () => {
      if (!auth.currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setWalletBalance(userDoc.data().walletBalance || 0);
        }
      } catch (error) {
        console.error("Error fetching wallet:", error);
      }
    };
    fetchWallet();

    const incrementViews = async () => {
      const newViews = (image.views || 0) + 1;
      const targetCollection = image.collection || activeTab || systemType;
      
      const cleanImage = Object.fromEntries(Object.entries(image).filter(([_, v]) => v !== undefined));

      try {
        await setDoc(doc(db, targetCollection, image.id), {
          ...cleanImage,
          views: newViews
        }, { merge: true });
      } catch (error) {
        console.error("Error updating views:", error);
      }
    };
    
    incrementViews();
  }, [image.id, image.collection, activeTab, systemType]);

  const deductCredits = async () => {
    if (!auth.currentUser || !isPaid || isDeducted) return true;
    
    if (walletBalance === null) return false;
    if (walletBalance < 3) {
      alert("Insufficient balance! Please add ₹3 to your wallet to access this premium content.");
      return false;
    }

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        walletBalance: walletBalance - 3
      });
      
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'transactions'), {
        amount: 3,
        type: 'Debit',
        isCredit: false,
        status: 'completed',
        title: `Premium Access: ${image.title}`,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        timestamp: new Date().toISOString(),
        description: `₹3 deducted for premium ${image.type === 'video' ? 'video' : 'image'} access`,
        createdAt: new Date().toISOString()
      });

      setWalletBalance(prev => (prev !== null ? prev - 3 : null));
      setIsDeducted(true);
      return true;
    } catch (error) {
      console.error("Error deducting credits:", error);
      alert("Something went wrong with the payment. Please try again.");
      return false;
    }
  };

  const handleCopyPrompt = async () => {
    if (image.prompt) {
      const success = await deductCredits();
      if (!success) return;

      navigator.clipboard.writeText(image.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyVarPrompt = async () => {
    if (image.variablePrompt) {
      const success = await deductCredits();
      if (!success) return;

      navigator.clipboard.writeText(image.variablePrompt);
      setCopiedVar(true);
      setTimeout(() => setCopiedVar(false), 2000);
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    
    const success = await deductCredits();
    if (!success) return;

    setIsDownloading(true);
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      const extension = image.type === 'video' ? 'mp4' : 'jpg';
      a.download = `${image.title.replace(/\s+/g, '_').toLowerCase() || 'media'}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed", err);
      window.open(image.url, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleActionClick = () => {
    handleDownload();
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: image.title,
          text: `Check out this awesome ${image.type === 'video' ? 'video' : 'image'}!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing", err);
    }
  };

  const handleLike = async () => {
    if (!auth.currentUser) {
      alert("Please log in to like this item.");
      return;
    }
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    
    try {
      const newLikes = (image.likes || 0) + (newLikedState ? 1 : -1);
      const targetCollection = image.collection || activeTab || systemType;
      
      // Remove undefined values to prevent Firestore errors
      const cleanImage = Object.fromEntries(Object.entries(image).filter(([_, v]) => v !== undefined));

      await setDoc(doc(db, targetCollection, image.id), {
        ...cleanImage,
        likes: newLikes
      }, { merge: true });
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const displayLikes = (image.likes || 0) + (isLiked ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-md h-full bg-zinc-900 border-l border-white/10 flex flex-col shadow-2xl z-10 overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors"
        >
          <X size={20} />
        </button>

        {/* Image Preview */}
        <div className="w-full aspect-square bg-black relative shrink-0">
          {image.type === 'video' ? (
            <video src={image.url} controls autoPlay className="w-full h-full object-contain" />
          ) : (
            <ProtectedImage src={image.url} alt={image.title} className="w-full h-full object-contain" />
          )}
        </div>

        {/* Details */}
        <div className="p-6 flex flex-col gap-6">
          <div>
            {image.aiModels && image.aiModels.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-black/60 backdrop-blur-md flex items-center justify-center p-1 border border-white/20">
                  {AI_WEBSITE_LOGOS[image.aiModels[0]] ? (
                    <img 
                      src={AI_WEBSITE_LOGOS[image.aiModels[0]]} 
                      alt={image.aiModels[0]} 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Sparkles size={12} className="text-indigo-400" />
                  )}
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-white drop-shadow-md bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/5">
                  {image.aiModels[0]}
                </span>
              </div>
            )}
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-xl font-bold text-white">{image.title}</h2>
              <div className={cn(
                "px-3 py-1 rounded-full text-sm font-bold border shrink-0 ml-4",
                isPaid 
                  ? "bg-amber-600/20 text-amber-400 border-amber-500/30" 
                  : "bg-indigo-600/20 text-indigo-400 border-indigo-500/30"
              )}>
                {isPaid ? '₹3' : 'Free'}
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-zinc-400 text-sm">
              <div className="flex items-center gap-1.5">
                <Eye size={16} />
                <span>{image.views?.toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart size={16} className={isLiked ? "text-pink-500 fill-pink-500" : "text-pink-500"} />
                <span>{displayLikes.toLocaleString()} likes</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleActionClick}
              disabled={isDownloading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Download size={18} />
              {isDownloading ? 'Downloading...' : 'Download Media'}
            </button>
            <div className="flex gap-3">
              <button 
                onClick={handleLike}
                className={`flex-1 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${isLiked ? 'bg-pink-500/20 text-pink-500' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}
              >
                <Heart size={18} className={isLiked ? "fill-pink-500" : ""} />
                {isLiked ? 'Liked' : 'Like'}
              </button>
              <button 
                onClick={handleShare}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Share2 size={18} />
                Share
              </button>
            </div>
          </div>

          {image.aiModels && image.aiModels.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">AI Models / Websites Used</h3>
              <div className="flex flex-wrap gap-2">
                {image.aiModels.map(model => (
                  <span 
                    key={model} 
                    className="px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-full text-xs font-medium"
                  >
                    {model}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="w-full h-px bg-white/10 my-2" />

          {/* Prompts */}
          <div className="space-y-6 pb-8">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Prompt</h3>
                <button onClick={handleCopyPrompt} className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
                  {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  <span className="text-xs">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                <p className="text-zinc-300 text-sm leading-relaxed">
                  {image.prompt || "No prompt available."}
                </p>
              </div>
            </div>

            {image.variablePrompt && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Variable Prompt</h3>
                  <button onClick={handleCopyVarPrompt} className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
                    {copiedVar ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    <span className="text-xs">{copiedVar ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                  <p className="text-zinc-400 text-sm font-mono">
                    {image.variablePrompt}
                  </p>
                </div>
              </div>
            )}

            {(image.version || image.seed) && (
              <div className="grid grid-cols-2 gap-4">
                {image.version && (
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Version</h3>
                    <div className="bg-zinc-800/50 px-3 py-2 rounded-lg border border-white/5 text-zinc-300 text-sm">
                      {image.version}
                    </div>
                  </div>
                )}
                {image.seed && (
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Seed</h3>
                    <div className="bg-zinc-800/50 px-3 py-2 rounded-lg border border-white/5 text-zinc-300 text-sm">
                      {image.seed}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

    </div>
  );
};
