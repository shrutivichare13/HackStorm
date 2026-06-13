/**
 * Return Item Page
 * =================
 * FIX 1: productHint passed to LiveCapture for detection gating.
 * FIX 4: Brand field added to sell form; passed through to pricing display.
 * FIX 8: Updated flow copy on choose-mode cards.
 */

import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import ProductCard from '../components/ProductCard';
import LiveCapture from '../components/LiveCapture';
import MultiAngleCapture from '../components/MultiAngleCapture';
import type { MultiAngleCaptureResult } from '../components/MultiAngleCapture';
import ProductAnalysisWorkflow from '../components/ProductAnalysisWorkflow';
import ReturnResult from '../components/ReturnResult';
import LowerRiskAlternatives from '../components/LowerRiskAlternatives';
import type { Product, ReturnRisk } from '../types';
import { getReturnRisk } from '../utils/api';
import { ArrowLeft, Package, ShoppingBag, Upload, ChevronRight } from 'lucide-react';

const returnReasons = [
  'Changed mind / No longer needed',
  "Wrong size / Doesn't fit",
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
    selectProduct, submitReturn, submitSellItem, returnResult, loadingReturn,
    marketplaceListings, fetchMarketplace,
  } = useStore();

  const [flowMode, setFlowMode] = useState<'choose' | 'return' | 'sell'>('choose');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [captureComplete, setCaptureComplete] = useState(false);
  const [imageHash, setImageHash] = useState('');
  const [step, setStep] = useState<'select' | 'capture' | 'analysis' | 'review' | 'result'>('select');
  const [returnRisk, setReturnRisk] = useState<ReturnRisk | null>(null);
  // FIX 1: detection gate for return flow
  const [detectionOk, setDetectionOk] = useState<boolean | null>(null);
  // Multi-angle capture result (Problems 2-7)
  const [multiCaptureResult, setMultiCaptureResult] = useState<MultiAngleCaptureResult | null>(null);
  // AI Analysis result
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Sell-item form state
  const [sellName, setSellName] = useState('');
  const [sellBrand, setSellBrand] = useState('');      // FIX 4
  const [sellPrice, setSellPrice] = useState('');
  const [sellCategory, setSellCategory] = useState('');
  const [sellReason, setSellReason] = useState('');
  const [sellDescription, setSellDescription] = useState('');
  const [sellStep, setSellStep] = useState<'form' | 'capture' | 'result'>('form');
  // FIX 1: detection gate for sell flow
  const [sellDetectionOk, setSellDetectionOk] = useState<boolean | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchMarketplace();
    setVerificationCode(Math.floor(100000 + Math.random() * 900000).toString());
  }, [fetchProducts, fetchMarketplace]);

  const handleProductSelect = (product: Product) => {
    selectProduct(product);
    setDetectionOk(null);
    setCaptureComplete(false);
    setMultiCaptureResult(null);
    setStep('capture');
    getReturnRisk(product.id)
      .then((risk) => setReturnRisk(risk as ReturnRisk))
      .catch(() => setReturnRisk(null));
  };

  // Called by LiveCapture when detection succeeds (match=true) → hash is valid
  const handleCapture = (hash: string, _timestamp: string) => {
    setImageHash(hash);
    setCaptureComplete(true);
  };

  // FIX 1: detection result handler for return flow
  const handleDetectionResult = (ok: boolean) => {
    setDetectionOk(ok);
    if (!ok) setCaptureComplete(false);
  };

  // Multi-angle capture complete — Problems 2-7
  const handleMultiCaptureComplete = (result: MultiAngleCaptureResult) => {
    setMultiCaptureResult(result);
    // Allow proceeding if not failed
    if (result.overallTier !== 'failed') {
      setCaptureComplete(true);
      setDetectionOk(true);
    }
    setStep('analysis');
  };

  // FIX 1: detection result handler for sell flow
  const handleSellDetectionResult = (ok: boolean) => {
    setSellDetectionOk(ok);
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
      // FIX 4: pass brand as part of description so backend receives it
      ...(sellBrand && sellBrand !== 'Unknown'
        ? { description: `Brand: ${sellBrand}. ${sellDescription}` }
        : {}),
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
    setReturnRisk(null);
    setDetectionOk(null);
    setMultiCaptureResult(null);
    setAnalysisComplete(false);
    setSellName('');
    setSellBrand('');
    setSellPrice('');
    setSellCategory('');
    setSellReason('');
    setSellDescription('');
    setSellStep('form');
    setSellDetectionOk(null);
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
          {/* Option A — FIX 8: updated copy */}
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
            {/* FIX 8 */}
            <p className="text-sm text-gray-600">
              Give returned products a meaningful second life. Select an item from your Amazon
              orders, verify its current condition, and let AI determine the best next action.
            </p>
            <div className="mt-4 text-xs text-gray-400 leading-relaxed">
              My Orders ↓ Select Product ↓ Live Verification ↓ AI Condition Analysis ↓ Resell / Refurbish / Donate / Recycle
            </div>
          </button>

          {/* Option B — FIX 8: updated copy */}
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
            {/* FIX 8 */}
            <p className="text-sm text-gray-600">
              Turn unused products into value and impact. List products you no longer need and
              let AI assess condition, pricing, and the best path to a new owner.
            </p>
            <div className="mt-4 text-xs text-gray-400 leading-relaxed">
              Add Product Details ↓ Live Verification ↓ AI Condition Analysis ↓ Price Estimation ↓ Resell / Donate / Exchange
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
                  placeholder="e.g., WH-1000XM5 Headphones"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
                />
              </div>

              {/* FIX 4: Brand field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand <span className="text-gray-400 font-normal">(optional — leave blank for range estimate)</span>
                </label>
                <input
                  type="text"
                  value={sellBrand}
                  onChange={(e) => setSellBrand(e.target.value)}
                  placeholder="e.g., Sony, Apple, Nike — or leave blank"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
                />
                {!sellBrand && (
                  <p className="text-xs text-amber-600 mt-1">
                    No brand entered — pricing will be shown as an estimated range.
                  </p>
                )}
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
                <strong>{sellName}</strong>
                {sellBrand && ` · ${sellBrand}`}
                {` · $${parseFloat(sellPrice || '0').toFixed(2)} · ${sellCategory}`}
              </p>
            </div>
            <h2 className="text-lg font-semibold mb-4">📸 Live Product Capture</h2>
            <p className="text-sm text-gray-600 mb-4">
              Take a live photo. Verification code:{' '}
              <strong className="text-amazon-orange">{verificationCode}</strong>
            </p>
            {/* FIX 1: productHint = product name for keyword-based detection */}
            <LiveCapture
              verificationCode={verificationCode}
              isExpensive={parseFloat(sellPrice || '0') > 300}
              productHint={sellName}
              onCapture={handleCapture}
              onDetectionResult={handleSellDetectionResult}
            />
            {/* FIX 1: block submit if detection failed */}
            {sellDetectionOk === true && (
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
            {sellDetectionOk === false && (
              <p className="mt-4 text-sm text-red-600 text-center">
                ⚠ Product verification failed — please recapture the correct item before submitting.
              </p>
            )}
          </div>
        )}

        {sellStep === 'result' && returnResult && (
          <div>
            {/* FIX 4: pass brand so ReturnResult can show range vs single price */}
            <ReturnResult result={returnResult} sellBrand={sellBrand || 'Unknown'} />
            <button onClick={handleReset} className="btn-secondary w-full mt-6">
              Start New Submission
            </button>
          </div>
        )}
      </div>
    );
  }

  // ============ OPTION A: RETURN PURCHASED ITEM ============
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
        {['Select Product', 'Live Capture', 'AI Analysis', 'Review', 'Result'].map((label, i) => {
          const stepNames = ['select', 'capture', 'analysis', 'review', 'result'];
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
              {i < 4 && <div className="w-8 h-0.5 bg-gray-200" />}
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
                <ProductCard key={product.id} product={product} onSelect={handleProductSelect} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Live Capture — multi-angle (Problems 2-7) */}
      {step === 'capture' && selectedProduct && (
        <div>
          <button
            onClick={() => { setStep('select'); selectProduct(null); }}
            className="flex items-center gap-1 text-amazon-teal hover:underline mb-4"
          >
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
            {returnRisk && (
              <div>
                <div className={`flex items-center gap-2 p-2.5 rounded-lg text-sm font-medium ${
                  returnRisk.risk_score > 30
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-green-50 text-green-800 border border-green-200'
                }`}>
                  <span>{returnRisk.risk_score > 30 ? '⚠️' : '✅'}</span>
                  <span>Return Risk: <strong>{returnRisk.risk_score}%</strong>
                    {returnRisk.risk_score > 30 ? ' — customers often return this item' : ' — low return rate'}
                  </span>
                </div>
                <LowerRiskAlternatives
                  riskScore={returnRisk.risk_score}
                  category={selectedProduct.category}
                  marketplaceListings={marketplaceListings}
                />
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Capture 3 angles of your product. Gallery uploads are disabled for fraud prevention.
            Show verification code{' '}
            <strong className="text-amazon-orange">{verificationCode}</strong> on screen.
          </p>

          {/* Multi-angle capture — replaces single LiveCapture in return flow */}
          <MultiAngleCapture
            verificationCode={verificationCode}
            productId={selectedProduct.id}
            productHint={selectedProduct.category}
            productName={selectedProduct.name}
            isElectronics={selectedProduct.category === 'Electronics'}
            onComplete={handleMultiCaptureComplete}
          />
        </div>
      )}

      {/* Step 3: AI Analysis */}
      {step === 'analysis' && selectedProduct && (
        <div>
          <button onClick={() => setStep('capture')} className="flex items-center gap-1 text-amazon-teal hover:underline mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to capture
          </button>

          <div className="card mb-6">
            <div className="flex items-center gap-4">
              <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-14 h-14 object-cover rounded" />
              <div>
                <h3 className="font-semibold text-sm">{selectedProduct.name}</h3>
                <p className="text-xs text-gray-500">{selectedProduct.category} · ${selectedProduct.original_price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <ProductAnalysisWorkflow
            productId={selectedProduct.id}
            productName={selectedProduct.name}
            productCategory={selectedProduct.category}
            capturedImageBase64={multiCaptureResult?.captures[0]?.dataUrl || ''}
            capturedTimestamp={multiCaptureResult?.captures[0]?.timestamp || new Date().toISOString()}
            onAnalysisComplete={() => {
              setAnalysisComplete(true);
            }}
            onVerificationFailed={() => {
              setAnalysisComplete(false);
            }}
          />

          {analysisComplete && (
            <button
              onClick={() => setStep('review')}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
            >
              Continue to Review <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {step === 'review' && selectedProduct && (
        <div>
          <button onClick={() => setStep('analysis')} className="flex items-center gap-1 text-amazon-teal hover:underline mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to analysis
          </button>
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Return Details</h2>

            {/* Problem 6: show functional verification in review */}
            {multiCaptureResult?.functionalVerification && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <p className="font-medium text-blue-800 mb-1">Functional Verification</p>
                <p className="text-blue-700">
                  Power Status: <strong>{multiCaptureResult.functionalVerification.powerStatus}</strong>
                  {multiCaptureResult.functionalVerification.reportedNotWorking && (
                    <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                      ⚠ Reported Not Working
                    </span>
                  )}
                </p>
                {multiCaptureResult.functionalVerification.demoVideoPath && (
                  <p className="text-blue-700 mt-0.5">
                    Demo Video: <strong>{multiCaptureResult.functionalVerification.demoVideoPath}</strong>
                  </p>
                )}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Return *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
              >
                <option value="">Select a reason...</option>
                {returnReasons.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details (optional)</label>
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

      {/* Step 5: Result */}
      {step === 'result' && returnResult && (
        <div>
          <ReturnResult
            result={returnResult}
            functionalVerification={multiCaptureResult?.functionalVerification}
          />
          <button onClick={handleReset} className="btn-secondary w-full mt-6">
            Start New Return
          </button>
        </div>
      )}
    </div>
  );
}
