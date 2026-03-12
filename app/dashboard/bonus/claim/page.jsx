"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Gift, 
  Clock, 
  Calendar,
  Sparkles,
  ChevronRight,
  Zap,
  Award,
  UserPlus,
  Coins
} from "lucide-react";
import axios from "axios";

export default function ClaimPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState({
    days: 0,
    hours: 13,
    minutes: 44,
    seconds: 18
  });

  useEffect(() => {
    fetchUserData();
    
    // Update timer every second
    const interval = setInterval(() => {
      setTimer(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
          if (minutes < 0) {
            minutes = 59;
            hours--;
            if (hours < 0) {
              hours = 23;
              days--;
              if (days < 0) {
                days = 3;
                hours = 0;
                minutes = 0;
                seconds = 0;
              }
            }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const userResponse = await axios.get('/api/wallet/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userResponse.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = () => {
    return `${timer.days}d ${timer.hours.toString().padStart(2, '0')}:${timer.minutes.toString().padStart(2, '0')}:${timer.seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-red-600 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-red-700 rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold">দাবি করা</h1>
        </div>
      </div>

      {/* User Info Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-xl">
              {user?.firstName?.charAt(0) || 'T'}
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.firstName || 'tonn57'}</p>
              <p className="text-sm text-gray-500">আইডি: {user?.id?.slice(-6) || '123456'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">ব্যালেন্স</p>
            <p className="text-lg font-bold text-gray-900">৳ {((user?.balance || 0) / 100).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 max-w-lg mx-auto">
        {/* Stats Row */}
        <div className="flex items-center justify-between bg-white rounded-xl p-3 mb-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Gift size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">উপলব্ধ</p>
              <p className="font-bold text-gray-900">৩টি</p>
            </div>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <Award size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">ক্লেইমড</p>
              <p className="font-bold text-gray-900">১টি</p>
            </div>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <Zap size={16} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">পেন্ডিং</p>
              <p className="font-bold text-gray-900">২টি</p>
            </div>
          </div>
        </div>

        {/* Main Coupon Card */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-start gap-4">
            {/* Left - Coupon Image */}
            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex flex-col items-center justify-center text-white p-2">
              <Gift size={24} className="mb-1" />
              <span className="text-xs font-medium">কুপন</span>
              <span className="text-lg font-bold">৳১</span>
            </div>

            {/* Right - Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-gray-900">অ্যাপ ডাউনলোড বোনাস</h3>
                  <p className="text-xs text-gray-500 mt-1">সর্বোচ্চ ৳77,777 বোনাস</p>
                </div>
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                  লিমিটেড
                </span>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2 mb-3">
                <Clock size={14} className="text-gray-400" />
                <span className="text-sm font-mono font-medium text-gray-700">{formatTimer()}</span>
                <span className="text-xs text-gray-400">বাকি</span>
              </div>

              {/* Claim Button */}
              <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition">
                দাবি
              </button>
            </div>
          </div>

          {/* Date */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar size={12} />
              <span>মেয়াদ: ২০২৬.০৩.১১</span>
            </div>
            <span className="text-xs text-green-600">সক্রিয়</span>
          </div>
        </div>

        {/* More Coupons */}
        <h2 className="text-sm font-medium text-gray-700 mb-3">আরও অফার</h2>
        
        <div className="space-y-3">
          {/* Coupon 2 - First Deposit - Navigates to /deposit */}
          <div 
            onClick={() => router.push("/deposit")}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:border-purple-200 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex flex-col items-center justify-center text-white">
                <Coins size={20} className="mb-1" />
                <span className="text-lg font-bold">৫০০৳</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">প্রথম ডিপোজিট</h3>
                <p className="text-sm text-purple-600 font-medium mb-2">৩০০৳ বোনাস</p>
                <div className="flex items-center gap-2">
                  <Clock size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-500">২ দিন বাকি</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </div>
          </div>

          {/* Coupon 3 - Referral - Navigates to /invite */}
          <div 
            onClick={() => router.push("/invite")}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:border-green-200 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex flex-col items-center justify-center text-white">
                <UserPlus size={20} className="mb-1" />
                <span className="text-lg font-bold">২৫০৳</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">বন্ধুদের আমন্ত্রণ</h3>
                <p className="text-sm text-green-600 font-medium mb-2">প্রতি বন্ধুতে ২৫০৳</p>
                <div className="flex items-center gap-2">
                  <Clock size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-500">৭ দিন বাকি</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </div>
          </div>

          {/* Coupon 4 - Daily Bonus - Navigates to /dashboard/bonus/sign-bonus */}
          <div 
            onClick={() => router.push("/dashboard/bonus/sign-bonus")}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:border-orange-200 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex flex-col items-center justify-center text-white">
                <Zap size={20} className="mb-1" />
                <span className="text-lg font-bold">৫০৳</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">ডেইলি বোনাস</h3>
                <p className="text-sm text-orange-600 font-medium mb-2">প্রতিদিন লগইন করুন</p>
                <div className="flex items-center gap-2">
                  <Zap size={12} className="text-orange-500" />
                  <span className="text-xs text-orange-500 font-medium">আজই ক্লেইম করুন</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Info Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            প্রতিদিন নতুন অফার আসে • শর্ত সাপেক্ষে
          </p>
        </div>
      </div>
    </div>
  );
}