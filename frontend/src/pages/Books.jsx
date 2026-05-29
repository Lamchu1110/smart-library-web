import { useState } from 'react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useToast } from '../contexts/ToastContext';

const sampleBooks = [
  { id: 'BK-001', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'Computer Science', qty: 5, available: 3, status: 'available', cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtaAdcRNZLH-sAF6fJj0UKjrQJD20U74Wm4tveOXx5Gfps_s2AHPtxkMSkJvuYK4exFcqTIC1civsHleQ0EX90OLgpbetj9dYpVNMXDo3ia3C-hTSnweGieEnXtzt9LTtz2J8id_ZkVIVrqsSQtaRRmMhFByzM1n7UoudHoBZNbJy6t_SR-A9CUxEFHl7KtWJii_8rjAV3TH5HlfhVahgetlICTfD2rKcYOFqTQtjuV9bidCBv0PgfOY1AIQRFIW3Foz3gMHirV7P_' },
  { id: 'BK-002', title: 'The Feynman Lectures on Physics', author: 'Richard P. Feynman', category: 'Physics', qty: 2, available: 0, status: 'borrowed', cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1pkcvqwlXSPBw7OVxS3MsbWgpBtV66n3iwJHNv0N-WrhFN5ScLErgCnShqz5381xxp-ZLLC_x7aP6co3zzhtwWOe8hHIzZtbA2Ap1fF22ywmq7E_qI0CAq_aseP21bs9cete6CT8YZqd-YpwzrfWi8Y8zRJxEttSTIDoRhX0XugP4TBZ119b_9xqk9PWgwczfiBs3eT2F9ABRYZOEcBy6VFujzQPb9XDl1-JkuSMpqCmn-MBdsXTv8SlcNx3f3hhPiHU_jgsRSeCy' },
  { id: 'BK-003', title: 'Advanced Calculus', author: 'Patrick M. Fitzpatrick', category: 'Mathematics', qty: 8, available: 6, status: 'available', cover: null },
  { id: 'BK-004', title: 'Clean Code', author: 'Robert C. Martin', category: 'Computer Science', qty: 4, available: 2, status: 'available', cover: null },
  { id: 'BK-005', title: 'Design Patterns', author: 'Erich Gamma', category: 'Computer Science', qty: 3, available: 1, status: 'available', cover: null },
  { id: 'BK-006', title: 'The Pragmatic Programmer', author: 'David Thomas', category: 'Computer Science', qty: 2, available: 0, status: 'borrowed', cover: null },
  { id: 'BK-007', title: 'Sapiens: A Brief History', author: 'Yuval Noah Harari', category: 'History', qty: 5, available: 4, status: 'available', cover: null },
  { id: 'BK-008', title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Literature', qty: 6, available: 5, status: 'available', cover: null },
];

export default function Books() {
  const [books, setBooks] = useState(sampleBooks);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const toast = useToast();

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formISBN, setFormISBN] = useState('');
  const [formCategory, setFormCategory] = useState('Computer Science');
  const [formPublisher, setFormPublisher] = useState('');
  const [formYear, setFormYear] = useState('2024');
  const [formQty, setFormQty] = useState('1');
  const [formCover, setFormCover] = useState('');

  const openAddModal = () => {
    setEditingBook(null);
    setFormTitle('');
    setFormAuthor('');
    setFormISBN('');
    setFormCategory('Computer Science');
    setFormPublisher('');
    setFormYear('2024');
    setFormQty('1');
    setFormCover('');
    setShowModal(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setFormTitle(book.title || '');
    setFormAuthor(book.author || '');
    setFormISBN(book.isbn || book.id || '');
    setFormCategory(book.category || 'Computer Science');
    setFormPublisher(book.publisher || '');
    setFormYear(book.year || '2024');
    setFormQty(book.qty?.toString() || '1');
    setFormCover(book.cover || '');
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete volume ${id}?`)) {
      setBooks(prev => prev.filter(b => b.id !== id));
      toast.success(`Volume ${id} has been successfully archived.`);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formTitle || !formAuthor) {
      toast.error('Title and Author are required fields.');
      return;
    }

    const qtyVal = parseInt(formQty, 10) || 1;

    if (editingBook) {
      // Edit logic
      setBooks(prev => prev.map(b => b.id === editingBook.id ? {
        ...b,
        title: formTitle,
        author: formAuthor,
        category: formCategory,
        qty: qtyVal,
        available: Math.min(b.available, qtyVal),
        status: qtyVal === 0 ? 'lost' : (b.available > 0 ? 'available' : 'borrowed'),
        cover: formCover || null,
        isbn: formISBN,
        publisher: formPublisher,
        year: formYear
      } : b));
      toast.success(`Book "${formTitle}" updated successfully.`);
    } else {
      // Add logic
      const nextId = `BK-0${books.length + 1}`;
      const newBook = {
        id: nextId,
        title: formTitle,
        author: formAuthor,
        category: formCategory,
        qty: qtyVal,
        available: qtyVal,
        status: qtyVal > 0 ? 'available' : 'borrowed',
        cover: formCover || null,
        isbn: formISBN,
        publisher: formPublisher,
        year: formYear
      };
      setBooks(prev => [newBook, ...prev]);
      toast.success(`New volume "${formTitle}" cataloged successfully.`);
    }
    setShowModal(false);
  };

  const filteredBooks = books.filter((book) => {
    const matchSearch =
      !search ||
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      book.id.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || book.category === categoryFilter;
    const matchStatus = !statusFilter || book.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      cellClass: 'text-ink-400 font-medium font-mono text-body-xs'
    },
    {
      header: 'Cover',
      accessor: 'cover',
      render: (val) => (
        <div className="w-10 h-14 bg-parchment-200 border border-warm-border rounded-vintage-sm overflow-hidden shadow-sm flex items-center justify-center relative group-hover:shadow-md transition-shadow">
          {val ? (
            <img src={val} alt="Book Cover" className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-ink-300 text-[20px]">book_5</span>
          )}
        </div>
      ),
    },
    {
      header: 'Title & Author',
      accessor: 'title',
      render: (val, row) => (
        <div className="max-w-[280px]">
          <div className="font-serif text-heading-sm text-wood-800 line-clamp-1 hover:text-brass-600 transition-colors" title={row.title}>
            {row.title}
          </div>
          <div className="text-body-xs text-ink-400 font-sans mt-0.5">{row.author}</div>
        </div>
      ),
    },
    { 
      header: 'Category', 
      accessor: 'category', 
      cellClass: 'text-ink-500 font-sans font-medium text-body-xs bg-parchment-200/30 px-2 py-0.5 rounded border border-warm-border/30 inline-block mt-3'
    },
    {
      header: 'Qty (Avail)',
      accessor: 'qty',
      headerClass: 'text-center',
      cellClass: 'text-center font-sans text-body-sm text-ink-500',
      render: (val, row) => (
        <>
          <span className="font-semibold text-wood-700">{row.qty}</span>
          <span className="text-ink-300 ml-1">({row.available})</span>
        </>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => <StatusBadge status={val} />,
    },
  ];

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
        {editingBook ? 'Save Changes' : 'Catalog Volume'}
      </button>
    </>
  );

  return (
    <div className="stagger-children space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Library Archives</h2>
          <p className="page-subtitle">Catalog, track, and maintain the library's literary collections.</p>
        </div>
        <button
          onClick={openAddModal}
          className="btn btn-brass btn-md"
        >
          <span className="material-symbols-outlined text-[18px]">add_box</span>
          Catalog New Book
        </button>
      </div>

      {/* Filters Panel */}
      <div className="v-card p-5 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300 text-[20px]">
            search
          </span>
          <input
            className="v-input !pl-10"
            placeholder="Search by Volume ID, Title, or Author..."
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            className="v-select min-w-[160px]"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Categories</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Literature">Literature</option>
            <option value="History">History</option>
          </select>
          <select
            className="v-select min-w-[150px]"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="borrowed">Borrowed</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredBooks}
        currentPage={currentPage}
        itemsPerPage={8}
        totalItems={filteredBooks.length}
        onPageChange={setCurrentPage}
        renderActions={(row) => (
          <div className="flex justify-end gap-1">
            <button 
              className="btn btn-ghost btn-sm !p-1 text-ink-300 hover:text-brass-600" 
              title="View volume details"
              onClick={() => toast.info(`Viewing details for: ${row.title}`)}
            >
              <span className="material-symbols-outlined text-[18px]">visibility</span>
            </button>
            <button
              className="btn btn-ghost btn-sm !p-1 text-ink-300 hover:text-wood-700"
              title="Edit catalog details"
              onClick={() => openEditModal(row)}
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button 
              className="btn btn-ghost btn-sm !p-1 text-ink-300 hover:text-v-error" 
              title="De-archive volume"
              onClick={() => handleDelete(row.id)}
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        )}
      />

      {/* Reusable Vintage Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingBook ? 'Edit Archival Record' : 'Catalog New Volume'}
        subtitle={
          editingBook 
            ? `Modify record details for entry ${editingBook.id}` 
            : 'Enter full metadata to index this book in the records'
        }
        size="lg"
        footer={modalFooter}
      >
        <form className="space-y-4" onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="v-label">Volume Title</label>
              <input
                className="v-input"
                type="text"
                placeholder="e.g. Principia Mathematica"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="v-label">Author / Creator</label>
              <input
                className="v-input"
                type="text"
                placeholder="e.g. Sir Isaac Newton"
                value={formAuthor}
                onChange={e => setFormAuthor(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="v-label">ISBN / Unique Reference</label>
              <input
                className="v-input"
                type="text"
                placeholder="e.g. 978-0-111-22222-3"
                value={formISBN}
                onChange={e => setFormISBN(e.target.value)}
              />
            </div>
            <div>
              <label className="v-label">Category</label>
              <select
                className="v-select"
                value={formCategory}
                onChange={e => setFormCategory(e.target.value)}
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Literature">Literature</option>
                <option value="History">History</option>
              </select>
            </div>
            <div>
              <label className="v-label">Publisher</label>
              <input
                className="v-input"
                type="text"
                placeholder="e.g. Cambridge University Press"
                value={formPublisher}
                onChange={e => setFormPublisher(e.target.value)}
              />
            </div>
            <div>
              <label className="v-label">Publication Year</label>
              <input
                className="v-input"
                type="number"
                placeholder="e.g. 1687"
                value={formYear}
                onChange={e => setFormYear(e.target.value)}
              />
            </div>
            <div>
              <label className="v-label">Total Quantity</label>
              <input
                className="v-input"
                type="number"
                min="0"
                placeholder="e.g. 5"
                value={formQty}
                onChange={e => setFormQty(e.target.value)}
              />
            </div>
            <div>
              <label className="v-label">Cover Image URL</label>
              <input
                className="v-input"
                type="text"
                placeholder="e.g. https://domain.com/cover.jpg"
                value={formCover}
                onChange={e => setFormCover(e.target.value)}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
