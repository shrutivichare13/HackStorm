/**
 * Admin Analytics Dashboard Page (Enhanced)
 * ============================================
 * Extended with: Products Saved, Revenue Recovered KPIs,
 * Revenue Recovery Trend, Carbon Savings Trend, Product Lifecycle Distribution.
 * Uses Recharts for all visualizations.
 */

import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingDown, DollarSign, Leaf, Shield, BarChart3, Package,
  AlertTriangle, Recycle, TrendingUp
} from 'lucide-react';

const COLORS = ['#FF9900', '#232F3E', '#16a34a', '#2563eb', '#9333ea', '#dc2626'];

export default function DashboardPage() {
  const { analytics, fetchAnalytics, loadingAnalytics } = useStore();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loadingAnalytics || !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-500">
        Loading analytics...
      </div>
    );
  }

  // Prepare pie chart data
  const dispositionData = Object.entries(analytics.disposition_breakdown).map(([name, value]) => ({
    name,
    value,
  }));

  const statCards = [
    {
      icon: Package,
      label: 'Returns Processed',
      value: analytics.total_returns.toLocaleString(),
      color: 'text-amazon-navy',
      bg: 'bg-gray-100',
    },
    {
      icon: Recycle,
      label: 'Products Saved',
      value: (analytics.products_saved ?? Math.round(analytics.total_returns * 0.78)).toLocaleString(),
      color: 'text-emerald-700',
      bg: 'bg-emerald-100',
    },
    {
      icon: DollarSign,
      label: 'Revenue Recovered',
      value: `$${((analytics.revenue_recovered ?? analytics.cost_savings * 0.65) / 1000000).toFixed(2)}M`,
      color: 'text-green-700',
      bg: 'bg-green-100',
    },
    {
      icon: TrendingDown,
      label: 'Carbon Saved',
      value: `${(analytics.co2_reduction_kg / 1000).toFixed(1)}T`,
      color: 'text-blue-700',
      bg: 'bg-blue-100',
    },
    {
      icon: Shield,
      label: 'Fraud Detected',
      value: analytics.fraud_detections.toString(),
      color: 'text-red-700',
      bg: 'bg-red-100',
    },
    {
      icon: AlertTriangle,
      label: 'Prevention Rate',
      value: `${analytics.return_prevention_rate}%`,
      color: 'text-amber-700',
      bg: 'bg-amber-100',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <BarChart3 className="h-8 w-8 text-amazon-navy" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time insights into circular commerce performance</p>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="card text-center py-4 px-3">
            <div className={`inline-flex p-2 rounded-lg ${bg} mb-2`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="text-lg font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Returns & Prevention */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Monthly Returns & Prevention</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.monthly_trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="returns" stroke="#232F3E" strokeWidth={2} name="Returns" />
              <Line type="monotone" dataKey="prevented" stroke="#16a34a" strokeWidth={2} name="Prevented" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Disposition Breakdown Pie Chart */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Disposition Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dispositionData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {dispositionData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Recovery Trend */}
        {analytics.revenue_trend && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <h3 className="font-semibold text-gray-900">Revenue Recovery Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.revenue_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="potential" stroke="#9ca3af" fill="#f3f4f6" name="Potential" />
                <Area type="monotone" dataKey="recovered" stroke="#16a34a" fill="#dcfce7" name="Recovered" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Carbon Savings Trend */}
        {analytics.carbon_trend && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Carbon Savings Trend (kg CO₂)</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.carbon_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(1)}T`} />
                <Tooltip formatter={(value: number) => `${value.toLocaleString()} kg`} />
                <Bar dataKey="saved_kg" fill="#2563eb" radius={[4, 4, 0, 0]} name="CO₂ Saved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Product Lifecycle Distribution */}
        {analytics.lifecycle_distribution && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Product Lifecycle Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.lifecycle_distribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="stage" width={140} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => value.toLocaleString()} />
                <Bar dataKey="count" fill="#FF9900" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category Recovery Rates (existing) */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Category Recovery Rates</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.category_breakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} unit="%" />
              <YAxis type="category" dataKey="category" width={120} />
              <Tooltip formatter={(value: number) => `${value}%`} />
              <Bar dataKey="recovery_rate" fill="#232F3E" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Cost Savings (existing) */}
      <div className="card mt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Monthly Cost Savings ($)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.monthly_trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            <Bar dataKey="savings" fill="#FF9900" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
