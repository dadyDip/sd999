"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/design/ui/dialog";
import { X, Loader2 } from "lucide-react";

export function WithdrawModal({ isOpen, onClose, onSuccess, balance }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bkash");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const withdrawalMethods = [
    { id: "bkash", name: "bKash" },
    { id: "nagad", name: "Nagad" },
    { id: "rocket", name: "Rocket" },
    { id: "bank", name: "ব্যাংক" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const withdrawAmount = parseFloat(amount) * 100; // Convert to paisa

    if (withdrawAmount > balance) {
      setError("পর্যাপ্ত ব্যালেন্স নেই");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: withdrawAmount,
          method,
          accountNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Withdrawal failed");
      }

      onSuccess();
      onClose();
      setAmount("");
      setAccountNumber("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const maxAmount = balance ? (balance / 100).toFixed(2) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md bg-white rounded-2xl p-4">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-gray-900 font-semibold">টাকা উত্তোলন</DialogTitle>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">বর্তমান ব্যালেন্স:</p>
          <p className="text-xl font-bold text-gray-900">৳ {maxAmount}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              পরিমাণ (৳)
            </label>
            <input
              type="number"
              min="100"
              step="100"
              max={maxAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder={`ন্যূনতম ৳ ১০০`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              উত্তোলন পদ্ধতি
            </label>
            <div className="grid grid-cols-2 gap-2">
              {withdrawalMethods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`p-2 border rounded-lg text-center ${
                    method === m.id
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-sm font-medium">{m.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              অ্যাকাউন্ট নম্বর
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="আপনার {method} নম্বর দিন"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !amount || !accountNumber}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              "উত্তোলন করুন"
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}