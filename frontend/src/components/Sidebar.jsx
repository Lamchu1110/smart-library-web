import { NavLink, useNavigate, useLocation } from 'react-router-dom';

const navSections = [
  {
    label: 'OVERVIEW',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: 'space_dashboard' },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { path: '/books', label: 'Books', icon: 'menu_book' },
      { path: '/readers', label: 'Readers', icon: 'groups' },
      { path: '/borrow-return', label: 'Borrow & Return', icon: 'swap_horiz' },
      { path: '/categories', label: 'Categories', icon: 'category' },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [
      { path: '/reports', label: 'Reports', icon: 'analytics' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { path: '/settings', label: 'Settings', icon: 'settings' },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 backdrop-vintage z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-sidebar bg-wood-gradient z-50 flex flex-col
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        {/* ── Logo ── */}
        <div className="px-6 py-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-brass-gradient rounded-vintage-sm flex items-center justify-center shadow-brass">
            <span className="material-symbols-outlined icon-filled text-wood-900 text-[22px]">local_library</span>
          </div>
          <div>
            <h1 className="font-serif text-heading-md text-parchment-100 leading-tight tracking-tight">
              SmartLib
            </h1>
            <p className="text-body-xs text-parchment-500/60 font-sans">University Library</p>
          </div>
        </div>

        {/* ── Decorative Divider ── */}
        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-brass-600/40 to-transparent" />

        {/* ── Navigation ── */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-5">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="text-label-caps text-parchment-500/40 uppercase px-3 mb-2 font-sans">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2.5 rounded-vintage-sm
                      transition-all duration-200 ease-out relative
                      ${isActive
                        ? 'bg-brass-600/20 text-brass-300'
                        : 'text-parchment-400/60 hover:text-parchment-200 hover:bg-white/5'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active indicator bar */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brass-400 rounded-r-full" />
                        )}
                        <span
                          className={`material-symbols-outlined text-[20px] transition-colors duration-200
                            ${isActive ? 'text-brass-400' : 'text-parchment-500/40 group-hover:text-parchment-300'}`}
                          style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          {item.icon}
                        </span>
                        <span className="text-label-md font-sans">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Bottom Divider ── */}
        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-brass-600/30 to-transparent" />

        {/* ── Logout ── */}
        <div className="px-4 py-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-vintage-sm
              text-parchment-500/50 hover:text-v-error hover:bg-v-error/10
              transition-all duration-200 font-sans text-label-md"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
