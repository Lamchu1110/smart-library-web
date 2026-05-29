import { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useToast } from '../contexts/ToastContext';

const sampleTransactions = [
  { id: '#TRX-8902', reader: 'James Davies', initials: 'JD', book: 'The Pragmatic Programmer', isbn: '978-0135957059', borrowDate: 'Oct 12, 2023', dueDate: 'Oct 26, 2023', status: 'overdue', penalty: '$15.00', bgClass: 'bg-wood-700 text-parchment-100' },
  { id: '#TRX-8905', reader: 'Sarah Miller', initials: 'SM', book: 'Design Patterns', isbn: '978-0201633610', borrowDate: 'Nov 01, 2023', dueDate: 'Nov 15, 2023', status: 'borrowed', penalty: '-', bgClass: 'bg-brass-100 text-wood-900 border border-brass-300' },
  { id: '#TRX-8890', reader: 'Alex Lee', initials: 'AL', book: 'Clean Code', isbn: '978-0132350884', borrowDate: 'Oct 05, 2023', dueDate: 'Oct 19, 2023', status: 'returned', penalty: '-', bgClass: 'bg-parchment-300 text-ink-600 border border-warm-border' },
  { id: '#TRX-8875', reader: 'Emily Chen', initials: 'EP', book: 'Introduction to Algorithms', isbn: '978-0262033848', borrowDate: 'Sep 28, 2023', dueDate: 'Oct 12, 2023', status: 'overdue', penalty: '$45.50', bgClass: 'bg-wood-800 text-brass-200' },
  { id: '#TRX-8870', reader: 'Michael Brown', initials: 'MB', book: 'Advanced Calculus', isbn: '978-0821847916', borrowDate: 'Oct 10, 2023', dueDate: 'Oct 24, 2023', status: 'borrowed', penalty: '-', bgClass: 'bg-wood-600 text-parchment-100' },
  { id: '#TRX-8860', reader: 'Anna White', initials: 'AW', book: 'Sapiens: A Brief History', isbn: '978-0062316097', borrowDate: 'Sep 20, 2023', dueDate: 'Oct 04, 2023', status: 'returned', penalty: '-', bgClass: 'bg-parchment-200 text-ink-500 border border-warm-border' },
];

const tabs = [
  { label: 'All Transactions', value: '' },
  { label: 'Borrowed', value: 'borrowed' },
  { label: 'Overdue', value: 'overdue', badge: 2 },
  { label: 'Returned', value: 'returned' },
];

export default function BorrowReturn() {
  const [transactions, setTransactions] = useState(sampleTransactions);
  const [activeTab, setActiveTab] = useState('');
  const [showModal, setShowModal] = useState(false);
  const toast = useToast();

  // Form states
  const [formReader, setFormReader] = useState('');
  const [formBook, setFormBook] = useState('');
  const [formBorrowDate, setFormBorrowDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDueDate, setFormDueDate] = useState('');

  const filtered = activeTab
    ? transactions.filter((t) => t.status === activeTab)
    : transactions;

  const handleReturn = (id, bookTitle) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'returned', penalty: '-' } : t));
    toast.success(`Book "${bookTitle}" returned successfully. Record updated.`);
  };

  const handleExtend = (id, bookTitle) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        const currentDueDate = new Date(t.dueDate);
        currentDueDate.setDate(currentDueDate.getDate() + 14);
        const formattedDate = currentDueDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        return { ...t, dueDate: formattedDate, status: 'borrowed', penalty: '-' };
      }
      return t;
    }));
    toast.success(`Loan term extended by 14 days for "${bookTitle}".`);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formReader || !formBook || !formDueDate) {
      toast.error('Please select a reader, book, and due date.');
      return;
    }

    const nextId = `#TRX-${8900 + transactions.length + 1}`;
    const readerInitials = formReader.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    
    // Parse input dates for display
    const bDate = new Date(formBorrowDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const dDate = new Date(formDueDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    const newTrx = {
      id: nextId,
      reader: formReader,
      initials: readerInitials,
      book: formBook,
      isbn: '978-' + Math.floor(1000000000 + Math.random() * 9000000000),
      borrowDate: bDate,
      dueDate: dDate,
      status: 'borrowed',
      penalty: '-',
      bgClass: 'bg-wood-700 text-parchment-100'
    };

    setTransactions(prev => [newTrx, ...prev]);
    toast.success(`Book "${formBook}" successfully issued to ${formReader}.`);
    setShowModal(false);
  };

  const modalFooter = (
    <>
      <button
        type="button"
        onClick={() => setShowModal(false)}
        className="btn btn-outline btn-md"
      >
        Cancel
      </button>
      <button
        type="submit"
        onClick={handleFormSubmit}
        className="btn btn-brass btn-md"
      >
        Issue Book
      </button>
    </>
  );

  return (
    <div className="stagger-children space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Circulation Ledger</h2>
          <p className="page-subtitle">Track loans, process returns, manage renewals, and handle overdue accounts.</p>
        </div>
        <button
          onClick={() => {
            setFormReader('');
            setFormBook('');
            setFormBorrowDate(new Date().toISOString().split('T')[0]);
            setFormDueDate('');
            setShowModal(true);
          }}
          className="btn btn-brass btn-md"
        >
          <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
          Issue New Book
        </button>
      </div>

      {/* Tab Filters */}
      <div className="flex items-center gap-6 border-b border-warm-border mb-6 px-1">
        {tabs.map((tab) => {
          const isOverdueTab = tab.value === 'overdue';
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`pb-3.5 border-b-2 text-label-md font-sans font-semibold transition-all duration-200 relative flex items-center gap-2 cursor-pointer
                ${isActive
                  ? isOverdueTab
                    ? 'border-v-error text-v-error font-bold'
                    : 'border-brass-500 text-wood-800 font-bold'
                  : 'border-transparent text-ink-300 hover:text-wood-700'
                }`}
            >
              {tab.label}
              {tab.badge && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm font-mono
                  ${isActive && isOverdueTab 
                    ? 'bg-v-error text-white' 
                    : 'bg-parchment-300 text-ink-600'
                  }`}>
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <span className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full
                  ${isOverdueTab ? 'bg-v-error' : 'bg-brass-500'}`} 
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Circulation Table Card */}
      <div className="v-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="v-table">
            <thead>
              <tr>
                <th>Borrow ID</th>
                <th>Reader Name</th>
                <th>Book Title</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Penalty</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((trx) => {
                const isOverdue = trx.status === 'overdue';
                const isReturned = trx.status === 'returned';
                return (
                  <tr
                    key={trx.id}
                    className={`${isOverdue ? 'bg-red-50/20 border-l-[3px] border-l-v-error/80' : ''}`}
                  >
                    <td className="font-medium font-mono text-body-xs text-ink-400">{trx.id}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${trx.bgClass} flex items-center justify-center text-body-xs font-serif font-bold shadow-inner-glow`}>
                          {trx.initials}
                        </div>
                        <span className="font-serif text-wood-800 font-medium text-body-md">{trx.reader}</span>
                      </div>
                    </td>
                    <td>
                      <div className="max-w-[240px]">
                        <span className="line-clamp-1 font-serif text-wood-700 font-medium text-body-md" title={trx.book}>{trx.book}</span>
                        <span className="text-body-xs text-ink-300 font-mono">ISBN: {trx.isbn}</span>
                      </div>
                    </td>
                    <td className="text-ink-400 font-sans">{trx.borrowDate}</td>
                    <td className={`font-sans ${isOverdue ? 'text-v-error font-semibold' : 'text-ink-400'}`}>
                      {isOverdue && (
                        <span className="material-symbols-outlined text-[14px] mr-1 align-middle icon-filled">warning</span>
                      )}
                      {trx.dueDate}
                    </td>
                    <td>
                      <StatusBadge status={trx.status} />
                    </td>
                    <td className={`font-sans font-medium ${trx.penalty !== '-' ? 'text-v-error' : 'text-ink-300'}`}>
                      {trx.penalty}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleReturn(trx.id, trx.book)}
                          className={`btn btn-ghost btn-sm !p-1 ${isReturned ? 'text-ink-200 cursor-not-allowed' : 'text-ink-300 hover:text-v-success'}`}
                          disabled={isReturned}
                          title="Record Book Return"
                        >
                          <span className="material-symbols-outlined text-[18px]">assignment_return</span>
                        </button>
                        <button
                          onClick={() => handleExtend(trx.id, trx.book)}
                          className={`btn btn-ghost btn-sm !p-1 ${isReturned ? 'text-ink-200 cursor-not-allowed' : 'text-ink-300 hover:text-brass-600'}`}
                          disabled={isReturned}
                          title="Extend Loan Term"
                        >
                          <span className="material-symbols-outlined text-[18px]">update</span>
                        </button>
                        <button 
                          onClick={() => toast.info(`Generating receipt for transaction ${trx.id}...`)}
                          className="btn btn-ghost btn-sm !p-1 text-ink-300 hover:text-wood-700" 
                          title="View Circulation Receipt"
                        >
                          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-ink-300">
              <span className="material-symbols-outlined text-[48px] text-ink-200 mb-2">inbox</span>
              <p className="text-body-md">No circulation records match this status.</p>
            </div>
          )}
        </div>

        {/* Vintage pagination mockup */}
        <div className="bg-parchment-100/50 px-6 py-4 flex items-center justify-between border-t border-warm-border">
          <span className="text-body-sm text-ink-300 font-sans">Showing 1 to {filtered.length} of {transactions.length} entries</span>
          <div className="flex items-center gap-1">
            <button className="btn btn-ghost btn-sm !px-2" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-vintage-sm bg-wood-700 text-parchment-100 font-sans text-body-sm font-medium flex items-center justify-center shadow-sm">1</button>
            <button className="w-8 h-8 rounded-vintage-sm text-ink-400 hover:bg-parchment-200 font-sans text-body-sm font-medium flex items-center justify-center">2</button>
            <button className="btn btn-ghost btn-sm !px-2">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reusable Issue Book Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Issue New Book"
        subtitle="Process a book checkout transaction for a library cardholder."
        size="md"
        footer={modalFooter}
      >
        <form className="space-y-4" onSubmit={handleFormSubmit}>
          <div>
            <label className="v-label">Select Reader Account</label>
            <select 
              className="v-select font-serif"
              value={formReader}
              onChange={e => setFormReader(e.target.value)}
              required
            >
              <option value="">-- Choose Account --</option>
              <option value="Emma Thompson">Emma Thompson (U-230914)</option>
              <option value="Marcus Johnson">Marcus Johnson (U-230915)</option>
              <option value="David Chen">David Chen (P-184022)</option>
              <option value="James Davies">James Davies (U-230919)</option>
              <option value="Sarah Miller">Sarah Miller (U-230920)</option>
            </select>
          </div>
          <div>
            <label className="v-label">Select Volume from Catalog</label>
            <select 
              className="v-select font-serif"
              value={formBook}
              onChange={e => setFormBook(e.target.value)}
              required
            >
              <option value="">-- Choose Book Volume --</option>
              <option value="Introduction to Algorithms">Introduction to Algorithms (3 copies available)</option>
              <option value="Clean Code">Clean Code (2 copies available)</option>
              <option value="Design Patterns">Design Patterns (1 copy available)</option>
              <option value="The Pragmatic Programmer">The Pragmatic Programmer (0 copies available - join queue)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="v-label">Checkout Date</label>
              <input 
                className="v-input" 
                type="date" 
                value={formBorrowDate}
                onChange={e => setFormBorrowDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="v-label">Return Due Date</label>
              <input 
                className="v-input" 
                type="date" 
                value={formDueDate}
                onChange={e => setFormDueDate(e.target.value)}
                required
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
