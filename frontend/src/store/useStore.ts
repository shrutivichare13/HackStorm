/**
 * Zustand Store
 * =============
 * Central state management for the application.
 * Manages products, returns, marketplace, green credits, and analytics data.
 */

import { create } from 'zustand';
import type {
  Product,
  ReturnResponse,
  MarketplaceListing,
  P2PListing,
  GreenCredits,
  AnalyticsData,
  SellItemRequest,
} from '../types';

const API_BASE = '/api';

interface AppState {
  // Products
  products: Product[];
  selectedProduct: Product | null;
  loadingProducts: boolean;

  // Returns
  returnResult: ReturnResponse | null;
  returnsHistory: ReturnResponse[];
  loadingReturn: boolean;

  // Marketplace
  marketplaceListings: MarketplaceListing[];
  loadingMarketplace: boolean;

  // P2P
  p2pListings: P2PListing[];
  loadingP2P: boolean;

  // Green Credits
  greenCredits: GreenCredits | null;
  loadingCredits: boolean;

  // Analytics
  analytics: AnalyticsData | null;
  loadingAnalytics: boolean;

  // Actions
  fetchProducts: () => Promise<void>;
  selectProduct: (product: Product | null) => void;
  submitReturn: (productId: string, reason: string, description?: string) => Promise<ReturnResponse>;
  submitSellItem: (request: SellItemRequest) => Promise<ReturnResponse>;
  fetchMarketplace: (filters?: Record<string, string>) => Promise<void>;
  fetchP2PListings: () => Promise<void>;
  createP2PListing: (productId: string, price: number, description: string) => Promise<void>;
  fetchGreenCredits: (userId?: string) => Promise<void>;
  redeemCredits: (credits: number) => Promise<{ success: boolean; message: string }>;
  fetchAnalytics: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  products: [],
  selectedProduct: null,
  loadingProducts: false,
  returnResult: null,
  returnsHistory: [],
  loadingReturn: false,
  marketplaceListings: [],
  loadingMarketplace: false,
  p2pListings: [],
  loadingP2P: false,
  greenCredits: null,
  loadingCredits: false,
  analytics: null,
  loadingAnalytics: false,

  // Fetch all products
  fetchProducts: async () => {
    set({ loadingProducts: true });
    try {
      const res = await fetch(`${API_BASE}/products/`);
      const data = await res.json();
      set({ products: data.products, loadingProducts: false });
    } catch (error) {
      console.error('Failed to fetch products:', error);
      set({ loadingProducts: false });
    }
  },

  // Select a product for return
  selectProduct: (product) => set({ selectedProduct: product, returnResult: null }),

  // Submit a return request
  submitReturn: async (productId, reason, description = '') => {
    set({ loadingReturn: true });
    try {
      const res = await fetch(`${API_BASE}/returns/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          reason,
          description,
          image_hash: Math.random().toString(36).substring(7),
          verification_code: '123456',
          timestamp: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      set({
        returnResult: data,
        returnsHistory: [...get().returnsHistory, data],
        loadingReturn: false,
      });
      return data;
    } catch (error) {
      console.error('Failed to submit return:', error);
      set({ loadingReturn: false });
      throw error;
    }
  },

  // Submit sell-unused-item request (Option B flow)
  submitSellItem: async (request) => {
    set({ loadingReturn: true });
    try {
      const res = await fetch(`${API_BASE}/returns/sell-item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      const data = await res.json();
      set({
        returnResult: data,
        returnsHistory: [...get().returnsHistory, data],
        loadingReturn: false,
      });
      return data;
    } catch (error) {
      console.error('Failed to submit sell item:', error);
      set({ loadingReturn: false });
      throw error;
    }
  },

  // Fetch marketplace listings
  fetchMarketplace: async (filters) => {
    set({ loadingMarketplace: true });
    try {
      const params = new URLSearchParams(filters || {});
      const res = await fetch(`${API_BASE}/marketplace/?${params}`);
      const data = await res.json();
      set({ marketplaceListings: data.listings, loadingMarketplace: false });
    } catch (error) {
      console.error('Failed to fetch marketplace:', error);
      set({ loadingMarketplace: false });
    }
  },

  // Fetch P2P listings
  fetchP2PListings: async () => {
    set({ loadingP2P: true });
    try {
      const res = await fetch(`${API_BASE}/peer-to-peer/`);
      const data = await res.json();
      set({ p2pListings: data.listings, loadingP2P: false });
    } catch (error) {
      console.error('Failed to fetch P2P listings:', error);
      set({ loadingP2P: false });
    }
  },

  // Create P2P listing
  createP2PListing: async (productId, price, description) => {
    try {
      await fetch(`${API_BASE}/peer-to-peer/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          selling_price: price,
          description,
        }),
      });
      await get().fetchP2PListings();
    } catch (error) {
      console.error('Failed to create P2P listing:', error);
    }
  },

  // Fetch green credits
  fetchGreenCredits: async (userId = 'user_001') => {
    set({ loadingCredits: true });
    try {
      const res = await fetch(`${API_BASE}/green-credits/${userId}`);
      const data = await res.json();
      set({ greenCredits: data, loadingCredits: false });
    } catch (error) {
      console.error('Failed to fetch green credits:', error);
      set({ loadingCredits: false });
    }
  },

  // Redeem credits
  redeemCredits: async (credits) => {
    try {
      const res = await fetch(`${API_BASE}/green-credits/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'user_001', credits_to_redeem: credits }),
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchGreenCredits();
      }
      return data;
    } catch (error) {
      console.error('Failed to redeem credits:', error);
      return { success: false, message: 'Failed to redeem credits' };
    }
  },

  // Fetch analytics
  fetchAnalytics: async () => {
    set({ loadingAnalytics: true });
    try {
      const res = await fetch(`${API_BASE}/analytics/dashboard`);
      const data = await res.json();
      set({ analytics: data, loadingAnalytics: false });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      set({ loadingAnalytics: false });
    }
  },
}));
