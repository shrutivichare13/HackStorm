/**
 * Peer-to-Peer Marketplace Page
 * ===============================
 * Module 6: Users can list and browse AI-verified products.
 * Shows seller trust scores, ratings, and condition reports.
 */

import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import GradeBadge from '../components/GradeBadge';
import TrustBadge from '../components/TrustBadge';
import { ShieldCheck, Star, Plus, X } from 'lucide-react';

export default function PeerToPeerPage() {
  const { p2pListings, fetchP2PListings, loadingP2P, products, fetchProducts, createP2PListing } = useStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [listingDescription, setListingDescription] = useState('');

  useEffect(() => {
    fetchP2PListings();
    fetchProducts();
  }, [fetchP2PListings, fetchProducts]);

  const handleCreateListing = async () => {
    if (!selectedProductId || !sellingPrice) return;
    await createP2PListing(selectedProductId, parseFloat(sellingPrice), listingDescription);
    setShowCreateModal(false);
    setSelectedProductId('');
    setSellingPrice('');
    setListingDescription('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Peer-to-Peer Marketplace</h1>
          <p className="text-gray-600">
            Buy and sell AI-verified pre-owned products directly.
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          List Item
        </button>
      </div>

      {/* Listings Grid */}
      {loadingP2P ? (
        <div className="text-center py-12 text-gray-500">Loading listings...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {p2pListings.map(listing => (
            <div key={listing.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex gap-4">
                {/* Image */}
                <img
                  src={listing.image_url}
                  alt={listing.product_name}
                  className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {listing.product_name}
                    </h3>
                    {listing.ai_verified && (
                      <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-1">{listing.category}</p>

                  {/* Grade */}
                  <div className="mt-2">
                    <GradeBadge grade={listing.condition_grade} size="sm" />
                  </div>

                  {/* Price */}
                  <div className="mt-2">
                    <span className="text-xl font-bold text-gray-900">
                      ${listing.selling_price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-400 line-through ml-2">
                      ${listing.original_price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Condition Report */}
              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 mb-1">AI Condition Report</p>
                <p className="text-sm text-gray-700">{listing.condition_report}</p>
              </div>

              {/* Seller Info */}
              <div className="mt-4 flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amazon-navy text-white flex items-center justify-center text-sm font-bold">
                    {listing.seller_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{listing.seller_name}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amazon-orange fill-amazon-orange" />
                      <span className="text-xs text-gray-600">{listing.seller_rating}</span>
                    </div>
                  </div>
                </div>
                <TrustBadge score={listing.seller_trust_score} />
              </div>

              <button className="btn-primary w-full mt-4 text-sm">
                Contact Seller
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Listing Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">List an Item</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Select a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price ($)</label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={listingDescription}
                  onChange={(e) => setListingDescription(e.target.value)}
                  placeholder="Describe the condition..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 resize-none"
                />
              </div>

              <button
                onClick={handleCreateListing}
                disabled={!selectedProductId || !sellingPrice}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
