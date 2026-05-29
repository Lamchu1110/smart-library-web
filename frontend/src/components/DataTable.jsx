import EmptyState from './EmptyState';

export default function DataTable({
  columns,
  data,
  totalItems,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange,
  renderActions,
}) {
  const total = totalItems || data.length;
  const totalPages = Math.ceil(total / itemsPerPage);

  const displayData = onPageChange
    ? data
    : data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, total);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  return (
    <div className="v-card overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="v-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={col.headerClass || ''}>
                  {col.header}
                </th>
              ))}
              {renderActions && (
                <th className="text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, rowIdx) => (
              <tr key={row.id || rowIdx} className={row._rowClass || ''}>
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={col.cellClass || ''}>
                    {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                  </td>
                ))}
                {renderActions && (
                  <td className="text-right">
                    {renderActions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {displayData.length === 0 && (
          <EmptyState
            icon="search_off"
            title="No records found"
            description="Try adjusting your search criteria or filters."
          />
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="px-5 py-3.5 border-t border-warm-border bg-parchment-100/50 flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto">
          <p className="text-body-sm text-ink-300 font-sans">
            Showing <span className="font-semibold text-wood-700">{startItem}</span> to{' '}
            <span className="font-semibold text-wood-700">{endItem}</span> of{' '}
            <span className="font-semibold text-wood-700">{total}</span> results
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              className="btn btn-ghost btn-sm !px-2"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            {getPageNumbers().map((page, idx) =>
              page === '...' ? (
                <span key={`dots-${idx}`} className="px-1 text-ink-300 text-body-sm">…</span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange?.(page)}
                  className={`w-8 h-8 rounded-vintage-sm font-sans text-body-sm font-medium flex items-center justify-center
                    transition-all duration-200
                    ${currentPage === page
                      ? 'bg-wood-700 text-parchment-100 shadow-sm'
                      : 'text-ink-400 hover:bg-parchment-200 hover:text-wood-700'
                    }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="btn btn-ghost btn-sm !px-2"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
