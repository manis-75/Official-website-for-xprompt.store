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
}

export const PaymentModal = ({ isOpen, onClose, initialAmount = '500', onSuccess }: PaymentModalProps) => {
  const [amount, setAmount] = useState(initialAmount);
  const [step, setStep] = useState<'amount' | 'method' | 'qr' | 'verify' | 'processing' | 'success' | 'enter-upi-id' | 'awaiting-upi-approval'>('amount');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [utr, setUtr] = useState('');
  const [upiId, setUpiId] = useState('');

  const handleProceed = () => {
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount < 10 || numAmount > 10000) {
      alert("Please enter a valid amount between ₹10 and ₹10,000");
      return;
    }
    setStep('method');
  };

  const handleMethodSelect = (method: string, methodName: string) => {
    setSelectedMethod(methodName);
    
    const isUpiApp = ['gpay', 'phonepe', 'paytm', 'bhim'].includes(method);

    if (isUpiApp) {
      setStep('enter-upi-id');
    } else if (method === 'qr') {
      setStep('qr');
    } else {
      setStep('verify');
    }
  };

  const handleUpiSubmit = () => {
    if (!upiId || !upiId.includes('@')) {
      alert("Please enter a valid UPI ID (e.g., name@ybl)");
      return;
    }
    setStep('awaiting-upi-approval');
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (step === 'awaiting-upi-approval') {
      // Simulate the user approving the request on their phone after 8 seconds
      timeout = setTimeout(() => {
        handlePaymentComplete(selectedMethod || 'UPI');
      }, 8000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [step, selectedMethod, amount]);

  const handlePaymentComplete = async (methodName: string = 'QR Code', utrNumber?: string) => {
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
      await setDoc(userRef, {
        walletBalance: newBalance
      }, { merge: true });
      
      // Add transaction record
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'transactions'), {
        title: `Wallet top-up via ${methodName}`,
        date: new Date().toLocaleString(),
        type: 'payment',
        amount: addedAmount,
        balance: newBalance,
        isCredit: true,
        utr: utrNumber || null,
        timestamp: new Date()
      });
      
      setStep('success');
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (error) {
      console.error("Payment error:", error);
      handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser.uid}`);
      setStep('method');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAndClose = () => {
    setStep('amount');
    setSelectedMethod(null);
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
                {step === 'method' && (
                  <p className="text-sm text-zinc-400">Select a payment method to proceed.</p>
                )}
                {step === 'qr' && (
                  <p className="text-sm text-zinc-400">Scan the QR code to make the payment.</p>
                )}
                {step === 'verify' && (
                  <p className="text-sm text-zinc-400">Enter your UTR number to verify the payment.</p>
                )}
                {step === 'enter-upi-id' && (
                  <p className="text-sm text-zinc-400">Enter your UPI ID to receive a payment request.</p>
                )}
                {step === 'awaiting-upi-approval' && (
                  <p className="text-sm text-zinc-400">Approve the payment request on your mobile app.</p>
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

              {step === 'method' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="text-center space-y-2 w-full border-b border-zinc-800 pb-6">
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Select Payment Method</p>
                    <h3 className="text-3xl font-light text-white font-mono">₹{amount}.00</h3>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">UPI Apps</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => handleMethodSelect('gpay', 'Google Pay')} className="flex flex-col items-center justify-center gap-3 p-4 border border-zinc-800 bg-[#111] hover:bg-zinc-800 transition-colors h-24">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-6 object-contain" />
                        <span className="text-xs font-medium text-zinc-400">Google Pay</span>
                      </button>
                      <button onClick={() => handleMethodSelect('phonepe', 'PhonePe')} className="flex flex-col items-center justify-center gap-3 p-4 border border-zinc-800 bg-[#111] hover:bg-zinc-800 transition-colors h-24">
                        <img src="https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png" alt="PhonePe" className="h-8 object-contain scale-150" />
                        <span className="text-xs font-medium text-zinc-400">PhonePe</span>
                      </button>
                      <button onClick={() => handleMethodSelect('paytm', 'Paytm')} className="flex flex-col items-center justify-center gap-3 p-4 border border-zinc-800 bg-[#111] hover:bg-zinc-800 transition-colors h-24">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="h-5 object-contain" />
                        <span className="text-xs font-medium text-zinc-400">Paytm</span>
                      </button>
                      <button onClick={() => handleMethodSelect('bhim', 'BHIM UPI')} className="flex flex-col items-center justify-center gap-3 p-4 border border-zinc-800 bg-[#111] hover:bg-zinc-800 transition-colors h-24">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-6 object-contain" />
                        <span className="text-xs font-medium text-zinc-400">BHIM UPI</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-zinc-800">
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Other Methods</p>
                    <button onClick={() => handleMethodSelect('qr', 'QR Code')} className="w-full flex items-center justify-between p-4 border border-zinc-800 bg-[#111] hover:bg-zinc-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <QrCode className="w-5 h-5 text-zinc-400" />
                        <span className="text-sm font-medium text-zinc-300">Show QR Code</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-600" />
                    </button>
                    <button onClick={() => handleMethodSelect('card', 'Credit/Debit Card')} className="w-full flex items-center justify-between p-4 border border-zinc-800 bg-[#111] hover:bg-zinc-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-zinc-400" />
                        <span className="text-sm font-medium text-zinc-300">Credit / Debit Card</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-600" />
                    </button>
                  </div>

                  <button 
                    onClick={() => setStep('amount')}
                    className="w-full py-3 text-xs font-mono text-zinc-500 hover:text-white transition-colors uppercase tracking-widest mt-4"
                  >
                    Back to Amount
                  </button>
                </motion.div>
              )}

              {step === 'processing' && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
                  <Loader2 className="w-12 h-12 text-zinc-400 animate-spin" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-white uppercase tracking-wider">Processing Payment</h3>
                    <p className="text-zinc-400 font-mono text-sm">Please wait while we confirm your payment</p>
                  </div>
                </motion.div>
              )}

              {step === 'enter-upi-id' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="text-center space-y-2 w-full border-b border-zinc-800 pb-6">
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">UPI Payment</p>
                    <h3 className="text-xl font-light text-white font-mono">Enter your UPI ID</h3>
                    <p className="text-sm text-zinc-400">A payment request will be sent to this UPI ID.</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">UPI ID (VPA)</label>
                    <div className="relative flex items-center border border-zinc-800 bg-black focus-within:border-zinc-500 transition-colors rounded-xl overflow-hidden">
                      <input 
                        type="text" 
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                        className="w-full bg-transparent py-4 px-4 text-lg font-light text-white focus:outline-none font-mono"
                        placeholder="e.g. 9876543210@ybl"
                      />
                    </div>
                  </div>

                  <div className="w-full space-y-3 pt-4">
                    <button 
                      onClick={handleUpiSubmit}
                      disabled={!upiId.includes('@')}
                      className="w-full bg-white text-black font-medium text-sm py-4 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send Payment Request
                    </button>
                    
                    <button 
                      onClick={() => setStep('method')}
                      className="w-full py-3 text-xs font-mono text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
                    >
                      Cancel / Go Back
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'awaiting-upi-approval' && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-8 space-y-6 text-center">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
                    <Smartphone className="w-8 h-8 text-zinc-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-white uppercase tracking-wider">Approve Payment</h3>
                    <p className="text-zinc-400 text-sm max-w-[280px] mx-auto leading-relaxed">
                      We have sent a request of <span className="text-white font-mono font-bold">₹{amount}.00</span> to <span className="text-white font-mono">{upiId}</span>.
                    </p>
                    <p className="text-zinc-500 text-xs">
                      Please open your {selectedMethod} app to approve the payment.
                    </p>
                  </div>
                  
                  <div className="pt-6 w-full">
                     <button 
                      onClick={() => setStep('enter-upi-id')}
                      className="w-full py-3 text-xs font-mono text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
                    >
                      Cancel Request
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

                  <div className="w-full space-y-3">
                    <button 
                      onClick={() => setStep('verify')}
                      className="w-full bg-white text-black font-medium text-sm py-4 hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 uppercase tracking-wider"
                    >
                      I have made the payment
                    </button>
                    
                    <button 
                      onClick={() => setStep('method')}
                      className="w-full py-3 text-xs font-mono text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
                    >
                      Cancel / Go Back
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'verify' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="text-center space-y-2 w-full border-b border-zinc-800 pb-6">
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Payment Verification</p>
                    <h3 className="text-xl font-light text-white font-mono">Enter UTR Number</h3>
                    <p className="text-sm text-zinc-400">Please enter the 12-digit reference number to confirm your payment of ₹{amount}.00</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">UTR / Reference No.</label>
                    <div className="relative flex items-center border border-zinc-800 bg-black focus-within:border-zinc-500 transition-colors">
                      <input 
                        type="text" 
                        value={utr}
                        onChange={(e) => setUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
                        className="w-full bg-transparent py-4 px-4 text-lg font-light text-white focus:outline-none font-mono tracking-widest"
                        placeholder="123456789012"
                      />
                    </div>
                  </div>

                  <div className="w-full space-y-3 pt-4">
                    <button 
                      onClick={() => {
                        if (utr.length !== 12) {
                          alert("Please enter a valid 12-digit UTR number");
                          return;
                        }
                        setStep('processing');
                        setTimeout(() => handlePaymentComplete(selectedMethod || 'UPI', utr), 2000);
                      }}
                      className="w-full bg-white text-black font-medium text-sm py-4 hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 uppercase tracking-wider"
                    >
                      Verify Payment
                    </button>
                    
                    <button 
                      onClick={() => setStep('method')}
                      className="w-full py-3 text-xs font-mono text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
                    >
                      Cancel / Go Back
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-8 space-y-6 text-center">
                  <div className="w-16 h-16 border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium text-white uppercase tracking-wider">Transaction Successful</h3>
                    <p className="text-zinc-400 font-mono text-sm">₹{amount}.00 added to wallet</p>
                  </div>
                  <button 
                    onClick={resetAndClose}
                    className="w-full border border-zinc-800 text-white px-6 py-3 hover:bg-zinc-800 transition-colors text-sm font-mono uppercase tracking-widest mt-4"
                  >
                    Return to Dashboard
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
