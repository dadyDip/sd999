"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

import { useIsGameRoute } from "@/components/hooks/useIsGameRoute";
import { useAuth } from "@/components/AuthProvider";
import InstallBanner from "@/components/InstallBanner";
import { useLang } from "@/app/i18n/useLang";

export function Navigation() {
  const router = useRouter();
  const isGameRoute = useIsGameRoute();
  const { user, loading } = useAuth();
  const [balance, setBalance] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { lang, changeLang } = useLang();

  useEffect(() => {
    if (lang !== "bn") changeLang("bn");
  }, []);

  useEffect(() => {
    if (!user) {
      setBalance(0);
      return;
    }
    fetchBalance();
  }, [user]);

  const fetchBalance = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/wallet/summary", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) return;
      const data = await res.json();
      setBalance(Math.floor((data?.balance ?? 0) / 100));
    } catch (err) {
      console.error("Failed to load wallet summary", err);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  if (isGameRoute || loading) return null;

  const mobileMenuItems = [
    { icon: "deposit", label: "ডিপোজিট", path: "/deposit" },
    { icon: "withdraw", label: "উইথড্র", path: "/dashboard/withdraw" },
    { icon: "refresh", label: "রিফ্রেশ", action: fetchBalance },
    { icon: "profile", label: "প্রোফাইল", path: "/dashboard" },
    { icon: "history", label: "হিস্ট্রি", path: "/history" },
    { icon: "bonus", label: "বোনাস", path: "/bonuses" },
    { icon: "logout", label: "লগআউট", path: "/logout" }
  ];

  const getIcon = (type, className = "w-5 h-5") => {
    switch(type) {
      case "deposit":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 10H21M7 15H11M7 18H14M5 6H19C20.1046 6 21 6.89543 21 8V16C21 17.1046 20.1046 18 19 18H5C3.89543 18 3 17.1046 3 16V8C3 6.89543 3.89543 6 5 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="18" cy="12" r="1" fill="currentColor"/>
          </svg>
        );
      case "withdraw":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 10H21M16 15L12 19M12 19L8 15M12 19V11M5 6H19C20.1046 6 21 6.89543 21 8V16C21 17.1046 20.1046 18 19 18H5C3.89543 18 3 17.1046 3 16V8C3 6.89543 3.89543 6 5 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case "refresh":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4V9H4.06189M20 20V15H19.9381M4.06189 9C4.55204 7.34475 5.53289 5.86285 6.87449 4.74275C8.53298 3.35756 10.6667 2.5 13 2.5C18.2467 2.5 22.5 6.75329 22.5 12C22.5 17.2467 18.2467 21.5 13 21.5C8.61947 21.5 4.94771 18.5248 3.88745 14.5M4.06189 9H9M19.9381 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case "profile":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M5 20V19C5 15.6863 7.68629 13 11 13H13C16.3137 13 19 15.6863 19 19V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case "history":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case "bonus":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 3C12 3 14 5 14 8C14 11 12 13 12 13C12 13 10 11 10 8C10 5 12 3 12 3Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M7 9C7 9 9 10 12 10C15 10 17 9 17 9" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case "logout":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 16.5V19C15 20.1046 14.1046 21 13 21H6C4.89543 21 4 20.1046 4 19V5C4 3.89543 4.89543 3 6 3H13C14.1046 3 15 3.89543 15 5V7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M11 12H21M21 12L18 9M21 12L18 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case "wallet":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12V16C21 17.1046 20.1046 18 19 18H5C3.89543 18 3 17.1046 3 16V8C3 6.89543 3.89543 6 5 6H19C20.1046 6 21 6.89543 21 8V12ZM21 12H17C15.8954 12 15 12.8954 15 14C15 15.1046 15.8954 16 17 16H21" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case "login":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 16.5V19C15 20.1046 14.1046 21 13 21H6C4.89543 21 4 20.1046 4 19V5C4 3.89543 4.89543 3 6 3H13C14.1046 3 15 3.89543 15 5V7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M11 12H21M21 12L18 9M21 12L18 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case "register":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 21V19C16 16.7909 14.2091 15 12 15H6C3.79086 15 2 16.7909 2 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M19 8V14M22 11H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case "menu":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case "close":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full">
        {/* Background with overlay like sidebar */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/nav-side.png')" }}
        />
        <div className="absolute inset-0 bg-orange-900/40 backdrop-blur-sm" />
        
        {/* Gold edge like sidebar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />

        {/* Lanterns */}
        <div className="lantern l1 hidden sm:block">🏮</div>
        <div className="lantern l2 hidden sm:block">🏮</div>
        <div className="lantern l3 hidden sm:block">🏮</div>
        
        {/* Gold particles */}
        <div className="particles hidden sm:block">
          {Array.from({length: 8}).map((_, i) => <span key={i}></span>)}
        </div>

        <div className="relative max-w-7xl mx-auto flex h-16 items-center justify-between px-4 z-10">
          {/* LOGO */}
          <div
            onClick={() => router.push("/")}
            className="cursor-pointer select-none relative group"
          >
            <div className="absolute -inset-2 bg-yellow-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <h1
              className="text-4xl sm:text-5xl font-black tracking-wider relative"
              style={{
                background: "linear-gradient(135deg, #FFE55C, #FFD700, #FFB347)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 20px rgba(255,215,0,0.3)"
              }}
            >
              SD999
            </h1>
          </div>

          {/* RIGHT SIDE */}
          {user ? (
            <div className="flex items-center gap-2">
              {/* BALANCE - Only this stays in English numbers */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-yellow-400/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 border border-yellow-500/30">
                  {getIcon("wallet", "w-4 h-4 text-yellow-400")}
                  <span className="font-bold text-sm text-white">৳ {balance}</span>
                  <button
                    onClick={fetchBalance}
                    className={`${refreshing ? "animate-spin" : ""} hover:scale-110 transition`}
                  >
                    {getIcon("refresh", "w-3 h-3 text-yellow-400")}
                  </button>
                </div>
              </div>

              {/* DEPOSIT ICON with badge */}
              <button
                onClick={() => router.push("/deposit")}
                className="relative group"
              >
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full z-10 animate-badgePulse">
                  ২০০%
                </div>
                
                <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-40 transition-opacity" />
                
                <div className="relative h-9 w-9 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg hover:scale-110 transition border-2 border-yellow-300">
                  {getIcon("deposit", "w-5 h-5 text-yellow-900")}
                </div>
              </button>

              {/* WITHDRAW ICON */}
              <button
                onClick={() => router.push("/dashboard/withdraw")}
                className="relative group"
              >
                <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-40 transition-opacity" />
                
                <div className="relative h-9 w-9 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg hover:scale-110 transition border-2 border-yellow-300">
                  {getIcon("withdraw", "w-5 h-5 text-yellow-900")}
                </div>
              </button>

              {/* MENU BUTTON */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="relative group"
              >
                <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-40 transition-opacity" />
                
                <div className="relative h-9 w-9 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 shadow-lg border-2 border-yellow-400">
                  {mobileMenuOpen ? getIcon("close", "w-5 h-5 text-white") : getIcon("menu", "w-5 h-5 text-white")}
                </div>
              </button>
            </div>
          ) : (
            /* GUEST UI - All in Bangla */
            <div className="flex items-center gap-3">
              {/* REGISTER BUTTON with bonus badge */}
              <div className="relative group">
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-300 to-yellow-500 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full z-10 animate-badgePulse flex items-center gap-0.5 border border-yellow-200">
                  <span>৳</span>
                  <span>৫.৭-৭৭৭৭</span>
                </div>
                
                <div className="absolute -inset-1 bg-yellow-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <Button
                  className="relative bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-white rounded-full text-xs sm:text-sm px-4 py-2 shadow-lg hover:scale-105 transition border border-yellow-400 flex items-center gap-1"
                  onClick={() => router.push("/register")}
                >
                  {getIcon("register", "w-4 h-4")}
                  <span>রেজিস্টার</span>
                </Button>
              </div>

              {/* LOGIN BUTTON */}
              <Button
                variant="outline"
                className="relative border-yellow-500/50 text-yellow-400 rounded-full text-xs sm:text-sm px-4 py-2 hover:bg-yellow-500/10 transition hover:scale-105 flex items-center gap-1"
                onClick={() => router.push("/login")}
              >
                {getIcon("login", "w-4 h-4")}
                <span>লগইন</span>
              </Button>

              {/* Mobile menu button */}
              <button className="lg:hidden relative h-9 w-9 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-700 flex items-center justify-center border border-yellow-400">
                {getIcon("menu", "w-5 h-5 text-white")}
              </button>
            </div>
          )}
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {user && (
          <div
            className={`
              lg:hidden fixed right-3 top-16 z-[100] w-[220px] origin-top-right
              transition-all duration-300 ease-out
              ${mobileMenuOpen 
                ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              }
            `}
          >
            {/* MENU CARD */}
            <div className="bg-[#1a1a1a]/95 backdrop-blur-md rounded-xl border border-yellow-500/30 shadow-2xl p-2">
              {/* Decorative top line */}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full" />
              
              {/* Particles effect on open */}
              {mobileMenuOpen && (
                <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                  {Array.from({length: 6}).map((_, i) => (
                    <span
                      key={i}
                      className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-menuParticle"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-1 relative z-10">
                {mobileMenuItems.map((item, index) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.action) item.action();
                      else router.push(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg 
                      hover:bg-yellow-500/20 transition-all group
                      ${mobileMenuOpen ? 'animate-menuItemFade' : ''}
                    `}
                    style={{
                      animationDelay: `${index * 0.03}s`,
                    }}
                  >
                    {/* ICON */}
                    <div className="flex items-center justify-center w-7 h-7 rounded-full 
                    bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900">
                      {getIcon(item.icon, "w-4 h-4")}
                    </div>

                    {/* LABEL - Now in Bangla */}
                    <span className="text-xs font-semibold text-white">
                      {item.label}
                    </span>

                    {/* ARROW */}
                    <span className="ml-auto text-yellow-400 text-xs group-hover:translate-x-1 transition">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      <InstallBanner />

      <style jsx global>{`
        @keyframes goldGlow {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }

        @keyframes badgePulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        @keyframes menuItemFade {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes menuParticle {
          0% {
            transform: scale(0) translateY(0);
            opacity: 0;
          }
          50% {
            transform: scale(1) translateY(-20px);
            opacity: 0.8;
          }
          100% {
            transform: scale(0) translateY(-40px);
            opacity: 0;
          }
        }

        .animate-badgePulse {
          animation: badgePulse 2s infinite;
        }

        .animate-menuItemFade {
          animation: menuItemFade 0.3s ease-out forwards;
        }

        .animate-menuParticle {
          animation: menuParticle 1s ease-out forwards;
        }

        .lantern {
          position: absolute;
          top: 2px;
          font-size: 16px;
          opacity: 0.65;
          animation: lanternFloat 5s ease-in-out infinite;
          z-index: 5;
        }

        .l1 { left: 15%; }
        .l2 { left: 45%; animation-delay: 1s; }
        .l3 { left: 75%; animation-delay: 2s; }

        @keyframes lanternFloat {
          0% { transform: translateY(0); }
          50% { transform: translateY(4px); }
          100% { transform: translateY(0); }
        }

        .particles span {
          position: absolute;
          bottom: 0;
          width: 3px;
          height: 3px;
          background: gold;
          border-radius: 50%;
          opacity: 0.6;
          animation: float 4s linear infinite;
          z-index: 5;
        }

        .particles span:nth-child(1) { left: 5%; }
        .particles span:nth-child(2) { left: 20%; animation-delay: 0.8s; }
        .particles span:nth-child(3) { left: 35%; animation-delay: 1.6s; }
        .particles span:nth-child(4) { left: 50%; animation-delay: 2.4s; }
        .particles span:nth-child(5) { left: 65%; animation-delay: 1.2s; }
        .particles span:nth-child(6) { left: 80%; animation-delay: 2s; }
        .particles span:nth-child(7) { left: 95%; animation-delay: 0.4s; }
        .particles span:nth-child(8) { left: 10%; animation-delay: 2.8s; }

        @keyframes float {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-40px); opacity: 0; }
        }

        @keyframes crownGlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
}