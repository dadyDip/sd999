"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Calendar,
  AlertCircle
} from "lucide-react";

export default function BettingRecordsPage() {

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [bettingHistory, setBettingHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [selectedGame, setSelectedGame] = useState("slot");

  const gameTabs = [
    { id: "slot", label: "স্লট" },
    { id: "fish", label: "মাছ" },
    { id: "live", label: "লাইভ" },
    { id: "sports", label: "খেলাধুলা" },
    { id: "poker", label: "পোকার" }
  ];

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {

      const token = localStorage.getItem("token");

      const res = await fetch("/api/casino/history?all=true", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      let bets = [];

      if (data.spins) {
        bets = data.spins.map(spin => ({
          id: spin.id,
          betAmount: spin.betAmount / 100,
          winAmount: spin.winAmount / 100,
          profit: (spin.winAmount - spin.betAmount) / 100,
          date: spin.timestamp
        }));
      }

      bets.sort((a, b) => new Date(b.date) - new Date(a.date));

      setBettingHistory(bets);
      setFilteredHistory(bets);

    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const totalBet = filteredHistory.reduce((a,b)=>a+b.betAmount,0);
  const totalWin = filteredHistory.reduce((a,b)=>a+b.winAmount,0);
  const totalProfit = filteredHistory.reduce((a,b)=>a+b.profit,0);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  return (

<div className="flex flex-col h-full bg-white text-black">

{/* HEADER */}

<div className="bg-[#8B0000] text-white h-16 flex items-center justify-between px-4">

<button onClick={()=>router.back()}>
<ArrowLeft/>
</button>

<h1 className="font-semibold text-lg">
বেটিং রেকর্ড
</h1>

<button className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
বজিট টার্নওভার তালিকা
</button>

</div>


{/* GAME TABS */}

<div className="border-b overflow-x-auto">

<div className="flex min-w-max">

{gameTabs.map(tab=>(
<button
key={tab.id}
onClick={()=>setSelectedGame(tab.id)}
className={`px-5 py-3 text-sm whitespace-nowrap ${
selectedGame===tab.id
? "text-blue-600 border-b-2 border-blue-600"
: "text-gray-700"
}`}
>
{tab.label}
</button>
))}

</div>

</div>


{/* FILTER BAR */}

<div className="flex items-center gap-2 p-3 border-b">

<div className="flex items-center gap-2 border border-blue-500 rounded-lg px-3 py-2 text-sm text-blue-600">

<Calendar size={16}/>
03/08 00:00 - 03/08 23:59

</div>

<button className="border border-blue-500 text-blue-600 px-3 py-2 rounded-lg text-sm">
সব
</button>

<button className="ml-auto">
<Search className="text-blue-600"/>
</button>

</div>


{/* CONTENT */}

<div className="flex-1 overflow-y-auto">

{filteredHistory.length===0 ?(

<div className="flex flex-col items-center justify-center h-full text-blue-500">

<div className="text-6xl mb-4">📦</div>

<p className="text-lg">
কোন ডেটা নেই
</p>

</div>

):(

<div className="p-4 space-y-3">

{filteredHistory.map(bet=>(
<div
key={bet.id}
className="border rounded-xl p-4 flex justify-between"
>

<div>
<p className="text-sm text-gray-500">
বেট
</p>

<p className="font-semibold">
৳ {bet.betAmount.toFixed(2)}
</p>
</div>

<div>
<p className="text-sm text-gray-500">
জয়
</p>

<p className="font-semibold">
৳ {bet.winAmount.toFixed(2)}
</p>
</div>

<div>
<p className="text-sm text-gray-500">
লাভ
</p>

<p className={`font-semibold ${
bet.profit>=0?"text-green-600":"text-red-600"
}`}>
৳ {bet.profit.toFixed(2)}
</p>
</div>

</div>
))}

</div>

)}

</div>


{/* BOTTOM STATS */}

<div className="border-t bg-gray-100 p-4 grid grid-cols-2 gap-4 text-sm">

<div>
<p className="text-gray-600">
বেট পরিমাণ
</p>
<p className="text-green-600 font-semibold">
{totalBet.toFixed(2)}
</p>
</div>

<div>
<p className="text-gray-600">
বৈধ বেট
</p>
<p className="text-green-600 font-semibold">
{totalBet.toFixed(2)}
</p>
</div>

<div>
<p className="text-gray-600">
জয়
</p>
<p className="text-green-600 font-semibold">
{totalWin.toFixed(2)}
</p>
</div>

<div>
<p className="text-gray-600">
লাভ এবং লস
</p>
<p className="text-green-600 font-semibold">
{totalProfit.toFixed(2)}
</p>
</div>

</div>

</div>

  );
}