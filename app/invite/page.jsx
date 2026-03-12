"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { 
  Copy, 
  Share2, 
  CheckCircle, 
  Users, 
  Gift, 
  Zap, 
  RefreshCw,
  DollarSign,
  Target,
  Award,
  TrendingUp,
  Clock,
  Medal,
  Crown
} from "lucide-react";

/* ================== Animated Counter ================== */
function Counter({ value }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = value / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        start = value;
        clearInterval(timer);
      }
      setCount(Math.floor(start));
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <>{count.toLocaleString()}</>;
}

/* ================== Reward Card ================== */
function RewardCard({ icon, title, amount, count }) {
  return (
    <div style={styles.rewardCard}>
      <img src={icon} width="55" alt={title} />
      <div>
        <div style={styles.rewardTitle}>{title}</div>
        <div style={styles.rewardAmount}>
          ৳ <Counter value={amount} />
        </div>
        <div style={styles.rewardCount}>{count} দাবিত</div>
      </div>
    </div>
  );
}

/* ================== Stat Box ================== */
function StatBox({ title, value }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <div style={styles.statBox}>
      <div>{title}</div>
      <div style={{ fontWeight: "bold", fontSize: 18 }}>
        ৳ {mounted ? <Counter value={value} /> : value.toLocaleString()}
      </div>
    </div>
  );
}

export default function InvitePage() {
  const router = useRouter();

  const [winners, setWinners] = useState([]);
  const [stats, setStats] = useState({
    today: 0,
    yesterday: 0,
    sucipotrodhari: 0,  // Active bonuses
    joggo: 0,            // Active referrals
  });
  const [mounted, setMounted] = useState(false);

  // Real referral data from your schema
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,      // Total users referred
    activeReferrals: 0,      // joggo - active referrals
    pendingReferrals: 0,     // Pending referrals waiting for conditions
    totalEarned: 0,          // Total bonus earned from referrals
    eligibleFriends: []      // Friends ready to claim
  });
  const [activeBonuses, setActiveBonuses] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);

  // Fix hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  /* ================== FETCH REAL DATA FROM YOUR API ================== */
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch winners/leaderboard data (keep for demo)
        const res = await fetch("https://dummyjson.com/users");
        const data = await res.json();
        const mapped = data.users.slice(0, 10).map((u) => ({
          name: u.username.slice(0, 2) + "******",
          amount: Math.floor(Math.random() * 1000 + 500),
        }));
        setWinners(mapped);

        // Fetch real user data from your API
        const token = localStorage.getItem("token");
        if (token) {
          const [userResponse, bonusResponse, referralResponse] = await Promise.all([
            axios.get('/api/wallet/summary', {
              headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get('/api/bonus/status', {
              headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get('/api/referral/stats', {
              headers: { Authorization: `Bearer ${token}` }
            })
          ]);

          setUser(userResponse.data);
          
          // Set referral stats from API
          setReferralStats({
            totalReferrals: referralResponse.data?.totalReferrals || 0,
            activeReferrals: referralResponse.data?.activeReferrals || 0,
            pendingReferrals: referralResponse.data?.pendingReferrals || 0,
            totalEarned: referralResponse.data?.totalEarned || 0,
            eligibleFriends: referralResponse.data?.eligibleFriends || []
          });
          
          // Set active bonuses
          setActiveBonuses(bonusResponse.data?.bonuses?.active || []);
          
          // Calculate REAL stats from your API data
          // Based on your schema:
          // - today: today's earnings from bonusTransactions
          // - yesterday: yesterday's earnings
          // - sucipotrodhari: active bonuses count
          // - joggo: active referrals count
          
          // Get today's date range
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          // You might need to fetch these from a separate endpoint
          // For now, using available data
          setStats({
            today: userResponse.data?.todayEarnings || 0,
            yesterday: userResponse.data?.yesterdayEarnings || 0,
            sucipotrodhari: bonusResponse.data?.bonuses?.summary?.activeBonuses || 0,
            joggo: referralResponse.data?.activeReferrals || 0,
          });
        }
      } catch (err) {
        console.log("Error fetching data:", err);
      }
    }

    fetchData();
  }, []);

  /* ================== Smooth Slide Animation ================== */
  useEffect(() => {
    const interval = setInterval(() => {
      setWinners((prev) => {
        if (prev.length === 0) return prev;
        return [...prev.slice(1), prev[0]];
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  /* ================== Referral Functions ================== */
  const copyCode = () => {
    const codeToCopy = user?.promoCode || "SHARE123";
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setMessage(`📋 রেফারেল কোড কপি হয়েছে!`);
    setMessageType('success');
  };

  const claimReferralReward = async (friendId) => {
    setClaimLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/bonus/claim', {
        type: 'referral_reward',
        friendId: friendId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage(`💰 ২৫০৳ রেফারেল বোনাস যোগ হয়েছে!`);
      setMessageType('success');
      
      // Refresh data
      const referralResponse = await axios.get('/api/referral/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReferralStats(referralResponse.data);
      
    } catch (error) {
      setMessage(error.response?.data?.error || 'রিওয়ার্ড ক্লেইম করতে সমস্যা হয়েছে');
      setMessageType('error');
    } finally {
      setClaimLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <button onClick={() => router.back()} style={styles.backBtn}>←</button>
          বন্ধুদের আমন্ত্রণ জানান
          <div style={{ width: 24 }} />
        </div>
        <div style={{ padding: 20, textAlign: 'center' }}>লোড হচ্ছে...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <button onClick={() => router.back()} style={styles.backBtn}>
          ←
        </button>
        বন্ধুদের আমন্ত্রণ জানান
        <div style={{ width: 24 }} />
      </div>

      {/* ================== STATS SECTION ================== */}
      <div style={styles.statsGrid}>
        <StatBox title="আজকের আয়" value={stats.today} />
        <StatBox title="গতকালের আয়" value={stats.yesterday} />
        <StatBox title="সূচিপত্রধারী" value={stats.sucipotrodhari} />
        <StatBox title="যোগ্য পরিচারক" value={stats.joggo} />
      </div>

      {/* ================== REFERRAL SECTION ================== */}
      <div className="mx-4 mb-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-sm">
                <Gift size={16} className="text-white" />
              </div>
              <div>
                <span className="text-xs text-gray-500 font-medium">রেফারেল প্রোগ্রাম</span>
                <h3 className="text-sm font-semibold text-gray-900">প্রতি বন্ধুতে ৳২৫০-৳৫০০</h3>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
              <Users size={14} className="text-gray-500" />
              <span className="text-xs font-medium text-gray-700">{referralStats.totalReferrals}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Promo Code Row */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-200">
              <div className="flex items-center gap-1.5 mb-1">
                <Share2 size={12} className="text-gray-400" />
                <span className="text-[10px] font-medium text-gray-500">আপনার কোড</span>
              </div>
              <div className="font-mono font-bold text-gray-900 text-base tracking-wider">
                {user?.promoCode || "লগইন করুন"}
              </div>
            </div>
            {user?.promoCode ? (
              <button
                onClick={copyCode}
                className="h-[68px] w-[68px] bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <Copy size={18} className="text-rose-500" />
                <span className="text-[10px] font-medium text-rose-600">
                  {copied ? 'কপিড' : 'কপি'}
                </span>
              </button>
            ) : (
              <div className="h-[68px] w-[68px] bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center justify-center gap-1">
                <span className="text-xl text-gray-400">🔒</span>
                <span className="text-[9px] font-medium text-gray-400">লগইন</span>
              </div>
            )}
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5 border border-gray-100">
              <div className="w-7 h-7 rounded-md bg-rose-100 flex items-center justify-center">
                <Share2 size={14} className="text-rose-500" />
              </div>
              <div>
                <span className="text-[9px] text-gray-500">ধাপ ১</span>
                <p className="text-xs font-medium text-gray-800">কোড শেয়ার</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5 border border-gray-100">
              <div className="w-7 h-7 rounded-md bg-emerald-100 flex items-center justify-center">
                <DollarSign size={14} className="text-emerald-600" />
              </div>
              <div>
                <span className="text-[9px] text-gray-500">ধাপ ২</span>
                <p className="text-xs font-medium text-gray-800">৩০০৳ ডিপোজিট</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5 border border-gray-100">
              <div className="w-7 h-7 rounded-md bg-amber-100 flex items-center justify-center">
                <Target size={14} className="text-amber-600" />
              </div>
              <div>
                <span className="text-[9px] text-gray-500">ধাপ ৩</span>
                <p className="text-xs font-medium text-gray-800">৩০০০৳ বাজি</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5 border border-gray-100">
              <div className="w-7 h-7 rounded-md bg-purple-100 flex items-center justify-center">
                <Award size={14} className="text-purple-600" />
              </div>
              <div>
                <span className="text-[9px] text-gray-500">ধাপ ৪</span>
                <p className="text-xs font-medium text-gray-800">৳২৫০-৳৫০০ বোনাস</p>
              </div>
            </div>
          </div>

          {/* Eligible Friends */}
          {referralStats.eligibleFriends?.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap size={14} className="text-amber-500" />
                  <span className="text-xs font-medium text-gray-700">ক্লেইম রেডি</span>
                </div>
                <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-200">
                  {referralStats.eligibleFriends.length}
                </span>
              </div>
              
              <div className="space-y-2">
                {referralStats.eligibleFriends.slice(0, 2).map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {friend.firstName?.charAt(0) || friend.phone?.charAt(0) || 'ব'}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-800">
                          {friend.firstName || 'বন্ধু'} {friend.lastName || ''}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-600">
                            ডি: {friend.totalDeposited/100}৳
                          </span>
                          <span className="text-[9px] bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-600">
                            বি: {friend.totalTurnover/100}৳
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => claimReferralReward(friend.id)}
                      disabled={claimLoading}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 text-emerald-700 text-[10px] font-medium transition-colors flex items-center gap-1"
                    >
                      {claimLoading ? (
                        <RefreshCw size={10} className="animate-spin" />
                      ) : (
                        <>
                          <CheckCircle size={10} />
                          ক্লেইম
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mini Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="text-center flex-1">
              <span className="text-[9px] text-gray-500 block">রেফারেল</span>
              <span className="text-sm font-semibold text-gray-900">{referralStats.totalReferrals}</span>
            </div>
            <div className="w-px h-6 bg-gray-200"></div>
            <div className="text-center flex-1">
              <span className="text-[9px] text-gray-500 block">আয়</span>
              <span className="text-sm font-semibold text-rose-600">{referralStats.totalEarned}৳</span>
            </div>
            <div className="w-px h-6 bg-gray-200"></div>
            <div className="text-center flex-1">
              <span className="text-[9px] text-gray-500 block">পেন্ডিং</span>
              <span className="text-sm font-semibold text-gray-900">{referralStats.pendingReferrals}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================== LEADERBOARD ================== */}
      <div style={styles.leaderCard}>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>লিডারবোর্ড</h2>

        <div style={styles.topThree}>
          {[1, 2, 3].map((rank) => (
            <div key={rank} style={styles.topUser}>
              {rank === 1 && (
                <Crown size={24} color="#FFD700" style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)" }} />
              )}
              <img
                src={`https://i.pravatar.cc/100?img=${rank + 10}`}
                style={styles.avatar}
                alt="avatar"
              />
              <div style={{ fontWeight: 600 }}>{rank}st</div>
              <div style={{ fontSize: 12 }}>৳ {Math.floor(Math.random() * 500000)}</div>
            </div>
          ))}
        </div>

        <h3 style={{ textAlign: "center", marginTop: 20, fontSize: 16 }}>
          পুরস্কৃত হয়েছে
        </h3>

        <div style={styles.winnerBox}>
          {winners.slice(0, 4).map((w, i) => (
            <div key={i} style={styles.winnerRow}>
              <span>{w.name}</span>
              <span>৳ {w.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ================== REWARD SECTION ================== */}
      <div style={{ padding: 15 }}>
        <RewardCard
          icon="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          title="আমন্ত্রণ পুরস্কার"
          amount={2135800}
          count={3787}
        />
        <RewardCard
          icon="https://cdn-icons-png.flaticon.com/512/2583/2583344.png"
          title="সাফল্য পুরস্কার"
          amount={1177}
          count={101}
        />
        <RewardCard
          icon="https://cdn-icons-png.flaticon.com/512/3144/3144456.png"
          title="জমা ছাড়"
          amount={622486}
          count={12042}
        />
        <RewardCard
          icon="https://cdn-icons-png.flaticon.com/512/3135/3135679.png"
          title="বেটিং রিবেট"
          amount={2621163}
          count={13436}
        />
      </div>

      {/* Message Display */}
      {message && (
        <div style={{
          ...styles.messageBox,
          backgroundColor: messageType === 'success' ? '#d4edda' : '#f8d7da',
          color: messageType === 'success' ? '#155724' : '#721c24',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {messageType === 'success' ? <CheckCircle size={18} /> : <span>⚠️</span>}
            <span>{message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================== STYLES ================== */
const styles = {
  page: {
    background: "#f2f2f2",
    minHeight: "100vh",
    paddingBottom: 40,
  },
  header: {
    background: "#c40d3c",
    color: "#fff",
    height: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 15px",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: 20,
    cursor: "pointer",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    padding: 15,
  },
  statBox: {
    padding: 15,
    borderRadius: 15,
    backdropFilter: "blur(10px)",
    background: "linear-gradient(135deg,#4facfe,#8e2de2)",
    color: "#fff",
    textAlign: "center",
  },
  leaderCard: {
    margin: 15,
    padding: 20,
    borderRadius: 20,
    backdropFilter: "blur(15px)",
    background: "linear-gradient(135deg,#3fa9f5,#8e2de2)",
    color: "#fff",
  },
  topThree: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: 20,
  },
  topUser: {
    textAlign: "center",
    position: "relative",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: "50%",
    marginBottom: 8,
    border: "3px solid rgba(255,255,255,0.3)",
  },
  winnerBox: {
    marginTop: 15,
    background: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 15,
  },
  winnerRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 12px",
    marginBottom: 6,
    background: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    fontSize: 13,
  },
  rewardCard: {
    background: "#fff",
    borderRadius: 20,
    padding: 15,
    display: "flex",
    alignItems: "center",
    gap: 15,
    marginBottom: 15,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  rewardTitle: { fontWeight: 600, fontSize: 15, color: "#333" },
  rewardAmount: { fontSize: 20, fontWeight: "bold", color: "#4b2aad" },
  rewardCount: { fontSize: 12, color: "#666", marginTop: 2 },
  messageBox: {
    position: "fixed",
    bottom: 20,
    right: 20,
    left: 20,
    maxWidth: 400,
    margin: "0 auto",
    padding: "12px 20px",
    borderRadius: 10,
    border: "1px solid",
    zIndex: 1000,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
};