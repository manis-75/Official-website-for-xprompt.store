import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: string;
  onSuccess?: () => void;
}

export const PaymentModal = ({ isOpen, onClose, initialAmount = '500', onSuccess }: PaymentModalProps) => {
  const [amount, setAmount] = useState(initialAmount);
  const [step, setStep] = useState<'amount' | 'qr' | 'success'>('amount');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProceed = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    setStep('qr');
  };

  const handlePaymentComplete = async () => {
    if (!auth.currentUser) return;
    setIsProcessing(true);
    
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      let currentBalance = 0;
      if (userSnap.exists()) {
        currentBalance = userSnap.data().walletBalance || 0;
      }
      
      const addedAmount = Number(amount);
      const newBalance = currentBalance + addedAmount;
      
      // Update wallet balance
      await updateDoc(userRef, {
        walletBalance: newBalance
      });
      
      // Add transaction record
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'transactions'), {
        title: 'Wallet top-up via QR',
        date: new Date().toLocaleString(),
        type: 'payment',
        amount: addedAmount,
        balance: newBalance,
        isCredit: true,
        timestamp: new Date()
      });
      
      setStep('success');
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (error) {
      console.error("Payment error:", error);
      handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser.uid}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={step === 'success' ? onClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#141414] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                Add Funds
              </h2>
              <button 
                onClick={onClose}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {step === 'amount' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Enter Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-medium text-zinc-400">₹</span>
                      <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded-xl py-4 pl-10 pr-4 text-2xl font-bold text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {['100', '500', '1000'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setAmount(preset)}
                        className={cn(
                          "py-2 rounded-lg text-sm font-medium border transition-colors",
                          amount === preset 
                            ? "bg-indigo-500/10 border-indigo-500 text-indigo-400" 
                            : "bg-black border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                        )}
                      >
                        ₹{preset}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={handleProceed}
                    className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                  >
                    Proceed to Pay
                    <ArrowUpRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {step === 'qr' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 flex flex-col items-center">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-bold text-white">Scan to Pay ₹{amount}</h3>
                    <p className="text-sm text-zinc-400">Use any UPI app (PhonePe, GPay, Paytm)</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl">
                    {/* Placeholder QR Code - replace with actual if needed */}
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" 
                      alt="UPI QR Code" 
                      className="w-48 h-48 object-contain"
                    />
                  </div>

                  <button 
                    onClick={handlePaymentComplete}
                    disabled={isProcessing}
                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? 'Verifying Payment...' : 'I have paid'}
                  </button>
                  
                  <button 
                    onClick={() => setStep('amount')}
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    Back to amount
                  </button>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mb-2">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Payment Successful!</h3>
                  <p className="text-zinc-400">₹{amount} has been added to your wallet.</p>
                  <button 
                    onClick={onClose}
                    className="mt-4 bg-zinc-800 text-white px-6 py-2 rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
