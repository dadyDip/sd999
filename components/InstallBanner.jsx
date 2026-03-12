"use client";

import { useEffect, useState } from "react";
import { Gift, Download, Sparkles, Crown } from "lucide-react";

export default function InstallBanner() {
  const [prompt, setPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = window.navigator.standalone === true;
    if (localStorage.getItem("installed")) return;

    if (isIOS && !isStandalone) {
      setShow(true);
    }

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!show) return null;

  const handleInstall = async () => {
    if (prompt) {
      prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === "accepted") {
        localStorage.setItem("installed", "true");
        setShow(false);
      }
    } else {
      alert("Use Share → Add to Home Screen to install this app");
      localStorage.setItem("installed", "true");
      setShow(false);
    }
  };

  return (
    <div className="relative w-full overflow-visible z-40 sticky top-16">
      {/* Glowing background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-950 via-orange-900 to-amber-900"></div>
      
      {/* Glow effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-yellow-500/5 animate-pulse"></div>
      
      {/* Gold glowing borders */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-goldGlow"></div>
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-400/70 to-transparent"></div>
      
      {/* Lanterns with glow */}
      <div className="lantern l1">🏮</div>
      <div className="lantern l2">🏮</div>
      <div className="lantern l3">🏮</div>
      <div className="lantern l4">🏮</div>
      
      {/* Gold particles */}
      <div className="particles">
        {Array.from({length:8}).map((_,i)=><span key={i}></span>)}
      </div>
      
      {/* Main content - medium size */}
      <div className="relative flex items-center justify-between px-4 py-2.5 backdrop-blur-[1px]">
        
        {/* Left section with icon and text */}
        <div className="flex items-center gap-3">
          {/* Crown with glow */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-yellow-400/30 blur-md"></div>
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center border border-yellow-300/50 shadow-lg shadow-yellow-600/30">
              <Crown className="w-5 h-5 text-white" />
            </div>
          </div>
          
          {/* SD999 text with glow */}
          <span className="text-white font-bold text-base tracking-wider drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">SD999</span>
        </div>
        
        {/* Right section with badge and button */}
        <div className="flex items-center gap-3">
          {/* 19.77 Taka badge with glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-sm"></div>
            <div className="relative bg-gradient-to-r from-yellow-400 to-amber-500 px-3 py-1.5 rounded-full border border-yellow-300 shadow-lg shadow-yellow-600/30 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-red-700" />
              <span className="font-bold text-red-700 text-sm">১৯.৭৭৳</span>
            </div>
          </div>
          
          {/* Install button with glow */}
          <button
            onClick={handleInstall}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-md blur-md opacity-60 group-hover:opacity-80 transition-opacity"></div>
            <div className="relative bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 px-4 py-2 rounded-md border border-orange-400/50 shadow-lg flex items-center gap-2 transition-all duration-200 group-hover:scale-105">
              <Download className="w-4 h-4 text-white" />
              <span className="font-medium text-white text-sm">Install</span>
            </div>
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .lantern {
          position: absolute;
          top: -5px;
          font-size: 14px;
          opacity: 0.4;
          filter: drop-shadow(0 0 4px gold);
          animation: lanternFloat 5s ease-in-out infinite;
          z-index: 5;
        }
        
        .l1 { left: 5%; }
        .l2 { left: 28%; animation-delay: 1s; }
        .l3 { left: 55%; animation-delay: 2s; }
        .l4 { left: 82%; animation-delay: 1.8s; }
        
        @keyframes lanternFloat {
          0% { transform: translateY(0); }
          50% { transform: translateY(5px); }
          100% { transform: translateY(0); }
        }
        
        .particles span {
          position: absolute;
          bottom: 5px;
          width: 3px;
          height: 3px;
          background: gold;
          border-radius: 50%;
          opacity: 0.4;
          filter: blur(1px);
          animation: float 5s linear infinite;
          z-index: 5;
        }
        
        .particles span:nth-child(1) { left: 10%; }
        .particles span:nth-child(2) { left: 22%; animation-delay: 1s; }
        .particles span:nth-child(3) { left: 35%; animation-delay: 2s; }
        .particles span:nth-child(4) { left: 48%; animation-delay: 3s; }
        .particles span:nth-child(5) { left: 60%; animation-delay: 4s; }
        .particles span:nth-child(6) { left: 72%; animation-delay: 2.5s; }
        .particles span:nth-child(7) { left: 85%; animation-delay: 1.5s; }
        .particles span:nth-child(8) { left: 95%; animation-delay: 3.5s; }
        
        @keyframes float {
          0% { transform: translateY(0); opacity: 0; }
          30% { opacity: 0.6; }
          100% { transform: translateY(-30px); opacity: 0; }
        }
        
        @keyframes goldGlow {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
        
        .animate-goldGlow {
          animation: goldGlow 3s infinite;
        }
      `}</style>
    </div>
  );
}