"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/design/ui/dialog";
import { X, Loader2 } from "lucide-react";

export function DepositModal({ isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bkash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const paymentMethods = [
    { id: "bkash", name: "bKash", logo: "/bkash.png" },
    { id: "nagad", name: "Nagad", logo: "/nagad.png" },
    { id: "rocket", name: "Rocket", logo: "/rocket.png" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount) * 100, // Convert to paisa
          method,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Deposit failed");
      }

      onSuccess();
      onClose();
      setAmount("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md bg-white rounded-2xl p-4">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-gray-900 font-semibold">টাকা জমা দিন</DialogTitle>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              পরিমাণ (৳)
            </label>
            <input
              type="number"
              min="10"
              step="10"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="ন্যূনতম ৳ ১০"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              পেমেন্ট পদ্ধতি
            </label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((m) => (
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

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !amount}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              "জমা দিন"
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}