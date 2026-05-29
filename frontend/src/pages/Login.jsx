import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useToast } from '../contexts/ToastContext';

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      try {
        const response = await authService.login(formData.email, formData.password);
        if (response.data && response.data.success) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          toast.success(`Welcome back, ${response.data.user.name}!`);
          navigate('/dashboard');
        }
      } catch (apiError) {
        console.warn("API login failed, checking fallback:", apiError);

        const emailLower = formData.email.toLowerCase();
        
        // Default admin demo account (Root Admin)
        if (emailLower === 'admin@university.edu' && formData.password === 'admin123') {
          localStorage.setItem('token', 'demo-jwt-token');
          localStorage.setItem('user', JSON.stringify({
            id: 1,
            name: 'Admin Profile',
            email: 'admin@university.edu',
            role: 'admin'
          }));
          toast.success("Access granted as Administrator (Demo Mode).");
          navigate('/dashboard');
          return;
        }

        // Check custom locally registered users (e.g. librarians/staff created by admin)
        const localUsers = JSON.parse(localStorage.getItem('smartlib_demo_users') || '[]');
        const match = localUsers.find(
          u => u.email.toLowerCase() === emailLower && u.password === formData.password
        );

        if (match) {
          localStorage.setItem('token', 'demo-jwt-token');
          localStorage.setItem('user', JSON.stringify({
            id: match.id,
            name: match.name,
            email: match.email,
            role: match.role
          }));
          toast.success(`Logged in as ${match.name} (${match.role === 'admin' ? 'Admin' : 'Librarian'} Demo Mode).`);
          navigate('/dashboard');
          return;
        }

        throw new Error(apiError.response?.data?.message || 'Invalid email or password credentials.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
      toast.error(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  return (
    <main className="w-full min-h-screen flex bg-parchment-100">
      {/* ── Left: Vintage Hero ── */}
      <section className="hidden lg:flex lg:w-3/5 relative items-center justify-center overflow-hidden">
        {/* Background Image */}
        <img
          alt="Library Background"
          className="absolute inset-0 w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80"
        />
        {/* Dark wood overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-wood-950/90 via-wood-900/85 to-wood-800/80 z-10" />

        {/* Content */}
        <div className="relative z-20 px-16 py-20 max-w-xl text-center">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-brass-gradient rounded-vintage shadow-brass mb-8">
            <span className="material-symbols-outlined icon-filled text-wood-900 text-[40px]">local_library</span>
          </div>

          <h1 className="font-serif text-display-xl text-parchment-100 mb-4 leading-tight">
            Empowering Academic Discovery
          </h1>

          {/* Ornament */}
          <div className="ornament-divider mb-6">
            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
          </div>

          <p className="text-body-lg text-parchment-400/80 font-sans leading-relaxed mb-10">
            Index resources, manage member records, and track borrowing ledger with our vintage academic administration hub.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { value: '50K+', label: 'Volumes' },
              { value: '12K+', label: 'Readers' },
              { value: '98%', label: 'Efficiency' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-serif text-display-md text-brass-400">{stat.value}</p>
                <p className="text-body-xs text-parchment-500/50 uppercase tracking-widest font-sans">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom attribution */}
        <p className="absolute bottom-6 left-0 right-0 text-center text-body-xs text-parchment-500/30 font-sans z-20">
          © 2026 Smart Library - International School
        </p>
      </section>

      {/* ── Right: Auth Panel ── */}
      <section className="w-full lg:w-2/5 flex items-center justify-center p-8 sm:p-12 bg-parchment-50">
        <div className="w-full max-w-sm animate-fade-in-up">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-10 h-10 bg-brass-gradient rounded-vintage-sm flex items-center justify-center shadow-brass">
              <span className="material-symbols-outlined icon-filled text-wood-900 text-[22px]">local_library</span>
            </div>
            <span className="font-serif text-heading-lg text-wood-800">SmartLib</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="font-serif text-display-lg text-wood-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-body-md text-ink-300 font-sans">
              Sign in to access the library management system
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 text-v-error rounded-vintage-sm text-body-sm font-sans flex items-center gap-2 ring-1 ring-v-error/20 animate-fade-in">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="v-label" htmlFor="email">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300 text-[18px]">mail</span>
                <input
                  className="v-input pl-11"
                  id="email"
                  placeholder="admin@university.edu"
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="v-label" htmlFor="password">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300 text-[18px]">lock</span>
                <input
                  className="v-input pl-11 pr-11"
                  id="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-wood-700 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-warm-border text-brass-600 focus:ring-brass-400 cursor-pointer accent-brass-600"
                />
                <span className="text-body-sm text-ink-400 font-sans">Remember me</span>
              </label>
              <button 
                type="button"
                onClick={() => toast.info('Password recovery instructions are not configured for this demo.')}
                className="text-body-sm text-brass-600 hover:text-brass-700 font-semibold font-sans transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-brass btn-lg w-full"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer Help */}
          <div className="mt-8">
            <div className="ornament-divider mb-4">
              <span className="text-body-xs text-ink-300 font-sans">Need help?</span>
            </div>
            <p className="text-center text-body-sm text-ink-300 font-sans">
              Contact{' '}
              <button 
                onClick={() => toast.info('Please reach out to the Systems Administrator.')}
                className="text-brass-600 hover:underline font-semibold"
              >
                IT Support
              </button>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
