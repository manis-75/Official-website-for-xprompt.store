import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, Clock, X, CreditCard } from 'lucide-react';
import { cn } from '../lib/utils';
import { PaymentModal } from './PaymentModal';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';

export default function Wallet() {
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWalletData = async () => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setBalance(userSnap.data().walletBalance || 0);
      }
    } catch (error) {
      console.error("Error fetching user doc:", error);
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser?.uid}`);
    }

    try {
      const q = query(
        collection(db, 'users', auth.currentUser.uid, 'transactions'),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const txs: any[] = [];
      querySnapshot.forEach((doc) => {
        txs.push({ id: doc.id, ...doc.data() });
      });
      setTransactions(txs);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      handleFirestoreError(error, OperationType.LIST, `users/${auth.currentUser?.uid}/transactions`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 custom-scrollbar bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <WalletIcon className="w-6 h-6" />
            <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
          </div>
          <p className="text-zinc-400 text-sm">Manage your credits and payments</p>
        </div>

        {/* Balance Card */}
        <div className="bg-[#141414] border border-zinc-800/50 rounded-xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-zinc-400 text-sm">Available Balance</p>
            <div className="text-4xl font-bold tracking-tight">₹ {balance.toFixed(2)}</div>
          </div>
          <button 
            onClick={() => setIsAddingFunds(true)}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Funds
          </button>
        </div>

        {/* Transaction History */}
        <div className="bg-[#141414] border border-zinc-800/50 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-6">Transaction History</h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              No transactions yet.
            </div>
          ) : (
            <div className="space-y-0">
              {transactions.map((tx, index) => (
                <div 
                  key={tx.id} 
                  className={cn(
                    "flex items-center justify-between py-4",
                    index !== transactions.length - 1 && "border-b border-zinc-800/50"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {tx.isCredit ? (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{tx.title}</p>
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {tx.date}
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 font-medium border border-zinc-700/50">
                          {tx.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <p className={cn(
                      "font-bold text-sm",
                      tx.isCredit ? "text-emerald-500" : "text-red-500"
                    )}>
                      {tx.isCredit ? "+" : "-"}₹{Math.abs(tx.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Bal: ₹{tx.balance?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <PaymentModal 
        isOpen={isAddingFunds} 
        onClose={() => setIsAddingFunds(false)} 
        onSuccess={() => {
          setIsAddingFunds(false);
          fetchWalletData();
        }}
      />
    </div>
  );
}
