import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Video, User, LayoutTemplate, Palette, Youtube, CheckCircle2 } from 'lucide-react';
import { PaymentModal } from './PaymentModal';

export default function Pricing() {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState('500');

  const pricingItems = [
    {
      title: 'AI Video Generation',
      description: 'High-quality AI influencer videos for Explore page',
      price: '₹15',
      unit: 'per video',
      icon: <Video className="w-8 h-8 text-indigo-500" />,
      features: ['1080p Resolution', 'Custom AI Avatar', 'Lip-syncing', 'Fast rendering']
    },
    {
      title: 'AI Influencer Image',
      description: 'Photorealistic AI model images',
      price: '₹6',
      unit: 'per image',
      icon: <User className="w-8 h-8 text-pink-500" />,
      features: ['4K Resolution', 'Custom poses', 'Various styles', 'Commercial rights']
    },
    {
      title: 'Ad Studio Image',
      description: 'Professional product advertisement images',
      price: '₹7',
      unit: 'per image',
      icon: <LayoutTemplate className="w-8 h-8 text-blue-500" />,
      features: ['High conversion design', 'Product placement', 'Multiple aspect ratios', 'Text overlays']
    },
    {
      title: 'Logo Generation',
      description: 'Unique AI-generated logos and icons',
      price: '₹5',
      unit: 'per logo',
      icon: <Palette className="w-8 h-8 text-emerald-500" />,
      features: ['Vector quality', 'Transparent background', 'Multiple variations', 'Brand identity']
    },
    {
      title: 'YouTube Thumbnail',
      description: 'Click-worthy thumbnails for your videos',
      price: '₹10',
      unit: 'per thumbnail',
      icon: <Youtube className="w-8 h-8 text-red-500" />,
      features: ['High CTR designs', 'Custom text', 'Trending styles', 'A/B testing ready']
    }
  ];

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 custom-scrollbar bg-black text-white">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black tracking-tight"
          >
            Pay As You <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Generate</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 text-lg"
          >
            Simple, transparent pricing for all your AI generation needs. No hidden fees, just top up your wallet and start creating.
          </motion.p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {pricingItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              onClick={() => {
                setSelectedAmount(item.price.replace('₹', ''));
                setIsPaymentModalOpen(true);
              }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 hover:bg-zinc-800/50 transition-all duration-300 relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                {item.icon}
              </div>
              
              <div className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="text-zinc-400 text-sm h-10">{item.description}</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black">{item.price}</span>
                  <span className="text-zinc-500 font-medium">{item.unit}</span>
                </div>

                <ul className="space-y-3 pt-4 border-t border-zinc-800">
                  {item.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-3 text-sm text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        initialAmount={selectedAmount}
      />
    </div>
  );
}
