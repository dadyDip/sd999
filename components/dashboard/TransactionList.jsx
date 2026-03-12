"use client";

import { ArrowDown, ArrowUp, X, Calendar } from "lucide-react";
import { useMemo, useState } from "react";

export function TransactionModal({ isOpen, onClose, transactions = [], type }) {

  const [tab, setTab] = useState("today");

  const tabs = [
    { id: "today", label: "আজ" },
    { id: "yesterday", label: "গতকাল" },
    { id: "7days", label: "7 দিন" },
    { id: "30days", label: "30 দিন" },
    { id: "all", label: "সব" }
  ];

  const filteredTransactions = useMemo(() => {
    // First, ensure transactions is an array
    const transactionList = Array.isArray(transactions) ? transactions : [];
    let list = [...transactionList];

    // Filter ONLY COMPLETED transactions first (matches dashboard pattern)
    list = list.filter((tx) => 
      (tx.status ?? "").toUpperCase() === "COMPLETED"
    );

    // Then filter by type if specified
    if (type && type !== "all") {
      list = list.filter(
        (tx) => (tx.type ?? "").toUpperCase() === type?.toUpperCase()
      );
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Filter by date tab
    if (tab === "today") {
      list = list.filter((tx) => {
        const d = new Date(tx.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === now.getTime();
      });
    }

    if (tab === "yesterday") {
      const y = new Date();
      y.setDate(now.getDate() - 1);
      y.setHours(0, 0, 0, 0);

      list = list.filter((tx) => {
        const d = new Date(tx.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === y.getTime();
      });
    }

    if (tab === "7days") {
      const past = new Date();
      past.setDate(now.getDate() - 7);
      list = list.filter((tx) => new Date(tx.createdAt) >= past);
    }

    if (tab === "30days") {
      const past = new Date();
      past.setDate(now.getDate() - 30);
      list = list.filter((tx) => new Date(tx.createdAt) >= past);
    }

    // Sort by date (newest first)
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return list;

  }, [transactions, type, tab]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("bn-BD", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  // Calculate totals for the modal
  const { totalDeposit, totalWithdraw } = useMemo(() => {
    const deposit = filteredTransactions
      .filter(tx => (tx.type ?? "").toUpperCase() === "DEPOSIT")
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    const withdraw = filteredTransactions
      .filter(tx => (tx.type ?? "").toUpperCase() === "WITHDRAW")
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    return {
      totalDeposit: deposit,
      totalWithdraw: withdraw
    };
  }, [filteredTransactions]);

  if (!isOpen) return null;

  // Determine title based on type
  const getTitle = () => {
    if (type?.toUpperCase() === "DEPOSIT") return "জমা রেকর্ড";
    if (type?.toUpperCase() === "WITHDRAW") return "উত্তোলন রেকর্ড";
    return "লেনদেন রেকর্ড";
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col h-screen">

      {/* HEADER */}
      <div className="bg-red-700 text-white p-4 flex items-center justify-between">
        <button onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-lg">{getTitle()}</h2>
        <div className="w-5" />
      </div>

      {/* SLIDING TABS */}
      <div className="border-b overflow-x-auto mt-2">
        <div className="flex min-w-max">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm whitespace-nowrap transition ${
                tab === t.id
                  ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                  : "text-gray-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex gap-2 p-3 border-b bg-white">
        <button className="border border-blue-500 text-blue-500 px-3 py-1 rounded-md text-sm">
          সব
        </button>
        <button className="border border-blue-500 text-blue-500 px-3 py-1 rounded-md text-sm">
          প্রকার
        </button>
        <button className="border border-blue-500 text-blue-500 px-3 py-1 rounded-md text-sm flex items-center gap-1">
          <Calendar size={14} />
          03/08 - 03/08
        </button>
      </div>

      {/* SUMMARY TOTALS (if showing all or specific type) */}
      {filteredTransactions.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-b">
          {!type || type === "all" ? (
            <div className="flex justify-between text-xs">
              <div>
                <span className="text-gray-500">মোট জমা: </span>
                <span className="font-medium text-gray-900">৳ {(totalDeposit / 100).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500">মোট উত্তোলন: </span>
                <span className="font-medium text-green-600">৳ {(totalWithdraw / 100).toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-500">
              মোট {filteredTransactions.length} টি লেনদেন
            </div>
          )}
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-blue-500">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-lg font-medium">কোন ডেটা নেই</p>
            <p className="text-sm text-gray-500 mt-2">এই সময়ে কোনো COMPLETED লেনদেন পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {filteredTransactions.map((tx) => {
              const isDeposit = (tx.type ?? "").toUpperCase() === "DEPOSIT";

              return (
                <div
                  key={tx.id}
                  className="bg-gray-50 p-3 rounded-lg border flex justify-between items-start hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      {isDeposit ? (
                        <ArrowDown className="w-4 h-4 text-gray-700" />
                      ) : (
                        <ArrowUp className="w-4 h-4 text-green-600" />
                      )}
                      <p className={`text-sm font-medium ${isDeposit ? 'text-gray-900' : 'text-green-600'}`}>
                        {isDeposit ? "জমা" : "উত্তোলন"}
                      </p>
                      {tx.method && (
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-700 uppercase">
                          {tx.method}
                        </span>
                      )}
                      {/* Completed badge */}
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Completed
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(tx.createdAt)}
                    </p>
                    {tx.provider && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        via {tx.provider} {tx.reference && `• ${tx.reference.slice(-4)}`}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        isDeposit ? "text-gray-900" : "text-green-600"
                      }`}
                    >
                      {isDeposit ? "" : "+"} ৳ {(tx.amount / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {tx.id?.slice(-8)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER */}
      {filteredTransactions.length > 0 && (
        <div className="border-t p-3 bg-white text-xs text-gray-400 text-center">
          শুধু COMPLETED লেনদেন দেখানো হচ্ছে
        </div>
      )}
    </div>
  );
}