"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { 
  Calendar, 
  Gift, 
  CheckCircle, 
  Clock, 
  Zap,
  Sparkles,
  Lock,
  ChevronLeft,
  TrendingUp,
  Star
} from "lucide-react";

// Reward days configuration with 💸 emoji only
const REWARD_DAYS = [
  { 
    day: 1, 
    amount: 5, 
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    gradient: "from-blue-400 to-blue-500"
  },
  { 
    day: 2, 
    amount: 10, 
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    gradient: "from-green-400 to-green-500"
  },
  { 
    day: 3, 
    amount: 20, 
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
    isRed: true,
    gradient: "from-red-400 to-red-500"
  },
  { 
    day: 4, 
    amount: 25, 
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
    gradient: "from-purple-400 to-purple-500"
  },
  { 
    day: 5, 
    amount: 30, 
    color: "from-yellow-500 to-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-700",
    gradient: "from-yellow-400 to-yellow-500"
  },
  { 
    day: 6, 
    amount: 35, 
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-700",
    gradient: "from-orange-400 to-orange-500"
  },
  { 
    day: 7, 
    amount: 40, 
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    textColor: "text-pink-700",
    gradient: "from-pink-400 to-pink-500"
  }
];

export default function SignInPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signInHistory, setSignInHistory] = useState([]);
  const [todayStats, setTodayStats] = useState({
    currentDay: 0,
    totalClaimed: 0,
    lastClaimed: null,
    canClaim: false,
    nextClaimIn: null
  });
  const [claimLoading, setClaimLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchSignInData();
  }, []);

  const fetchSignInData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Get user info
      const userResponse = await axios.get('/api/wallet/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(userResponse.data);

      // Get sign-in history
      const historyResponse = await axios.get('/api/bonus/signin-history', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const history = historyResponse.data.history || [];
      setSignInHistory(history);

      // Calculate today's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const claimedToday = history.filter(h => {
        const claimDate = new Date(h.claimedAt);
        claimDate.setHours(0, 0, 0, 0);
        return claimDate.getTime() === today.getTime();
      });

      const lastClaim = history.length > 0 ? history[history.length - 1] : null;
      
      // Determine current day streak
      let currentDay = 1;
      if (lastClaim) {
        const lastClaimDate = new Date(lastClaim.claimedAt);
        lastClaimDate.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastClaimDate.getTime() === yesterday.getTime()) {
          // Consecutive claim
          currentDay = (lastClaim.day % 7) + 1;
        } else if (lastClaimDate.getTime() === today.getTime()) {
          // Already claimed today
          currentDay = lastClaim.day;
        } else {
          // Streak broken
          currentDay = 1;
        }
      }

      const canClaim = claimedToday.length === 0;
      
      // Calculate next claim time
      let nextClaimIn = null;
      if (!canClaim && lastClaim) {
        const lastClaimTime = new Date(lastClaim.claimedAt);
        const nextClaimTime = new Date(lastClaimTime);
        nextClaimTime.setDate(nextClaimTime.getDate() + 1);
        nextClaimTime.setHours(0, 0, 0, 0);
        
        const now = new Date();
        if (nextClaimTime > now) {
          const hoursLeft = Math.floor((nextClaimTime - now) / (1000 * 60 * 60));
          const minutesLeft = Math.floor(((nextClaimTime - now) % (1000 * 60 * 60)) / (1000 * 60));
          nextClaimIn = `${hoursLeft}h ${minutesLeft}m`;
        }
      }

      setTodayStats({
        currentDay,
        totalClaimed: history.length,
        lastClaimed: lastClaim,
        canClaim,
        nextClaimIn
      });

    } catch (error) {
      console.error("Error fetching sign-in data:", error);
    } finally {
      setLoading(false);
    }
  };

  const claimSignInBonus = async () => {
    setClaimLoading(true);
    try {
      const token = localStorage.getItem("token");
      const dayToClaim = todayStats.currentDay;
      const reward = REWARD_DAYS[dayToClaim - 1];

      const response = await axios.post('/api/bonus/claim', {
        type: 'sign_in_bonus',
        day: dayToClaim,
        amount: reward.amount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({
        text: `🎉 দিন ${dayToClaim} এর ${reward.amount}৳ বোনাস যোগ হয়েছে!`,
        type: 'success'
      });

      // Refresh data
      await fetchSignInData();

      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);

    } catch (error) {
      setMessage({
        text: error.response?.data?.error || 'বোনাস ক্লেইম করতে সমস্যা হয়েছে',
        type: 'error'
      });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } finally {
      setClaimLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">💸</span>
            </div>
          </div>
          <p className="text-gray-600 font-medium">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 pt-8 pb-12">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button 
              onClick={() => router.back()}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-semibold">ডেইলি সাইন ইন</h1>
          </div>

          {/* User Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold">{user?.firstName || 'User'}</p>
                <p className="text-2xl font-bold mt-1">৳ {((user?.balance || 0) / 100).toFixed(2)}</p>
              </div>
              <div className="bg-white/20 rounded-full px-3 py-1.5 text-sm flex items-center gap-1">
                <Calendar size={14} />
                <span>দিন {todayStats.totalClaimed}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 -mt-8">
        {/* Stats Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">আপনার অগ্রগতি</h2>
            <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
              <TrendingUp size={14} />
              <span>স্ট্রিক {todayStats.currentDay}/7</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{todayStats.totalClaimed}</div>
              <div className="text-xs text-blue-700 font-medium">মোট ক্লেইম</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{todayStats.currentDay}</div>
              <div className="text-xs text-green-700 font-medium">বর্তমান দিন</div>
            </div>
          </div>

          {/* Status */}
          <div className="mt-4 p-3 bg-gray-50 rounded-xl flex items-center justify-between">
            <span className="text-sm text-gray-600">আজকের অবস্থা</span>
            {todayStats.canClaim ? (
              <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                <Zap size={14} />
                ক্লেইম রেডি
              </span>
            ) : (
              <span className="bg-gray-200 text-gray-600 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                <Clock size={14} />
                {todayStats.nextClaimIn || 'কাল'}
              </span>
            )}
          </div>

          {user?.totalDeposited < 10000 && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                <Sparkles size={14} />
                বোনাস পেতে ১০০৳ ডিপোজিট করুন
              </p>
            </div>
          )}
        </div>

        {/* Rewards Grid */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Gift size={18} className="text-red-500" />
            সাপ্তাহিক বোনাস
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {REWARD_DAYS.map((reward) => {
              const isClaimed = signInHistory.some(h => h.day === reward.day);
              const isCurrentDay = reward.day === todayStats.currentDay && !isClaimed && todayStats.canClaim;
              const isLocked = reward.day > todayStats.currentDay || (reward.day === todayStats.currentDay && !todayStats.canClaim);

              return (
                <div
                  key={reward.day}
                  className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${
                    isCurrentDay ? 'ring-2 ring-red-300 shadow-md' : 
                    isClaimed ? 'opacity-90' : ''
                  } ${reward.borderColor}`}
                >
                  {/* Day Header */}
                  <div className={`bg-gradient-to-r ${reward.color} text-white py-2 px-3 text-center font-medium text-sm relative`}>
                    দিন {reward.day}
                    {reward.isRed && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] border-2 border-white">
                        🧧
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 text-center">
                    <div className="relative mb-3">
                      <div className={`w-20 h-20 mx-auto rounded-2xl ${reward.bgColor} flex items-center justify-center text-3xl`}>
                        💸
                      </div>
                      
                      {isClaimed && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-green-500 text-white rounded-full p-1.5 shadow-lg">
                            <CheckCircle size={20} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">বোনাস</p>
                      <p className={`text-xl font-bold ${reward.textColor}`}>৳{reward.amount}</p>
                    </div>

                    {/* Button */}
                    <button
                      onClick={claimSignInBonus}
                      disabled={!isCurrentDay || claimLoading || user?.totalDeposited < 10000}
                      className={`w-full py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isClaimed
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : isLocked
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : user?.totalDeposited < 10000
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : `bg-gradient-to-r ${reward.gradient} text-white hover:opacity-90 shadow-sm`
                      }`}
                    >
                      {claimLoading && isCurrentDay ? (
                        <span className="flex items-center justify-center gap-1">
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          প্রসেসিং
                        </span>
                      ) : isClaimed ? (
                        'ক্লেইমড ✓'
                      ) : isLocked ? (
                        <span className="flex items-center justify-center gap-1">
                          <Lock size={12} />
                          লকড
                        </span>
                      ) : user?.totalDeposited < 10000 ? (
                        'ডিপোজিট প্রয়োজন'
                      ) : (
                        'ক্লেইম'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100 mb-8">
          <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-1.5">
            <Sparkles size={16} />
            কিভাবে কাজ করে?
          </h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-bold mt-0.5">১</div>
              <p className="text-xs text-indigo-800 flex-1">প্রতিদিন ১ বার সাইন ইন বোনাস নিতে পারবেন</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-bold mt-0.5">২</div>
              <p className="text-xs text-indigo-800 flex-1">টানা ৭ দিন সাইন ইন করে বড় বোনাস সংগ্রহ করুন</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-bold mt-0.5">৩</div>
              <p className="text-xs text-indigo-800 flex-1">দিন ৩ এ বিশেষ লাল খাম বোনাস পাবেন</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-bold mt-0.5">৪</div>
              <p className="text-xs text-indigo-800 flex-1">বোনাস পেতে ন্যূনতম ১০০৳ ডিপোজিট প্রয়োজন</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message Toast */}
      {message.text && (
        <div className={`fixed bottom-4 left-4 right-4 max-w-md mx-auto p-4 rounded-2xl shadow-lg z-50 border ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 
          'bg-red-50 text-red-800 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle size={18} className="text-green-600" />
            ) : (
              <span className="text-lg">⚠️</span>
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}