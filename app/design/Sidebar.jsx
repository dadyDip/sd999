"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { House, Gift, Users, User, ShoppingBag, Crown } from "lucide-react";

export function Sidebar() {

  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const go = (path, auth=false) => {
    if (auth && !user) {
      router.push("/login");
      return;
    }
    router.push(path);
  };

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}

      <aside className="hidden lg:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 flex-col z-40">

        {/* background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/nav-side.png')" }}
        />

        <div className="absolute inset-0 bg-orange-900/40 backdrop-blur-sm"></div>

        {/* gold edge */}
        <div className="absolute right-0 top-0 h-full w-[2px] bg-gradient-to-b from-transparent via-yellow-400 to-transparent"/>

        <nav className="relative flex flex-col gap-4 px-5 py-6 z-10">

          {/* HOME */}
          <button
            onClick={()=>go("/")}
            className={`sidebarBtn ${pathname==="/"?"active":""}`}
          >
            <House className="icon"/>
            <span>হোম</span>
          </button>

          {/* PROMOTION */}
          <button
            onClick={()=>go("/promotion")}
            className={`sidebarBtn ${pathname==="/promotion"?"active":""}`}
          >
            <Gift className="icon text-green-400"/>
            <span>প্রমোশন</span>
          </button>

          {/* DEPOSIT */}
          <button
            onClick={()=>go("/deposit",true)}
            className="sidebarBtn special"
          >
            <div className="depositIcon">
              <ShoppingBag className="h-6 w-6 text-white"/>
              <div className="depositBadge">200%</div>
            </div>
            <span>ডিপোজিট</span>
          </button>

          {/* INVITE */}
          <button
            onClick={()=>go("/invite",true)}
            className={`sidebarBtn ${pathname==="/invite"?"active":""}`}
          >
            <div className="relative">
              <Users className="icon"/>
              <div className="inviteBadge">৳7777</div>
            </div>
            <span>আমন্ত্রণ</span>
          </button>

          {/* MEMBER */}
          <button
            onClick={()=>go("/dashboard",true)}
            className={`sidebarBtn ${pathname==="/dashboard"?"active":""}`}
          >
            <div className="relative">
              <User className="icon text-emerald-400"/>
              <Crown className="crown"/>
            </div>
            <span>সদস্য</span>
          </button>

        </nav>
      </aside>


      {/* ================= MOBILE NAV ================= */}

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-[70px] overflow-visible">

        {/* dark orange casino background */}
        <div className="absolute inset-0 bg-gradient-to-t from-orange-950 via-orange-900 to-orange-800"></div>

        {/* glowing gold border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-goldGlow"/>

        {/* lanterns */}
        <div className="lantern l1">🏮</div>
        <div className="lantern l2">🏮</div>
        <div className="lantern l3">🏮</div>
        <div className="lantern l4">🏮</div>
        <div className="lantern l5">🏮</div>

        {/* gold particles */}
        <div className="particles">
          {Array.from({length:14}).map((_,i)=><span key={i}></span>)}
        </div>

        {/* main nav container with proper spacing */}
        <div className="relative flex items-center justify-between h-full px-3">

          {/* HOME - 20% width */}
          <button
            onClick={()=>go("/")}
            className="flex flex-col items-center justify-center w-[20%] pt-3"
          >
            <House className={`w-6 h-6 ${pathname==="/" ? "text-yellow-300" : "text-white/90"}`}/>
            <span className={`text-[11px] font-medium mt-1 ${pathname==="/" ? "text-yellow-300" : "text-white/90"}`}>হোম</span>
          </button>

          {/* PROMOTION - 20% width */}
          <button
            onClick={()=>go("/promotion")}
            className="flex flex-col items-center justify-center w-[20%] pt-3"
          >
            <Gift className={`w-6 h-6 ${pathname==="/promotion" ? "text-yellow-300" : "text-white/90"}`}/>
            <span className={`text-[11px] font-medium mt-1 ${pathname==="/promotion" ? "text-yellow-300" : "text-white/90"}`}>প্রমোশন</span>
          </button>

          {/* FLOATING DEPOSIT - 20% width with raised position */}
          <div className="w-[20%] flex justify-center relative">
            <button
              onClick={()=>go("/deposit",true)}
              className="absolute -top-12 flex flex-col items-center"
            >
              {/* 200% badge */}
              <div className="absolute -top-4 bg-yellow-300 text-red-700 text-[11px] font-bold px-2 py-[2px] rounded-full shadow-lg animate-badgePulse z-10">
                200%
              </div>

              <div className="relative">
                {/* sparkle */}
                <div className="sparkle"></div>

                {/* glow */}
                <div className="absolute inset-0 rounded-full bg-yellow-400 blur-md opacity-60 animate-pulse"></div>

                <div className="relative bg-gradient-to-b from-yellow-300 to-yellow-500 w-[58px] h-[58px] rounded-full flex items-center justify-center border-4 border-yellow-200 shadow-xl">

                  <img
                    src="https://cdn-icons-png.flaticon.com/512/3135/3135706.png"
                    className="w-7 h-7"
                    alt="deposit"
                  />

                </div>
              </div>

              <span className="text-[10px] font-bold text-yellow-100 mt-1">
                ডিপোজিট
              </span>
            </button>
          </div>

          {/* INVITE - 20% width */}
          <button
            onClick={()=>go("/invite",true)}
            className="flex flex-col items-center justify-center w-[20%] pt-3 relative"
          >
            <div className="absolute -top-1 bg-yellow-300 text-red-700 text-[9px] font-bold px-2 py-[1px] rounded-full animate-badgePulse z-10">
              ৳7777
            </div>
            <Users className={`w-6 h-6 ${pathname==="/invite" ? "text-yellow-300" : "text-white/90"}`}/>
            <span className={`text-[11px] font-medium mt-1 ${pathname==="/invite" ? "text-yellow-300" : "text-white/90"}`}>আমন্ত্রণ</span>
          </button>

          {/* MEMBER - 20% width */}
          <button
            onClick={()=>go("/dashboard",true)}
            className="flex flex-col items-center justify-center w-[20%] pt-3"
          >
            <User className={`w-6 h-6 ${pathname==="/dashboard" ? "text-yellow-300" : "text-white/90"}`}/>
            <span className={`text-[11px] font-medium mt-1 ${pathname==="/dashboard" ? "text-yellow-300" : "text-white/90"}`}>সদস্য</span>
          </button>

        </div>
      </nav>


      {/* ================= STYLES ================= */}

      <style jsx global>{`

        /* DESKTOP BUTTONS */

        .sidebarBtn{
          display:flex;
          align-items:center;
          gap:14px;
          padding:12px 16px;
          border-radius:12px;
          color:white;
          font-weight:600;
          transition:0.25s;
          width:100%;
        }

        .sidebarBtn:hover{
          background:rgba(255,255,255,0.08);
          transform:translateX(3px);
        }

        .sidebarBtn.active{
          background:rgba(255,200,50,0.15);
          color:#facc15;
          border-left:3px solid #facc15;
        }

        .icon{
          width:24px;
          height:24px;
        }

        .depositIcon{
          position:relative;
          background:linear-gradient(135deg,#fde047,#facc15);
          padding:10px;
          border-radius:999px;
          box-shadow:0 0 15px rgba(255,200,0,0.6);
        }

        .depositBadge{
          position:absolute;
          top:-8px;
          right:-10px;
          background:#ef4444;
          color:white;
          font-size:10px;
          font-weight:bold;
          padding:2px 6px;
          border-radius:999px;
        }

        .inviteBadge{
          position:absolute;
          top:-8px;
          right:-10px;
          background:#ef4444;
          color:white;
          font-size:10px;
          padding:2px 6px;
          border-radius:999px;
        }

        .crown{
          position:absolute;
          top:-6px;
          right:-6px;
          width:16px;
          height:16px;
          color:#facc15;
          animation:crownGlow 2s infinite;
        }

        /* ANIMATIONS */

        @keyframes goldGlow{
          0%{opacity:.4}
          50%{opacity:1}
          100%{opacity:.4}
        }

        .animate-goldGlow{
          animation:goldGlow 3s infinite;
        }

        @keyframes crownGlow{
          0%,100%{opacity:.6}
          50%{opacity:1}
        }

        /* MOBILE ANIMATIONS */

        /* lanterns */
        .lantern{
          position:absolute;
          top:-6px;
          font-size:18px;
          opacity:0.65;
          animation:lanternFloat 5s ease-in-out infinite;
          z-index:5;
        }

        .l1{left:5%}
        .l2{left:25%;animation-delay:1s}
        .l3{left:45%;animation-delay:2s}
        .l4{left:65%;animation-delay:1.5s}
        .l5{left:85%;animation-delay:2.5s}

        @keyframes lanternFloat{
          0%{transform:translateY(0)}
          50%{transform:translateY(6px)}
          100%{transform:translateY(0)}
        }

        /* particles */
        .particles span{
          position:absolute;
          bottom:5px;
          width:4px;
          height:4px;
          background:gold;
          border-radius:50%;
          opacity:0.6;
          animation:float 6s linear infinite;
          z-index:5;
        }

        .particles span:nth-child(1){left:2%}
        .particles span:nth-child(2){left:12%;animation-delay:1s}
        .particles span:nth-child(3){left:22%;animation-delay:2s}
        .particles span:nth-child(4){left:32%;animation-delay:3s}
        .particles span:nth-child(5){left:42%;animation-delay:4s}
        .particles span:nth-child(6){left:52%;animation-delay:5s}
        .particles span:nth-child(7){left:62%;animation-delay:2s}
        .particles span:nth-child(8){left:72%;animation-delay:3s}
        .particles span:nth-child(9){left:82%;animation-delay:4s}
        .particles span:nth-child(10){left:92%;animation-delay:2.5s}
        .particles span:nth-child(11){left:8%;animation-delay:3.5s}
        .particles span:nth-child(12){left:28%;animation-delay:1.5s}
        .particles span:nth-child(13){left:48%;animation-delay:4.5s}
        .particles span:nth-child(14){left:68%;animation-delay:0.5s}

        @keyframes float{
          0%{transform:translateY(0);opacity:0}
          50%{opacity:1}
          100%{transform:translateY(-30px);opacity:0}
        }

        /* badge pulse */
        .animate-badgePulse{
          animation:badgePulse 2s infinite;
        }

        @keyframes badgePulse{
          0%{transform:scale(1)}
          50%{transform:scale(1.15)}
          100%{transform:scale(1)}
        }

        /* sparkle */
        .sparkle{
          position:absolute;
          top:-5px;
          right:-5px;
          width:12px;
          height:12px;
          background:radial-gradient(circle, white, gold);
          border-radius:50%;
          animation:sparkle 1.6s infinite;
          z-index:10;
        }

        @keyframes sparkle{
          0%{opacity:0;transform:scale(0)}
          50%{opacity:1;transform:scale(1)}
          100%{opacity:0;transform:scale(0)}
        }

      `}</style>
    </>
  );
}