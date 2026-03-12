// app/page.jsx - EXACTLY YOUR WORKING CODE, ONLY PROVIDER CLICK CHANGED
"use client";

import { v4 as uuidv4 } from "uuid";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/components/SocketProvider";
import InstantMatchModal from "@/components/InstantMatchModal";
import { useLang } from "@/app/i18n/useLang";
import {
  Flame,
  Zap,
  Play,
  Gamepad2,
  Tv,
  Fish,
  Dice5,
  Star,
  TrendingUp,
  Trophy,
  Sparkles,
  X,
  Search,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { socket, ready: socketReady } = useSocket();
  const { t } = useLang();

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [hasTurnover, setHasTurnover] = useState(false);
  const [userBalance, setUserBalance] = useState(null);
  const [isLaunching, setIsLaunching] = useState(false);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState("hot");
  const [searchTerm, setSearchTerm] = useState("");

  // slider
  const [heroIndex, setHeroIndex] = useState(0);
  const heroTimer = useRef(null);
  
  // games scroll refs
  const categoryScrollRef = useRef(null);
  const providerScrollRef = useRef(null);
  
  // announcements
  const announcements = useMemo(
    () => [
      "🔥 প্রথম ডিপোজিট বোনাস ৫০% পর্যন্ত!",
      "💰 লাইভ ক্যাসিনোতে জয় করুন ১০ লাখ টাকা!",
      "👑 VIP মেম্বারদের জন্য বিশেষ উপহার",
      "⚡ দ্রুত উইথড্রো - ৫ মিনিটে পেমেন্ট",
      "🏆 সাপ্তাহিক টুর্নামেন্ট - পুরস্কার ২৫ লাখ টাকা",
      "🎰 নতুন গেমস যোগ হয়েছে - এখনই খেলুন!",
    ],
    []
  );

  const [announcementIndex, setAnnouncementIndex] = useState(0);

  // Jackpot counter
  const [jackpotAmount, setJackpotAmount] = useState(25637627890);
  const [jackpotDigits, setJackpotDigits] = useState(["2", "5", "6", ".", "3", "7", "6", ".", "2", "7", "8", ".", "9", "0"]);
  const [bonusAmount, setBonusAmount] = useState(250000000 + Math.floor(Math.random() * 100000000));
  // Premium providers
  const casinoProviders = [
    {
      brand_id: "49",
      brand_title: "JILI",
      logo: "https://softapi2.shop/uploads/brands/jili.png",
    },
    {
      brand_id: "45",
      brand_title: "PGSoft",
      logo: "https://softapi2.shop/uploads/brands/pgsoft.png",
    },
    {
      brand_id: "57",
      brand_title: "Spribe",
      logo: "https://softapi2.shop/uploads/brands/spribe.png",
    },
    {
      brand_id: "58",
      brand_title: "Evolution Live",
      logo: "https://softapi2.shop/uploads/brands/brand_58_1759739497.png",
    },
  ];

  // ====== CATEGORY ICONS ======
  const categories = useMemo(
    () => [
      { id: "hot", label: "গরম", icon: <Flame className="w-5 h-5" />, color: "from-orange-500 to-red-500" },
      { id: "slots", label: "স্লটস", icon: <Star className="w-5 h-5" />, color: "from-amber-500 to-orange-500" },
      { id: "live", label: "লাইভ", icon: <Tv className="w-5 h-5" />, color: "from-orange-600 to-red-600" },
      { id: "fishing", label: "ফিশিং", icon: <Fish className="w-5 h-5" />, color: "from-amber-400 to-orange-500" },
      { id: "cards", label: "কার্ডস", icon: <Gamepad2 className="w-5 h-5" />, color: "from-orange-400 to-amber-600" },
      { id: "crash", label: "ক্র্যাশ", icon: <TrendingUp className="w-5 h-5" />, color: "from-orange-500 to-red-500" },
      { id: "ludo", label: "লুডো", icon: <Dice5 className="w-5 h-5" />, color: "from-amber-600 to-orange-600" },
      { id: "sports", label: "স্পোর্টস", icon: <Trophy className="w-5 h-5" />, color: "from-orange-500 to-amber-500" },
    ],
    []
  );

  // ====== HERO SLIDES ======
  const heroSlides = useMemo(
    () => [
      {
        id: "slide-1",
        img: "/images/slide-1-md.jpg",
        fallback: "https://images.unsplash.com/photo-1617957718614-8c23f060c2d0?q=80&w=1600&auto=format&fit=crop",
      },
      {
        id: "slide-2",
        img: "/images/slide-2-md.jpg",
        fallback: "https://images.unsplash.com/photo-1617957718614-8c23f060c2d0?q=80&w=1600&auto=format&fit=crop",
      },
      {
        id: "slide-3",
        img: "/images/slide-3-md.jpg",
        fallback: "https://images.unsplash.com/photo-1617957718614-8c23f060c2d0?q=80&w=1600&auto=format&fit=crop",
      },
      {
        id: "slide-4",
        img: "/images/slide-4-md.jpg",
        fallback: "https://images.unsplash.com/photo-1617957718614-8c23f060c2d0?q=80&w=1600&auto=format&fit=crop",
      },
      {
        id: "slide-5",
        img: "/images/slide-5-md.jpg",
        fallback: "https://images.unsplash.com/photo-1617957718614-8c23f060c2d0?q=80&w=1600&auto=format&fit=crop",
      },
    ],
    []
  );


  const allGames = [
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
    // WILD BOUNTY SHOWDOWN MOVED TO 9TH POSITION
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
    },
    {
      "game_code": "6305",
      "game_name": "Crazy Time",
      "game_img": "https://softapi2.shop/uploads/games/evolution-crazy-time.webp",
      "category": "CasinoLive",
      "providerId": "17",
      "providerName": "Evolution",
      "rating": 0
    },
    {
      "game_code": "6473",
      "game_name": "Emperor Dragon Tiger",
      "game_img": "https://softapi2.shop/uploads/games/EmperorDragonTiger.webp",
      "category": "CasinoLive",
      "providerId": "17",
      "providerName": "Evolution",
      "rating": 0
    },
    {
      "game_code": "6475",
      "game_name": "Dragon Tiger",
      "game_img": "https://softapi2.shop/uploads/games/DragonTiger1.webp",
      "category": "CasinoLive",
      "providerId": "17",
      "providerName": "Evolution",
      "rating": 0
    },
    {
      game_code: "723",
      game_name: "Mini Roulette",
      game_img: "https://softapi2.shop/uploads/games/mini-roulette-9dc7ac6155c5a19c1cc204853e426367.png",
      category: "flash",
      providerId: "57",
      providerName: "Spribe",
      rating: 4.4
    },
    {
      game_code: "149",
      game_name: "Jungle Delight",
      game_img: "https://softapi2.shop/uploads/games/jungle-delight-232e8e0c74f9bb16ab676e5ed49d72b4.png",
      category: "Slots",
      providerId: "45",
      providerName: "PGSoft",
      rating: 4.7
    },
    {
      game_code: "150",
      game_name: "Oriental Prosperity",
      game_img: "https://softapi2.shop/uploads/games/oriental-prosperity-23b43b58e11aadb1f27fd05ba41e9819.png",
      category: "Slots",
      providerId: "45",
      providerName: "PGSoft",
      rating: 4.6
    },
    {
      game_code: "157",
      game_name: "Raider Jane's Crypt of Fortune",
      game_img: "https://softapi2.shop/uploads/games/raider-jane-s-crypt-of-fortune-24d8e1dbc5cface0907f5a21ecd56753.png",
      category: "Slots",
      providerId: "45",
      providerName: "PGSoft",
      rating: 4.8
    },
    {
      game_code: "172",
      game_name: "Candy Burst",
      game_img: "https://softapi2.shop/uploads/games/candy-burst-27237d7e8d9b183c92fa9f6ab9832edc.png",
      category: "Slots",
      providerId: "45",
      providerName: "PGSoft",
      rating: 4.5
    },
    {
      game_code: "6262",
      game_name: "Emperor Speed Baccarat B",
      game_img: "https://softapi2.shop/uploads/games/EmperorSpeedBaccaratA.webp",
      category: "CasinoLive",
      providerId: "58",
      providerName: "Evolution Live",
      rating: 4.9
    },
    {
      game_code: "6263",
      game_name: "Fan Tan",
      game_img: "https://softapi2.shop/uploads/games/fan_tan.webp",
      category: "CasinoLive",
      providerId: "58",
      providerName: "Evolution Live",
      rating: 4.7
    },
    {
      game_code: "354",
      game_name: "Jungle King",
      game_img: "https://softapi2.shop/uploads/games/jungle-king-4db0ec24ff55a685573c888efed47d7f.png",
      category: "Slots",
      providerId: "49",
      providerName: "JILI",
      rating: 4.5
    },
    {
      game_code: "357",
      game_name: "Go Goal Bingo",
      game_img: "https://softapi2.shop/uploads/games/go-goal-bingo-4e5ddaa644badc5f68974a65bf7af02a.png",
      category: "flash",
      providerId: "49",
      providerName: "JILI",
      rating: 4.3
    },
    {
      game_code: "358",
      game_name: "Zeus",
      game_img: "https://softapi2.shop/uploads/games/zeus-4e7c9f4fbe9b5137f21ebd485a9cfa5c.png",
      category: "flash",
      providerId: "49",
      providerName: "JILI",
      rating: 4.6
    },
    {
      game_code: "775",
      game_name: "Hi Lo",
      game_img: "https://softapi2.shop/uploads/games/hi-lo-a669c993b0e1f1b7da100fcf95516bdf.png",
      category: "flash",
      providerId: "57",
      providerName: "Spribe",
      rating: 4.3
    },
    {
      game_code: "826",
      game_name: "Hotline",
      game_img: "https://softapi2.shop/uploads/games/hotline-b31720b3cd65d917a1a96ef61a72b672.png",
      category: "flash",
      providerId: "57",
      providerName: "Spribe",
      rating: 4.2
    },
    {
      game_code: "894",
      game_name: "Keno",
      game_img: "https://softapi2.shop/uploads/games/keno-c311eb4bbba03b105d150504931f2479.png",
      category: "flash",
      providerId: "57",
      providerName: "Spribe",
      rating: 4.1
    },
    {
      game_code: "140",
      game_name: "Phoenix Rises",
      game_img: "https://softapi2.shop/uploads/games/phoenix-rises-21c55c4cd28bb1ebf465fcfaf413477c.png",
      category: "Slots",
      providerId: "45",
      providerName: "PGSoft",
      rating: 4.7
    },
    {
      game_code: "144",
      game_name: "Hood vs Wolf",
      game_img: "https://softapi2.shop/uploads/games/hood-vs-wolf-222ce90a04a2246eecd5216454f9792f.png",
      category: "Slots",
      providerId: "45",
      providerName: "PGSoft",
      rating: 4.6
    },
    {
      game_code: "145",
      game_name: "Baccarat Deluxe",
      game_img: "https://softapi2.shop/uploads/games/baccarat-deluxe-22c3b8df172b40ac24a7e9c909e0e50e.png",
      category: "Slots",
      providerId: "45",
      providerName: "PGSoft",
      rating: 4.8
    },
    {
      game_code: "175",
      game_name: "Buffalo Win",
      game_img: "https://softapi2.shop/uploads/games/buffalo-win-2818a7add6e10b2ec5f938d7ae0efb04.png",
      category: "Slots",
      providerId: "45",
      providerName: "PGSoft",
      rating: 4.4
    },
    {
      game_code: "210",
      game_name: "Ninja vs Samurai",
      game_img: "https://softapi2.shop/uploads/games/ninja-vs-samurai-2eb712d4bb30e4594032ebf1464618b1.png",
      category: "Slots",
      providerId: "45",
      providerName: "PGSoft",
      rating: 4.7
    },
    {
      game_code: "6261",
      game_name: "French Roulette Gold",
      game_img: "https://softapi2.shop/uploads/games/french_roulette_gold.webp",
      category: "CasinoLive",
      providerId: "58",
      providerName: "Evolution Live",
      rating: 4.9
    },
    {
      game_code: "6264",
      game_name: "Speed Roulette",
      game_img: "https://softapi2.shop/uploads/games/speed_roulette.webp",
      category: "CasinoLive",
      providerId: "58",
      providerName: "Evolution Live",
      rating: 4.8
    },
    {
      game_code: "6265",
      game_name: "Blackjack VIP 12",
      game_img: "https://softapi2.shop/uploads/games/blackjack_vip_12.webp",
      category: "CasinoLive",
      providerId: "58",
      providerName: "Evolution Live",
      rating: 4.9
    },
    {
      game_code: "6266",
      game_name: "Blackjack VIP R",
      game_img: "https://softapi2.shop/uploads/games/blackjack_vip_r.webp",
      category: "CasinoLive",
      providerId: "58",
      providerName: "Evolution Live",
      rating: 4.8
    },
    {
      game_code: "6267",
      game_name: "Speed VIP Blackjack K",
      game_img: "https://softapi2.shop/uploads/games/blackjack_k.webp",
      category: "CasinoLive",
      providerId: "58",
      providerName: "Evolution Live",
      rating: 4.7
    },
    // REMOVED ONE GAME FROM THE END (Blackjack VIP J)
  ];

  // Filter games based on selected category
  const getFilteredGames = () => {
    if (selectedCategory === "hot") {
      return allGames;
    }
    return allGames.filter(game => game.category === selectedCategory);
  };

  const filteredGames = getFilteredGames();

  // Initialize
  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
    }

    let pid = localStorage.getItem("playerId");
    if (!pid) {
      pid = "p-" + uuidv4().slice(0, 8);
      localStorage.setItem("playerId", pid);
    }
    setPlayerId(pid);
    
    // wallet summary
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("/api/wallet/summary", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const balance = data.balance ?? data.walletBalance ?? 0;
        setUserBalance(balance);
      })
      .catch(() => setUserBalance(0))
      .finally(() => setLoading(false));

    // Bonus counter animation
    let currentAmount = 250000000 + Math.floor(Math.random() * 100000000);
    setBonusAmount(currentAmount);

    const incrementInterval = setInterval(() => {
      currentAmount += 10;
      setBonusAmount(currentAmount);
    }, 1000);

    return () => clearInterval(incrementInterval);
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

  const launchGame = (game) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("দয়া করে প্রথমে লগইন করুন");
      window.location.href = '/login';
      return;
    }

    setIsLaunching(true);
    
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
    setSelectedCategory(categoryId);
    setSearchTerm("");
    
    if (categoryId === "cards") {
      setShowModal(true);
    } else if (categoryId === "ludo") {
      router.push('/game/ludo/demo');
    }
  };

  // ONLY THIS FUNCTION CHANGED - NOW REDIRECTS TO PROVIDER PAGE
  const handleProviderClick = (provider) => {
    router.push(`/casino/providers/${provider.brand_id}/games`);
  };

  const getCurrentCategoryLabel = () => {
    const category = categories.find(c => c.id === selectedCategory);
    return category ? category.label : "জনপ্রিয় গেমস";
  };

  if (loading) return null;

  return (
    <div className="relative min-h-screen text-white">
      {/* Background Image with Orange Overlay */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/images/app-bg.jpeg" 
          alt="background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-orange-900/70 via-orange-800/60 to-orange-900/80 backdrop-blur-[2px]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 md:px-6 pb-10">
        {/* Hero Slider */}
        <div className="mt-3 md:mt-4">
          <div className="relative rounded-xl md:rounded-2xl overflow-hidden border-2 border-orange-500/30 shadow-2xl shadow-orange-500/20 h-[160px] sm:h-[180px] md:h-[220px] lg:h-[280px] xl:h-[320px]">
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
                />
              </div>
            ))}
            
            {/* Slide indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHeroIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === heroIndex 
                      ? "w-6 bg-orange-500 shadow-lg shadow-orange-500/50" 
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Announcement Bar */}
        <div className="pt-3 md:pt-4">
          <div className="w-full rounded-full bg-emerald-950/80 backdrop-blur-sm border border-amber-400/50 px-4 py-1.5 flex items-center gap-2 md:gap-3 shadow-lg">
            <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <Zap className="w-3 h-3 lg:w-4 lg:h-4 text-emerald-950" />
            </div>

            <div className="relative h-4 md:h-5 overflow-hidden flex-1">
              <div
                className="absolute inset-0 transition-transform duration-500 ease-out whitespace-nowrap"
                style={{ transform: `translateX(-${announcementIndex * 100}%)` }}
              >
                <div className="flex">
                  {announcements.map((msg, idx) => (
                    <div key={idx} className="h-4 md:h-5 flex items-center justify-center min-w-full">
                      <span className="text-amber-300 font-medium text-xs md:text-sm">
                        {msg}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Jackpot Banner */}
        <div className="mt-3 md:mt-4 lg:mt-6">
          <div className="relative rounded-xl md:rounded-2xl overflow-hidden border-2 border-orange-400/40 h-[140px] md:h-[160px] lg:h-[200px] xl:h-[220px] group shadow-2xl">
            <div className="absolute inset-0">
              <img 
                src="/jackpot-img.png" 
                alt="Jackpot"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                onError={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #FF8C00 0%, #FF4500 50%, #FF8C00 100%)';
                }}
              />
            </div>
            
            <div className="absolute inset-0 flex items-end justify-center pb-6 md:pb-8 lg:pb-12 px-2">
              <div className="flex items-end justify-center gap-1 md:gap-2 lg:gap-3">
                <div className="w-8 h-10 md:w-12 md:h-16 lg:w-16 lg:h-20 xl:w-20 xl:h-24 rounded-lg lg:rounded-xl bg-gradient-to-b from-orange-600 to-orange-800 border-2 border-amber-300/70 flex items-center justify-center">
                  <span className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-amber-200">৳</span>
                </div>
                
                <div className="flex items-end gap-1 md:gap-2 lg:gap-3">
                  {jackpotDigits.map((digit, idx) => (
                    <div key={idx} className={`
                      rounded-lg lg:rounded-xl bg-gradient-to-b from-orange-600 to-orange-800 
                      border-2 border-amber-300/70 flex items-center justify-center
                      ${digit === '.' 
                        ? 'w-2 h-4 md:w-3 md:h-6 lg:w-4 lg:h-8' 
                        : 'w-7 h-10 md:w-11 md:h-16 lg:w-14 lg:h-20 xl:w-16 xl:h-24'
                      }
                    `}>
                      {digit === '.' ? (
                        <span className="text-sm md:text-base lg:text-lg font-black text-amber-300">•</span>
                      ) : (
                        <span className="text-lg md:text-3xl lg:text-4xl xl:text-5xl font-black text-amber-100">
                          {digit}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Buttons */}
        <div className="mt-4 md:mt-6 lg:mt-8">
          <div
            ref={categoryScrollRef}
            className="flex gap-1.5 md:gap-2 lg:gap-3 overflow-x-auto scrollbar-hide pb-2 pt-1 px-4 md:px-0"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`
                  flex-shrink-0 w-[70px] h-[70px] md:w-[80px] md:h-[80px] lg:w-[100px] lg:h-[100px] rounded-xl lg:rounded-2xl
                  bg-gradient-to-br from-orange-900/60 to-orange-950/80 backdrop-blur-md border-2 
                  ${selectedCategory === cat.id
                    ? 'border-orange-400 shadow-lg shadow-orange-500/50 scale-105' 
                    : 'border-orange-400/40 hover:border-orange-400/80'
                  }
                  p-1.5 md:p-2 lg:p-3 flex flex-col items-center justify-center
                  hover:scale-110 transition-all duration-300
                `}
              >
                <div className={`
                  w-8 h-8 md:w-9 md:h-9 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-gradient-to-br ${cat.color} 
                  flex items-center justify-center text-white shadow-lg border border-white/20
                `}>
                  {cat.icon}
                </div>
                <div className="text-white font-bold text-[10px] md:text-xs lg:text-sm text-center mt-0.5">
                  {cat.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Provider Icons - Click to go to provider page */}
        <div className="mt-4 md:mt-6">
          <div
            ref={providerScrollRef}
            className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide py-2 px-4 md:px-0"
          >
            {casinoProviders.map((provider) => (
              <button
                key={provider.brand_id}
                onClick={() => handleProviderClick(provider)}
                className="flex-shrink-0 transition-all duration-300 hover:scale-105 group"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white shadow-lg flex items-center justify-center p-2 group-hover:ring-2 group-hover:ring-orange-400 group-hover:ring-offset-2 group-hover:ring-offset-orange-950">
                  <img
                    src={provider.logo}
                    alt={provider.brand_title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-[10px] md:text-xs text-center mt-1 text-orange-200">
                  {provider.brand_title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Games Section */}
        <div className="mt-4 md:mt-6 lg:mt-8">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <h2 className="text-white font-bold text-lg md:text-xl lg:text-2xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-orange-400" />
              {getCurrentCategoryLabel()}
            </h2>
          </div>

          {/* Search Bar */}
          <div className="mb-4 md:mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder={`${getCurrentCategoryLabel()} গেমস খুঁজুন...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 md:px-5 md:py-3 rounded-xl bg-orange-900/30 border border-orange-400/30 text-white placeholder-orange-200/50 focus:outline-none focus:border-orange-400 text-sm"
              />
              <Search className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-orange-300" />
            </div>
          </div>
          
          {/* Games Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3 lg:gap-4">
            {filteredGames
              .filter(game => 
                game.game_name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .slice(0, 30)
              .map((game, index) => (
                <div
                  key={`game-${game.game_code}-${index}`}
                  onClick={() => launchGame(game)}
                  className="relative rounded-lg lg:rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl hover:shadow-orange-500/30 border-2 border-transparent hover:border-orange-400/50"
                >
                  <div className="relative w-full aspect-[3/4]">
                    <img
                      src={game.game_img}
                      alt={game.game_name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "https://softapi2.shop/uploads/games/default.png";
                      }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-950/90 via-transparent to-transparent" />
                    
                    <div className="absolute top-1.5 left-1.5 lg:top-2 lg:left-2">
                      <div className="px-1.5 py-0.5 md:px-2 md:py-1 rounded-md lg:rounded-lg bg-orange-900/80 backdrop-blur-sm border border-orange-400/30 text-white text-[10px] md:text-xs lg:text-sm font-bold">
                        {game.providerName}
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 bg-orange-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 flex items-center justify-center shadow-2xl animate-pulse">
                        <Play className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-white" fill="white" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-1.5 md:p-2 lg:p-3 bg-gradient-to-t from-orange-900 to-transparent">
                    <div className="text-white font-bold text-[10px] md:text-xs lg:text-sm text-center truncate">
                      {game.game_name}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Premium Providers Section */}
        <div className="mt-10 md:mt-14 lg:mt-16">
          <div className="flex items-center justify-center mb-4 md:mb-6">
            <div className="w-8 md:w-12 lg:w-16 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
            <h3 className="text-sm md:text-base lg:text-xl font-bold text-white mx-3 md:mx-4">
              প্রিমিয়াম প্রোভাইডার
            </h3>
            <div className="w-8 md:w-12 lg:w-16 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            {casinoProviders.map((provider) => (
              <button
                key={provider.brand_id}
                onClick={() => handleProviderClick(provider)}
                className="group relative rounded-lg md:rounded-xl lg:rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/40 bg-gradient-to-br from-orange-800/40 to-orange-900/60 border-2 border-orange-500/30 aspect-[3/1] md:aspect-[16/9]"
              >
                <div className="absolute inset-0 flex items-center justify-center p-3 md:p-4">
                  <img
                    src={provider.logo}
                    alt={provider.brand_title}
                    className="max-w-full max-h-10 md:max-h-14 lg:max-h-20 object-contain transition-transform duration-300 group-hover:scale-110" 
                  />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-orange-950/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-orange-200 text-[10px] md:text-xs text-center truncate">
                    {provider.brand_title}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Launching Overlay */}
      {isLaunching && (
        <div className="fixed inset-0 bg-orange-950/90 backdrop-blur-md flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-xl font-bold text-white">গেম লোড হচ্ছে...</div>
          </div>
        </div>
      )}


      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}