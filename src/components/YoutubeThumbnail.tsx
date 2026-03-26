import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageItem } from '../constants';
import { Heart, Eye, Sparkles } from 'lucide-react';
import { ImageModal } from './ImageModal';
import { useImages } from '../hooks/useImages';
import { ProtectedImage } from './ProtectedImage';
import { AI_WEBSITE_LOGOS } from '../constants';

export const YoutubeThumbnail = ({ activeTab }: { activeTab: string }) => {
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
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors dark:bg-black/20 dark:group-hover:bg-black/40 light-mode:bg-transparent light-mode:group-hover:bg-black/20" />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                {/* Top Left: AI Model Badge */}
                <div>
                  {image.aiModels && image.aiModels.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-black/60 backdrop-blur-md flex items-center justify-center p-0.5 border border-white/20">
                        {AI_WEBSITE_LOGOS[image.aiModels[0]] ? (
                          <img 
                            src={AI_WEBSITE_LOGOS[image.aiModels[0]]} 
                            alt={image.aiModels[0]} 
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Sparkles size={10} className="text-indigo-400" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white drop-shadow-md bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/5">
                        {image.aiModels[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom: Title and Stats */}
                <div className="flex flex-col gap-1 text-white">
                  <div className="flex items-center justify-between">
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
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      <AnimatePresence>
        {selectedImage && (
          <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} systemType="Thumbnail" activeTab={activeTab} />
        )}
      </AnimatePresence>
    </div>
  );
};
