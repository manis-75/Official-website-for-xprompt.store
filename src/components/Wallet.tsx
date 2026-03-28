import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Wallet as WalletIcon, Plus, History, ArrowUpRight, ArrowDownLeft, Search, Filter, CreditCard, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, onSnapshot, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { UserProfile } from '../App';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  isCredit: boolean;
  status: string;
  title: string;
  date: string;
  timestamp: string;
  method?: string;
  description?: string;
}

export const Wallet = ({ onOpenPayment }: { onOpenPayment?: () => void }) => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');

  useEffect(() => {
    if (!auth.currentUser) return;

    // Listen to user balance
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const unsubscribeBalance = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        setBalance(doc.data().walletBalance || 0);
      }
    });

    // Fetch transactions
    const fetchTransactions = async () => {
      try {
        const q = query(
          collection(db, 'users', auth.currentUser!.uid, 'transactions'),
          orderBy('timestamp', 'desc'),
          limit(50)
        );
        const querySnapshot = await getDocs(q);
        const txs: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          txs.push({ id: doc.id, ...doc.data() } as Transaction);
        });
        setTransactions(txs);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();

    return () => {
      unsubscribeBalance();
    };
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesFilter = filter === 'all' || 
                         (filter === 'credit' && tx.isCredit) || 
                         (filter === 'debit' && !tx.isCredit);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <WalletIcon className="text-indigo-500" size={32} />
            My Wallet
          </h1>
          <p className="text-zinc-400 mt-1">Manage your balance and view transaction history</p>
        </div>
        <button
          onClick={() => onOpenPayment?.()}
          className="flex items-center justify-center gap-2 bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-white/5"
        >
          <Plus size={20} />
          Add Funds
        </button>
      </div>

      {/* Balance Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-8 shadow-2xl shadow-indigo-500/20"
        >
          {/* Decorative Circles */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center justify-between">
              <span className="text-indigo-100/80 font-medium tracking-wider uppercase text-xs">Available Balance</span>
              <CreditCard className="text-white/40" size={24} />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-light text-indigo-100">₹</span>
                <span className="text-6xl font-black text-white tracking-tight">
                  {balance.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-indigo-100/60 text-sm">Wallet ID: {auth.currentUser?.uid.slice(0, 8).toUpperCase()}...</p>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-white">Active Account</span>
              </div>
              <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                <RefreshCw className="text-indigo-200" size={14} />
                <span className="text-xs font-medium text-white">Auto-sync enabled</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 flex flex-col justify-between"
        >
          <div className="space-y-6">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
              <History size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Quick Stats</h3>
              <p className="text-zinc-500 text-sm">Your wallet activity summary</p>
            </div>
          </div>

          <div className="space-y-4 mt-8">
            <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-2xl border border-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                  <ArrowDownLeft size={16} />
                </div>
                <span className="text-sm text-zinc-400">Total Added</span>
              </div>
              <span className="text-sm font-bold text-white">₹{transactions.filter(t => t.isCredit).reduce((acc, t) => acc + t.amount, 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-2xl border border-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-rose-500/10 rounded-lg flex items-center justify-center text-rose-500">
                  <ArrowUpRight size={16} />
                </div>
                <span className="text-sm text-zinc-400">Total Spent</span>
              </div>
              <span className="text-sm font-bold text-white">₹{transactions.filter(t => !t.isCredit).reduce((acc, t) => acc + t.amount, 0).toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Transactions Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Recent Transactions
            <span className="text-xs font-normal text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
              {filteredTransactions.length}
            </span>
          </h2>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type="text" 
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors w-full md:w-64"
              />
            </div>
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1">
              {(['all', 'credit', 'debit'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-lg capitalize transition-all",
                    filter === f ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2rem] overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-zinc-500 text-sm font-medium">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="divide-y divide-zinc-800/50">
              {filteredTransactions.map((tx) => (
                <motion.div 
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 flex items-center justify-between hover:bg-zinc-800/20 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                      tx.isCredit ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      {tx.isCredit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm md:text-base">{tx.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-zinc-500">{tx.date}</span>
                        <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                        <span className="text-xs text-zinc-500">{tx.method || 'Wallet'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-black text-lg",
                      tx.isCredit ? "text-emerald-500" : "text-white"
                    )}>
                      {tx.isCredit ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mt-0.5">
                      {tx.status}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-zinc-800/50 rounded-3xl flex items-center justify-center text-zinc-600">
                <History size={32} />
              </div>
              <div>
                <h3 className="text-white font-bold">No transactions found</h3>
                <p className="text-zinc-500 text-sm mt-1">Your transaction history will appear here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
