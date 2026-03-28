import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, ArrowRight, CheckCircle2, QrCode, Smartphone, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: string;
  onSuccess?: () => void;
  onLoginClick?: () => void;
}

export const PaymentModal = ({ isOpen, onClose, initialAmount = '500', onSuccess, onLoginClick }: PaymentModalProps) => {
  const [amount, setAmount] = useState(initialAmount);
  const [step, setStep] = useState<'amount' | 'qr'>('amount');

  const handleProceed = () => {
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount < 10 || numAmount > 10000) {
      alert("Please enter a valid amount between ₹10 and ₹10,000");
      return;
    }
    setStep('qr');
  };

  const resetAndClose = () => {
    setStep('amount');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm font-sans"
        >
          <motion.div
            initial={{ scale: 0.98, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#0a0a0a] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 pb-2 shrink-0">
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-white">QR Code Generator</h2>
                <p className="text-sm text-zinc-400">
                  {step === 'amount' ? 'Select an amount to generate a payment QR code.' : `Payment QR for ₹${amount}`}
                </p>
              </div>
              <button 
                onClick={resetAndClose}
                className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {step === 'amount' && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  
                  <div className="grid grid-cols-3 gap-3">
                    {['100', '250', '499', '1000', '2000', '5000'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setAmount(preset)}
                        className={cn(
                          "py-3 text-sm font-medium rounded-xl border transition-colors",
                          amount === preset 
                            ? "border-zinc-500 text-white bg-zinc-800" 
                            : "border-zinc-800 text-zinc-300 hover:bg-zinc-800/50"
                        )}
                      >
                        ₹{preset}
                      </button>
                    ))}
                  </div>

                  <div>
                    <div className="relative flex items-center border border-zinc-800 rounded-xl bg-[#0a0a0a] focus-within:border-zinc-500 transition-colors overflow-hidden">
                      <span className="pl-4 text-zinc-500">₹</span>
                      <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-transparent py-3.5 px-3 text-sm text-white focus:outline-none"
                        placeholder="Custom amount"
                      />
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">Min: ₹10 · Max: ₹10,000</p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button 
                      onClick={resetAndClose}
                      className="px-6 py-2.5 rounded-xl border border-zinc-800 text-white text-sm font-medium hover:bg-zinc-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleProceed}
                      disabled={!amount || Number(amount) < 10 || Number(amount) > 10000}
                      className="px-6 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white text-black hover:bg-zinc-200"
                    >
                      Generate
                    </button>
                  </div>
                </motion.div>
              )}
              {step === 'qr' && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 flex flex-col items-center py-2">
                  <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_0_60px_rgba(255,255,255,0.15)] border-4 border-zinc-800">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`upi://pay?pa=mithunk9857t@ybl&pn=Mithun&am=${amount}&cu=INR`)}`}
                      alt="UPI QR Code" 
                      className="w-64 h-64 object-contain"
                    />
                  </div>
                  
                  <div className="text-center">
                    <p className="text-zinc-500 text-xs uppercase tracking-widest">Scan to pay ₹{amount}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
