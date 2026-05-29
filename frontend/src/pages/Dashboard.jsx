import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const barData = [
  { month: 'JAN', borrowed: 120, returned: 90 },
  { month: 'FEB', borrowed: 150, returned: 135 },
  { month: 'MAR', borrowed: 195, returned: 180 },
  { month: 'APR', borrowed: 135, returned: 165 },
  { month: 'MAY', borrowed: 240, returned: 210 },
  { month: 'JUN', borrowed: 270, returned: 255 },
];

const pieData = [
  { name: 'Science', value: 420, color: '#C8A24A' },
  { name: 'Fiction', value: 300, color: '#2D1F15' },
  { name: 'History', value: 250, color: '#A8862E' },
  { name: 'Literature', value: 180, color: '#D4BC82' },
  { name: 'Other', value: 100, color: '#E8DFD0' },
];

const recentActivity = [
  { id: 1, reader: 'Emma Johnson', initials: 'EJ', book: 'The Design of Everyday Things', date: 'Oct 12, 2023', status: 'active' },
  { id: 2, reader: 'Michael Smith', initials: 'MS', book: 'Introduction to Algorithms', date: 'Sep 28, 2023', status: 'overdue' },
  { id: 3, reader: 'Alice Lee', initials: 'AL', book: 'Sapiens: A Brief History', date: 'Oct 15, 2023', status: 'active' },
  { id: 4, reader: 'David Brown', initials: 'DB', book: 'Clean Code', date: 'Oct 01, 2023', status: 'returned' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-parchment-50 border border-warm-border rounded-vintage-sm shadow-elevated px-4 py-3">
      <p className="font-serif text-heading-sm text-wood-800 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-body-sm font-sans" style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard Overview</h2>
          <p className="page-subtitle">Welcome back. Here's what's happening in the library today.</p>
        </div>
        <button className="btn btn-brass btn-md">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add New Book
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-gutter mb-8 stagger-children">
        <StatCard icon="menu_book" label="Total Books" value="1,250" accentColor="brass" />
        <StatCard icon="check_circle" label="Available" value="840" accentColor="green" />
        <StatCard icon="swap_horiz" label="Borrowed" value="320" trendValue="+12%" trend="up" accentColor="blue" />
        <StatCard icon="warning" label="Overdue" value="45" trendValue="-5%" trend="down" accentColor="red" />
        <StatCard icon="groups" label="Readers" value="500" accentColor="amber" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-8">
        {/* Bar Chart */}
        <div className="lg:col-span-2 v-card p-card flex flex-col h-[420px]">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="section-title">Monthly Trends</h3>
              <p className="text-body-sm text-ink-300 font-sans mt-0.5">Borrowing vs returning over 6 months</p>
            </div>
            <select className="v-select !w-auto !py-1.5 text-body-sm">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#7A6E5D', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#7A6E5D', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="borrowed" fill="#C8A24A" radius={[4, 4, 0, 0]} name="Borrowed" />
                <Bar dataKey="returned" fill="#2D1F15" radius={[4, 4, 0, 0]} name="Returned" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-3 pt-3 border-t border-warm-border-light">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-brass-500" />
              <span className="text-body-xs text-ink-300 font-sans">Borrowed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-wood-700" />
              <span className="text-body-xs text-ink-300 font-sans">Returned</span>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="v-card p-card flex flex-col h-[420px]">
          <h3 className="section-title mb-1">Books by Category</h3>
          <p className="text-body-sm text-ink-300 font-sans mb-4">Collection distribution</p>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mb-3">
            <span className="font-serif text-display-md text-wood-800">1.2k</span>
            <span className="block text-label-caps text-ink-300 mt-0.5">TOTAL BOOKS</span>
          </div>
          <div className="space-y-2.5">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-body-sm text-ink-400 font-sans">{item.name}</span>
                </div>
                <span className="text-body-sm text-wood-700 font-semibold font-sans">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-gutter">
        {/* Recent Activity Table */}
        <div className="lg:col-span-3 v-card overflow-hidden">
          <div className="p-card border-b border-warm-border flex justify-between items-center">
            <h3 className="section-title">Recent Borrowing Activity</h3>
            <a className="text-body-sm text-brass-600 hover:text-brass-700 font-semibold font-sans transition-colors" href="/borrow-return">
              View All →
            </a>
          </div>
          <table className="v-table">
            <thead>
              <tr>
                <th>Reader</th>
                <th>Book</th>
                <th>Date Borrowed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-wood-gradient text-brass-300 flex items-center justify-center font-serif font-bold text-body-xs">
                        {item.initials}
                      </div>
                      <span className="text-label-md text-wood-700 font-sans">{item.reader}</span>
                    </div>
                  </td>
                  <td className="text-ink-400">{item.book}</td>
                  <td className="text-ink-300">{item.date}</td>
                  <td><StatusBadge status={item.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div className="bg-wood-gradient rounded-vintage shadow-elevated p-card flex flex-col justify-between text-parchment-100 relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -right-12 -top-12 w-44 h-44 bg-brass-500 rounded-full opacity-10 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <h3 className="font-serif text-heading-md mb-6 flex items-center gap-2 text-parchment-200">
              <span className="material-symbols-outlined icon-filled text-brass-400 text-[20px]">bolt</span>
              Quick Actions
            </h3>
            <div className="space-y-3">
              {[
                { icon: 'add_circle', label: 'Add New Book', path: '/books' },
                { icon: 'person_add', label: 'Register Reader', path: '/readers' },
                { icon: 'how_to_reg', label: 'Issue Book', path: '/borrow-return' },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.path}
                  className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10
                    rounded-vintage-sm border border-white/5 transition-all duration-200 group"
                >
                  <span className="material-symbols-outlined text-brass-400 group-hover:scale-110 transition-transform text-[20px]">
                    {action.icon}
                  </span>
                  <span className="text-label-md text-parchment-200 font-sans">{action.label}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 relative z-10">
            <p className="text-body-xs text-parchment-500/50 font-sans mb-1">Need help?</p>
            <a className="text-label-md text-brass-400 hover:text-brass-300 font-sans flex items-center gap-1 transition-colors" href="#">
              View Documentation
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
