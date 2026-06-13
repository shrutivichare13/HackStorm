/**
 * Green Credits Page
 * ===================
 * Module 5: Sustainability reward system dashboard.
 * Shows credits, environmental impact, and redemption history.
 */

import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Leaf, Recycle, TreePine, Wind, Gift, TrendingUp, Award } from 'lucide-react';

export default function GreenCreditsPage() {
  const { greenCredits, fetchGreenCredits, loadingCredits, redeemCredits } = useStore();
  const [redeemAmount, setRedeemAmount] = useState(50);
  const [redeemMessage, setRedeemMessage] = useState('');

  useEffect(() => {
    fetchGreenCredits();
  }, [fetchGreenCredits]);

  const handleRedeem = async () => {
    const result = await redeemCredits(redeemAmount);
    setRedeemMessage(result.message);
    setTimeout(() => setRedeemMessage(''), 5000);
  };

  if (loadingCredits || !greenCredits) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-500">
        Loading sustainability data...
      </div>
    );
  }

  // Compute wallet-style totals
  const totalEarned = greenCredits.credit_history
    .filter(h => h.type === 'earned')
    .reduce((sum, h) => sum + h.credits, 0);
  const totalRedeemed = greenCredits.credit_history
    .filter(h => h.type === 'redeemed')
    .reduce((sum, h) => sum + Math.abs(h.credits), 0);

  const impactCards = [
    {
      icon: Recycle,
      label: 'Waste Diverted',
      value: `${greenCredits.waste_diverted_kg.toFixed(1)} kg`,
      color: 'bg-green-100 text-green-700',
    },
    {
      icon: Wind,
      label: 'CO₂ Saved',
      value: `${greenCredits.carbon_saved_kg.toFixed(1)} kg`,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      icon: TreePine,
      label: 'Trees Equivalent',
      value: `${(greenCredits.carbon_saved_kg / 21.77).toFixed(1)}`,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      icon: Gift,
      label: 'Items Given Second Life',
      value: `${greenCredits.items_recycled + greenCredits.items_donated + greenCredits.items_refurbished + greenCredits.items_resold}`,
      color: 'bg-amber-100 text-amber-700',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-green-100">
          <Leaf className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Green Credits</h1>
          <p className="text-gray-600">Your sustainability impact and rewards</p>
        </div>
      </div>

      {/* Credits Summary (Wallet) */}
      <div className="card bg-gradient-to-r from-green-600 to-emerald-600 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">Green Credits Wallet</p>
            <p className="text-4xl font-bold mt-1">{greenCredits.total_credits}</p>
            <p className="text-green-100 text-sm mt-2">
              = ${(greenCredits.total_credits / 10).toFixed(2)} / ₹{greenCredits.total_credits} in discounts
            </p>
            <div className="flex gap-4 mt-3 text-xs text-green-200">
              <span>Earned: +{totalEarned}</span>
              <span>Redeemed: -{totalRedeemed}</span>
            </div>
          </div>
          <Award className="h-16 w-16 text-green-200 opacity-50" />
        </div>
      </div>

      {/* Impact Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {impactCards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card text-center">
            <div className={`inline-flex p-3 rounded-lg ${color} mb-3`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Activity Breakdown */}
        <div className="card">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">Activity Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Items Resold', value: greenCredits.items_resold, color: 'bg-blue-500' },
              { label: 'Items Donated', value: greenCredits.items_donated, color: 'bg-green-500' },
              { label: 'Items Recycled', value: greenCredits.items_recycled, color: 'bg-amber-500' },
              { label: 'Items Refurbished', value: greenCredits.items_refurbished, color: 'bg-purple-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="flex-1 text-sm text-gray-700">{label}</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Redeem Credits */}
        <div className="card">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">Redeem Credits</h3>
          <p className="text-sm text-gray-600 mb-4">
            Convert your green credits to shopping discounts. 10 credits = $1.00 (40 credits = ₹40)
          </p>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="range"
              min={10}
              max={greenCredits.total_credits}
              step={10}
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(parseInt(e.target.value))}
              className="flex-1 accent-amazon-orange"
            />
            <span className="text-lg font-bold text-gray-900 w-16 text-right">
              {redeemAmount}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Discount value: <span className="font-bold text-green-700">${(redeemAmount / 10).toFixed(2)}</span>
            <span className="text-gray-400 mx-1">·</span>
            <span className="font-bold text-green-700">₹{redeemAmount}</span>
          </p>
          <button onClick={handleRedeem} className="btn-primary w-full">
            Redeem {redeemAmount} Credits
          </button>
          {redeemMessage && (
            <p className="mt-3 text-sm text-green-700 bg-green-50 p-2 rounded">{redeemMessage}</p>
          )}
        </div>
      </div>

      {/* Credit History */}
      <div className="card mt-6">
        <h3 className="font-semibold text-lg text-gray-900 mb-4">Credit History</h3>
        <div className="space-y-2">
          {greenCredits.credit_history.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.action}</p>
                <p className="text-xs text-gray-500">{item.date}</p>
              </div>
              <span className={`font-bold ${item.credits > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {item.credits > 0 ? '+' : ''}{item.credits}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
