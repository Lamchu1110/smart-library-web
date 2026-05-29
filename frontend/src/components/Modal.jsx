export default function Modal({ isOpen, onClose, title, subtitle, children, size = 'md', footer }) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 backdrop-vintage" onClick={onClose} />

      {/* Modal Content */}
      <div className={`relative w-full ${sizeClasses[size]} bg-parchment-50 rounded-vintage-lg shadow-modal
        animate-scale-in max-h-[90vh] flex flex-col overflow-hidden`}>

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-warm-border bg-parchment-100/50">
          <div>
            <h3 className="font-serif text-heading-lg text-wood-800">{title}</h3>
            {subtitle && <p className="text-body-sm text-ink-300 mt-0.5 font-sans">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-vintage-sm text-ink-300 hover:text-wood-700 hover:bg-parchment-200 transition-colors"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Brass accent line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-brass-400/40 to-transparent" />

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-warm-border bg-parchment-100/30 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
