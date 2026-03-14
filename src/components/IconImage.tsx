import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageItem } from '../constants';
import { Heart, Eye } from 'lucide-react';
import { ImageModal } from './ImageModal';
import { useImages } from '../hooks/useImages';
import { ProtectedImage } from './ProtectedImage';

export const IconImage = ({ activeTab }: { activeTab: string }) => {
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
              className="relative group break-inside-avoid rounded-2xl overflow-hidden cursor-pointer bg-zinc-900 border border-white/5"
            >
              <div className="relative aspect-square flex items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-900 to-black">
                {image.type === 'video' ? (
                  <video
                    src={image.url}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <ProtectedImage
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                  />
                )}
                
                {/* Motion lines for Moving Car */}
                {image.title === 'Moving Car' && (
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-8 h-0.5 bg-blue-400/60 rounded-full animate-[pulse_1s_infinite]" />
                    <div className="w-12 h-0.5 bg-blue-400/60 rounded-full animate-[pulse_1.2s_infinite]" />
                    <div className="w-10 h-0.5 bg-blue-400/60 rounded-full animate-[pulse_0.8s_infinite]" />
                    <div className="w-6 h-0.5 bg-blue-400/60 rounded-full animate-[pulse_1.1s_infinite]" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
          <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} systemType="Logo" activeTab={activeTab} />
        )}
      </AnimatePresence>
    </div>
  );
};
