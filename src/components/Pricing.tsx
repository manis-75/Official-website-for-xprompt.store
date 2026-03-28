import React from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Star, Shield, Crown, ArrowRight, Wallet as WalletIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  icon: React.ReactNode;
  color: string;
}

const PLANS: PricingPlan[] = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for beginners exploring AI generation",
    icon: <Zap className="text-blue-400" size={24} />,
    color: "blue",
    features: [
      "10 Free Prompts (One-time)",
      "Standard Resolution",
      "Public Gallery Access",
      "Basic Support",
      "Community Access"
    ]
  },
  {
    name: "Pro",
    price: "₹499",
    description: "For creators who need more power and flexibility",
    isPopular: true,
    icon: <Star className="text-indigo-400" size={24} />,
    color: "indigo",
    features: [
      "Unlimited AI Generations",
      "4K Ultra HD Resolution",
      "Private Mode",
      "Priority Support",
      "Commercial Usage Rights",
      "Advanced Editing Tools"
    ]
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Tailored solutions for teams and businesses",
    icon: <Crown className="text-amber-400" size={24} />,
    color: "amber",
    features: [
      "Everything in Pro",
      "Dedicated Account Manager",
      "Custom Model Training",
      "SLA Guarantee",
      "Team Collaboration"
    ]
  }
];

export const Pricing = ({ onTabChange, onOpenPayment }: { onTabChange?: (tab: string) => void, onOpenPayment?: (amount: string) => void }) => {
  const handlePlanAction = (plan: PricingPlan) => {
    if (plan.price === 'Free') {
      onTabChange?.('Explore');
      return;
    }
    
    if (plan.price === 'Custom') {
      if (onOpenPayment) {
        onOpenPayment('5000'); // Open payment modal with a custom high amount
      } else {
        onTabChange?.('Wallet');
      }
      return;
    }

    // Extract numeric value from price string (e.g., "₹499" -> "499")
    const amount = plan.price.replace(/[^0-9]/g, '');
    if (amount && onOpenPayment) {
      onOpenPayment(amount);
    } else {
      onTabChange?.('Wallet');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 font-sans">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest"
        >
          <Zap size={14} />
          Pricing Plans
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-black text-white tracking-tight"
        >
          Simple, Transparent <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500">Pricing for Everyone</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-400 text-lg"
        >
          Choose the plan that fits your creative needs. No hidden fees, cancel anytime.
        </motion.p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 3) }}
            className={cn(
              "relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-500 group",
              plan.isPopular 
                ? "bg-zinc-900 border-indigo-500/50 shadow-2xl shadow-indigo-500/10 scale-105 z-10" 
                : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
            )}
          >
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                Most Popular
              </div>
            )}

            <div className="mb-8 space-y-4">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500",
                plan.color === 'blue' ? "bg-blue-500/10" : 
                plan.color === 'indigo' ? "bg-indigo-500/10" : "bg-amber-500/10"
              )}>
                {plan.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                <p className="text-zinc-500 text-sm mt-1">{plan.description}</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                {plan.price !== 'Free' && plan.price !== 'Custom' && (
                  <span className="text-zinc-500 text-sm">/month</span>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-4 mb-8">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                    <Check className="text-indigo-400" size={12} />
                  </div>
                  <span className="text-zinc-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handlePlanAction(plan)}
              className={cn(
                "w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn",
                plan.isPopular 
                  ? "bg-white text-black hover:bg-zinc-200" 
                  : "bg-zinc-800 text-white hover:bg-zinc-700"
              )}
            >
              Get Started
              <ArrowRight className="transition-transform group-hover/btn:translate-x-1" size={16} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Wallet CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-indigo-600/10 to-violet-600/10 border border-indigo-500/20 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
              <WalletIcon size={20} />
            </div>
            <h3 className="text-2xl font-bold text-white">Pay as you go with Wallet</h3>
          </div>
          <p className="text-zinc-400 max-w-xl">
            Don't want a subscription? Add funds to your wallet and pay only for what you use. 
            Credits never expire and can be used for any generation.
          </p>
        </div>
        <button
          onClick={() => onTabChange?.('Wallet')}
          className="px-8 py-4 bg-indigo-500 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 whitespace-nowrap"
        >
          Check Wallet Balance
        </button>
      </motion.div>

      {/* FAQ Preview */}
      <div className="text-center pt-8">
        <p className="text-zinc-500 text-sm">
          Have questions? <button className="text-indigo-400 hover:underline font-medium">Contact our support team</button>
        </p>
      </div>
    </div>
  );
};
