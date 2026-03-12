"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Copy,
  Check,
  Home
} from "lucide-react";

const PAYMENT_CHANNELS = {
  bkash: [
    { id: "bkash-vip-1", name: "Bkash-vip-1", number: "01635-073307" }
  ],
  nagad: [
    { id: "nagad-vip-1", name: "Nagad-vip-1", number: "01861-633561" }
  ]
};

export default function DepositFinalStepPage() {
  const router = useRouter();

  const [depositData, setDepositData] = useState(null);
  const [trxId, setTrxId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  
  const trxIdInputRef = useRef(null);

  // Load deposit data from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('depositData');
    if (stored) {
      setDepositData(JSON.parse(stored));
    } else {
      router.push('/deposit');
    }
  }, [router]);

  if (!depositData) {
    return null;
  }

  const { method, amount, selectedChannel } = depositData;
  
  // Get current payment channel
  const currentChannel = PAYMENT_CHANNELS[method].find(ch => ch.id === selectedChannel) || PAYMENT_CHANNELS[method][0];

  // Method-specific content
  const methodContent = {
    bkash: {
      gradientFrom: "from-pink-500",
      gradientTo: "to-pink-600",
      logoBg: "bg-white",
      logoText: "text-pink-600",
      logoDisplay: "bKash",
      title: "BKASH Deposit",
      walletLabel: "Wallet No",
      description: "এই BKASH নাম্বারে শুধুমাত্র ক্যাশআউট গ্রহণ করা হয়",
      placeholder: "TrxID অবশ্যই পূরণ করতে হবে!",
      confirmText: "নিশ্চিত",
      submittingText: "সাবমিট হচ্ছে..."
    },
    nagad: {
      gradientFrom: "from-orange-500",
      gradientTo: "to-orange-600",
      logoBg: "bg-white",
      logoText: "text-orange-600",
      logoDisplay: "Nagad",
      title: "NAGAD Deposit",
      walletLabel: "Wallet No",
      description: "এই NAGAD নাম্বারে শুধুমাত্র ক্যাশআউট গ্রহণ করা হয়",
      placeholder: "TrxID অবশ্যই পূরণ করতে হবে!",
      confirmText: "নিশ্চিত",
      submittingText: "সাবমিট হচ্ছে..."
    }
  };

  const content = methodContent[method] || methodContent.bkash;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };

  const handleBack = () => {
    router.back();
  };

  const goHome = () => {
    router.push("/");
  };

  const submitDeposit = async () => {
    if (!trxId.trim()) {
      setError("ট্রানজেকশন আইডি দিন");
      if (trxIdInputRef.current) {
        trxIdInputRef.current.focus();
      }
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/deposit/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ 
          method, 
          amount: Number(amount), 
          trxId,
          paymentChannel: selectedChannel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit deposit");
      }

      sessionStorage.removeItem('depositData');
      
      alert("✅ ডিপোজিট অনুরোধ সফল হয়েছে। অ্যাপ্রুভ হওয়ার পর ব্যালেন্স যুক্ত হবে।");
      router.push("/");
    } catch (err) {
      setError(err.message || "ডিপোজিট সাবমিট করতে ব্যর্থ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 🔝 Top Header Section - Dark Green Background */}
      <div className="bg-[#006341] px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Amount */}
          <div>
            <div className="text-white text-2xl font-bold">
              BDT {Number(amount).toFixed(2)}
            </div>
            <div className="text-white text-sm mt-1">
              কম বা বেশি ক্যাশআউট করবেন না
            </div>
          </div>

          {/* Right Side - PAY SERVICE Logo */}
          <div className="flex items-center gap-1">
            <div className="bg-white rounded-full px-3 py-1">
              <span className="text-[#006341] font-bold">PAY</span>
            </div>
            <span className="text-white font-bold">SERVICE</span>
          </div>

          {/* Language Toggle - Hidden for now as per design */}
          <div className="hidden">
            <button className="bg-white rounded-full px-2 py-1 text-sm">
              <span className="font-bold">EN</span>
              <span className="text-gray-400 ml-1">বা°</span>
            </button>
          </div>
        </div>
      </div>

      {/* ⚠️ Warning Section */}
      <div className="bg-gray-100 px-4 py-3">
        <p className="text-red-600 font-bold text-base text-center">
          আপনি যদি টাকার পরিমাণ পরিবর্তন করেন <span className="text-red-700">(BDT {Number(amount).toFixed(2)})</span>, আপনি ক্রেডিট পেতে সক্ষম হবেন না।
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* 💳 Deposit Section - Dynamic based on method */}
        <div className={`bg-gradient-to-r ${content.gradientFrom} ${content.gradientTo} rounded-xl p-4 shadow-md`}>
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className={`w-12 h-12 ${content.logoBg} rounded-full flex items-center justify-center`}>
              <div className={`${content.logoText} font-bold text-lg`}>{content.logoDisplay}</div>
            </div>
            <div className="text-white font-bold text-xl">
              {content.title}
            </div>
          </div>
        </div>

        {/* 📱 Wallet Number Section - Dynamic based on method */}
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <span className="text-black font-bold">{content.walletLabel}</span>
            <span className="text-red-600 font-bold">*</span>
          </div>
          
          <p className="text-black text-sm">
            {content.description}
          </p>

          {/* Wallet Number Box */}
          <div className="flex items-center justify-between bg-gray-100 border border-gray-300 rounded-lg p-4">
            <span className="text-black font-mono text-lg">
              {currentChannel.number}
            </span>
            <button
              onClick={() => copyToClipboard(currentChannel.number)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {copySuccess ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* 🔢 Transaction ID Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <span className="text-black font-bold">ক্যাশআউটের TrxID নাম্বারটি লিখুন</span>
            <span className="text-red-600 font-bold">(প্রয়োজন)</span>
          </div>

          {/* Input Field */}
          <input
            ref={trxIdInputRef}
            type="text"
            placeholder={content.placeholder}
            value={trxId}
            onChange={(e) => {
              setTrxId(e.target.value);
              setError("");
            }}
            className="w-full p-4 bg-gray-100 border-2 border-red-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 text-black placeholder-gray-500"
            autoFocus
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-300 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* ✅ Confirm Button */}
        <button
          onClick={submitDeposit}
          disabled={loading || !trxId.trim()}
          className={`w-full py-4 rounded-xl font-bold text-lg border-2 border-black ${
            loading || !trxId.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-black hover:bg-gray-300 active:bg-gray-400'
          } transition-colors`}
        >
          {loading ? content.submittingText : content.confirmText}
        </button>

        {/* ⚠️ Bottom Warning Section - Dynamic based on method */}
        <div className="space-y-2 pt-4">
          <h3 className="text-black font-bold text-base">
            সতর্কতা:
          </h3>
          <p className="text-red-600 font-bold text-base leading-relaxed">
            লেনদেন আইডি সঠিকভাবে পূরণ করতে হবে, অন্যথায় ক্রোর ব্যর্থ হবে!!
          </p>
          <p className="text-gray-500 text-sm">
            আপনি সঠিক {method === 'bkash' ? 'BKASH' : 'NAGAD'} ডিপোজিট ওয়ালেট নম্বরে ক্যাশআউট করছেন কিনা তা নিশ্চিত করুন। আপনি যদি অন্য ওয়ালেট নম্বরে ক্যাশআউট করেন, তাহলে টাকা পাওয়ার কোনো সম্ভাবনা নেই।
          </p>
        </div>
      </div>
    </div>
  );
}