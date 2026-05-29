const statusConfig = {
  available: { bg: 'bg-emerald-50', text: 'text-v-success', dot: 'bg-v-success', label: 'Available' },
  borrowed:  { bg: 'bg-blue-50', text: 'text-v-info', dot: 'bg-v-info', label: 'Borrowed' },
  overdue:   { bg: 'bg-red-50', text: 'text-v-error', dot: 'bg-v-error', label: 'Overdue', border: 'ring-1 ring-v-error/20' },
  returned:  { bg: 'bg-parchment-200', text: 'text-ink-400', dot: 'bg-ink-300', label: 'Returned' },
  active:    { bg: 'bg-emerald-50', text: 'text-v-success', dot: 'bg-v-success', label: 'Active' },
  suspended: { bg: 'bg-amber-50', text: 'text-v-warning', dot: 'bg-v-warning', label: 'Suspended' },
  inactive:  { bg: 'bg-parchment-200', text: 'text-ink-400', dot: 'bg-ink-300', label: 'Inactive' },
  lost:      { bg: 'bg-red-50', text: 'text-v-error', dot: 'bg-v-error', label: 'Lost' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status?.toLowerCase()] || statusConfig.active;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-body-xs font-semibold font-sans
      ${config.bg} ${config.text} ${config.border || ''}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
