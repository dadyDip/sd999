"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CreateRoomModal } from "@/components/CreateRoomModal";
import { CreateLudoRoomModal } from "@/components/CreateLudoRoomModal";
import { useLang } from "@/app/i18n/useLang";
import { DepositModal } from "@/components/wallet/DepositModal";
import WithdrawModal from "@/components/wallet/WithdrawModal";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap,
  Wallet,
  ArrowDownToLine,
  X,
  Play,
  Crown,
  Gamepad2,
  Tv,
  Swords,
  Fish,
  Dice5,
  Star,
  Sparkles,
  Users,
  Trophy,
  Target,
  Sword,
  Gem,
  Heart,
  TrendingUp,
  Award,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function HeroSection({
  onJoinCard,
  onCreateCard,
  onCreateLudoRoom,
  onJoinLudo,
  onSetLudoRoomId,
}) {
  const { t } = useLang();
  const router = useRouter();

  const [userBalance, setUserBalance] = useState(null);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  // modals
  const [openModal, setOpenModal] = useState(false);
  const [showLudoModal, setShowLudoModal] = useState(false);

  // slider
  const [heroIndex, setHeroIndex] = useState(0);
  const heroTimer = useRef(null);

  // games scroll refs
  const hotGamesRef1 = useRef(null);
  const hotGamesRef2 = useRef(null);
  const hotGamesRef3 = useRef(null);
  const categoryScrollRef = useRef(null);

  // announcements
  const announcements = useMemo(
    () => [
      "🎉 প্রথম ডিপোজিট বোনাস ৫০% পর্যন্ত!",
      "🔥 লাইভ ক্যাসিনোতে জয় করুন ১০ লাখ টাকা!",
      "💎 VIP মেম্বারদের জন্য বিশেষ উপহার",
      "⚡ দ্রুত উইথড্রো - ৫ মিনিটে পেমেন্ট",
      "🏆 সাপ্তাহিক টুর্নামেন্ট - পুরস্কার ২৫ লাখ টাকা",
      "🎰 নতুন গেমস যোগ হয়েছে - এখনই খেলুন!",
      "🛡️ ১০০% নিরাপদ এবং সুরক্ষিত গেমিং",
      "👑 সেরা খেলোয়াড়দের জন্য বিশেষ রিওয়ার্ড",
    ],
    []
  );

  const [announcementIndex, setAnnouncementIndex] = useState(0);
  
  // All games data
  const [allGames, setAllGames] = useState([]);

  // Jackpot counter
  const [jackpotAmount, setJackpotAmount] = useState(25637627890);
  const [jackpotDigits, setJackpotDigits] = useState(["2", "5", "6", ".", "3", "7", "6", ".", "2", "7", "8", ".", "9", "0"]);

  // Premium providers
  const casinoProviders = [
    {
      brand_id: "49",
      brand_title: "JILI",
      logo: "https://softapi2.shop/uploads/brands/jili.png",
      bgClass: "bg-white/90",
      borderClass: "border border-orange-500/30 hover:border-orange-500"
    },
    {
      brand_id: "45",
      brand_title: "PGSoft",
      logo: "https://softapi2.shop/uploads/brands/pgsoft.png",
      bgClass: "bg-white/90",
      borderClass: "border border-orange-500/30 hover:border-orange-500"
    },
    {
      brand_id: "57",
      brand_title: "Spribe",
      logo: "https://softapi2.shop/uploads/brands/spribe.png",
      bgClass: "bg-white/90",
      borderClass: "border border-orange-500/30 hover:border-orange-500"
    },
    {
      brand_id: "58",
      brand_title: "Evolution Live",
      logo: "https://softapi2.shop/uploads/brands/brand_58_1759739497.png",
      bgClass: "bg-white/90",
      borderClass: "border border-orange-500/30 hover:border-orange-500"
    }
  ];

  // ====== HERO SLIDES ======
  const heroSlides = useMemo(
    () => [
      {
        id: "slide-1",
        img: "/images/slide-1.png",
        fallback: "https://images.unsplash.com/photo-1617957718614-8c23f060c2d0?q=80&w=1600&auto=format&fit=crop",
        title: "ওয়েলকাম বোনাস",
        subtitle: "৫০% পর্যন্ত বোনাস পান",
      },
      {
        id: "slide-2",
        img: "/images/slide-2.png",
        fallback: "https://images.unsplash.com/photo-1617957718614-8c23f060c2d0?q=80&w=1600&auto=format&fit=crop",
        title: "লাইভ ক্যাসিনো",
        subtitle: "রিয়েল-টাইম গেমিং",
      },
      {
        id: "slide-3",
        img: "/images/slide-3.png",
        fallback: "https://images.unsplash.com/photo-1617957718614-8c23f060c2d0?q=80&w=1600&auto=format&fit=crop",
        title: "VIP মেম্বারশিপ",
        subtitle: "এক্সক্লুসিভ সুবিধা",
      },
      {
        id: "slide-4",
        img: "/images/slide-4.png",
        fallback: "https://images.unsplash.com/photo-1617957718614-8c23f060c2d0?q=80&w=1600&auto=format&fit=crop",
        title: "টুর্নামেন্ট",
        subtitle: "বিশাল পুরস্কার",
      },
    ],
    []
  );
  
  // ====== CATEGORY ICONS ======
  const categories = useMemo(
    () => [
      { id: "hot", label: "গরম", icon: <Flame className="w-5 h-5" />, color: "from-orange-500 to-red-500" },
      { id: "slots", label: "স্লটস", icon: <Star className="w-5 h-5" />, color: "from-amber-500 to-orange-500" },
      { id: "live", label: "লাইভ", icon: <Tv className="w-5 h-5" />, color: "from-red-500 to-orange-500" },
      { id: "fishing", label: "ফিশিং", icon: <Fish className="w-5 h-5" />, color: "from-orange-400 to-amber-500" },
      { id: "cards", label: "কার্ডস", icon: <Gamepad2 className="w-5 h-5" />, color: "from-orange-500 to-amber-600" },
      { id: "table", label: "টেবিল", icon: <Target className="w-5 h-5" />, color: "from-amber-500 to-orange-600" },
      { id: "crash", label: "ক্র্যাশ", icon: <TrendingUp className="w-5 h-5" />, color: "from-orange-500 to-red-500" },
      { id: "sports", label: "স্পোর্টস", icon: <Trophy className="w-5 h-5" />, color: "from-amber-500 to-orange-500" },
      { id: "ludo", label: "লুডো", icon: <Dice5 className="w-5 h-5" />, color: "from-orange-500 to-red-500" },
    ],
    []
  );

  // Initialize all games data
  useEffect(() => {
    const allGamesData = [
      {
        game_code: "737",
        game_name: "Aviator",
        game_img: "https://softapi2.shop/uploads/games/aviator-a04d1f3eb8ccec8a4823bdf18e3f0e84.png",
        category: "flash",
        providerId: "57",
        providerName: "Spribe",
        rating: 4.8
      },
      {
        game_code: "581",
        game_name: "Super Ace Deluxe",
        game_img: "https://softapi2.shop/uploads/games/49[1].png",
        category: "flash",
        providerId: "49",
        providerName: "JILI",
        rating: 4.5
      },
      {
        game_code: "642",
        game_name: "Crazy777",
        game_img: "https://softapi2.shop/uploads/games/crazy777-8c62471fd4e28c084a61811a3958f7a1.png",
        category: "Slots",
        providerId: "49",
        providerName: "JILI",
        rating: 4.7
      },
      {
        game_code: "709",
        game_name: "Wild Ace",
        game_img: "https://softapi2.shop/uploads/games/wild-ace-9a3b65e2ae5343df349356d548f3fc4b.png",
        category: "Slots",
        providerId: "49",
        providerName: "JILI",
        rating: 4.6
      },
      {
        game_code: "519",
        game_name: "Arena Fighter",
        game_img: "https://softapi2.shop/uploads/games/arena-fighter-71468f38b1fa17379231d50635990c31.png",
        category: "flash",
        providerId: "49",
        providerName: "JILI",
        rating: 4.4
      },
      {
        game_code: "879",
        game_name: "Super Ace",
        game_img: "https://softapi2.shop/uploads/games/super-ace-bdfb23c974a2517198c5443adeea77a8.png",
        category: "flash",
        providerId: "49",
        providerName: "JILI",
        rating: 4.9
      },
      {
        game_code: "59",
        game_name: "Super Ace Scratch",
        game_img: "https://softapi2.shop/uploads/games/super-ace-scratch-0ec0aeb7aad8903bb6ee6b9b9460926a.png",
        category: "flash",
        providerId: "49",
        providerName: "JILI",
        rating: 4.3
      },
      {
        game_code: "925",
        game_name: "Mega Fishing",
        game_img: "https://softapi2.shop/uploads/games/mega-fishing-caacafe3f64a6279e10a378ede09ff38.png",
        category: "Fishing",
        providerId: "49",
        providerName: "JILI",
        rating: 4.7
      },
      {
        game_code: "916",
        game_name: "Wild Bounty Showdown",
        game_img: "https://softapi2.shop/uploads/games/wild-bounty-showdown-c98bb64436826fe9a2c62955ff70cba9.png",
        category: "Slots",
        providerId: "45",
        providerName: "PGSoft",
        rating: 4.6
      },
      {
        game_code: "426",
        game_name: "Mines",
        game_img: "https://softapi2.shop/uploads/games/mines.webp",
        category: "flash",
        providerId: "57",
        providerName: "Spribe",
        rating: 4.8
      }
    ];
    setAllGames(allGamesData);

    // wallet summary
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/wallet/summary", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const balance = data.balance ?? data.walletBalance ?? 0;
        setUserBalance(balance);
        window.userBalance = balance;
      })
      .catch(() => setUserBalance(0));
  }, []);

  // announcement rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementIndex((p) => (p + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [announcements.length]);

  // hero slider rotate
  useEffect(() => {
    if (heroTimer.current) clearInterval(heroTimer.current);

    heroTimer.current = setInterval(() => {
      setHeroIndex((p) => (p + 1) % heroSlides.length);
    }, 7000);

    return () => {
      if (heroTimer.current) clearInterval(heroTimer.current);
    };
  }, [heroSlides.length]);

  // Jackpot auto increment
  useEffect(() => {
    const interval = setInterval(() => {
      setJackpotAmount(prev => {
        const newAmount = prev + Math.floor(Math.random() * 100);
        
        const amountStr = newAmount.toString();
        let formatted = [];
        
        if (amountStr.length >= 9) {
          formatted.push(amountStr.substring(0, 3));
          formatted.push(amountStr.substring(3, 6));
          formatted.push(amountStr.substring(6, 9));
          formatted.push(amountStr.substring(9));
        } else {
          formatted = [amountStr];
        }
        
        const digits = [];
        formatted.forEach((group, index) => {
          for (let char of group) {
            digits.push(char);
          }
          if (index < formatted.length - 1) {
            digits.push('.');
          }
        });
        
        setJackpotDigits(digits);
        return newAmount;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const scrollCategories = (direction) => {
    if (!categoryScrollRef.current) return;
    categoryScrollRef.current.scrollBy({
      left: direction === "left" ? -120 : 120,
      behavior: "smooth",
    });
  };

  const launchGame = (game) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("দয়া করে প্রথমে লগইন করুন");
      window.location.href = '/login';
      return;
    }

    localStorage.setItem('lastGameLaunched', JSON.stringify({
      name: game.game_name,
      code: game.game_code,
      provider: game.providerName,
      providerId: game.providerId,
      image: game.game_img,
      timestamp: new Date().toISOString()
    }));
    
    const embedUrl = `/casino/play/${game.game_code}?provider=${game.providerId}`;
    window.location.href = embedUrl;
  };

  const handleCategoryClick = (categoryId) => {
    if (categoryId === "cards") {
      setOpenModal(true);
    } else if (categoryId === "ludo") {
      setShowLudoModal(true);
    } else {
      router.push("/casino");
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* Background Image - Visible but Subtle Blur (optimized for low-end devices) */}
      <div className="fixed inset-0 z-0">
        {/* Image with very light blur (uses less CPU than backdrop-blur) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: "url('/image/app-bg.jpeg')",
            filter: "blur(8px) brightness(0.9)",
            transform: "scale(1.05)" // Slight scale to hide blur edges
          }}
        ></div>
        {/* Light orange overlay - very subtle */}
        <div className="absolute inset-0 bg-orange-900/20"></div>
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-3 md:px-6 pb-10">

          {/* ===== HERO SLIDER ===== */}
          <div className="mt-3 md:mt-4">
            <div className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-lg h-[160px] sm:h-[180px] md:h-[220px] lg:h-[280px] xl:h-[320px] border border-orange-400/30">
              {heroSlides.map((s, idx) => (
                <div
                  key={s.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    idx === heroIndex ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    src={s.img}
                    onError={(e) => (e.currentTarget.src = s.fallback)}
                    alt="hero"
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* ===== ANNOUNCEMENT BAR ===== */}
          <div className="pt-3 md:pt-4">
            <div className="w-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 border border-orange-400 px-4 py-2.5 lg:py-3 flex items-center gap-2 md:gap-3 shadow-md">
              <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-lg bg-white flex items-center justify-center shadow">
                <Zap className="w-3 h-3 lg:w-4 lg:h-4 text-orange-600" />
              </div>

              <div className="relative h-5 md:h-6 lg:h-7 overflow-hidden flex-1">
                <div
                  className="absolute inset-0 transition-transform duration-500 ease-out"
                  style={{ transform: `translateY(-${announcementIndex * 100}%)` }}
                >
                  {announcements.map((msg, idx) => (
                    <div key={idx} className="h-5 md:h-6 lg:h-7 flex items-center">
                      <span className="font-bold text-sm md:text-base text-white">
                        {msg}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ===== JACKPOT BANNER ===== */}
          <div className="mt-3 md:mt-4 lg:mt-6">
            <div className="relative rounded-xl md:rounded-2xl overflow-hidden h-[140px] md:h-[160px] lg:h-[200px] xl:h-[220px] group border border-orange-400/30">
              <div className="absolute inset-0">
                <img 
                  src="/jackpot-img.jpg" 
                  alt="Jackpot"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  onError={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #F97316 0%, #FB923C 50%, #F59E0B 100%)';
                  }}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/30 to-amber-600/30"></div>
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-orange-900/50 via-transparent to-transparent" />
              </div>
              
              <div className="absolute inset-0 flex items-end justify-center pb-8 md:pb-10 lg:pb-12 px-2">
                <div className="flex items-end justify-center gap-1 md:gap-2 lg:gap-3 w-full">
                  <div className="relative">
                    <div className="w-8 h-10 md:w-12 md:h-16 lg:w-16 lg:h-20 xl:w-20 xl:h-24 rounded-lg lg:rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 border border-white/50 shadow-lg flex items-center justify-center">
                      <span className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-white drop-shadow-md">৳</span>
                    </div>
                  </div>
                  
                  <div className="flex items-end gap-1 md:gap-2 lg:gap-3">
                    {jackpotDigits.map((digit, idx) => (
                      <div key={idx} className="relative">
                        <div className={`
                          rounded-lg lg:rounded-xl bg-gradient-to-b from-white to-orange-100 
                          border border-orange-400 shadow-md
                          flex items-center justify-center
                          ${digit === '.' 
                            ? 'w-2 h-4 md:w-3 md:h-6 lg:w-4 lg:h-8' 
                            : 'w-7 h-10 md:w-11 md:h-16 lg:w-14 lg:h-20 xl:w-16 xl:h-24'
                          }
                          transition-all duration-300 hover:scale-105
                        `}>
                          {digit === '.' ? (
                            <span className="text-sm md:text-base lg:text-lg font-black text-orange-600">•</span>
                          ) : (
                            <span className="text-lg md:text-3xl lg:text-4xl xl:text-5xl font-black text-orange-600">
                              {digit}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== SLIDABLE CATEGORY BUTTONS ===== */}
          <div className="mt-4 md:mt-6 lg:mt-8">
            <div className="relative">
              <div
                ref={categoryScrollRef}
                className="flex gap-1.5 md:gap-2 lg:gap-3 overflow-x-auto scrollbar-hide pb-2 pt-1 -mx-1 px-1"
              >
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`
                      flex-shrink-0 w-[65px] h-[65px] md:w-[75px] md:h-[75px] lg:w-[90px] lg:h-[90px] xl:w-[100px] xl:h-[100px] rounded-xl lg:rounded-2xl
                      bg-white/95 backdrop-blur-sm
                      border border-orange-400
                      p-1.5 md:p-2 lg:p-3 flex flex-col items-center justify-center gap-0.5 lg:gap-1
                      hover:scale-105 hover:shadow-md hover:border-orange-500
                      transition-all duration-200 active:scale-95
                      shadow
                    `}
                  >
                    <div className={`
                      w-8 h-8 md:w-9 md:h-9 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-gradient-to-br ${cat.color}
                      flex items-center justify-center text-white
                      shadow-sm
                    `}>
                      {cat.icon}
                    </div>
                    <div className="text-orange-900 font-bold text-[10px] md:text-xs lg:text-sm text-center leading-tight mt-0.5 lg:mt-1">
                      {cat.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ===== WALLET SECTION ===== */}
          <div className="mt-4 md:mt-6 lg:mt-8">
            <div className="grid grid-cols-3 gap-2 md:gap-3 lg:gap-4">
              <Link
                href="/deposit"
                className="group rounded-xl lg:rounded-2xl bg-white/95 backdrop-blur-sm border border-orange-400 p-2 md:p-3 lg:p-4 flex flex-col items-center justify-center gap-1 lg:gap-2 hover:border-orange-500 hover:bg-white transition-all duration-200 shadow"
              >
                <div className="w-9 h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <Wallet className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="text-orange-900 font-bold text-xs md:text-sm lg:text-base">ডিপোজিট</div>
              </Link>
              
              <Link
                href="/dashboard/withdraw"
                className="group rounded-xl lg:rounded-2xl bg-white/95 backdrop-blur-sm border border-orange-400 p-2 md:p-3 lg:p-4 flex flex-col items-center justify-center gap-1 lg:gap-2 hover:border-orange-500 hover:bg-white transition-all duration-200 shadow"
              >
                <div className="w-9 h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <ArrowDownToLine className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="text-orange-900 font-bold text-xs md:text-sm lg:text-base">উইথড্র</div>
              </Link>
              
              <div className="rounded-xl lg:rounded-2xl bg-white/95 backdrop-blur-sm border border-orange-400 p-2 md:p-3 lg:p-4 flex flex-col items-center justify-center shadow">
                <div className="text-orange-900 font-bold text-lg md:text-xl lg:text-2xl xl:text-3xl">
                  ৳ {userBalance ? formatNumber(userBalance / 100) : "০"}
                </div>
                <div className="text-orange-700 text-xs md:text-sm lg:text-base">ব্যালেন্স</div>
                <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-orange-500 animate-pulse mt-1 lg:mt-2"></div>
              </div>
            </div>
          </div>

          {/* ===== ALL GAMES TOGETHER ===== */}
          <div className="mt-6 md:mt-8 lg:mt-10">
            <div className="text-orange-900 font-bold text-lg md:text-xl lg:text-2xl mb-3 lg:mb-4 border-b border-orange-400 pb-2 inline-block">
              জনপ্রিয় গেমস
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3 lg:gap-4">
              {allGames.map((game, index) => (
                <div
                  key={`game-${game.game_code}-${index}`}
                  onClick={() => launchGame(game)}
                  className="relative rounded-lg lg:rounded-xl overflow-hidden group cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md border border-orange-400/50"
                >
                  <div className="relative w-full aspect-[3/4]">
                    <img
                      src={game.game_img}
                      alt={game.game_name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-900/80 via-transparent to-transparent" />
                    
                    <div className="absolute top-1.5 left-1.5 lg:top-2 lg:left-2">
                      <div className="px-1.5 py-0.5 md:px-2 md:py-1 rounded-md lg:rounded-lg bg-orange-500 text-white text-[10px] md:text-xs lg:text-sm font-bold truncate max-w-[60px] md:max-w-[70px] lg:max-w-[80px] shadow">
                        {game.providerName}
                      </div>
                    </div>
                    
                    <button className="absolute top-1.5 right-1.5 lg:top-2 lg:right-2 w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 rounded-full bg-white/90 border border-orange-400 flex items-center justify-center hover:bg-orange-100 transition-colors z-10">
                      <Heart className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4 text-orange-600" />
                    </button>
                    
                    {game.providerId === "58" && (
                      <div className="absolute top-8 md:top-9 lg:top-10 right-1.5 lg:right-2 flex items-center gap-0.5">
                        <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-orange-500 animate-pulse"></div>
                        <div className="text-white text-[10px] md:text-xs lg:text-sm font-bold">Live</div>
                      </div>
                    )}
                    
                    <div className="absolute top-8 md:top-9 lg:top-10 left-1.5 lg:left-2 hidden md:flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4 text-orange-400 fill-orange-400" />
                      <span className="text-white text-[10px] md:text-xs lg:text-sm font-bold">{game.rating}</span>
                    </div>
                    
                    <div className="absolute inset-0 bg-orange-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow">
                        <Play className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-white" fill="white" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-1.5 md:p-2 lg:p-3 bg-gradient-to-t from-orange-600 to-orange-500/80">
                    <div className="text-white font-bold text-[10px] md:text-xs lg:text-sm text-center truncate leading-tight">
                      {game.game_name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => router.push("/casino")}
              className="w-full mt-4 md:mt-6 lg:mt-8 rounded-lg lg:rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 border border-orange-400 py-3 lg:py-4 text-white font-bold text-sm md:text-base lg:text-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 hover:scale-[1.01] shadow"
            >
              সব গেমস দেখুন →
            </button>
          </div>

          {/* ===== PREMIUM PROVIDERS SECTION ===== */}
          <div className="mt-10 md:mt-14 lg:mt-16">
            <div className="flex items-center justify-center mb-4 md:mb-6 lg:mb-8">
              <div className="w-8 md:w-12 lg:w-16 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent"></div>
              <h3 className="text-sm md:text-base lg:text-xl font-bold text-orange-900 mx-3 md:mx-4 lg:mx-6">
                প্রিমিয়াম প্রোভাইডার
              </h3>
              <div className="w-8 md:w-12 lg:w-16 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
              {casinoProviders.map((provider) => (
                <button
                  key={provider.brand_id}
                  onClick={() => router.push(`/casino/providers/${provider.brand_id}/games`)}
                  className={`group relative rounded-lg md:rounded-xl lg:rounded-2xl overflow-hidden transition-all duration-200 hover:scale-102 hover:shadow ${provider.bgClass} ${provider.borderClass} aspect-[3/1] md:aspect-[16/9]`}
                >
                  <div className="absolute inset-0 flex items-center justify-center p-3 md:p-4 lg:p-6">
                    <div className="w-full h-full flex items-center justify-center p-1 md:p-2 lg:p-3">
                      {provider.logo ? (
                        <img
                          src={provider.logo}
                          alt={provider.brand_title}
                          className="max-w-full max-h-10 md:max-h-14 lg:max-h-20 object-contain transition-transform duration-200 group-hover:scale-105" 
                          loading="lazy"
                        />
                      ) : (
                        <div className="text-2xl md:text-3xl lg:text-4xl opacity-50">🎰</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-2 lg:p-3 bg-gradient-to-t from-orange-600/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="text-white text-[10px] md:text-xs lg:text-sm text-center truncate font-medium">
                      {provider.brand_title}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ===== GO TO CASINO CTA ===== */}
          <div className="text-center mt-10 md:mt-14 lg:mt-16 mb-6 md:mb-10 lg:mb-12">
            <div className="text-orange-800 text-sm md:text-base lg:text-lg mb-4 lg:mb-6">
              আরও ৫০০+ প্রিমিয়াম গেমসের জন্য
            </div>
            <button
              onClick={() => router.push("/casino")}
              className="inline-flex items-center gap-2 px-6 py-3 md:px-10 md:py-4 lg:px-12 lg:py-5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-white text-sm md:text-base lg:text-lg font-bold hover:shadow-md transition-all hover:scale-102 border border-orange-400"
            >
              <span>পুরো ক্যাসিনো দেখুন</span>
              <span className="text-lg md:text-xl lg:text-2xl">→</span>
            </button>
          </div>
        </div>

        {/* ===== DEPOSIT MODAL ===== */}
        <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} />

        {/* ===== WITHDRAW MODAL ===== */}
        <WithdrawModal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} />

        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </div>
  );
}