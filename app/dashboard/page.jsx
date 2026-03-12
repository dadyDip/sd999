"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  BarChart3,
  Wallet,
  ClipboardList,
  ArrowDown,
  User,
  Shield,
  Users,
  Gift,
  Coins,
  Mail,
  MessageCircle,
  Download,
  Headphones,
  HelpCircle,
  RefreshCw,
  Copy,
  Check
} from "lucide-react";

// Import modals
import styles from "./profileCard.module.css";
import { DepositModal } from "@/components/wallet/DepositModal";
import { WithdrawModal } from "@/components/wallet/WithdrawModal";
import { TransactionModal } from "@/components/dashboard/TransactionList";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);
  
  // Modal states
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransactionType, setSelectedTransactionType] = useState(null);

  // Load user from localStorage and fetch real data
  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!stored || !token) {
      router.replace("/login");
      return;
    }

    setUser(JSON.parse(stored));

    // Fetch real dashboard data
    Promise.all([
      fetch("/api/wallet/summary", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch("/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    ])
      .then(([summaryData, txData]) => {
        if (summaryData.error) {
          router.replace("/login");
          return;
        }
        setSummary(summaryData);
        setTransactions(txData);
        setLoading(false);
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router]);

  const refreshData = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    Promise.all([
      fetch("/api/wallet/summary", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch("/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    ])
      .then(([summaryData, txData]) => {
        if (!summaryData.error) {
          setSummary(summaryData);
          setTransactions(txData);
        }
      })
      .catch(() => {});
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  };

  const handleTransactionClick = (type) => {
    setSelectedTransactionType(type);
    setShowTransactionModal(true);
  };

  if (loading || !user || !summary) {
    return (
      <main className="min-h-screen bg-gray-100 pb-20">
        <div className="h-screen flex items-center justify-center">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </main>
    );
  }

  // Format balance (assuming balance is in paisa/cent)
  const balance = ((summary.balance || 0) / 100).toFixed(2);
  const totalDeposited = ((summary.totalDeposited || 0) / 100).toFixed(2);
  const totalWithdrawn = ((summary.totalWithdrawn || 0) / 100).toFixed(2);
  const totalDepositAmount = (summary?.totalDeposited || 0) / 100;

  let vipLevel = 0;

  if (totalDepositAmount >= 5000) vipLevel = 2;
  else if (totalDepositAmount >= 500) vipLevel = 1;

  const vipConfig = {
    0: {
      label: "VIP0",
      badge: "/vip/vip0.png",
      color: "bg-gray-200 text-gray-700"
    },
    1: {
      label: "VIP1",
      badge: "/vip/vip1.png",
      color: "bg-yellow-700 text-white"
    },
    2: {
      label: "VIP2",
      badge: "/vip/vip2.png",
      color: "bg-gray-400 text-white"
    }
  };
  // Stats calculations
  const gamesPlayed = summary?.gamesPlayed ?? 0;
  const wins = summary?.wins ?? 0;
  const losses = summary?.losses ?? 0;
  const winRate = gamesPlayed === 0 ? "0%" : `${Math.round((wins / gamesPlayed) * 100)}%`;

  const menu = [
    { icon: Trophy, label: "পুরস্কার সেন্টার", onClick: () => router.push("/dashboard/bonus") },
    { icon: BarChart3, label: "বেটিং রেকর্ড", onClick: () => router.push("/dashboard/betting-records") },
    { icon: Wallet, label: "লাভ এবং লস", onClick: () => router.push("/dashboard/profit-loss") },
    { icon: ClipboardList, label: "জমা রেকর্ড", onClick: () => handleTransactionClick("deposit") },
    { icon: ArrowDown, label: "উত্তোলন রেকর্ড", onClick: () => handleTransactionClick("withdraw") },
    { icon: User, label: "আমার অ্যাকাউন্ট", onClick: () => router.push("/dashboard/payment") },
    { icon: Users, label: "বন্ধুদের আমন্ত্রণ জানান", onClick: () => router.push("/invite") },
    { icon: Gift, label: "মিশন", onClick: () => router.push("/") },
    { icon: Coins, label: "রিবেট", onClick: () => router.push("/") },
    { icon: Mail, label: "মেইল", onClick: () => router.push("/") },
    { icon: MessageCircle, label: "পরামর্শ", onClick: () => router.push("/") },
    { icon: Download, label: "অ্যাপ ডাউনলোড", onClick: () => router.push("/") },
    { icon: Headphones, label: "কাস্টমার সার্ভিস", onClick: () => router.push("/") },
    { icon: HelpCircle, label: "সহায়তা কেন্দ্র", onClick: () => router.push("/") },
  ];

  return (
    <main className="min-h-screen bg-gray-100 pb-20">
      {/* TOP BAR */}
      <div className="bg-red-600 text-white p-4 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 hover:bg-red-700 rounded-full transition">
          ←
        </button>
        <h1 className="font-semibold">আমার অ্যাকাউন্ট</h1>
        <button 
          onClick={refreshData}
          className="p-2 hover:bg-red-700 rounded-full transition"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* PROFILE CARD */}
      <div className="max-w-5xl mx-auto px-4 mt-4">

      <div
      style={{
      position: "relative",
      borderRadius: "22px",
      padding: "20px",
      background: "linear-gradient(135deg,#eef2f6,#e3e8ee)",
      boxShadow: "0 8px 18px rgba(0,0,0,0.15)",
      overflow: "hidden"
      }}
      >

      {/* VIP MEDAL BACKGROUND */}
      <img
      src="/vip-medal.png"
      style={{
      position: "absolute",
      right: "-20px",
      top: "-20px",
      width: "170px",
      opacity: 0.18,
      pointerEvents: "none"
      }}
      />

      {/* SIGN IN BADGE */}
      <div
      style={{
      position: "absolute",
      right: 0,
      top: 0,
      background: "linear-gradient(180deg,#ff4b4b,#c60000)",
      color: "white",
      padding: "6px 18px",
      borderBottomLeftRadius: "18px",
      fontSize: "13px",
      fontWeight: 600
      }}
      >
      ✔ সাইন ইন
      </div>

      {/* USER ROW */}
      <div style={{display:"flex",alignItems:"center",gap:"14px"}}>

      <img
      src={summary.avatar || `https://i.pravatar.cc/150?u=${user.id}`}
      style={{
      width:"64px",
      height:"64px",
      borderRadius:"50%",
      border:"3px solid white",
      boxShadow:"0 3px 8px rgba(0,0,0,0.2)"
      }}
      />

      <div style={{flex:1}}>

      {/* VIP BADGE */}
      <div
      style={{
      display:"inline-block",
      padding:"4px 14px",
      fontSize:"12px",
      borderRadius:"20px",
      fontWeight:700,
      marginBottom:"4px",
      background:
      vipLevel === 0
      ? "#ffffff"
      : vipLevel === 1
      ? "linear-gradient(135deg,#b87333,#d89a5b)"
      : "linear-gradient(135deg,#c0c0c0,#8c8c8c)",
      color: vipLevel === 0 ? "#444" : "white",
      border: vipLevel === 0 ? "1px solid #ccc" : "none"
      }}
      >
      VIP{vipLevel}
      </div>

      {/* USERNAME */}
      <div style={{display:"flex",alignItems:"center",gap:"6px"}}>

      <h2 style={{fontSize:"18px",fontWeight:700,color:"#000"}}>
      {user.firstName || "User"}
      </h2>

      <button
      onClick={() => copyToClipboard(user.username,"username")}
      style={{background:"none",border:"none",cursor:"pointer"}}
      >
      {copied === "username"
      ? <Check size={16} color="green"/>
      : <Copy size={16} color="#555"/>}
      </button>

      </div>


      {/* JOIN DATE */}
      <div style={{fontSize:"12px",color:"#555"}}>
      যোগদান করেছেন: {new Date(user.createdAt || Date.now()).toLocaleDateString("bn-BD")}
      </div>

      </div>

      </div>

      {/* BALANCE ROW */}
      <div
      style={{
      marginTop:"18px",
      display:"flex",
      alignItems:"center",
      justifyContent:"space-between"
      }}
      >

      <div
      style={{
      fontSize:"30px",
      fontWeight:800,
      color:"#000"
      }}
      >
      ৳ {balance}
      </div>

      <button
      onClick={refreshData}
      style={{
      border:"none",
      background:"#e7ecf1",
      padding:"6px",
      borderRadius:"50%",
      cursor:"pointer"
      }}
      >
      <RefreshCw size={20} color="#444"/>
      </button>

      </div>

      {/* ACTION BUTTONS */}
      <div
        style={{
          marginTop: "14px",
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "8px"
        }}
      >
        <button
          onClick={() => router.push("/deposit")}
          style={{
            background: "#f3f5f7",
            color: "black",
            borderRadius: "22px",
            padding: "8px 0",
            fontSize: "13px",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.12), inset -2px -2px 4px rgba(255,255,255,0.8)"
          }}
        >
          জমা দিন
        </button>

        <button
          onClick={() => router.push("/dashboard/withdraw")}
          style={{
            background: "#f3f5f7",
            color: "black",
            borderRadius: "22px",
            padding: "8px 0",
            fontSize: "13px",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.12), inset -2px -2px 4px rgba(255,255,255,0.8)"
          }}
        >
          উত্তোলন
        </button>

        <button
          onClick={() => router.push("/dashboard/payment")}
          style={{
            background: "#f3f5f7",
            color: "black",
            borderRadius: "22px",
            padding: "8px 0",
            fontSize: "13px",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.12), inset -2px -2px 4px rgba(255,255,255,0.8)"
          }}
        >
          আমার অ্যাকাউন্ট
        </button>
      </div>
      </div>
      </div>

      {/* MEMBER CENTER */}
      <div className="max-w-5xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">
            সদস্য সেন্টার
          </h3>

          <div className="grid grid-cols-4 md:grid-cols-6 gap-6">
            {menu.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  onClick={item.onClick}
                  className="flex flex-col items-center text-center gap-2 cursor-pointer hover:scale-105 transition"
                >
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-yellow-600" />
                  </div>
                  <p className="text-xs text-gray-600 leading-tight">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>


      {/* LOGOUT BUTTON */}
      <div className="max-w-5xl mx-auto px-4 mt-8">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/login");
          }}
          className="w-full py-3 rounded-xl border border-red-500/30 text-red-600 hover:bg-red-500/10 transition"
        >
          লগআউট
        </button>
      </div>

      {/* MODALS */}
      <DepositModal 
        isOpen={showDeposit} 
        onClose={() => setShowDeposit(false)}
        onSuccess={refreshData}
      />
      
      <WithdrawModal 
        isOpen={showWithdraw} 
        onClose={() => setShowWithdraw(false)}
        onSuccess={refreshData}
        balance={summary.balance}
      />

      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false);
          setSelectedTransactionType(null);
        }}
        transactions={transactions}
        type={selectedTransactionType}
      />
    </main>
  );
}