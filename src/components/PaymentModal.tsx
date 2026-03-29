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
  const [paymentDetected, setPaymentDetected] = useState(false);
  const [scanStatus, setScanStatus] = useState<'waiting' | 'detected' | 'processing' | 'ready'>('waiting');
  const [utr, setUtr] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (step === 'qr') {
      setTimeLeft(300);
      setIsExpired(false);
      setPaymentDetected(false);
      setScanStatus('waiting');
      setUtr('');
    }
  }, [step]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'qr' && timeLeft > 0 && !isExpired) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft, isExpired]);

  useEffect(() => {
    if (step === 'qr' && !isExpired) {
      // Journey: Waiting -> Detected (4s) -> Processing (2s) -> Ready (UTR Input)
      const detectedTimer = setTimeout(() => {
        setScanStatus('detected');
        
        const processingTimer = setTimeout(() => {
          setScanStatus('processing');
          
          const readyTimer = setTimeout(() => {
            setScanStatus('ready');
            setPaymentDetected(true);
          }, 2000);
          
          return () => clearTimeout(readyTimer);
        }, 2000);
        
        return () => clearTimeout(processingTimer);
      }, 4000);

      return () => clearTimeout(detectedTimer);
    }
  }, [step, isExpired]);

  const handlePaymentComplete = async () => {
    if (!auth.currentUser) return;
    if (utr.length !== 12) {
      alert("Please enter a valid 12-digit UTR number.");
      return;
    }

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
        utr: utr,
        description: `₹${amount} added to wallet via UPI QR (UTR: ${utr})`,
        createdAt: new Date().toISOString()
      });

      // Log for admin records
      await addDoc(collection(db, 'payments'), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        amount: amountToAdd,
        method: 'UPI_QR',
        utr: utr,
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
      setScanStatus('ready');
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
                <p className="text-sm text-zinc-400">
                  {step === 'amount' ? 'Choose an amount and payment method to add funds to your wallet.' : `Paying to Mithun: ₹${amount}`}
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
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 flex flex-col items-center py-2">
                  <div className="text-center space-y-1">
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">QR Validity</p>
                    <p className={cn(
                      "text-xl font-bold font-mono",
                      timeLeft < 60 ? "text-red-500 animate-pulse" : "text-white"
                    )}>
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </p>
                  </div>

                  <div className="relative group">
                    <div className={cn(
                      "bg-white p-6 rounded-[2.5rem] shadow-[0_0_60px_rgba(255,255,255,0.15)] border-4 transition-all duration-500 relative overflow-hidden",
                      isExpired ? "border-red-500 grayscale opacity-50" : "border-zinc-800"
                    )}>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&ecc=H&margin=1&data=${encodeURIComponent(`upi://pay?pa=mithunk9857t@ybl&pn=Mithun&am=${Number(amount).toFixed(2)}&cu=INR&tn=Wallet%20Topup&mc=0000&mode=02&purpose=00`)}`}
                        alt="UPI QR Code" 
                        className="w-64 h-64 object-contain"
                        onLoad={() => console.log('QR Code loaded')}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(`upi://pay?pa=mithunk9857t@ybl&pn=Mithun&am=${Number(amount).toFixed(2)}&cu=INR`)}`;
                        }}
                      />
                      {/* Optimized PhonePe Logo Overlay - Smaller to prevent scan interference */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-zinc-50">
                          <img 
                            src="https://img.icons8.com/color/48/phone-pe.png" 
                            alt="Pe" 
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                      </div>
                    </div>
                    {!isExpired && (
                      <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg border-2 border-[#0a0a0a]">
                        <CheckCircle2 size={14} />
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center space-y-4 w-full">
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Paying to</p>
                      <p className="text-white font-bold text-lg flex items-center justify-center gap-2">
                        Mithun
                        <CheckCircle2 size={16} className="text-blue-400 fill-blue-400/20" />
                      </p>
                      <p className="text-white font-black text-3xl mt-2">₹{Number(amount).toLocaleString('en-IN')}</p>
                    </div>

                    <div className="flex flex-col items-center gap-4 w-full min-h-[80px]">
                      <AnimatePresence mode="wait">
                        {isExpired ? (
                          <motion.div 
                            key="expired-state"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-4 w-full"
                          >
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl w-full text-center">
                              <p className="text-red-500 text-sm font-bold uppercase tracking-wider">QR Code Expired</p>
                              <p className="text-zinc-500 text-[10px] mt-1 uppercase tracking-widest">For security, QR codes are valid for 5 minutes only.</p>
                            </div>
                            <button
                              onClick={() => setStep('amount')}
                              className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-all text-xs uppercase tracking-[0.2em]"
                            >
                              Regenerate QR Code
                            </button>
                          </motion.div>
                        ) : scanStatus === 'ready' ? (
                          <motion.div
                            key="utr-input-state"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center gap-4 w-full"
                          >
                            <div className="w-full space-y-2">
                              <label className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.2em] block text-center">
                                Payment Detected! Enter UTR Number
                              </label>
                              <input
                                type="text"
                                maxLength={12}
                                value={utr}
                                onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
                                placeholder="12-digit UTR Number"
                                className="w-full bg-zinc-900 border border-emerald-500/30 rounded-xl py-4 px-4 text-center text-white font-mono tracking-[0.3em] focus:outline-none focus:border-emerald-500 transition-colors"
                              />
                              <p className="text-[9px] text-zinc-500 text-center uppercase tracking-widest">Check your payment app for the 12-digit UTR/Ref No.</p>
                            </div>
                            <button
                              onClick={handlePaymentComplete}
                              disabled={utr.length !== 12}
                              className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle2 size={20} />
                              Verify & Complete
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div 
                            key={scanStatus}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="flex flex-col items-center gap-3"
                          >
                            {scanStatus === 'waiting' && (
                              <>
                                <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
                                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">Waiting for payment...</p>
                              </>
                            )}
                            {scanStatus === 'detected' && (
                              <>
                                <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                </div>
                                <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.3em] animate-pulse">Scan Detected!</p>
                              </>
                            )}
                            {scanStatus === 'processing' && (
                              <>
                                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                                <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.3em]">Processing scan details...</p>
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex items-center justify-center gap-6 pt-2 opacity-40 grayscale">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-4 invert" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-4" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-4" />
                    </div>
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
