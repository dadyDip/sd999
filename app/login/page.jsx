"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/app/i18n/useLang";
import { Eye, EyeOff, Phone, Lock, ArrowRight, Shield, UserPlus } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t, lang } = useLang();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async () => {
    if (!phone || !password) {
      alert(t.requiredFields);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        alert(data?.error || "Login failed");
        return;
      }

      login(data.token, data.user);
      router.push("/dashboard");

    } catch (err) {
      setLoading(false);
      alert(t.serverError);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-8">
      {/* Background Image with Orange Overlay - Same as page.jsx */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/images/app-bg.jpeg" 
          alt="background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-orange-900/70 via-orange-800/60 to-orange-900/80 backdrop-blur-[2px]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30 mb-4 border-2 border-orange-400/50">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {t.login}
          </h1>
          <p className="text-orange-200">
            {lang === 'bn' ? "আপনার অ্যাকাউন্টে সাইন ইন করুন" : "Sign in to your account"}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-orange-950/40 backdrop-blur-md rounded-2xl shadow-2xl border border-orange-500/30 overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">
            
            {/* Phone Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-orange-200 flex items-center gap-2">
                <Phone size={16} className="text-orange-400" />
                {t.phoneNumber}
              </label>
              <div className="relative">
                <input
                  placeholder={lang === 'bn' ? "০১XXXXXXXXX" : "01XXXXXXXXX"}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-4 pl-12 rounded-lg bg-orange-900/30 border border-orange-500/30 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-white placeholder-orange-300/50"
                />
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" size={18} />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-orange-200 flex items-center gap-2">
                <Lock size={16} className="text-orange-400" />
                {t.password}
              </label>
              <div className="relative">
                <input
                  placeholder={lang === 'bn' ? "আপনার পাসওয়ার্ড দিন" : "Enter your password"}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 pl-12 pr-12 rounded-lg bg-orange-900/30 border border-orange-500/30 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-white placeholder-orange-300/50"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" size={18} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-300 transition-colors"
                  aria-label={showPassword ? (lang === 'bn' ? "পাসওয়ার্ড লুকান" : "Hide password") : (lang === 'bn' ? "পাসওয়ার্ড দেখান" : "Show password")}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Forgot Password Link */}
              <div className="text-right pt-1">
                <button className="text-xs text-orange-400 hover:text-orange-300 font-medium transition-colors">
                  {lang === 'bn' ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?"}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              disabled={loading}
              onClick={submit}
              className="w-full py-4 rounded-lg bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-lg transition-all duration-200 shadow-lg shadow-orange-600/30 hover:shadow-xl hover:shadow-orange-600/40 flex items-center justify-center gap-2 group border border-orange-500/50"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t.loggingIn}
                </>
              ) : (
                <>
                  {t.loginBtn}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Register Link */}
            <div className="text-center pt-6 border-t border-orange-500/30">
              <p className="text-orange-200">
                {t.dontHaveAccount}{" "}
                <button
                  onClick={() => router.push("/register")}
                  className="text-orange-400 hover:text-orange-300 font-semibold transition-colors inline-flex items-center gap-1"
                >
                  {t.registerHere}
                  <UserPlus size={14} />
                </button>
              </p>
            </div>

            {/* Security Note */}
            <div className="p-3 bg-blue-900/30 backdrop-blur-sm rounded-lg border border-blue-500/30">
              <p className="text-xs text-blue-300 text-center">
                🔒 {lang === 'bn' ? "আপনার অ্যাকাউন্ট সুরক্ষিত" : "Your account is secure"}
              </p>
            </div>
          </div>
        </div>

        {/* Features/Benefits */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-orange-950/40 backdrop-blur-sm rounded-lg border border-orange-500/30 shadow-lg">
            <div className="text-orange-400 text-lg font-bold mb-1">⚡</div>
            <p className="text-xs font-medium text-orange-200">
              {lang === 'bn' ? "দ্রুত লগইন" : "Quick Login"}
            </p>
          </div>
          <div className="p-3 bg-orange-950/40 backdrop-blur-sm rounded-lg border border-orange-500/30 shadow-lg">
            <div className="text-orange-400 text-lg font-bold mb-1">🔐</div>
            <p className="text-xs font-medium text-orange-200">
              {lang === 'bn' ? "সুরক্ষিত" : "Secure"}
            </p>
          </div>
          <div className="p-3 bg-orange-950/40 backdrop-blur-sm rounded-lg border border-orange-500/30 shadow-lg">
            <div className="text-orange-400 text-lg font-bold mb-1">🎯</div>
            <p className="text-xs font-medium text-orange-200">
              {lang === 'bn' ? "সহজ" : "Easy"}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-orange-300">
            {lang === 'bn' ? "সাহায্যের প্রয়োজন?" : "Need help?"}{" "}
            <button className="text-orange-400 hover:text-orange-300 font-medium">
              {lang === 'bn' ? "সাপোর্টে যোগাযোগ করুন" : "Contact support"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}