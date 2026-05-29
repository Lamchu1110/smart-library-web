export default function StatCard({ icon, label, value, trend, trendValue, accentColor = 'brass' }) {
  const isPositive = trend === 'up';

  const accentMap = {
    brass:   { bg: 'bg-brass-100', icon: 'text-brass-700', ring: 'ring-brass-300/30' },
    green:   { bg: 'bg-emerald-50', icon: 'text-v-success', ring: 'ring-emerald-300/30' },
    blue:    { bg: 'bg-blue-50', icon: 'text-v-info', ring: 'ring-blue-300/30' },
    red:     { bg: 'bg-red-50', icon: 'text-v-error', ring: 'ring-red-300/30' },
    amber:   { bg: 'bg-amber-50', icon: 'text-v-warning', ring: 'ring-amber-300/30' },
  };

  const accent = accentMap[accentColor] || accentMap.brass;

  return (
    <div className="v-card p-card relative overflow-hidden group corner-accent">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-vintage-sm flex items-center justify-center
            ${accent.bg} ${accent.icon} ring-1 ${accent.ring}
            group-hover:scale-105 transition-transform duration-300`}>
            <span className="material-symbols-outlined text-[24px]">{icon}</span>
          </div>
          <div>
            <p className="text-body-sm text-ink-300 font-sans mb-0.5">{label}</p>
            <p className="font-serif text-display-md text-wood-800 leading-none">{value}</p>
          </div>
        </div>
        {trendValue && (
          <span className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-full text-body-xs font-semibold font-sans
            ${isPositive ? 'text-v-success bg-emerald-50' : 'text-v-error bg-red-50'}`}>
            <span className="material-symbols-outlined text-[14px]">
              {isPositive ? 'trending_up' : 'trending_down'}
            </span>
            {trendValue}
          </span>
        )}
      </div>
    </div>
  );
}
