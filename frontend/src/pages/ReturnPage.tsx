/**
 * Return Item Page (Enhanced)
 * =============================
 * Dual entry points:
 * - Option A: Return Purchased Item (My Orders → Select → Return)
 * - Option B: Sell Unused Item (Upload Product → Analyze)
 * Preserves existing return workflow and adds sell-item flow.
 */

import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import ProductCard from '../components/ProductCard';
import LiveCapture from '../components/LiveCapture';
import ReturnResult from '../components/ReturnResult';
import type { Product } from '../types';
import { ArrowLeft, Package, ShoppingBag, Upload } from 'lucide-react';

const returnReasons = [
  'Changed mind / No longer needed',
  'Wrong size / Doesn\'t fit',
  'Not as described',
  'Defective / Broken',
  'Better price found elsewhere',
  'Arrived too late',
  'Wrong item received',
];

const sellReasons = [
  'No longer needed',
  'Upgrading to new model',
  'Decluttering',
  'Unused gift',
  'Duplicate item',
];

const categories = [
  'Electronics', 'Clothing', 'Home & Kitchen', 'Books',
  'Toys & Games', 'Sports & Outdoors', 'Beauty', 'Automotive',
];

export default function ReturnPage() {
  const {
    products, fetchProducts, loadingProducts, selectedProduct,
    selectProduct, submitReturn, submitSellItem, returnResult, loadingReturn
  } = useStore();

  // Flow mode: 'choose' | 'return' | 'sell'
  const [flowMode, setFlowMode] = useState<'choose' | 'return' | 'sell'>('choose');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [captureComplete, setCaptureComplete] = useState(false);
  const [imageHash, setImageHash] = useState('');
  const [step, setStep] = useState<'select' | 'capture' | 'review' | 'result'>('select');

  // Sell-item form state
  const [sellName, setSellName] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellCategory, setSellCategory] = useState('');
  const [sellReason, setSellReason] = useState('');
  const [sellDescription, setSellDescription] = useState('');
  const [sellStep, setSellStep] = useState<'form' | 'capture' | 'result'>('form');

  useEffect(() => {
    fetchProducts();
    setVerificationCode(Math.floor(100000 + Math.random() * 900000).toString());
  }, [fetchProducts]);

  const handleProductSelect = (product: Product) => {
    selectProduct(product);
    setStep('capture');
  };

  const handleCapture = (hash: string, _timestamp: string) => {
    setImageHash(hash);
    setCaptureComplete(true);
  };

  const handleProceedToReview = () => {
    setStep('review');
  };

  const handleSubmit = async () => {
    if (!selectedProduct || !reason) return;
    await submitReturn(selectedProduct.id, reason, description);
    setStep('result');
  };

  const handleSellSubmit = async () => {
    if (!sellName || !sellPrice || !sellCategory || !sellReason) return;
    await submitSellItem({
      product_name: sellName,
      original_price: parseFloat(sellPrice),
      category: sellCategory,
      reason: sellReason,
      description: sellDescription,
    });
    setSellStep('result');
  };

  const handleReset = () => {
    selectProduct(null);
    setReason('');
    setDescription('');
    setCaptureComplete(false);
    setImageHash('');
    setStep('select');
    setFlowMode('choose');
    setSellName('');
    setSellPrice('');
    setSellCategory('');
    setSellReason('');
    setSellDescription('');
    setSellStep('form');
  };

  const isExpensiveProduct = (selectedProduct?.original_price ?? 0) > 300;

  // ============ CHOOSE FLOW MODE ============
  if (flowMode === 'choose') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Return or Sell</h1>
        <p className="text-gray-600 mb-8">
          Choose how you'd like to give your product a second life.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Option A: Return Purchased Item */}
          <button
            onClick={() => setFlowMode('return')}
            className="card hover:shadow-lg hover:border-amazon-orange/40 transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-amazon-orange/10 group-hover:bg-amazon-orange/20 transition-colors">
                <Package className="h-6 w-6 text-amazon-orange" />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-gray-900">Return Purchased Item</h2>
                <p className="text-sm text-gray-500">From your orders</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Select a product from My Orders, capture live images, and submit for AI analysis.
            </p>
            <div className="mt-4 text-xs text-gray-400">
              My Orders → Select Product → Live Capture → AI Analysis
            </div>
          </button>

          {/* Option B: Sell Unused Item */}
          <button
            onClick={() => setFlowMode('sell')}
            className="card hover:shadow-lg hover:border-amazon-orange/40 transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                <Upload className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-gray-900">Sell Unused Item</h2>
                <p className="text-sm text-gray-500">List any product</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              List any unused product, upload details, and get AI-powered pricing and disposition.
            </p>
            <div className="mt-4 text-xs text-gray-400">
              Add Product Details → Live Capture → AI Analysis
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ============ OPTION B: SELL UNUSED ITEM ============
  if (flowMode === 'sell') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={handleReset} className="flex items-center gap-1 text-amazon-teal hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to options
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Upload className="h-6 w-6 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900">Sell Unused Item</h1>
        </div>

        {sellStep === 'form' && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Product Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={sellName}
                  onChange={(e) => setSellName(e.target.value)}
                  placeholder="e.g., Sony WH-1000XM5 Headphones"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Price ($) *</label>
                  <input
                    type="number"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={sellCategory}
                    onChange={(e) => setSellCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Selling *</label>
                <select
                  value={sellReason}
                  onChange={(e) => setSellReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
                >
                  <option value="">Select a reason...</option>
                  {sellReasons.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  value={sellDescription}
                  onChange={(e) => setSellDescription(e.target.value)}
                  placeholder="Describe the condition of the item..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 resize-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setSellStep('capture')}
                disabled={!sellName || !sellPrice || !sellCategory || !sellReason}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Capture
              </button>
            </div>
          </div>
        )}

        {sellStep === 'capture' && (
          <div>
            <div className="card mb-6">
              <p className="text-sm text-gray-600">
                <strong>{sellName}</strong> · ${parseFloat(sellPrice || '0').toFixed(2)} · {sellCategory}
              </p>
            </div>
            <h2 className="text-lg font-semibold mb-4">📸 Live Product Capture</h2>
            <p className="text-sm text-gray-600 mb-4">
              Take a live photo. Verification code: <strong className="text-amazon-orange">{verificationCode}</strong>
            </p>
            <LiveCapture
              verificationCode={verificationCode}
              isExpensive={parseFloat(sellPrice || '0') > 300}
              onCapture={handleCapture}
            />
            {captureComplete && (
              <div className="mt-6">
                <button
                  onClick={handleSellSubmit}
                  disabled={loadingReturn}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loadingReturn ? 'Analyzing with AI...' : 'Submit for AI Analysis'}
                </button>
              </div>
            )}
          </div>
        )}

        {sellStep === 'result' && returnResult && (
          <div>
            <ReturnResult result={returnResult} />
            <button onClick={handleReset} className="btn-secondary w-full mt-6">
              Start New Submission
            </button>
          </div>
        )}
      </div>
    );
  }

  // ============ OPTION A: RETURN PURCHASED ITEM (Original Flow) ============
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={handleReset} className="flex items-center gap-1 text-amazon-teal hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to options
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Return an Item</h1>
      <p className="text-gray-600 mb-8">
        Our AI engine will assess your product's condition and recommend the best second-life path.
      </p>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {['Select Product', 'Live Capture', 'Review', 'Result'].map((label, i) => {
          const stepNames = ['select', 'capture', 'review', 'result'];
          const currentIdx = stepNames.indexOf(step);
          const isActive = i === currentIdx;
          const isComplete = i < currentIdx;
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                isActive ? 'bg-amazon-orange text-white' :
                isComplete ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {isComplete ? '✓' : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${isActive ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                {label}
              </span>
              {i < 3 && <div className="w-8 h-0.5 bg-gray-200" />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Select Product */}
      {step === 'select' && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="h-5 w-5 text-amazon-orange" />
            <h2 className="text-lg font-semibold">My Orders — Select a product to return</h2>
          </div>
          {loadingProducts ? (
            <div className="text-center py-12 text-gray-500">Loading products...</div>
          ) : (
            <div className="grid gap-4">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={handleProductSelect}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Live Capture */}
      {step === 'capture' && selectedProduct && (
        <div>
          <button onClick={() => { setStep('select'); selectProduct(null); }} className="flex items-center gap-1 text-amazon-teal hover:underline mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to products
          </button>
          <div className="card mb-6">
            <div className="flex items-center gap-4 mb-4">
              <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-16 h-16 object-cover rounded" />
              <div>
                <h3 className="font-semibold">{selectedProduct.name}</h3>
                <p className="text-sm text-gray-500">${selectedProduct.original_price.toFixed(2)}</p>
              </div>
            </div>
            {isExpensiveProduct && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm text-amber-800 mb-4">
                ⚠️ This is a high-value item (${selectedProduct.original_price.toFixed(2)}). 
                Guided video capture is required for verification.
              </div>
            )}
          </div>

          <h2 className="text-lg font-semibold mb-4">📸 Live Product Capture</h2>
          <p className="text-sm text-gray-600 mb-4">
            Take a live photo of your product. Gallery uploads are disabled for fraud prevention.
            Your verification code <strong className="text-amazon-orange">{verificationCode}</strong> must be visible on screen.
          </p>

          <LiveCapture
            verificationCode={verificationCode}
            isExpensive={isExpensiveProduct}
            onCapture={handleCapture}
          />

          {captureComplete && (
            <div className="mt-6">
              <button onClick={handleProceedToReview} className="btn-primary w-full">
                Continue to Review
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Review & Submit */}
      {step === 'review' && selectedProduct && (
        <div>
          <button onClick={() => setStep('capture')} className="flex items-center gap-1 text-amazon-teal hover:underline mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to capture
          </button>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Return Details</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Return *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
              >
                <option value="">Select a reason...</option>
                {returnReasons.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the condition of the item..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 resize-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!reason || loadingReturn}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingReturn ? 'Processing with AI...' : 'Submit Return'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Result */}
      {step === 'result' && returnResult && (
        <div>
          <ReturnResult result={returnResult} />
          <button onClick={handleReset} className="btn-secondary w-full mt-6">
            Start New Return
          </button>
        </div>
      )}
    </div>
  );
}
