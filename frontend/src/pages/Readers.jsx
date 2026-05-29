import { useState } from 'react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useToast } from '../contexts/ToastContext';

const sampleReaders = [
  { id: '#R-10429', name: 'Emma Thompson', email: 'ethompson@uni.edu', code: 'U-230914', status: 'active', borrowed: 3, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtmxTX5WE092Umo4OFHM8x2rUaXqoHgPUkB48qYql123VZsfoAfDCOxNUd2RUNJIPyAEm4_Fdkel7ISlwPH_cbXeVWPwlHd5fQL_T2p1cxVqh0BBl3WjjVH7SM7IfEoBEFL737A2f70tWWORjB_D8nicsYbI4lvzEjqixGrbMCEAv8VWoQ8sQaPdT_VMHi5ZJTwlGLxS5aEIutCrZHlev0roSGxaLdapWIC-nISds39mqw6qkYnzdayjVG8tGyXUdsA04XSHOuGxKj', initials: 'ET' },
  { id: '#R-10430', name: 'Marcus Johnson', email: 'mjohnson@uni.edu', code: 'U-230915', status: 'suspended', borrowed: 5, avatar: null, initials: 'MJ' },
  { id: '#R-10431', name: 'David Chen', email: 'dchen@uni.edu', code: 'P-184022', status: 'active', borrowed: 12, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRIhKso0aSYkmzhSX1NdXqhA2193HmWxH1T8zn4gkEDbasFHi0D-7KQRi4MfjHu_GfXpsQ-UWxoHHjlh-G4pFdwGNjlW2AlCcnvgqgWvDFwVwO07haJoTw0D-7-T3tncp5BkiVFpHof7CULqItCn898Ah-E1UNGD6LyTWcgxX19q3Bik8brF-Br6p9C6-ye_w2xAP5YNPDp_MOSw1ZxkFeird6hTWIcI8k29PCsbCRRFZ7G6_DKQ1ZpdskRx1OaZASSfN7zOUIGARX', initials: 'DC' },
  { id: '#R-10432', name: 'Sarah Adams', email: 'sadams@uni.edu', code: 'F-009182', status: 'inactive', borrowed: 0, avatar: null, initials: 'SA' },
  { id: '#R-10433', name: 'James Wilson', email: 'jwilson@uni.edu', code: 'U-230920', status: 'active', borrowed: 7, avatar: null, initials: 'JW' },
  { id: '#R-10434', name: 'Linda Park', email: 'lpark@uni.edu', code: 'P-184030', status: 'active', borrowed: 2, avatar: null, initials: 'LP' },
];

export default function Readers() {
  const [readers, setReaders] = useState(sampleReaders);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [membershipFilter, setMembershipFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingReader, setEditingReader] = useState(null);
  const toast = useToast();

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formType, setFormType] = useState('Undergraduate');
  const [formAddress, setFormAddress] = useState('');

  const openAddModal = () => {
    setEditingReader(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormCode('');
    setFormType('Undergraduate');
    setFormAddress('');
    setShowModal(true);
  };

  const openEditModal = (reader) => {
    setEditingReader(reader);
    setFormName(reader.name || '');
    setFormEmail(reader.email || '');
    setFormPhone(reader.phone || '');
    setFormCode(reader.code || '');
    setFormType(reader.type || 'Undergraduate');
    setFormAddress(reader.address || '');
    setShowModal(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete member ${name}?`)) {
      setReaders(prev => prev.filter(r => r.id !== id));
      toast.success(`Member "${name}" has been removed from the registry.`);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formName || !formEmail || !formCode) {
      toast.error('Name, Email, and Student Code are required fields.');
      return;
    }

    if (editingReader) {
      setReaders(prev => prev.map(r => r.id === editingReader.id ? {
        ...r,
        name: formName,
        email: formEmail,
        code: formCode,
        phone: formPhone,
        type: formType,
        address: formAddress,
        initials: formName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      } : r));
      toast.success(`Member profile for "${formName}" updated.`);
    } else {
      const nextId = `#R-10${430 + readers.length + 1}`;
      const newReader = {
        id: nextId,
        name: formName,
        email: formEmail,
        code: formCode,
        phone: formPhone,
        type: formType,
        address: formAddress,
        status: 'active',
        borrowed: 0,
        avatar: null,
        initials: formName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      };
      setReaders(prev => [newReader, ...prev]);
      toast.success(`Member "${formName}" registered successfully.`);
    }
    setShowModal(false);
  };

  const filteredReaders = readers.filter((r) => {
    const matchSearch =
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const columns = [
    { 
      header: 'Reader ID', 
      accessor: 'id', 
      cellClass: 'text-ink-400 font-medium font-mono text-body-xs' 
    },
    {
      header: 'Reader',
      accessor: 'name',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          {row.avatar ? (
            <img src={row.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-warm-border shadow-sm" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brass-100 flex items-center justify-center text-body-sm text-wood-800 border border-brass-300 font-serif font-bold shadow-inner-glow">
              {row.initials}
            </div>
          )}
          <div>
            <div className="font-serif text-heading-sm text-wood-800 leading-tight">{row.name}</div>
            <div className="text-body-xs text-ink-300 font-sans mt-0.5">{row.email}</div>
          </div>
        </div>
      ),
    },
    { 
      header: 'Student/Faculty Code', 
      accessor: 'code', 
      cellClass: 'text-ink-500 font-mono text-body-xs' 
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      header: 'Borrowed',
      accessor: 'borrowed',
      headerClass: 'text-right',
      cellClass: 'text-right font-sans text-body-sm font-semibold text-wood-700',
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
        {editingReader ? 'Save Changes' : 'Register Member'}
      </button>
    </>
  );

  return (
    <div className="stagger-children space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Reader Registry</h2>
          <p className="page-subtitle">Manage library members, track borrow limits, and update statuses.</p>
        </div>
        <button
          onClick={openAddModal}
          className="btn btn-brass btn-md"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Register New Reader
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
            placeholder="Search by Full Name, Member ID, or Student Code..."
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
            className="v-select min-w-[200px]"
            value={membershipFilter}
            onChange={(e) => {
              setMembershipFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Membership Types</option>
            <option value="undergrad">Undergraduate</option>
            <option value="postgrad">Postgraduate</option>
            <option value="faculty">Faculty</option>
            <option value="staff">Staff</option>
          </select>
          <button 
            onClick={() => toast.info('Advanced filtering options are locked for demo purposes.')}
            className="btn btn-outline btn-md"
          >
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            More Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredReaders}
        currentPage={currentPage}
        itemsPerPage={8}
        totalItems={filteredReaders.length}
        onPageChange={setCurrentPage}
        renderActions={(row) => (
          <div className="flex justify-end gap-1">
            <button 
              className="btn btn-ghost btn-sm !p-1 text-ink-300 hover:text-brass-600" 
              title="View member card"
              onClick={() => toast.info(`Viewing record of member: ${row.name}`)}
            >
              <span className="material-symbols-outlined text-[18px]">visibility</span>
            </button>
            <button
              className="btn btn-ghost btn-sm !p-1 text-ink-300 hover:text-wood-700"
              title="Edit registry information"
              onClick={() => openEditModal(row)}
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button 
              className="btn btn-ghost btn-sm !p-1 text-ink-300 hover:text-v-error" 
              title="Deregister member"
              onClick={() => handleDelete(row.id, row.name)}
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        )}
      />

      {/* Add/Edit Reader Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingReader ? 'Edit Registry Details' : 'Register New Reader'}
        subtitle={
          editingReader 
            ? `Modify registry parameters for entry ${editingReader.id}` 
            : 'Enter details to register a new member into the library records'
        }
        size="md"
        footer={modalFooter}
      >
        <form className="space-y-4" onSubmit={handleFormSubmit}>
          <div>
            <label className="v-label">Full Name</label>
            <input
              className="v-input"
              type="text"
              placeholder="e.g. Emma Watson"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="v-label">Email Address</label>
            <input
              className="v-input"
              type="email"
              placeholder="e.g. ewatson@university.edu"
              value={formEmail}
              onChange={e => setFormEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="v-label">Phone Number</label>
              <input
                className="v-input"
                type="text"
                placeholder="e.g. +84 901 234 567"
                value={formPhone}
                onChange={e => setFormPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="v-label">Student / Faculty Code</label>
              <input
                className="v-input"
                type="text"
                placeholder="e.g. U-230914"
                value={formCode}
                onChange={e => setFormCode(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="v-label">Membership Type</label>
            <select
              className="v-select"
              value={formType}
              onChange={e => setFormType(e.target.value)}
            >
              <option value="Undergraduate">Undergraduate</option>
              <option value="Postgraduate">Postgraduate</option>
              <option value="Faculty">Faculty</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          <div>
            <label className="v-label">Residential Address</label>
            <textarea
              className="v-textarea"
              placeholder="Enter address details..."
              value={formAddress}
              onChange={e => setFormAddress(e.target.value)}
              rows="2"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
