import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageItem } from '../constants';
import { db, auth } from '../lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { Heart, Eye, Library as LibraryIcon } from 'lucide-react';
import { ImageModal } from './ImageModal';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { ProtectedImage } from './ProtectedImage';

export const Library = () => {
  const [purchasedImages, setPurchasedImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!auth.currentUser) return;
      
      try {
        const q = query(
          collection(db, 'users', auth.currentUser.uid, 'purchases'),
          orderBy('purchasedAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedImages: ImageItem[] = [];
        
        querySnapshot.forEach((doc) => {
          fetchedImages.push({ id: doc.id, ...doc.data() } as ImageItem);
        });
        
        setPurchasedImages(fetchedImages);
      } catch (error) {
        console.error("Error fetching library:", error);
        handleFirestoreError(error, OperationType.LIST, `users/${auth.currentUser.uid}/purchases`);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  return (
    <div className="p-6 md:p-8 relative min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <LibraryIcon className="text-indigo-500" size={32} />
          My Library
        </h1>
        <p className="text-zinc-400 mt-2">All your purchased prompts and media are saved here.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : purchasedImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-zinc-500 bg-zinc-900/30 rounded-2xl border border-white/5">
          <LibraryIcon size={48} className="mb-4 opacity-50" />
          <p className="text-lg font-medium">Your library is empty</p>
          <p className="text-sm mt-1">Purchase prompts to see them here.</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {purchasedImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedImage(image)}
              className="relative group break-inside-avoid rounded-2xl overflow-hidden cursor-pointer bg-zinc-900 border border-white/5"
            >
              <div className="relative overflow-hidden">
                {image.type === 'video' ? (
                  <video
                    src={image.url}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <ProtectedImage
                    src={image.url}
                    alt={image.title}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <div className="flex items-center justify-between text-white">
                  <span className="font-medium truncate mr-2">{image.title}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 text-sm bg-black/40 backdrop-blur-md px-2 py-1 rounded-full">
                      <Eye size={14} />
                      <span>{image.views?.toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="flex items-center gap-1 text-sm bg-black/40 backdrop-blur-md px-2 py-1 rounded-full hover:text-pink-500 transition-colors"
                    >
                      <Heart size={14} />
                      <span>{image.likes?.toLocaleString()}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      <AnimatePresence>
        {selectedImage && (
          <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} systemType="Library" />
        )}
      </AnimatePresence>
    </div>
  );
};
