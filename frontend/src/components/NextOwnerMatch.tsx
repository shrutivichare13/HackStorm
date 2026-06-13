/**
 * Next Owner Match Component
 * ===========================
 * FEATURE B: Shows where the item goes next based on the disposition decision.
 * Reads from mock nearbyMatches.json — no backend changes needed.
 * - RESELL / REFURBISH / P2P  → 2–3 nearby buyers, 🌱 Local Match tag, CO₂ savings
 * - DONATE                    → 1 nearby NGO
 * - RECYCLE                   → 1 nearby recycling center
 */

import { MapPin, Recycle, Heart, Users } from 'lucide-react';
import nearbyData from '../data/nearbyMatches.json';

interface NextOwnerMatchProps {
  disposition: string;
}

const CO2_SAVING_PER_KM_AVOIDED = 0.21; // kg CO₂ per km (avg logistics)
const BASELINE_WAREHOUSE_KM = 120;       // km to nearest warehouse/liquidation

interface MatchItem {
  name: string;
  distance_km: number;
  type: string;
}

export default function NextOwnerMatch({ disposition }: NextOwnerMatchProps) {
  const disp = disposition?.toLowerCase() ?? '';

  const isResell = disp.includes('resell') || disp.includes('refurbish') || disp.includes('peer');
  const isDonate = disp.includes('donate');
  const isRecycle = disp.includes('recycle');

  if (!isResell && !isDonate && !isRecycle) return null;

  // Select the right pool of matches
  let matches: MatchItem[] = [];
  if (isResell) {
    const sorted = [...nearbyData.buyers].sort((a, b) => a.distance_km - b.distance_km);
    matches = sorted.slice(0, 3);
  } else if (isDonate) {
    matches = [nearbyData.ngos[0]];
  } else if (isRecycle) {
    matches = [nearbyData.recyclingCenters[0]];
  }

  const headerIcon = isResell ? Users : isDonate ? Heart : Recycle;
  const HeaderIcon = headerIcon;
  const headerColor = isResell ? 'text-amazon-teal' : isDonate ? 'text-pink-600' : 'text-emerald-600';
  const headerBg = isResell ? 'bg-amazon-teal/10' : isDonate ? 'bg-pink-50' : 'bg-emerald-50';

  return (
    <div className="card border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-2 rounded-lg ${headerBg}`}>
          <HeaderIcon className={`h-4 w-4 ${headerColor}`} />
        </div>
        <h3 className="font-semibold text-gray-900">
          {isResell ? 'Next Best Owner Match' : isDonate ? 'Donation Partner' : 'Recycling Center'}
        </h3>
      </div>

      {isResell && (
        <p className="text-xs text-gray-500 mb-3">
          Connecting locally reduces logistics cost and CO₂ emissions.
        </p>
      )}

      <div className="space-y-2">
        {matches.map((match, i) => {
          const isLocal = match.distance_km <= 10;
          const co2Saved = ((BASELINE_WAREHOUSE_KM - match.distance_km) * CO2_SAVING_PER_KM_AVOIDED).toFixed(1);

          return (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                  match.type === 'buyer' ? 'bg-amazon-navy' :
                  match.type === 'ngo' ? 'bg-pink-600' : 'bg-emerald-600'
                }`}>
                  {match.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5 flex-wrap">
                    {match.name}
                    {isLocal && (
                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                        🌱 Local Match
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {match.distance_km} km away
                    {match.type === 'buyer' && (
                      <span className="ml-1 text-green-600 font-medium">
                        · saves ~{co2Saved} kg CO₂
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                match.type === 'buyer' ? 'bg-blue-50 text-blue-700' :
                match.type === 'ngo' ? 'bg-pink-50 text-pink-700' :
                'bg-emerald-50 text-emerald-700'
              }`}>
                {match.type === 'buyer' ? 'Buyer' : match.type === 'ngo' ? 'NGO' : 'Recycler'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
