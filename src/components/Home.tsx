import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Youtube, Palette, LayoutTemplate, User, Compass, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface HomeProps {
  onTabChange?: (tab: string) => void;
}

const FEATURES = [
  {
    id: 'AI Influencer',
    title: 'AI Influencer',
    subtitle: 'Create hyper-realistic AI models',
    icon: User,
    colSpan: 'md:col-span-2',
    color: 'from-pink-500/20 to-purple-500/20',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'Ad Studio',
    title: 'Ad Studio',
    subtitle: 'High-converting ad templates',
    icon: LayoutTemplate,
    colSpan: 'md:col-span-1',
    color: 'from-blue-500/20 to-cyan-500/20',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'Thumbnail',
    title: 'YouTube Thumbnail',
    subtitle: 'Viral thumbnail designs',
    icon: Youtube,
    colSpan: 'md:col-span-1',
    color: 'from-red-500/20 to-orange-500/20',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'Logo Prompt',
    title: 'Logo Generator',
    subtitle: 'Professional brand identities',
    icon: Palette,
    colSpan: 'md:col-span-1',
    color: 'from-emerald-500/20 to-teal-500/20',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'Icon Prompt',
    title: 'Icon Assets',
    subtitle: 'Premium icon collections',
    icon: Sparkles,
    colSpan: 'md:col-span-1',
    color: 'from-amber-500/20 to-yellow-500/20',
    image: 'https://images.unsplash.com/photo-1613909207039-6b173b755cc1?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'Explore',
    title: 'Explore Gallery',
    subtitle: 'Discover community creations',
    icon: Compass,
    colSpan: 'md:col-span-3',
    color: 'from-indigo-500/20 to-blue-500/20',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
  },
];

const FeatureCard = ({ feature, index, onClick }: { feature: any, index: number, onClick: () => void }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopImage = async () => {
      try {
        // Fetch the latest 20 images to find the most liked/sold one without needing a composite index
        const q = query(collection(db, feature.id), orderBy('createdAt', 'desc'), limit(20));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          let topImage = snapshot.docs[0].data();
          let maxPopularity = (topImage.likes || 0) + (topImage.sales || 0);

          snapshot.docs.forEach(doc => {
            const data = doc.data();
            const popularity = (data.likes || 0) + (data.sales || 0);
            if (popularity > maxPopularity) {
              maxPopularity = popularity;
              topImage = data;
            }
          });

          if (topImage.url) {
            setImageUrl(topImage.url);
          }
        }
      } catch (error) {
        console.error("Error fetching top image for category:", feature.id, error);
      }
    };
    fetchTopImage();
  }, [feature.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-3xl cursor-pointer bg-zinc-900 border border-white/5 transition-all duration-500 hover:border-white/20",
        feature.colSpan,
        "min-h-[280px]"
      )}
    >
      {/* Background Image */}
      {(imageUrl || feature.image) && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-500"
          style={{ backgroundImage: `url(${imageUrl || feature.image})` }}
        />
      )}
      
      {/* Gradient Overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-80 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-90",
        feature.color
      )} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 p-8 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
            <feature.icon className="w-6 h-6 text-white" />
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:translate-x-2 transition-transform duration-500">
            {feature.title}
          </h3>
          <p className="text-zinc-300 font-medium group-hover:translate-x-2 transition-transform duration-500 delay-75">
            {feature.subtitle}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export const Home = ({ onTabChange }: HomeProps) => {
  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-7xl mx-auto flex flex-col gap-12">
      <div>
        <div className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
          >
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Ad Studio</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-zinc-400 max-w-2xl"
          >
            Your all-in-one creative powerhouse. Generate stunning AI influencers, high-converting ads, viral thumbnails, and premium brand assets in seconds.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              index={index}
              onClick={() => {
                if (onTabChange) {
                  onTabChange(feature.id);
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
