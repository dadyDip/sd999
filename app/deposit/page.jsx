"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/app/i18n/useLang";
import { 
  ChevronLeft, 
  Bell, 
  Copy,
  Check,
  ChevronDown,
  Home,
  X,
  AlertCircle
} from "lucide-react";

const PAYMENT_CHANNELS = {
  bkash: [
    { id: "bkash-vip-1", name: "Bkash-vip-1", number: "01635-073307" }
  ],
  nagad: [
    { id: "nagad-vip-1", name: "Nagad-vip-1", number: "01861-633561" }
  ]
};

const MINIMUM_DEPOSIT = 100;
const MAXIMUM_DEPOSIT = 25000;

// Preset amounts with bonuses (10x turnover)
const PRESET_AMOUNTS = [
  { amount: 100, bonus: 60 },
  { amount: 200, bonus: 120 },
  { amount: 500, bonus: 300 },
  { amount: 1000, bonus: 600 },
  { amount: 2000, bonus: 1200 },
  { amount: 5000, bonus: 3000 },
];

// Deposit programs
const DEPOSIT_PROGRAMS = [
  {
    id: 1,
    title: "দৈনিক প্রথম রিচার্জ সর্বোচ্চ ৭৫০০ বোনাস পান",
    requirement: "≥ ৳ 100.00",
    description: "প্রতিদিন মাত্র ১ বার অংশগ্রহণ করা যাবে",
    tiers: [
      { min: 100, bonusPercent: 20, bonusAmount: 20 },
      { min: 200, bonusPercent: 20, bonusAmount: 40 },
      { min: 500, bonusPercent: 20, bonusAmount: 100 },
      { min: 1000, bonusPercent: 20, bonusAmount: 200 },
      { min: 2000, bonusPercent: 20, bonusAmount: 400 },
      { min: 5000, bonusPercent: 25, bonusAmount: 1250 },
      { min: 10000, bonusPercent: 25, bonusAmount: 2500, highlight: true },
      { min: 15000, bonusPercent: 30, bonusAmount: 4500, highlight: true },
      { min: 20000, bonusPercent: 30, bonusAmount: 6000, highlight: true },
      { min: 25000, bonusPercent: 35, bonusAmount: 8750, highlight: true },
    ],
    extraReward: "5,000 নগদ এক্সট্রা ভাউচার"
  }
];

export default function DepositPage() {
  const { lang } = useLang();
  const router = useRouter();

  const [method, setMethod] = useState("bkash");
  const [amount, setAmount] = useState("");
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedPresetBonus, setSelectedPresetBonus] = useState(0);
  const [error, setError] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("bkash-vip-1");
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [showProgramDetails, setShowProgramDetails] = useState(false);
  const [activeBonusType, setActiveBonusType] = useState(null);
  
  // Refs for input fields
  const amountInputRef = useRef(null);

  // Get current payment channel
  const currentChannel = PAYMENT_CHANNELS[method].find(ch => ch.id === selectedChannel) || PAYMENT_CHANNELS[method][0];

  // Language-specific text
  const texts = {
    en: {
      deposit: "Deposit",
      back: "Back",
      home: "Home",
      depositMode: "Our Mode",
      selectMode: "Select payment method",
      paymentChannel: "Payment Channel",
      selectChannel: "Select payment channel",
      depositAmount: "Deposit Amount",
      minDeposit: "Minimum deposit:",
      maxDeposit: "Maximum deposit:",
      enterAmount: "Enter amount (BDT)",
      amountPlaceholder: "500 - 1,000",
      programs: "Programs",
      participate: "Participate",
      noProgram: "Do not participate in any program",
      warning: "You can only select one bonus type",
      warningTitle: "Important Notice",
      warningText: "Use the latest account for each deposit. If transaction fails, don't save account info.",
      next: "Next",
      fillAllFields: "Please fill all fields",
      invalidNumber: "Please enter a valid number",
      minDepositError: `Minimum deposit is ${MINIMUM_DEPOSIT} BDT`,
      maxDepositError: `Maximum deposit is ${MAXIMUM_DEPOSIT} BDT`,
      bkash: "bKash",
      nagad: "Nagad",
      presetBonus: "Preset Bonus",
      programBonus: "Program Bonus",
      totalBonus: "Total Bonus",
      clearSelection: "Clear",
      turnover: "Turnover"
    },
    bn: {
      deposit: "জমা দিন",
      back: "পেছনে",
      home: "হোম",
      depositMode: "আমাদের মোড",
      selectMode: "পেমেন্ট পদ্ধতি নির্বাচন করুন",
      paymentChannel: "পেমেন্ট চ্যানেল",
      selectChannel: "পেমেন্ট চ্যানেল নির্বাচন করুন",
      depositAmount: "জমা পরিমাণ",
      minDeposit: "সর্বনিম্ন জমা:",
      maxDeposit: "সর্বোচ্চ জমা:",
      enterAmount: "পরিমাণ লিখুন (টাকা)",
      amountPlaceholder: "500 - 1,000",
      programs: "কার্যক্রম",
      participate: "অংশগ্রহণ করুন",
      noProgram: "কোনও প্রচারে অংশ নেওয়া যায় না",
      warning: "আপনি শুধুমাত্র একটি বোনাস টাইপ নির্বাচন করতে পারেন",
      warningTitle: "গুরুত্বপূর্ণ নোটিশ",
      warningText: "প্রতিটি ডিপোজিটের জন্য সর্বশেষ অ্যাকাউন্ট ব্যবহার করুন। লেনদেন ব্যর্থ হলে অ্যাকাউন্ট তথ্য সংরক্ষণ করবেন না।",
      next: "পরবর্তী",
      fillAllFields: "দয়া করে সব তথ্য দিন",
      invalidNumber: "দয়া করে একটি সঠিক সংখ্যা দিন",
      minDepositError: `সর্বনিম্ন জমা ${MINIMUM_DEPOSIT} টাকা`,
      maxDepositError: `সর্বোচ্চ জমা ${MAXIMUM_DEPOSIT} টাকা`,
      bkash: "বিকাশ",
      nagad: "নগদ",
      presetBonus: "প্রিসেট বোনাস",
      programBonus: "প্রোগ্রাম বোনাস",
      totalBonus: "মোট বোনাস",
      clearSelection: "মুছুন",
      turnover: "টার্নওভার"
    }
  };

  const currentText = texts[lang] || texts.en;

  // Focus amount input when preset is selected
  useEffect(() => {
    if (selectedPreset && amountInputRef.current) {
      amountInputRef.current.focus();
    }
  }, [selectedPreset]);

  // Update activeBonusType when selection changes
  useEffect(() => {
    if (selectedPreset !== null) {
      setActiveBonusType('preset');
    } else if (selectedProgram !== null) {
      setActiveBonusType('program');
    } else {
      setActiveBonusType(null);
    }
  }, [selectedPreset, selectedProgram]);

  const validateAmount = (value) => {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      setError(currentText.invalidNumber);
      return false;
    }
    if (numValue < MINIMUM_DEPOSIT) {
      setError(currentText.minDepositError);
      return false;
    }
    if (numValue > MAXIMUM_DEPOSIT) {
      setError(currentText.maxDepositError);
      return false;
    }
    setError("");
    return true;
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    
    const numValue = Number(value);
    const matchedPreset = PRESET_AMOUNTS.find(preset => preset.amount === numValue);
    
    if (matchedPreset && activeBonusType === 'preset') {
      setSelectedPresetBonus(matchedPreset.bonus);
    } else if (!matchedPreset && activeBonusType === 'preset') {
      setSelectedPreset(null);
      setSelectedPresetBonus(0);
      setActiveBonusType(null);
    }
    
    if (value) {
      validateAmount(value);
    } else {
      setError("");
    }
  };

  const handlePresetSelect = (preset) => {
    if (activeBonusType === 'program') {
      setError(lang === 'bn' 
        ? 'আপনি ইতিমধ্যে প্রোগ্রাম বোনাস নির্বাচন করেছেন। প্রিসেট বোনাস নির্বাচন করতে প্রথমে প্রোগ্রাম বোনাস মুছুন।' 
        : 'You have already selected program bonus. To select preset bonus, first clear the program bonus.');
      return;
    }
    
    setAmount(preset.amount.toString());
    setSelectedPreset(preset.amount);
    setSelectedPresetBonus(preset.bonus);
    setSelectedProgram(null);
    setError("");
    validateAmount(preset.amount);
  };

  const handleProgramSelect = (programId) => {
    if (activeBonusType === 'preset') {
      setError(lang === 'bn' 
        ? 'আপনি ইতিমধ্যে প্রিসেট বোনাস নির্বাচন করেছেন। প্রোগ্রাম বোনাস নির্বাচন করতে প্রথমে প্রিসেট বোনাস মুছুন।' 
        : 'You have already selected preset bonus. To select program bonus, first clear the preset bonus.');
      return;
    }
    
    setSelectedProgram(programId);
    setSelectedPreset(null);
    setSelectedPresetBonus(0);
    setError("");
    setShowProgramDetails(true);
  };

  const clearPresetSelection = () => {
    setSelectedPreset(null);
    setSelectedPresetBonus(0);
    setError("");
  };

  const clearProgramSelection = () => {
    setSelectedProgram(null);
    setShowProgramDetails(false);
    setError("");
  };

  const toggleProgramDetails = () => {
    if (selectedProgram === 1) {
      setShowProgramDetails(!showProgramDetails);
    }
  };

  const calculateProgramBonus = () => {
    if (!selectedProgram || selectedProgram !== 1) return 0;
    
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 100) return 0;
    
    const applicableTier = DEPOSIT_PROGRAMS[0].tiers
      .slice()
      .reverse()
      .find(tier => numAmount >= tier.min);
    
    return applicableTier ? (numAmount * applicableTier.bonusPercent) / 100 : 0;
  };

  const getTotalBonus = () => {
    if (activeBonusType === 'preset') {
      return selectedPresetBonus;
    } else if (activeBonusType === 'program') {
      return calculateProgramBonus();
    }
    return 0;
  };

  const getTurnoverMultiplier = () => {
    if (activeBonusType === 'preset') return 10;
    if (activeBonusType === 'program') return 7;
    return 0;
  };

  const handleNext = () => {
    if (!amount || !validateAmount(amount)) {
      setError(currentText.fillAllFields);
      return;
    }

    // Store deposit data in sessionStorage for the next page
    const depositData = {
      method,
      amount: Number(amount),
      selectedChannel,
      selectedProgram,
      selectedPreset,
      selectedPresetBonus,
      activeBonusType,
      totalBonus: getTotalBonus(),
      turnoverMultiplier: getTurnoverMultiplier()
    };
    
    sessionStorage.setItem('depositData', JSON.stringify(depositData));
    
    // Navigate to final step page
    router.push('/deposit/final-step');
  };

  const handleBack = () => {
    router.back();
  };

  const goHome = () => {
    router.push("/");
  };

  const isButtonDisabled = !amount || Number(amount) < MINIMUM_DEPOSIT || Number(amount) > MAXIMUM_DEPOSIT;
  const totalBonus = getTotalBonus();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#8B0000] px-4 py-5 shrink-0">
        <div className="flex items-center justify-between">
          <button onClick={handleBack} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <h1 className="text-white font-bold text-xl">
            {currentText.deposit}
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                1
              </span>
            </div>
            <button onClick={goHome} className="text-white">
              <Home className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 pb-32">
        {/* Section 1: Deposit Mode */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <h2 className="font-bold text-gray-800 text-lg">
              {currentText.depositMode}
            </h2>
          </div>
          
          <p className="text-gray-600 text-sm">{currentText.selectMode}</p>
          
          <div className="grid grid-cols-2 gap-4">
            {/* bKash Card */}
            <button
              onClick={() => {
                setMethod("bkash");
                setSelectedChannel("bkash-vip-1");
              }}
              className={`p-4 rounded-xl border-2 ${
                method === "bkash"
                  ? "border-red-500 shadow-lg"
                  : "border-gray-200"
              } bg-white relative transition-all duration-200`}
            >
              {method === "bkash" && (
                <div className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] border-t-red-500 rounded-tr-xl">
                  <Check className="w-4 h-4 text-white absolute -top-8 right-1" />
                </div>
              )}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-xl font-bold text-pink-600">bK</span>
                </div>
                <span className="font-medium text-gray-800">bKash</span>
              </div>
            </button>

            {/* Nagad Card */}
            <button
              onClick={() => {
                setMethod("nagad");
                setSelectedChannel("nagad-vip-1");
              }}
              className={`p-4 rounded-xl border-2 ${
                method === "nagad"
                  ? "border-red-500 shadow-lg"
                  : "border-gray-200"
              } bg-white relative transition-all duration-200`}
            >
              {method === "nagad" && (
                <div className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] border-t-red-500 rounded-tr-xl">
                  <Check className="w-4 h-4 text-white absolute -top-8 right-1" />
                </div>
              )}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-xl font-bold text-orange-600">N</span>
                </div>
                <span className="font-medium text-gray-800">Nagad</span>
              </div>
            </button>
          </div>
        </div>

        {/* Warning Text */}
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">
            ⚠️ {currentText.warningText}
          </p>
        </div>

        {/* Divider */}
        <div className="h-6 bg-gray-100 -mx-4"></div>

        {/* Section 2: Payment Channel */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
            <h2 className="font-bold text-gray-800 text-lg">
              {currentText.paymentChannel}
            </h2>
          </div>
          
          <p className="text-gray-600 text-sm">{currentText.selectChannel}</p>
          
          {/* Payment Channel Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowChannelDropdown(!showChannelDropdown)}
              className="w-full p-4 rounded-xl border-2 border-red-500 bg-white flex justify-between items-center"
            >
              <span className="text-red-600 font-bold">{currentChannel.name}</span>
              <ChevronDown className={`w-5 h-5 text-red-600 transition-transform ${showChannelDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showChannelDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-red-500 rounded-xl shadow-lg z-10">
                {PAYMENT_CHANNELS[method].map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => {
                      setSelectedChannel(channel.id);
                      setShowChannelDropdown(false);
                    }}
                    className="w-full p-3 text-left hover:bg-red-50 first:rounded-t-xl last:rounded-b-xl"
                  >
                    <div className="font-medium text-gray-800">{channel.name}</div>
                    <div className="text-sm text-gray-600">{channel.number}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Deposit Amount */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <h2 className="font-bold text-gray-800 text-lg">
              {currentText.depositAmount}
            </h2>
          </div>

          {/* Preset Amounts */}
          <div className="grid grid-cols-3 gap-3">
            {PRESET_AMOUNTS.map((preset) => (
              <div key={preset.amount} className="relative">
                <button
                  onClick={() => handlePresetSelect(preset)}
                  className={`w-full p-3 rounded-lg border ${
                    selectedPreset === preset.amount
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  } transition-all duration-200`}
                >
                  <div className="absolute -top-1 -left-1 bg-gradient-to-r from-pink-400 to-orange-400 text-white text-xs px-2 py-0.5 rounded-tl rounded-br">
                    +{preset.bonus}
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-800">
                      ৳{preset.amount}
                    </div>
                  </div>
                </button>
                
                {selectedPreset === preset.amount && (
                  <button
                    onClick={clearPresetSelection}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-black">
              <span>{currentText.minDeposit} ৳{MINIMUM_DEPOSIT}</span>
              <span>{currentText.maxDeposit} ৳{MAXIMUM_DEPOSIT}</span>
            </div>
            
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black">
                ৳
              </div>
              <input
                ref={amountInputRef}
                type="number"
                value={amount}
                onChange={handleAmountChange}
                placeholder={currentText.amountPlaceholder}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-black"
                min={MINIMUM_DEPOSIT}
                max={MAXIMUM_DEPOSIT}
                autoFocus
              />
            </div>
            
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            {/* Active Selection Display */}
            {activeBonusType && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">🎁</span>
                    </div>
                    <span className="text-blue-700 font-medium">
                      {activeBonusType === 'preset' ? currentText.presetBonus : currentText.programBonus}
                    </span>
                  </div>
                  <span className="text-blue-600 font-bold">+৳{totalBonus}</span>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-blue-600">
                    {getTurnoverMultiplier()}x {currentText.turnover}
                  </div>
                  <button
                    onClick={activeBonusType === 'preset' ? clearPresetSelection : clearProgramSelection}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    {currentText.clearSelection}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 bg-gray-100 -mx-4"></div>

        {/* Section 4: Programs */}
        <div className="space-y-4 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h2 className="font-bold text-gray-800 text-lg">
                {currentText.programs}
              </h2>
            </div>
            <button 
              onClick={toggleProgramDetails}
              className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center"
            >
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showProgramDetails ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Program Card - Collapsible */}
          <div className="relative">
            <div 
              onClick={() => handleProgramSelect(1)}
              className={`border-2 rounded-xl cursor-pointer transition-all duration-200 overflow-hidden ${
                selectedProgram === 1 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-pink-200 bg-white hover:border-pink-300'
              }`}
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="relative mt-1">
                      <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                        selectedProgram === 1 ? 'border-green-500' : 'border-red-500'
                      }`}>
                        {selectedProgram === 1 && (
                          <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-sm">
                        {DEPOSIT_PROGRAMS[0].title}
                      </h3>
                      {showProgramDetails && (
                        <p className="text-gray-600 text-xs mt-1">
                          {DEPOSIT_PROGRAMS[0].description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-red-600 font-bold text-sm">
                      {DEPOSIT_PROGRAMS[0].requirement}
                    </span>
                  </div>
                </div>
              </div>

              {/* Collapsible Content */}
              {showProgramDetails && (
                <div className="px-4 pb-4 border-t pt-4">
                  <div className="space-y-1">
                    {DEPOSIT_PROGRAMS[0].tiers.map((tier, index) => (
                      <div
                        key={index}
                        className={`flex justify-between text-xs ${
                          tier.highlight
                            ? "font-bold text-gray-800"
                            : "text-gray-600"
                        }`}
                      >
                        <span>ডিপোজিট ≥ {tier.min}, বোনাস {tier.bonusPercent}%, পরিমাণ {tier.bonusAmount}</span>
                        {tier.bonusPercent === 30 && (
                          <span className="text-red-600">{tier.bonusPercent}%</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t mt-2">
                    <p className="text-red-600 text-xs font-medium">
                      (অতিরিক্ত পুরস্কার)
                    </p>
                    <p className="text-gray-700 text-xs mt-1">
                      {DEPOSIT_PROGRAMS[0].extraReward}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {selectedProgram === 1 && (
              <button
                onClick={clearProgramSelection}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Warning about exclusive selection */}
          {activeBonusType && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-800">
                {currentText.warning}
              </p>
            </div>
          )}

          {/* No Program Option */}
          <button
            onClick={() => {
              clearPresetSelection();
              clearProgramSelection();
            }}
            className={`w-full p-4 rounded-xl border-2 ${
              !activeBonusType
                ? "border-gray-400 bg-gray-50"
                : "border-gray-200 bg-white"
            } flex items-center gap-3 transition-all duration-200`}
          >
            <div className="w-5 h-5 border-2 border-gray-400 rounded-full flex items-center justify-center">
              {!activeBonusType && (
                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full"></div>
              )}
            </div>
            <span className="font-bold text-gray-800">
              {currentText.noProgram}
            </span>
          </button>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="bottom-9 left-0 right-0 p-4 bg-white border-t shadow-lg z-10">
        <button
          onClick={handleNext}
          disabled={isButtonDisabled}
          className={`w-full py-4 rounded-xl font-bold text-lg ${
            isButtonDisabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-red-600 text-white hover:bg-red-700 transition-colors"
          }`}
        >
          {currentText.next}
        </button>
      </div>
    </div>
  );
}