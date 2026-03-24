import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageItem } from '../constants';
import { Heart, Eye, Search, X, SlidersHorizontal, Image as ImageIcon, Video, TrendingUp, Clock, Zap, Send, ChevronDown } from 'lucide-react';
import { ImageModal } from './ImageModal';
import { ProtectedImage } from './ProtectedImage';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';

export const Explore = () => {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'popular' | 'views'>('trending');
  const [loading, setLoading] = useState(true);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const ALL_CATEGORIES = [
    { 
      group: 'Model Categories', 
      options: ["Fashion Model", "Fitness Model", "Glamour Model", "Traditional Model", "Casual Lifestyle"] 
    },
    { 
      group: 'Ad Studio Categories', 
      options: ["Product Ads", "Fashion Ads", "Fitness Ads", "Beauty Ads", "Food Ads", "Tech Ads", "Business Ads", "Social Ads", "Story Ads", "Global Style", "Luxury Ads", "Ecom Ads"] 
    },
    {
      group: 'Trending Categories',
      options: ["Gaming", "Stock Market", "Personal Finance", "Tech", "Vlogging", "Cricket", "Movies", "Web Series", "Comedy", "Podcast", "Fitness", "Motivation", "Education", "Online Earning", "Business Ideas", "Automobile", "Cooking", "Real Estate", "Spirituality", "Fashion", "Beauty", "Parenting", "Coding", "Graphic Design", "Photography", "Travel", "News", "Science", "AI", "Government Schemes"]
    }
  ];

  const processedImages = useMemo(() => {
    let result = images.filter(img => {
      const matchesSearch = !searchQuery || 
        img.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.type?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'all' || img.type === filterType;
      
      return matchesSearch && matchesType;
    });

    // Sorting logic
    result.sort((a, b) => {
      if (sortBy === 'trending') {
        const scoreA = (a.sales || 0) * 10 + (a.likes || 0) * 2 + (a.views || 0) * 0.1;
        const scoreB = (b.sales || 0) * 10 + (b.likes || 0) * 2 + (b.views || 0) * 0.1;
        return scoreB - scoreA;
      }
      if (sortBy === 'popular') {
        return (b.likes || 0) - (a.likes || 0);
      }
      if (sortBy === 'views') {
        return (b.views || 0) - (a.views || 0);
      }
      if (sortBy === 'newest') {
        // Since we fetch in desc order of createdAt, we can use the original index if we had it
        // But for now, let's assume the data has a timestamp or we just use the fetch order
        return 0; // Default to fetch order which is newest
      }
      return 0;
    });

    return result;
  }, [images, searchQuery, filterType, sortBy]);

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
            category: data.category,
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
    <div className="p-6 md:p-8 relative min-h-screen bg-black">
      {/* Advanced Search & Filter Section */}
      <div className="mb-12 max-w-4xl mx-auto space-y-6 relative">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by title, prompt, or style..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowCategoryDropdown(false)}
            className="block w-full pl-14 pr-40 py-5 bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] text-white placeholder-zinc-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all backdrop-blur-xl text-lg shadow-2xl"
          />
          
          <div className="absolute inset-y-0 right-3 flex items-center gap-2">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-2 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            )}
            
            <button 
              onClick={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
              }}
              className={cn(
                "w-11 h-11 flex items-center justify-center rounded-full border transition-all duration-300",
                showCategoryDropdown 
                  ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-400" 
                  : "bg-zinc-800/30 border-zinc-700/50 text-zinc-400 hover:text-white hover:border-zinc-500"
              )}
            >
              <SlidersHorizontal size={18} />
            </button>

            <button 
              className="w-11 h-11 flex items-center justify-center rounded-full border border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all duration-300"
              onClick={() => {
                // Trigger search or any other action
                console.log('Searching for:', searchQuery);
              }}
            >
              <Send size={18} className="rotate-[-15deg] translate-x-[1px] translate-y-[-1px]" />
            </button>
          </div>
        </div>

        {/* Category Dropdown List */}
        <AnimatePresence>
          {showCategoryDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute left-0 right-0 top-full mt-4 z-[60] bg-zinc-900/95 border border-zinc-800 rounded-3xl shadow-2xl backdrop-blur-xl max-h-[400px] overflow-y-auto custom-scrollbar"
            >
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {ALL_CATEGORIES.map((cat) => (
                  <div key={cat.group} className="space-y-4">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <div className="w-1 h-3 bg-indigo-500 rounded-full" />
                      {cat.group}
                    </h4>
                    <div className="flex flex-col gap-1">
                      {cat.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSearchQuery(option);
                            setShowCategoryDropdown(false);
                          }}
                          className="text-left px-3 py-2 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {processedImages.length > 0 ? (
            processedImages.map((image, index) => (
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
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <Search className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No results found</h3>
              <p className="text-zinc-500">We couldn't find any images matching "{searchQuery}"</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 text-indigo-500 hover:text-indigo-400 font-medium"
              >
                Clear search
              </button>
            </div>
          )}
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
