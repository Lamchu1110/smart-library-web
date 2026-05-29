import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Library overview & statistics' },
  '/books': { title: 'Books', subtitle: 'Manage your library catalog' },
  '/readers': { title: 'Readers', subtitle: 'Reader directory & membership' },
  '/borrow-return': { title: 'Transactions', subtitle: 'Borrow, return & track books' },
  '/categories': { title: 'Categories', subtitle: 'Organize your book collection' },
  '/reports': { title: 'Reports', subtitle: 'Analytics & performance insights' },
  '/settings': { title: 'Settings', subtitle: 'System configuration' },
};

export default function Header({ onMenuClick }) {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{"name":"Admin Profile","role":"Librarian"}');
  const pageInfo = pageTitles[location.pathname] || { title: 'SmartLib', subtitle: '' };

  const getInitials = (name) => {
    return name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'AP';
  };

  return (
    <header className="sticky top-0 bg-parchment-50/90 backdrop-blur-md border-b border-warm-border h-header flex items-center justify-between px-6 z-20">
      {/* Left: Menu + Page Info */}
      <div className="flex items-center gap-4">
        <button
          className="md:hidden p-2 text-ink-400 hover:text-wood-700 hover:bg-parchment-200 rounded-vintage-sm transition-colors"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <div className="hidden sm:block">
          <h2 className="font-serif text-heading-md text-wood-800 leading-tight">{pageInfo.title}</h2>
          <p className="text-body-xs text-ink-300 font-sans">{pageInfo.subtitle}</p>
        </div>
      </div>

      {/* Right: Search + Actions + Profile */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="hidden lg:flex items-center bg-parchment-200/60 rounded-full px-4 py-2 border border-warm-border
          focus-within:border-brass-400 focus-within:ring-2 focus-within:ring-brass-400/15 focus-within:bg-parchment-50
          transition-all duration-200 group">
          <span className="material-symbols-outlined text-ink-300 mr-2 text-[18px] group-focus-within:text-brass-600 transition-colors">search</span>
          <input
            type="text"
            placeholder="Search books, readers..."
            className="bg-transparent border-none outline-none text-body-md text-ink-600 w-56 placeholder:text-ink-300/70 font-sans"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-ink-400
          hover:bg-parchment-200 hover:text-wood-700 transition-colors" aria-label="Notifications">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-v-error rounded-full ring-2 ring-parchment-50" />
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-warm-border mx-1" />

        {/* User Profile */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-wood-gradient text-brass-300 flex items-center justify-center
            font-serif font-bold text-body-sm ring-2 ring-brass-500/30 group-hover:ring-brass-400/60 transition-all">
            {getInitials(user.name)}
          </div>
          <div className="hidden sm:block">
            <p className="text-label-md text-wood-700 leading-tight font-sans">{user.name || 'Admin Profile'}</p>
            <p className="text-body-xs text-ink-300 font-sans">{user.role || 'Librarian'}</p>
          </div>
          <span className="material-symbols-outlined text-[16px] text-ink-300 hidden sm:block">expand_more</span>
        </div>
      </div>
    </header>
  );
}
