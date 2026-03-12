"use client";

import { ArrowDown, ArrowUp, Calendar, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import axios from "axios";

export default function DashboardPage() {
  const [tab, setTab] = useState("today");
  const [typeFilter, setTypeFilter] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [walletSummary, setWalletSummary] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabs = [
    { id: "today", label: "আজ" },
    { id: "yesterday", label: "গতকাল" },
    { id: "7days", label: "7 দিন" },
    { id: "30days", label: "30 দিন" },
    { id: "all", label: "সব" }
  ];

  // Fetch user data and transactions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        
        if (!token) {
          setError("Please login first");
          setLoading(false);
          return;
        }

        // Fetch wallet summary
        try {
          const summaryResponse = await axios.get('/api/wallet/summary', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(summaryResponse.data);
          setWalletSummary(summaryResponse.data);
        } catch (error) {
          console.error("Error fetching wallet summary:", error);
        }

        // Fetch transactions
        try {
          const transactionsResponse = await axios.get('/api/transactions', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Handle different response structures
          let transactionsData = transactionsResponse.data?.data || 
                                transactionsResponse.data?.transactions || 
                                transactionsResponse.data;
          
          // Make sure it's an array
          transactionsData = Array.isArray(transactionsData) ? transactionsData : [];
          
          // Filter ONLY COMPLETED transactions
          const completedTransactions = transactionsData.filter(tx => 
            (tx.status ?? "").toUpperCase() === "COMPLETED"
          );
          
          setTransactions(completedTransactions);

        } catch (error) {
          console.error("Error fetching transactions:", error);
          if (error.response?.status === 401) {
            setError("Session expired. Please login again.");
            localStorage.removeItem("token");
          } else {
            setError("Failed to load transactions");
          }
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter transactions based on tab and type
  const filteredTransactions = useMemo(() => {
    const transactionList = Array.isArray(transactions) ? transactions : [];
    let list = [...transactionList];

    // Filter by type
    if (typeFilter !== "all") {
      list = list.filter((tx) => 
        (tx.type ?? "").toUpperCase() === typeFilter?.toUpperCase()
      );
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Filter by date tab
    if (tab === "today") {
      list = list.filter((tx) => {
        const d = new Date(tx.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === now.getTime();
      });
    }

    if (tab === "yesterday") {
      const y = new Date();
      y.setDate(now.getDate() - 1);
      y.setHours(0, 0, 0, 0);

      list = list.filter((tx) => {
        const d = new Date(tx.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === y.getTime();
      });
    }

    if (tab === "7days") {
      const past = new Date();
      past.setDate(now.getDate() - 7);
      list = list.filter((tx) => new Date(tx.createdAt) >= past);
    }

    if (tab === "30days") {
      const past = new Date();
      past.setDate(now.getDate() - 30);
      list = list.filter((tx) => new Date(tx.createdAt) >= past);
    }

    // Sort by date (newest first)
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return list;
  }, [transactions, typeFilter, tab]);

  // Calculate totals
  const { totalDeposit, totalWithdraw, netProfit } = useMemo(() => {
    const deposit = filteredTransactions
      .filter(tx => (tx.type ?? "").toUpperCase() === "DEPOSIT")
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    const withdraw = filteredTransactions
      .filter(tx => (tx.type ?? "").toUpperCase() === "WITHDRAW")
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    return {
      totalDeposit: deposit,
      totalWithdraw: withdraw,
      netProfit: withdraw - deposit // Withdraw minus Deposit = Net Profit
    };
  }, [filteredTransactions]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'আজ';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'গতকাল';
    } else {
      return date.toLocaleDateString('bn-BD', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `৳ ${(amount / 100).toFixed(2)}`;
  };

  // Get date range text for filter button
  const getDateRangeText = () => {
    const now = new Date();
    switch(tab) {
      case 'today':
        return now.toLocaleDateString('bn-BD');
      case 'yesterday':
        const y = new Date();
        y.setDate(now.getDate() - 1);
        return y.toLocaleDateString('bn-BD');
      case '7days':
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return `${sevenDaysAgo.toLocaleDateString('bn-BD')} - ${now.toLocaleDateString('bn-BD')}`;
      case '30days':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return `${thirtyDaysAgo.toLocaleDateString('bn-BD')} - ${now.toLocaleDateString('bn-BD')}`;
      default:
        return "সব সময়";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow max-w-md mx-4">
          <div className="text-6xl mb-4 text-red-500">⚠️</div>
          <p className="text-lg font-medium text-red-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">দয়া করে লগইন করুন</p>
          {error.includes('login') ? (
            <button 
              onClick={() => window.location.href = '/login'} 
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg"
            >
              লগইন করুন
            </button>
          ) : (
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg"
            >
              আবার চেষ্টা করুন
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER */}
      <div className="bg-red-700 text-white p-4 flex items-center justify-between sticky top-0 z-10">
        <button className="p-1">
          <Wallet className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-lg">প্রফিট/লস ড্যাশবোর্ড</h2>
        <button onClick={handleLogout} className="text-sm">
          লগআউট
        </button>
      </div>

      {/* WALLET SUMMARY CARD */}
      {walletSummary && (
        <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">বর্তমান ব্যালেন্স</p>
              <p className="text-2xl font-bold">{formatCurrency(walletSummary.balance || walletSummary.totalBalance || 0)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">মোট {walletSummary.totalTransactions || transactions.length} লেনদেন</p>
              {walletSummary.name && (
                <p className="text-xs opacity-75 mt-1">{walletSummary.name}</p>
              )}
            </div>
          </div>
        </div>
      )}


      {/* SLIDING TABS */}
      <div className="border-b bg-white overflow-x-auto">
        <div className="flex min-w-max">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm whitespace-nowrap transition ${
                tab === t.id
                  ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                  : "text-gray-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex gap-2 p-3 border-b bg-white overflow-x-auto">
        <button 
          onClick={() => setTypeFilter("all")}
          className={`border px-3 py-1 rounded-md text-sm whitespace-nowrap ${
            typeFilter === "all" 
              ? "bg-blue-500 text-white border-blue-500" 
              : "border-blue-500 text-blue-500"
          }`}
        >
          সব
        </button>
        <button 
          onClick={() => setTypeFilter("deposit")}
          className={`border px-3 py-1 rounded-md text-sm whitespace-nowrap ${
            typeFilter === "deposit" 
              ? "bg-gray-700 text-white border-gray-700" 
              : "border-gray-500 text-gray-700"
          }`}
        >
          শুধু জমা
        </button>
        <button 
          onClick={() => setTypeFilter("withdraw")}
          className={`border px-3 py-1 rounded-md text-sm whitespace-nowrap ${
            typeFilter === "withdraw" 
              ? "bg-green-600 text-white border-green-600" 
              : "border-green-600 text-green-600"
          }`}
        >
          শুধু উত্তোলন
        </button>
        <button className="border border-blue-500 text-blue-500 px-3 py-1 rounded-md text-sm flex items-center gap-1 whitespace-nowrap">
          <Calendar size={14} />
          {getDateRangeText()}
        </button>
      </div>

      {/* STATUS INFO BADGE */}
      <div className="px-3 pt-2">
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
          শুধু COMPLETED লেনদেন দেখানো হচ্ছে
        </span>
      </div>

      {/* TRANSACTION LIST */}
      <div className="flex-1 overflow-y-auto p-3">
        <h3 className="text-sm font-medium text-gray-700 mb-2 px-1">
          লেনদেন ইতিহাস ({filteredTransactions.length})
        </h3>

        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-blue-500 bg-white rounded-lg">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-lg font-medium">কোন লেনদেন নেই</p>
            <p className="text-sm text-gray-500 mt-2">এই সময়ে কোনো COMPLETED লেনদেন পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="space-y-2 pb-4">
            {filteredTransactions.map((tx) => {
              const isDeposit = (tx.type ?? "").toUpperCase() === "DEPOSIT";

              return (
                <div
                  key={tx.id}
                  className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-start hover:shadow-md transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {isDeposit ? (
                        <ArrowDown className="w-4 h-4 text-gray-700" />
                      ) : (
                        <ArrowUp className="w-4 h-4 text-green-600" />
                      )}
                      <p className={`text-sm font-medium ${isDeposit ? 'text-gray-900' : 'text-green-600'}`}>
                        {isDeposit ? "জমা" : "উত্তোলন"}
                      </p>
                      {tx.method && (
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 uppercase">
                          {tx.method}
                        </span>
                      )}
                      {/* Completed badge */}
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Completed
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDate(tx.createdAt)} - {formatTime(tx.createdAt)}
                    </p>
                    
                    {tx.provider && (
                      <p className="text-xs text-gray-400 mt-1">
                        via {tx.provider} {tx.reference && `• ${tx.reference.slice(-4)}`}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-bold text-lg ${
                        isDeposit ? 'text-gray-900' : 'text-green-600'
                      }`}
                    >
                      {isDeposit ? "" : "+"} {formatCurrency(tx.amount)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {tx.id?.slice(-8)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {filteredTransactions.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 shadow-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">মোট লেনদেন:</span>
            <span className="font-medium">{filteredTransactions.length} টি</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-gray-600">নেট প্রফিট:</span>
            <span className="font-bold text-blue-600">
              {formatCurrency(Math.abs(netProfit))}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1 text-xs">
            <span className="text-gray-500">মোট জমা:</span>
            <span className="text-gray-900">{formatCurrency(totalDeposit)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">মোট উত্তোলন:</span>
            <span className="text-green-600">{formatCurrency(totalWithdraw)}</span>
          </div>
        </div>
      )}
            {/* PROFIT/LOSS CARDS */}
      <div className="p-4 grid grid-cols-2 gap-3 bg-white border-b">
        {/* Deposit Card - Black */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-700">মোট জমা</span>
            <ArrowDown className="w-5 h-5 text-gray-700" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalDeposit)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {filteredTransactions.filter(tx => (tx.type ?? "").toUpperCase() === "DEPOSIT").length} টি লেনদেন
          </p>
        </div>

        {/* Withdraw Card - Green (Profit) */}
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">মোট উত্তোলন</span>
            <ArrowUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalWithdraw)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {filteredTransactions.filter(tx => (tx.type ?? "").toUpperCase() === "WITHDRAW").length} টি লেনদেন
          </p>
        </div>

        {/* Net Profit - Withdraw minus Deposit */}
        <div className="col-span-2 bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">নেট প্রফিট</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600 mt-1">
            {formatCurrency(Math.abs(netProfit))}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {tab === "today" && "আজকের"}
            {tab === "yesterday" && "গতকালের"}
            {tab === "7days" && "গত ৭ দিনের"}
            {tab === "30days" && "গত ৩০ দিনের"}
            {tab === "all" && "সর্বমোট"}
            {" "}নেট প্রফিট (উত্তোলন - জমা)
          </p>
        </div>
      </div>
    </div>
  );
}