/**
 * Certified Refurbished Marketplace Page
 * ========================================
 * Module 4: Displays products approved for resale/refurbishment.
 * Includes dynamic pricing, condition grades, and trust badges.
 */

import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import GradeBadge from '../components/GradeBadge';
import DecisionTransparencyPanel from '../components/DecisionTransparencyPanel';
import type { MarketplaceListing } from '../types';
import { ShieldCheck, Tag, Search, SlidersHorizontal, CheckCircle, Leaf, X } from 'lucide-react';

const categories = ['All', 'Electronics', 'Home & Kitchen', 'Clothing', 'Books'];

export default function MarketplacePage() {
  const { marketplaceListings, fetchMarketplace, loadingMarketplace } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  // FEATURE A: transparency modal state
  const [transparencyListing, setTransparencyListing] = useState<MarketplaceListing | null>(null);

  useEffect(() => {
    const filters: Record<string, string> = {};
    if (selectedCategory !== 'All') {
      filters.category = selectedCategory;
    }
    fetchMarketplace(filters);
  }, [selectedCategory, fetchMarketplace]);

  const filteredListings = marketplaceListings.filter(listing =>
    listing.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Certified Refurbished Marketplace</h1>
        <p className="text-gray-600">
          Every product is AI-inspected, graded, and backed by our quality guarantee.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-500" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-amazon-navy text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loadingMarketplace ? (
        <div className="text-center py-12 text-gray-500">Loading marketplace...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map(listing => (
            <div key={listing.id} className="card hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="relative mb-4">
                <img
                  src={listing.image_url}
                  alt={listing.product_name}
                  className="w-full h-48 object-cover rounded-lg"
                />
                {listing.trust_badge && (
                  <button
                    onClick={() => setTransparencyListing(listing)}
                    title="View AI Decision Transparency"
                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 hover:bg-white hover:shadow transition-shadow cursor-pointer"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-xs font-medium text-green-700">Certified</span>
                  </button>
                )}
              </div>

              {/* Info */}
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                {listing.product_name}
              </h3>
              <p className="text-xs text-gray-500 mb-2">{listing.category}</p>

              {/* Grade */}
              <div className="mb-3">
                <GradeBadge grade={listing.condition_grade} size="sm" />
              </div>

              {/* Certification Badges */}
              {listing.badges && listing.badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {listing.badges.map((badge) => (
                    <span
                      key={badge}
                      className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                        badge === 'AI Certified' ? 'bg-blue-50 text-blue-700' :
                        badge === 'Quality Checked' ? 'bg-purple-50 text-purple-700' :
                        'bg-green-50 text-green-700'
                      }`}
                    >
                      {badge === 'Green Choice' ? (
                        <Leaf className="h-2.5 w-2.5" />
                      ) : (
                        <CheckCircle className="h-2.5 w-2.5" />
                      )}
                      {badge}
                    </span>
                  ))}
                </div>
              )}

              {/* AI Summary */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {listing.ai_inspection_summary}
              </p>

              {/* Pricing */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-gray-900">
                    ${listing.resale_price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-400 line-through ml-2">
                    ${listing.original_price.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <Tag className="h-3.5 w-3.5" />
                  <span className="text-sm font-medium">
                    {Math.round((1 - listing.resale_price / listing.original_price) * 100)}% off
                  </span>
                </div>
              </div>

              {/* CTA */}
              <button className="btn-primary w-full mt-4 text-sm">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}

      {filteredListings.length === 0 && !loadingMarketplace && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found matching your criteria.</p>
        </div>
      )}

      {/* FEATURE A: Decision Transparency Modal */}
      {transparencyListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{transparencyListing.product_name}</h2>
              <button onClick={() => setTransparencyListing(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <DecisionTransparencyPanel
              conditionScore={transparencyListing.condition_score}
              grade={transparencyListing.condition_grade}
              category={transparencyListing.category}
              resaleValue={transparencyListing.resale_price}
              refurbishCost={
                transparencyListing.gradingDetails?.refurbishCost ??
                Math.round(transparencyListing.original_price * 0.15)
              }
              recycleValue={
                transparencyListing.gradingDetails?.recycleValue ??
                Math.round(transparencyListing.original_price * 0.08)
              }
              disposition={
                transparencyListing.condition_grade === 'A' || transparencyListing.condition_grade === 'B'
                  ? 'Resell'
                  : 'Refurbish'
              }
              demandScore={transparencyListing.gradingDetails?.demandScore ?? 90}
            />
          </div>
        </div>
      )}
    </div>
  );
}
