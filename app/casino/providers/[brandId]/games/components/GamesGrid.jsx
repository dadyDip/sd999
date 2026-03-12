// app/casino/providers/[brandId]/games/components/GamesGrid.js - CLEAN VERSION WITH HOMEPAGE DESIGN
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Play, Sparkles, ArrowLeft } from "lucide-react";

const BRAND_LOGOS = {
  49: 'https://softapi2.shop/uploads/brands/jili.png',
  45: 'https://softapi2.shop/uploads/brands/pgsoft.png',
  57: 'https://softapi2.shop/uploads/brands/spribe.png',
  58: 'https://softapi2.shop/uploads/brands/brand_58_1759739497.png'
};

const BRAND_NAMES = {
  49: 'JILI',
  45: 'PGSoft',
  57: 'Spribe',
  58: 'Evolution Live'
};

export default function GamesGrid({ brandId, games }) {
  const router = useRouter();
  const [isLaunching, setIsLaunching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const providerName = BRAND_NAMES[brandId] || `Provider ${brandId}`;
  const providerLogo = BRAND_LOGOS[brandId];

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        const response = await fetch('/api/wallet/summary', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUser();
  }, []);

  const launchGame = (game) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("দয়া করে প্রথমে লগইন করুন");
      router.push('/login');
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

  const filteredGames = games.filter(game =>
    game.game_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.providerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-950 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-bold text-white drop-shadow-lg">
            গেম লোড হচ্ছে...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white">
      {/* Background Image with Orange Overlay - Same as home page */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/images/app-bg.jpeg" 
          alt="background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-orange-900/80 via-orange-800/70 to-orange-900/90 backdrop-blur-[1px]"></div>
      </div>

      <div className="relative z-10">
        <div className="pt-4 pb-8 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="mb-6 flex items-center gap-2 text-orange-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">পিছনে যান</span>
            </button>

            {/* Provider Header */}
            <div className="mb-8 md:mb-10">
              {/* Provider Info Card - White background for logo */}
              <div className="flex items-center gap-4 md:gap-6">
                {/* Logo with white background - right aligned */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-white shadow-lg flex items-center justify-center p-3 md:p-4 flex-shrink-0">
                  {providerLogo ? (
                    <img
                      src={providerLogo}
                      alt={providerName}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-2xl md:text-3xl text-orange-600">🎰</div>
                  )}
                </div>
                
                {/* Provider info - left aligned text */}
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
                    {providerName}
                  </h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-orange-300 text-sm md:text-base">
                      {filteredGames.length} টি গেম
                    </span>
                    <span className="w-1 h-1 rounded-full bg-orange-400/50"></span>
                    <span className="text-orange-200/90 text-sm md:text-base">
                      প্রিমিয়াম গেম কালেকশন
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-8 md:mb-10">
              <div className="relative max-w-2xl">
                <input
                  type="text"
                  placeholder={`${providerName} গেমস খুঁজুন...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-5 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl bg-orange-900/40 border-2 border-orange-400/30 text-white placeholder-orange-200/70 focus:outline-none focus:border-orange-400 focus:bg-orange-900/60 backdrop-blur-sm text-sm md:text-base"
                />
                <Search className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-orange-300" />
              </div>
            </div>

            {/* Games Grid - EXACT same as homepage */}
            {filteredGames.length === 0 ? (
              <div className="text-center py-16 bg-orange-900/20 rounded-xl border-2 border-orange-500/20">
                <div className="text-6xl mb-4 opacity-50">🎮</div>
                <div className="text-xl md:text-2xl text-orange-200 mb-2">কোনো গেম পাওয়া যায়নি</div>
                <div className="text-orange-300/70">অন্য কিছু খুঁজুন</div>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3 lg:gap-4">
                {filteredGames.map((game) => {
                  const gameImage = game.game_img || game.img || game.image;
                  const gameName = game.game_name || game.name;
                  
                  return (
                    <div
                      key={game.game_code}
                      onClick={() => launchGame(game)}
                      className="relative rounded-lg lg:rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl hover:shadow-orange-500/30 border-2 border-transparent hover:border-orange-400/50"
                    >
                      <div className="relative w-full aspect-[3/4]">
                        {/* Game Image */}
                        <img
                          src={gameImage}
                          alt={gameName}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = "https://softapi2.shop/uploads/games/default.png";
                          }}
                        />
                        
                        {/* Gradient Overlay - exactly like homepage */}
                        <div className="absolute inset-0 bg-gradient-to-t from-orange-950/90 via-transparent to-transparent" />
                        
                        {/* Provider Badge - exactly like homepage */}
                        <div className="absolute top-1.5 left-1.5 lg:top-2 lg:left-2">
                          <div className="px-1.5 py-0.5 md:px-2 md:py-1 rounded-md lg:rounded-lg bg-orange-900/80 backdrop-blur-sm border border-orange-400/30 text-white text-[10px] md:text-xs lg:text-sm font-bold truncate max-w-[60px] md:max-w-[70px] lg:max-w-[80px]">
                            {game.providerName}
                          </div>
                        </div>
                        
                        {/* Play Overlay - exactly like homepage */}
                        <div className="absolute inset-0 bg-orange-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-orange-500/50 animate-pulse">
                            <Play className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-white" fill="white" />
                          </div>
                        </div>
                      </div>

                      {/* Game Name - exactly like homepage */}
                      <div className="absolute bottom-0 left-0 right-0 p-1.5 md:p-2 lg:p-3 bg-gradient-to-t from-orange-900 via-orange-800/90 to-transparent">
                        <div className="text-white font-bold text-[10px] md:text-xs lg:text-sm text-center truncate drop-shadow-lg leading-tight">
                          {gameName}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Back to Home Button */}
            <div className="text-center mt-12 md:mt-16">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-2 px-8 py-3 md:px-10 md:py-4 bg-gradient-to-r from-orange-600 to-amber-600 rounded-full text-white text-sm md:text-base font-bold hover:shadow-xl hover:shadow-orange-500/40 transition-all hover:scale-105 border border-orange-400/30"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>হোমপেজে ফিরে যান</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Launching Overlay */}
      {isLaunching && (
        <div className="fixed inset-0 bg-orange-950/90 backdrop-blur-md flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-xl font-bold text-white drop-shadow-lg">গেম লোড হচ্ছে...</div>
            <div className="text-orange-200 text-sm mt-2">অপেক্ষা করুন</div>
          </div>
        </div>
      )}
    </div>
  );
}