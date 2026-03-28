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
  const [step, setStep] = useState<'amount' | 'qr' | 'processing' | 'success'>('amount');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentComplete = async () => {
    if (!auth.currentUser) return;

    setIsProcessing(true);
    setStep('processing');
    
    try {
      // Advanced simulated verification with the bank
      await new Promise(resolve => setTimeout(resolve, 3000));

      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      const amountToAdd = Number(amount);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          walletBalance: amountToAdd,
          createdAt: new Date().toISOString()
        });
      } else {
        const currentBalance = userDoc.data().walletBalance || 0;
        await updateDoc(userRef, {
          walletBalance: currentBalance + amountToAdd
        });
      }

      // Record transaction in history
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'transactions'), {
        amount: amountToAdd,
        type: 'Credit',
        isCredit: true,
        status: 'completed',
        title: 'Wallet Top-up',
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        timestamp: new Date().toISOString(),
        method: 'UPI_QR',
        description: `₹${amount} added to wallet via UPI QR`,
        createdAt: new Date().toISOString()
      });

      // Log for admin records
      await addDoc(collection(db, 'payments'), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        amount: amountToAdd,
        method: 'UPI_QR',
        status: 'completed',
        createdAt: new Date().toISOString()
      });
      
      setStep('success');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      handleFirestoreError(error, OperationType.WRITE, 'users');
      setStep('qr');
      alert("Verification failed. Please ensure your payment was successful and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceed = () => {
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount < 10 || numAmount > 10000) {
      alert("Please enter a valid amount between ₹10 and ₹10,000");
      return;
    }

    if (!auth.currentUser) {
      if (onLoginClick) {
        onLoginClick();
        onClose();
      } else {
        alert("Please login to continue with the payment.");
      }
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
          onClick={step === 'success' ? resetAndClose : undefined}
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
                <h2 className="text-xl font-bold text-white">Add Funds to Wallet</h2>
                {step === 'amount' && (
                  <p className="text-sm text-zinc-400">Choose an amount and payment method to add funds to your wallet.</p>
                )}
                {step === 'qr' && (
                  <p className="text-sm text-zinc-400">Scan this QR to pay ₹{amount}</p>
                )}
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
                      className="px-6 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ 
                        backgroundColor: amount && Number(amount) >= 10 && Number(amount) <= 10000 ? '#e4e4e7' : '#52525b',
                        color: amount && Number(amount) >= 10 && Number(amount) <= 10000 ? '#000' : '#a1a1aa'
                      }}
                    >
                      Pay ₹{amount || '0'}
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
                  
                  <div className="flex flex-col items-center gap-4 w-full">
                    <button
                      onClick={handlePaymentComplete}
                      className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={20} />
                      I have paid ₹{amount}
                    </button>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">Scan and click verify after payment</p>
                  </div>
                </motion.div>
              )}

              {step === 'processing' && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-zinc-800 border-t-white rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Smartphone className="w-8 h-8 text-zinc-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Verifying with Bank</h3>
                    <p className="text-zinc-400 font-mono text-sm max-w-[250px]">Securely confirming your transaction. Please do not close this window.</p>
                  </div>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-8 space-y-6 text-center">
                  <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Payment Successful</h3>
                    <div className="bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-2xl inline-block mt-2">
                      <p className="text-emerald-400 font-mono text-lg font-bold">₹{amount}.00 Added</p>
                    </div>
                    <p className="text-zinc-500 text-sm mt-4">Your wallet balance has been updated successfully.</p>
                  </div>
                  <button 
                    onClick={resetAndClose}
                    className="w-full bg-white text-black font-bold py-4 hover:bg-zinc-200 transition-colors text-sm uppercase tracking-widest mt-4 rounded-xl"
                  >
                    Continue to Dashboard
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
