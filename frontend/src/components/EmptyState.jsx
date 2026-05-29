export default function EmptyState({ icon = 'search_off', title = 'No results found', description = 'Try adjusting your search or filters.', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-parchment-200 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[32px] text-ink-300">{icon}</span>
      </div>
      <h3 className="font-serif text-heading-md text-wood-700 mb-1">{title}</h3>
      <p className="text-body-md text-ink-300 max-w-sm mb-4">{description}</p>
      {action && action}
    </div>
  );
}

export function LoadingRows({ columns = 5, rows = 5 }) {
  return (
    <div className="space-y-0">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-warm-border-light" style={{ animationDelay: `${i * 80}ms` }}>
          {[...Array(columns)].map((_, j) => (
            <div key={j} className={`skeleton h-4 rounded ${j === 0 ? 'w-16' : j === 1 ? 'w-40' : 'w-24'}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function LoadingCards({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="v-card-flat p-card space-y-3" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="flex items-center gap-3">
            <div className="skeleton w-12 h-12 rounded-vintage-sm" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3 w-20 rounded" />
              <div className="skeleton h-5 w-14 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeMap[size]} border-3 border-parchment-300 border-t-brass-500 rounded-full animate-spin`}
        style={{ borderWidth: '3px' }} />
    </div>
  );
}
