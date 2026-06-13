/**
 * Impact Journey Diagram
 * =======================
 * FEATURE E: Visual "before vs after" section for the landing page.
 * Shows WITHOUT (→ Landfill) vs WITH US (→ AI Decision → New Life).
 * Uses Amazon color palette: #232F3E navy, #FF9900 orange.
 * Pure CSS boxes + arrows — no extra dependencies.
 */

import { ArrowRight, X, Check } from 'lucide-react';

interface FlowNode {
  label: string;
  sub?: string;
  color: string;
  textColor: string;
}

const withoutFlow: FlowNode[] = [
  { label: 'Customer', sub: 'Returns item', color: '#f3f4f6', textColor: '#374151' },
  { label: 'Warehouse', sub: 'Receives return', color: '#f3f4f6', textColor: '#374151' },
  { label: 'Liquidation', sub: 'Bulk sold at loss', color: '#fef3c7', textColor: '#92400e' },
  { label: 'Landfill', sub: '🗑 Ends here', color: '#fee2e2', textColor: '#991b1b' },
];

const withUsFlow: FlowNode[] = [
  { label: 'Customer', sub: 'Returns item', color: '#f0fdf4', textColor: '#14532d' },
  { label: 'AI Decision', sub: 'Condition assessed', color: '#FF9900', textColor: '#ffffff' },
  { label: 'New Owner', sub: '↗ Resell / P2P', color: '#232F3E', textColor: '#ffffff' },
  { label: 'Donation', sub: '❤ NGO / Charity', color: '#232F3E', textColor: '#ffffff' },
  { label: 'Recycling', sub: '♻ Responsible', color: '#232F3E', textColor: '#ffffff' },
];

function FlowRow({ nodes, bad }: { nodes: FlowNode[]; bad?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {nodes.map((node, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="rounded-lg px-3 py-2 text-center min-w-[80px] shadow-sm"
            style={{ backgroundColor: node.color, color: node.textColor }}
          >
            <p className="text-xs font-bold leading-tight">{node.label}</p>
            {node.sub && (
              <p className="text-[10px] opacity-80 mt-0.5 leading-tight">{node.sub}</p>
            )}
          </div>
          {i < nodes.length - 1 && (
            <ArrowRight
              className="h-4 w-4 flex-shrink-0"
              style={{ color: bad ? '#dc2626' : '#FF9900' }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ImpactJourneyDiagram() {
  return (
    <section className="bg-white border-t border-b py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
          The Difference We Make
        </h2>
        <p className="text-center text-gray-500 mb-12">
          See how AI-powered circular commerce transforms the returns journey.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* WITHOUT */}
          <div className="rounded-2xl border-2 border-red-200 bg-red-50/30 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                <X className="h-4 w-4 text-red-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Without Second Life</h3>
            </div>
            <FlowRow nodes={withoutFlow} bad />
            <ul className="mt-5 space-y-1.5">
              {[
                'Up to 25% of returns end in landfill',
                'Average loss of 66% original value',
                'High logistics & warehousing cost',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-xs text-red-700">
                  <X className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* WITH US */}
          <div
            className="rounded-2xl border-2 p-6"
            style={{ borderColor: '#FF9900', backgroundColor: 'rgba(255,153,0,0.04)' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#FF9900' }}
              >
                <Check className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">With Second Life Commerce</h3>
            </div>
            <FlowRow nodes={withUsFlow} />
            <ul className="mt-5 space-y-1.5">
              {[
                'AI routes every item to its highest-value path',
                'Up to 78% value recovery across categories',
                'Local matching reduces CO₂ by ~21% per item',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-xs text-green-700">
                  <Check className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
