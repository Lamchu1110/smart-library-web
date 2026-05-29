import StatCard from '../components/StatCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useToast } from '../contexts/ToastContext';

const areaData = [
  { month: 'Jan', borrowed: 3200, returned: 2800 },
  { month: 'Feb', borrowed: 3600, returned: 3200 },
  { month: 'Mar', borrowed: 4200, returned: 3800 },
  { month: 'Apr', borrowed: 3800, returned: 4000 },
  { month: 'May', borrowed: 4600, returned: 4200 },
  { month: 'Jun', borrowed: 4900, returned: 4600 },
];

const categoryData = [
  { name: 'Computer Science', value: 35, color: '#2D1F15' }, // dark wood
  { name: 'Engineering', value: 25, color: '#4A3728' }, // medium wood
  { name: 'Mathematics', value: 20, color: '#C8A24A' }, // brass
  { name: 'Literature', value: 15, color: '#BFA264' }, // warm brass
  { name: 'Other', value: 5, color: '#7A6E5D' }, // ink
];

const topBooks = [
  { rank: '01', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', borrows: 423, pct: 85, colorClass: 'bg-brass-500' },
  { rank: '02', title: 'Clean Code', author: 'Robert C. Martin', borrows: 389, pct: 75, colorClass: 'bg-wood-500' },
  { rank: '03', title: 'Design Patterns', author: 'Erich Gamma', borrows: 312, pct: 60, colorClass: 'bg-ink-400' },
];

export default function Reports() {
  const toast = useToast();

  const handleExport = (type) => {
    toast.info(`Preparing ${type} file for archival export...`);
    setTimeout(() => {
      toast.success(`Successfully compiled and downloaded ${type} report.`);
    }, 1500);
  };

  return (
    <div className="stagger-children space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Reports &amp; Statistics</h2>
          <p className="page-subtitle">Comprehensive overview of library performance and circulation metrics.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleExport('PDF')}
            className="btn btn-outline btn-md"
          >
            <span className="material-symbols-outlined text-[18px]">description</span>
            Export PDF
          </button>
          <button 
            onClick={() => handleExport('Excel')}
            className="btn btn-brass btn-md"
          >
            <span className="material-symbols-outlined text-[18px]">table</span>
            Export Excel
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon="library_books" label="Total Circulation" value="45,231" accentColor="brass" trend="up" trendValue="12.5%" />
        <StatCard icon="group_add" label="New Members" value="1,204" accentColor="blue" trend="up" trendValue="5.2%" />
        <StatCard icon="warning" label="Overdue Returns" value="342" accentColor="red" trend="down" trendValue="2.1%" />
        <StatCard icon="account_balance_wallet" label="Fines Collected" value="$4,520" accentColor="green" trend="up" trendValue="8.4%" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <div className="v-card p-5 lg:col-span-2 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
            <div>
              <h3 className="font-serif text-heading-lg text-wood-800">Monthly Activity Ledger</h3>
              <p className="text-body-xs text-ink-300 mt-0.5">Borrowing vs Returning trends over the last 6 months.</p>
            </div>
            <div className="flex items-center gap-4 text-body-xs font-sans font-semibold">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-brass-500"></div>
                <span className="text-ink-400">BORROWED</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-wood-500"></div>
                <span className="text-ink-400">RETURNED</span>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="borrowedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8A24A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#C8A24A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="returnedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A3728" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4A3728" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E8D8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#7A6E5D', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#7A6E5D', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FEFCF7', border: '1px solid #E8DFD0', borderRadius: '8px', fontSize: '12px', fontFamily: 'Inter' }} />
                <Area type="monotone" dataKey="borrowed" stroke="#C8A24A" strokeWidth={2.5} fill="url(#borrowedGrad)" />
                <Area type="monotone" dataKey="returned" stroke="#4A3728" strokeWidth={2.5} fill="url(#returnedGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="v-card p-5 flex flex-col">
          <h3 className="font-serif text-heading-lg text-wood-800">Genre Distribution</h3>
          <p className="text-body-xs text-ink-300 mt-0.5 mb-6">Active circulation density categorized by literary genre.</p>
          <div className="flex-1 flex flex-col items-center justify-center relative min-h-[200px]">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="font-serif text-display-md text-wood-850">12k</span>
              <span className="text-[10px] tracking-wider text-ink-300 font-bold font-sans">TOTAL COPIES</span>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-body-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-ink-550 font-medium font-sans">{item.name}</span>
                </div>
                <span className="font-serif text-wood-700 font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Borrowed Books */}
      <div className="v-card p-5">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-serif text-heading-lg text-wood-800">Top Circulated Volumes</h3>
            <p className="text-body-xs text-ink-300 mt-0.5">Most checked out literary works in the archive catalog.</p>
          </div>
          <button 
            onClick={() => toast.info('Navigating to full circulation rankings...')}
            className="btn btn-ghost btn-sm text-brass-600 hover:text-brass-700"
          >
            View Rankings
          </button>
        </div>
        <div className="space-y-5">
          {topBooks.map((book) => (
            <div key={book.rank} className="group">
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-heading-md text-ink-300 group-hover:text-brass-600 transition-colors w-6">{book.rank}</span>
                  <div>
                    <h4 className="font-serif text-heading-sm text-wood-800 leading-tight group-hover:text-brass-700 transition-colors">{book.title}</h4>
                    <p className="text-body-xs text-ink-300 font-sans">{book.author}</p>
                  </div>
                </div>
                <span className="font-serif text-heading-sm text-wood-800">{book.borrows} checkouts</span>
              </div>
              <div className="w-full bg-parchment-200 border border-warm-border/40 rounded-full h-2">
                <div
                  className={`h-1.5 rounded-full ${book.colorClass} transition-all duration-500`}
                  style={{ width: `${book.pct}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
