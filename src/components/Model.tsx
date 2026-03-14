import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageItem } from '../constants';
import { Heart, Eye } from 'lucide-react';
import { ImageModal } from './ImageModal';
import { useImages } from '../hooks/useImages';
import { ProtectedImage } from './ProtectedImage';

export const Model = ({ activeTab }: { activeTab: string }) => {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  
  const { images, loading } = useImages(activeTab);

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
          <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} systemType="Model" activeTab={activeTab} />
        )}
      </AnimatePresence>
    </div>
  );
};
