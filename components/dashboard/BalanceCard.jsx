"use client";

import { useEffect, useState } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { authFetch } from "@/lib/api";
import { useLang } from "@/app/i18n/useLang";

export function BalanceCard() {

  const { t } = useLang();

  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(null);

  const load = () => {
    authFetch("/api/wallet/summary")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(setData)
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  };

  if (!data) {
    return (
      <div className="rounded-2xl bg-gray-200 p-6 animate-pulse">
        {t.loadingBalance || "Loading balance…"}
      </div>
    );
  }

  const balance = (data.balance / 100).toFixed(2);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 space-y-5">

      {/* PROFILE ROW */}

      <div className="flex items-center gap-4">

        {/* AVATAR */}

        <div className="w-16 h-16 rounded-full overflow-hidden border">
          <img
            src={data.avatar || "/p-av.jpeg"}
            className="w-full h-full object-cover"
          />
        </div>

        {/* USER INFO */}

        <div className="flex-1">

          <div className="flex items-center gap-2">

            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">
              VIP0
            </span>

            <span className="font-semibold text-lg text-gray-800">
              {data.firstName} {data.lastName}
            </span>

          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">

            <span>ID:</span>

            <span className="text-gray-800 font-medium">
              {data.id?.slice(0,8)}...
            </span>

            <button onClick={() => copy(data.id, "uid")}>

              {copied === "uid" ? (
                <Check className="w-4 h-4 text-green-500"/>
              ) : (
                <Copy className="w-4 h-4 text-gray-400 hover:text-black"/>
              )}

            </button>

          </div>

        </div>

      </div>

      {/* BALANCE */}

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-gray-500">
            {t.demoBalance || "Balance"}
          </p>

          <h2 className="text-3xl font-bold text-gray-900">
            ৳ {balance}
          </h2>
        </div>

        <button
          onClick={load}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <RefreshCw className="w-5 h-5 text-gray-500"/>
        </button>

      </div>

      {/* ACTION BUTTONS */}

      <div className="grid grid-cols-3 gap-3">

        <button
          className="
          bg-red-500 hover:bg-red-600
          text-white font-medium
          py-3 rounded-full
          shadow
          transition
          "
        >
          জমা দিন
        </button>

        <button
          className="
          bg-red-500 hover:bg-red-600
          text-white font-medium
          py-3 rounded-full
          shadow
          transition
          "
        >
          উত্তোলন
        </button>

        <button
          className="
          bg-red-500 hover:bg-red-600
          text-white font-medium
          py-3 rounded-full
          shadow
          transition
          "
        >
          আমার কার্ড
        </button>

      </div>

      {/* STATS */}

      <div className="flex justify-between text-sm text-gray-500 border-t pt-3">

        <div>
          {t.totalDeposited || "Deposited"}:
          <span className="ml-1 text-gray-800 font-medium">
            ৳ {(data.totalDeposited / 100).toFixed(2)}
          </span>
        </div>

        <div>
          {t.totalWithdrawn || "Withdrawn"}:
          <span className="ml-1 text-gray-800 font-medium">
            ৳ {(data.totalWithdrawn / 100).toFixed(2)}
          </span>
        </div>

      </div>

    </div>
  );
}