import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Video, User, LayoutTemplate, Palette, Youtube, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { PaymentModal } from './PaymentModal';

export default function Pricing() {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState('500');

  const pricingItems = [
    {
      id: '01',
      title: 'AI Video Generation',
      description: 'High-quality AI influencer videos for Explore page',
      price: '15',
      unit: 'per video',
      icon: <Video className="w-5 h-5" />,
      features: ['1080p Resolution', 'Custom AI Avatar', 'Lip-syncing', 'Fast rendering'],
      color: 'text-indigo-400',
      bg: 'bg-indigo-400/10',
      border: 'border-indigo-400/20'
    },
    {
      id: '02',
      title: 'AI Influencer Image',
      description: 'Photorealistic AI model images',
      price: '6',
      unit: 'per image',
      icon: <User className="w-5 h-5" />,
      features: ['4K Resolution', 'Custom poses', 'Various styles', 'Commercial rights'],
      color: 'text-pink-400',
      bg: 'bg-pink-400/10',
      border: 'border-pink-400/20'
    },
    {
      id: '03',
      title: 'Ad Studio Image',
      description: 'Professional product advertisement images',
      price: '7',
      unit: 'per image',
      icon: <LayoutTemplate className="w-5 h-5" />,
      features: ['High conversion design', 'Product placement', 'Multiple aspect ratios', 'Text overlays'],
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      border: 'border-blue-400/20'
    },
    {
      id: '04',
      title: 'Logo Generation',
      description: 'Unique AI-generated logos and icons',
      price: '5',
      unit: 'per logo',
      icon: <Palette className="w-5 h-5" />,
      features: ['Vector quality', 'Transparent background', 'Multiple variations', 'Brand identity'],
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20'
    },
    {
      id: '05',
      title: 'YouTube Thumbnail',
      description: 'Click-worthy thumbnails for your videos',
      price: '10',
      unit: 'per thumbnail',
      icon: <Youtube className="w-5 h-5" />,
      features: ['High CTR designs', 'Custom text', 'Trending styles', 'A/B testing ready'],
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      border: 'border-red-400/20'
    }
  ];

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 custom-scrollbar bg-[#050505] text-white font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header - Corporate & Structured */}
        <div className="border-b border-zinc-800 pb-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                Billing & Plans
              </div>
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-100">
                Service Pricing
              </h1>
              <p className="text-zinc-400 max-w-xl text-sm md:text-base leading-relaxed">
                Transparent, pay-as-you-go pricing for enterprise-grade AI generation. 
                Fund your wallet and consume services on demand.
              </p>
            </div>
            <div className="flex-shrink-0">
              <button 
                onClick={() => {
                  setSelectedAmount('500');
                  setIsPaymentModalOpen(true);
                }}
                className="bg-white text-black px-6 py-3 rounded-none text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2"
              >
                Fund Wallet <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Pricing Grid - Office District / Technical Dashboard Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-800 border border-zinc-800">
          {pricingItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                setSelectedAmount(item.price);
                setIsPaymentModalOpen(true);
              }}
              className="bg-[#0a0a0a] p-8 hover:bg-[#111] transition-colors cursor-pointer group flex flex-col justify-between min-h-[400px]"
            >
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 flex items-center justify-center ${item.bg} ${item.color} border ${item.border}`}>
                    {item.icon}
                  </div>
                  <span className="font-mono text-xs text-zinc-600">{item.id}</span>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-zinc-100 mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-500 line-clamp-2">{item.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-zinc-500 font-mono">₹</span>
                  <span className="text-4xl font-light tracking-tight text-zinc-100">{item.price}</span>
                  <span className="text-xs text-zinc-500 font-mono ml-1">/{item.unit.replace('per ', '')}</span>
                </div>

                <div className="w-full h-px bg-zinc-800/50 my-6"></div>

                <ul className="space-y-3">
                  {item.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3 text-sm text-zinc-400">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 ${item.color} opacity-70`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-800/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-mono text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  Select Plan <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </motion.div>
          ))}
          
          {/* Enterprise Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0a0a0a] p-8 flex flex-col justify-center items-center text-center"
          >
            <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-zinc-500" />
            </div>
            <h3 className="text-lg font-medium text-zinc-100 mb-2">Enterprise Volume</h3>
            <p className="text-sm text-zinc-500 mb-6">
              Need more than 10,000 generations per month? Contact us for custom pricing.
            </p>
            <button className="text-xs font-mono text-zinc-300 uppercase tracking-wider border-b border-zinc-700 pb-1 hover:text-white hover:border-white transition-colors">
              Contact Sales
            </button>
          </motion.div>
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
