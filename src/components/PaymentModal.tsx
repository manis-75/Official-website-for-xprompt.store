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
  const [utr, setUtr] = useState('');
  const [step, setStep] = useState<'amount' | 'qr' | 'utr' | 'processing' | 'success'>('amount');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentComplete = async () => {
    if (!auth.currentUser) return;
    if (!utr || utr.length < 6) {
      alert("Please enter a valid UTR number (Transaction ID)");
      return;
    }

    setIsProcessing(true);
    setStep('processing');
    
    try {
      // Record a pending transaction in user's history
      const transactionRef = await addDoc(collection(db, 'users', auth.currentUser.uid, 'transactions'), {
        amount: Number(amount),
        type: 'Credit',
        isCredit: true,
        status: 'pending',
        title: 'Wallet Top-up (Pending)',
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        timestamp: new Date().toISOString(),
        utr: utr,
        method: 'UPI_QR',
        description: `₹${amount} payment pending verification (UTR: ${utr})`,
        createdAt: new Date().toISOString()
      });

      // Create a payment request for admin verification
      await addDoc(collection(db, 'payment_requests'), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        amount: Number(amount),
        utr: utr,
        method: 'UPI_QR',
        status: 'pending',
        transactionId: transactionRef.id,
        createdAt: new Date().toISOString()
      });
      
      setStep('success');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Payment submission error:", error);
      handleFirestoreError(error, OperationType.WRITE, 'payment_requests');
      setStep('utr');
      alert("Failed to submit payment request. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    // Removed automatic simulation
  }, [step]);

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
    setUtr('');
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
                  <p className="text-sm text-zinc-400">Scan the QR code to make the payment.</p>
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
                    {['100', '250', '500', '1000', '2000', '5000'].map((preset) => (
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
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 flex flex-col items-center">
                  <div className="text-center space-y-2 w-full border-b border-zinc-800 pb-6">
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Awaiting Payment</p>
                    <h3 className="text-3xl font-light text-white font-mono">₹{amount}.00</h3>
                    <p className="text-sm text-zinc-400">Scan using any UPI application</p>
                  </div>
                  
                  <div className="bg-white p-4 border-4 border-zinc-800">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=8103094197-3@ybl&pn=AI%20Studio&am=${amount}&cu=INR`)}`}
                      alt="UPI QR Code" 
                      className="w-48 h-48 object-contain"
                    />
                  </div>

                  <div className="w-full space-y-4">
                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 text-center">
                      <p className="text-sm text-zinc-400">Scan the QR code and complete the payment in your UPI app.</p>
                      <p className="text-xs text-zinc-500 mt-2">After payment, click the button below to verify.</p>
                    </div>

                    <button 
                      onClick={() => setStep('utr')}
                      disabled={isProcessing}
                      className="w-full bg-white text-black font-bold text-sm py-4 hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                      I have made the payment
                    </button>
                    
                    <button 
                      onClick={() => setStep('amount')}
                      className="w-full py-3 text-xs font-mono text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
                    >
                      Cancel / Go Back
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'utr' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-white">Enter Transaction Details</h3>
                    <p className="text-sm text-zinc-400">Please provide the UTR number / Transaction ID from your payment app.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">UTR Number / Transaction ID</label>
                      <input 
                        type="text" 
                        value={utr}
                        onChange={(e) => setUtr(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-zinc-500 transition-colors font-mono"
                        placeholder="Enter 12-digit UTR number"
                      />
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                      <p className="text-xs text-amber-500 leading-relaxed">
                        <strong>Important:</strong> Entering a fake or random UTR number will result in permanent account suspension. Our team verifies every transaction manually.
                      </p>
                    </div>

                    <button 
                      onClick={handlePaymentComplete}
                      disabled={isProcessing || !utr || utr.length < 6}
                      className="w-full bg-white text-black font-bold text-sm py-4 hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit for Verification'
                      )}
                    </button>

                    <button 
                      onClick={() => setStep('qr')}
                      className="w-full py-2 text-xs font-mono text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
                    >
                      Go Back to QR
                    </button>
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
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Submitting Request</h3>
                    <p className="text-zinc-400 font-mono text-sm max-w-[250px]">Uploading your payment details for verification...</p>
                  </div>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-8 space-y-6 text-center">
                  <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Request Submitted</h3>
                    <div className="bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-2xl inline-block mt-2">
                      <p className="text-emerald-400 font-mono text-lg font-bold">₹{amount}.00 Pending</p>
                    </div>
                    <p className="text-zinc-500 text-sm mt-4">Your payment request has been submitted. Funds will be added to your wallet within 30-60 minutes after verification.</p>
                  </div>
                  <button 
                    onClick={resetAndClose}
                    className="w-full bg-white text-black font-bold py-4 hover:bg-zinc-200 transition-colors text-sm uppercase tracking-widest mt-4 rounded-xl"
                  >
                    Back to Dashboard
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
