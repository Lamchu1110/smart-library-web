import { useState } from 'react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useToast } from '../contexts/ToastContext';

const sampleCategories = [
  { id: 'CAT-001', code: 'CS', name: 'Computer Science', volumes: 14, description: 'Technical works on computation, software engineering, algorithms, and systems architectures.', status: 'active' },
  { id: 'CAT-002', code: 'PHY', name: 'Physics', volumes: 8, description: 'Theoretical, mathematical, and practical works exploring the fundamental principles of the physical universe.', status: 'active' },
  { id: 'CAT-003', code: 'MATH', name: 'Mathematics', volumes: 11, description: 'Classical and advanced mathematical treatises, calculus, geometry, and proof foundations.', status: 'active' },
  { id: 'CAT-004', code: 'LIT', name: 'Literature', volumes: 18, description: 'Historical and contemporary novels, prose, poetry, and classical theatrical manuscripts.', status: 'active' },
  { id: 'CAT-005', code: 'HIS', name: 'History', volumes: 9, description: 'Biographical accounts, global historical documentation, and geopolitical historical studies.', status: 'active' },
  { id: 'CAT-006', code: 'PHI', name: 'Philosophy', volumes: 5, description: 'Essays and dialogues regarding ethics, logic, existentialism, and metaphysical discourse.', status: 'inactive' },
];

export default function Categories() {
  const [categories, setCategories] = useState(sampleCategories);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const toast = useToast();

  // Form states
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState('active');

  const openAddModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormCode('');
    setFormDesc('');
    setFormStatus('active');
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormName(cat.name || '');
    setFormCode(cat.code || '');
    setFormDesc(cat.description || '');
    setFormStatus(cat.status || 'active');
    setShowModal(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success(`Category "${name}" has been removed from catalog indices.`);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formName || !formCode) {
      toast.error('Category Name and Index Code are required.');
      return;
    }

    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? {
        ...c,
        name: formName,
        code: formCode.toUpperCase(),
        description: formDesc,
        status: formStatus
      } : c));
      toast.success(`Category indices for "${formName}" updated successfully.`);
    } else {
      const nextId = `CAT-0${categories.length + 1}`;
      const newCat = {
        id: nextId,
        code: formCode.toUpperCase(),
        name: formName,
        volumes: 0,
        description: formDesc,
        status: formStatus
      };
      setCategories(prev => [newCat, ...prev]);
      toast.success(`Category index "${formName}" added successfully.`);
    }
    setShowModal(false);
  };

  const filtered = categories.filter(c => {
    const matchSearch = 
      !search || 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    { 
      header: 'Index Code', 
      accessor: 'code', 
      cellClass: 'text-ink-400 font-semibold font-mono text-body-xs bg-parchment-200/50 border border-warm-border px-2 py-0.5 rounded text-center inline-block mt-3' 
    },
    {
      header: 'Category Name',
      accessor: 'name',
      render: (val, row) => (
        <div>
          <div className="font-serif text-heading-sm text-wood-800 leading-tight">{row.name}</div>
          <div className="text-body-xs text-ink-300 font-sans mt-0.5 line-clamp-1 max-w-[340px]" title={row.description}>
            {row.description || 'No description provided.'}
          </div>
        </div>
      )
    },
    { 
      header: 'Cataloged Volumes', 
      accessor: 'volumes', 
      headerClass: 'text-center',
      cellClass: 'text-center font-sans text-body-sm font-semibold text-wood-700' 
    },
    {
      header: 'Index Status',
      accessor: 'status',
      render: (val) => <StatusBadge status={val} />
    }
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
        {editingCategory ? 'Save Index Changes' : 'Create Category Index'}
      </button>
    </>
  );

  return (
    <div className="stagger-children space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Category Index</h2>
          <p className="page-subtitle">Organize and classify book volumes using archival indexing schemes.</p>
        </div>
        <button
          onClick={openAddModal}
          className="btn btn-brass btn-md"
        >
          <span className="material-symbols-outlined text-[18px]">category</span>
          Create Category Index
        </button>
      </div>

      {/* Filter Panel */}
      <div className="v-card p-5 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300 text-[20px]">
            search
          </span>
          <input
            className="v-input !pl-10"
            placeholder="Search by Index Name or Class Code..."
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex gap-3">
          <select
            className="v-select min-w-[160px]"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active Index</option>
            <option value="inactive">Inactive Index</option>
          </select>
        </div>
      </div>

      {/* Categories DataTable */}
      <DataTable
        columns={columns}
        data={filtered}
        currentPage={currentPage}
        itemsPerPage={6}
        totalItems={filtered.length}
        onPageChange={setCurrentPage}
        renderActions={(row) => (
          <div className="flex justify-end gap-1">
            <button 
              className="btn btn-ghost btn-sm !p-1 text-ink-300 hover:text-brass-600" 
              title="Inspect volumes under classification"
              onClick={() => toast.info(`Index contains ${row.volumes} volumes under "${row.name}".`)}
            >
              <span className="material-symbols-outlined text-[18px]">find_in_page</span>
            </button>
            <button
              className="btn btn-ghost btn-sm !p-1 text-ink-300 hover:text-wood-700"
              title="Edit classification details"
              onClick={() => openEditModal(row)}
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button 
              className="btn btn-ghost btn-sm !p-1 text-ink-300 hover:text-v-error" 
              title="Decommission index classification"
              onClick={() => handleDelete(row.id, row.name)}
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCategory ? 'Edit Index Classification' : 'Catalog New Index Classification'}
        subtitle={
          editingCategory 
            ? `Modify settings for index code: ${editingCategory.code}` 
            : 'Register a new classification folder to host library catalog volumes.'
        }
        size="md"
        footer={modalFooter}
      >
        <form className="space-y-4" onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="v-label">Index Category Name</label>
              <input
                className="v-input"
                type="text"
                placeholder="e.g. Modern Philosophy"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="v-label">Class Code prefix</label>
                <input
                  className="v-input font-mono uppercase"
                  type="text"
                  placeholder="e.g. PHI"
                  value={formCode}
                  onChange={e => setFormCode(e.target.value)}
                  maxLength={5}
                  required
                />
              </div>
              <div>
                <label className="v-label">Classification Status</label>
                <select
                  className="v-select"
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value)}
                >
                  <option value="active">Active Index</option>
                  <option value="inactive">Inactive Index</option>
                </select>
              </div>
            </div>
            <div>
              <label className="v-label">Index Scope &amp; Description</label>
              <textarea
                className="v-textarea"
                placeholder="Detail the catalog boundaries of this folder..."
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                rows="3"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
