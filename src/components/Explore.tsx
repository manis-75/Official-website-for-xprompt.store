import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageItem } from '../constants';
import { Heart, Eye } from 'lucide-react';
import { ImageModal } from './ImageModal';
import { ProtectedImage } from './ProtectedImage';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const Explore = () => {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchExploreData = async () => {
      try {
        setLoading(true);
        // Fetch up to 1000 items directly from the database for the Explore page
        const q = query(collection(db, 'Explore'), orderBy('createdAt', 'desc'), limit(1000));
        const querySnapshot = await getDocs(q);
        
        const fetchedImages: ImageItem[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          let type = data.type || 'image';
          
          // Detect video types based on URL
          if (data.url && data.url.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
            type = 'video';
          } else if (data.url && data.url.includes('firebasestorage') && data.url.includes('videos%2F')) {
            type = 'video';
          }
          
          fetchedImages.push({
            id: doc.id,
            url: data.url,
            title: data.title,
            type: type,
            aspectRatio: data.aspectRatio || 'square',
            prompt: data.prompt,
            variablePrompt: data.variablePrompt,
            likes: data.likes || 0,
            views: data.views || 0,
            sales: data.sales || 0,
            price: data.price || 0,
            collection: 'Explore',
          });
        });

        if (isMounted) {
          // Sort by sales first, then likes, then views
          fetchedImages.sort((a, b) => {
            const salesA = a.sales || 0;
            const salesB = b.sales || 0;
            if (salesA !== salesB) return salesB - salesA;
            
            const likesA = a.likes || 0;
            const likesB = b.likes || 0;
            if (likesA !== likesB) return likesB - likesA;
            
            const viewsA = a.views || 0;
            const viewsB = b.views || 0;
            return viewsB - viewsA;
          });
          
          setImages(fetchedImages);
        }
      } catch (error) {
        console.error("Error fetching explore data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchExploreData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-6 md:p-8 relative">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedImage(image)}
              className="relative group break-inside-avoid rounded-2xl overflow-hidden cursor-pointer bg-zinc-900"
            >
              {image.type === 'video' ? (
                <video
                  src={image.url}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <ProtectedImage
                  src={image.url}
                  alt={image.title}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                />
              )}

              {/* Motion lines for Neon Rider */}
              {image.title === 'Neon Rider' && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-12 h-1 bg-blue-500/60 rounded-full animate-[pulse_1s_infinite]" />
                  <div className="w-16 h-1 bg-blue-500/60 rounded-full animate-[pulse_1.2s_infinite]" />
                  <div className="w-14 h-1 bg-blue-500/60 rounded-full animate-[pulse_0.8s_infinite]" />
                  <div className="w-10 h-1 bg-blue-500/60 rounded-full animate-[pulse_1.1s_infinite]" />
                </div>
              )}

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
                        // Handle like
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
          <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} systemType="Explore" activeTab="Explore" />
        )}
      </AnimatePresence>
    </div>
  );
};
