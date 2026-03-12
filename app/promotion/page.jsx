"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Gift, Sparkles, Crown, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export default function PromotionsPage() {
  const router = useRouter();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const slides = [
    {
      src: "/images/slide-1.png",
      title: "প্রথম ডিপোজিট বোনাস",
      badge: "২০০%",
      desc: "আজই ডিপোজিট করুন দ্বিগুণ বোনাস পাবেন"
    },
    {
      src: "/images/slide-2.png",
      title: "লাইভ ক্যাসিনো অফার",
      badge: "৫০%",
      desc: "লাইভ গেমসে বিশেষ ক্যাশব্যাক"
    },
    {
      src: "/images/slide-3.png",
      title: "সাপ্তাহিক টুর্নামেন্ট",
      badge: "২৫লাখ",
      desc: "প্রতি সপ্তাহে জিতে নিন বিশাল পুরস্কার"
    },
    {
      src: "/images/slide-4.png",
      title: "রয়্যাল ভিআইপি ক্লাব",
      badge: "VIP",
      desc: "এক্সক্লুসিভ বোনাস ও কনসিয়ার্জ সেবা"
    },
  ];

  // Particles animation effect
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes float-particle {
        0% { transform: translateY(0) rotate(0deg); opacity: 0; }
        20% { opacity: 0.8; }
        100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Background with royal gradient and glow */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/images/app-bg.jpeg" 
          alt="background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-orange-900/80 via-orange-800/70 to-amber-900/80 backdrop-blur-[2px]"></div>
        
        {/* Glowing orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Gold particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {Array.from({length: 20}).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-particle ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Header with royal styling */}
      <div className="relative z-10 sticky top-0">
        {/* Background with glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-950 via-orange-900 to-amber-900"></div>
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"></div>
        
        {/* Lantern decorations */}
        <div className="lantern l1">🏮</div>
        <div className="lantern l2">🏮</div>
        <div className="lantern l3">🏮</div>
        
        {/* Header content */}
        <div className="relative flex items-center justify-between px-4 py-3 backdrop-blur-sm">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 rounded-full bg-orange-800/50 border border-orange-400/30 flex items-center justify-center hover:bg-orange-700/50 transition-all hover:scale-110 group"
          >
            <ArrowLeft className="w-5 h-5 text-orange-200 group-hover:text-white" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-md"></div>
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center">
                <Gift className="w-4 h-4 text-white" />
              </div>
            </div>
            <h1 className="text-white font-bold text-xl tracking-wider drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
              প্রমোশন
            </h1>
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          </div>
          
          <div className="w-10 h-10 rounded-full bg-orange-800/30 border border-orange-400/30 flex items-center justify-center">
            <Crown className="w-5 h-5 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Cards container */}
      <div className="relative z-10 px-4 py-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-5">
          <Zap className="w-5 h-5 text-yellow-400" />
          <span className="text-orange-200 font-medium">এক্সক্লুসিভ অফার সমূহ</span>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-orange-400/30 to-transparent"></div>
        </div>

        {slides.map((slide, index) => (
          <div
            key={index}
            className="relative group mb-6 cursor-pointer"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Glow effect on hover */}
            <div className={`absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500 ${hoveredIndex === index ? 'opacity-50' : ''}`}></div>
            
            {/* Card */}
            <div className="relative bg-gradient-to-br from-orange-950/90 to-amber-950/90 backdrop-blur-sm rounded-xl border border-orange-500/30 overflow-hidden shadow-2xl transform transition-all duration-500 group-hover:scale-[1.02] group-hover:border-yellow-400/50">
              
              {/* Image */}
              <div className="relative w-full aspect-[2/1] overflow-hidden">
                <Image
                  src={slide.src}
                  alt={slide.title}
                  width={800}
                  height={400}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  priority={index < 2}
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-orange-950 via-orange-950/50 to-transparent"></div>
                
                {/* Badge */}
                <div className="absolute top-3 right-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-70"></div>
                    <div className="relative bg-gradient-to-r from-yellow-400 to-amber-500 px-3 py-1.5 rounded-full border border-yellow-300 shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-red-700" />
                      <span className="font-bold text-red-700 text-sm">{slide.badge}</span>
                    </div>
                  </div>
                </div>
                
                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h2 className="text-white font-bold text-xl mb-1 drop-shadow-lg">
                    {slide.title}
                  </h2>
                  <p className="text-orange-200 text-sm flex items-center gap-1">
                    {slide.desc}
                    <ArrowLeft className="w-4 h-4 rotate-180 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                  </p>
                </div>
              </div>
              
              {/* Bottom indicator */}
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-4">
        <p className="text-xs text-orange-300/70">
          শর্তাবলী প্রযোজ্য | সীমিত সময়ের অফার
        </p>
      </div>

      <style jsx>{`
        .lantern {
          position: absolute;
          top: -4px;
          font-size: 14px;
          opacity: 0.4;
          filter: drop-shadow(0 0 4px gold);
          animation: lanternFloat 5s ease-in-out infinite;
          z-index: 5;
        }
        
        .l1 { left: 5%; }
        .l2 { left: 45%; animation-delay: 1.5s; }
        .l3 { left: 85%; animation-delay: 2.5s; }
        
        @keyframes lanternFloat {
          0% { transform: translateY(0); }
          50% { transform: translateY(5px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}