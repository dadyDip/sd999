"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Gift, 
  CalendarCheck, 
  Coins, 
  UserPlus, 
  ChevronRight,
  Sparkles,
  TrendingUp,
  Award,
  Clock,
  Zap
} from "lucide-react";
import axios from "axios";

export default function RewardsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    availableBonuses: 4,
    totalEarned: 0,
    pendingRewards: 2,
    claimCount: 4
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const userResponse = await axios.get('/api/wallet/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userResponse.data);
        
        // Fetch bonus stats
        const bonusResponse = await axios.get('/api/bonus/status', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setStats({
          availableBonuses: bonusResponse.data?.bonuses?.summary?.activeBonuses || 4,
          totalEarned: (userResponse.data?.totalBonusGiven || 125000) / 100,
          pendingRewards: bonusResponse.data?.bonuses?.summary?.pendingBonuses || 2,
          claimCount: bonusResponse.data?.bonuses?.summary?.totalClaimed || 4
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles size={20} className="text-red-500" />
            </div>
          </div>
          <p className="text-gray-600 text-sm">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Premium Header with Gradient */}
      <div className="bg-gradient-to-br from-[#b5002a] via-[#c41e3a] to-[#8b0000] px-5 pt-12 pb-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>

        {/* Header Bar */}
        <div className="relative z-10 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => router.back()}
              className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
            >
              <ChevronRight size={18} className="rotate-180" />
            </button>
            <div className="bg-black/20 backdrop-blur px-5 py-1.5 rounded-full border border-white/20">
              <h1 className="text-white font-semibold text-sm">বোনাস সেন্টার</h1>
            </div>
            <div className="w-9" />
          </div>

          {/* User Profile Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {user?.firstName?.charAt(0) || 'T'}
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white font-semibold">{user?.firstName || 'tonn57'}</p>
                  <span className="bg-yellow-500 text-[10px] px-2 py-0.5 rounded-full text-white">VIP</span>
                </div>
                <p className="text-white/70 text-xs mb-2">আইডি: {user?.id?.slice(-6) || '123456'}</p>
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 rounded-lg px-2 py-1">
                    <p className="text-white/70 text-[8px]">ব্যালেন্স</p>
                    <p className="text-white font-bold text-sm">৳ {((user?.balance || 0) / 100).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-white/5 backdrop-blur rounded-xl p-2 border border-white/10">
              <p className="text-white/60 text-[9px]">উপলব্ধ</p>
              <p className="text-white font-bold text-base">{stats.availableBonuses}</p>
              <p className="text-white/40 text-[7px]">বোনাস</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-2 border border-white/10">
              <p className="text-white/60 text-[9px]">মোট আয়</p>
              <p className="text-white font-bold text-base">৳{stats.totalEarned}</p>
              <p className="text-white/40 text-[7px]">এ পর্যন্ত</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-2 border border-white/10">
              <p className="text-white/60 text-[9px]">পেন্ডিং</p>
              <p className="text-white font-bold text-base">{stats.pendingRewards}</p>
              <p className="text-white/40 text-[7px]">রিওয়ার্ড</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Cards Grid */}
      <div className="max-w-md mx-auto px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-2 gap-3">
          {/* CLAIM Card */}
          <div 
            onClick={() => router.push("/dashboard/bonus/claim")}
            className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="relative mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-md">
                <Gift size={24} />
              </div>
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">
                {stats.claimCount}
              </div>
            </div>
            <h3 className="font-bold text-gray-800 text-base">দাবি করা</h3>
            <p className="text-xs text-gray-400 mt-0.5">বোনাস সংগ্রহ</p>
            <div className="mt-2 flex items-center gap-1 text-green-600 text-xs">
              <Zap size={12} />
              <span>{stats.availableBonuses} টি রেডি</span>
            </div>
          </div>

          {/* SIGN IN Card */}
          <div 
            onClick={() => router.push("/dashboard/signbonus")}
            className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md mb-2">
              <CalendarCheck size={24} />
            </div>
            <h3 className="font-bold text-gray-800 text-base">সাইন ইন</h3>
            <p className="text-xs text-gray-400 mt-0.5">দৈনিক বোনাস</p>
            <div className="mt-2 flex items-center gap-1 text-blue-600 text-xs">
              <Clock size={12} />
              <span>৫ ঘন্টা বাকি</span>
            </div>
          </div>

          {/* REDEMPTION Card */}
          <div 
            onClick={() => router.push("/dashboard/redemption")}
            className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white shadow-md mb-2">
              <Coins size={24} />
            </div>
            <h3 className="font-bold text-gray-800 text-base">উদ্ধার তহবিল</h3>
            <p className="text-xs text-gray-400 mt-0.5">ক্যাশব্যাক</p>
            <div className="mt-2 flex items-center gap-1 text-orange-600 text-xs">
              <TrendingUp size={12} />
              <span>২% রিবেট</span>
            </div>
          </div>

          {/* INVITE Card */}
          <div 
            onClick={() => router.push("/invite")}
            className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 relative"
          >
            <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full">
              ২৫০৳
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md mb-2">
              <UserPlus size={24} />
            </div>
            <h3 className="font-bold text-gray-800 text-base">আমন্ত্রণ</h3>
            <p className="text-xs text-gray-400 mt-0.5">বন্ধুদের করুন</p>
            <div className="mt-2 flex items-center gap-1 text-purple-600 text-xs">
              <Award size={12} />
              <span>প্রতি বন্ধুতে</span>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100">
          <p className="text-xs text-purple-700 text-center">
            🎉 বিশেষ অফার: প্রথম ডিপোজিটে ৫০০৳ এ ৩০০৳ বোনাস!
          </p>
        </div>

        {/* Bottom Info */}
        <div className="mt-6 text-center text-xs text-gray-400 pb-6">
          বোনাস নিতে কার্ডে ক্লিক করুন • শর্ত সাপেক্ষে
        </div>
      </div>
    </div>
  );
}