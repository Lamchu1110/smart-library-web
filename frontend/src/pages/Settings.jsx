import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import authService from '../services/authService';

export default function Settings() {
  const [settings, setSettings] = useState({
    libraryName: 'University Central Library & Archives',
    maxBorrowDays: 14,
    maxBooksPerReader: 5,
    overdueFeePerDay: 1.50,
    enableNotifications: true,
    enableAutoReminders: true,
    reminderDaysBefore: 3,
  });

  const toast = useToast();

  // Check logged-in user role
  const userString = localStorage.getItem('user');
  const loggedInUser = userString ? JSON.parse(userString) : null;
  const isAdmin = loggedInUser?.role === 'admin';

  // State for creating new staff accounts (Admin only)
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState('librarian');

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Archival system configuration saved successfully.');
  };

  const handleReset = () => {
    setSettings({
      libraryName: 'University Central Library & Archives',
      maxBorrowDays: 14,
      maxBooksPerReader: 5,
      overdueFeePerDay: 1.50,
      enableNotifications: true,
      enableAutoReminders: true,
      reminderDaysBefore: 3,
    });
    toast.info('System configuration reset to original parchment defaults.');
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffPassword) {
      toast.error('Please fill in all fields to create a staff account.');
      return;
    }
    if (staffPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    try {
      const response = await authService.register({
        name: staffName,
        email: staffEmail,
        password: staffPassword,
        role: staffRole
      });
      if (response.data && response.data.success) {
        toast.success(`Account for "${staffName}" created successfully.`);
        setStaffName('');
        setStaffEmail('');
        setStaffPassword('');
        setStaffRole('librarian');
      }
    } catch (apiError) {
      console.warn("API register failed, saving to local demo registry:", apiError);
      
      const emailLower = staffEmail.toLowerCase();
      if (emailLower === 'admin@university.edu') {
        toast.error('This email address is already registered.');
        return;
      }
      
      const localUsers = JSON.parse(localStorage.getItem('smartlib_demo_users') || '[]');
      if (localUsers.some(u => u.email.toLowerCase() === emailLower)) {
        toast.error('This email address is already registered.');
        return;
      }

      // Add to local mock database
      const newUser = {
        id: localUsers.length + 2,
        name: staffName,
        email: staffEmail,
        password: staffPassword,
        role: staffRole
      };
      localUsers.push(newUser);
      localStorage.setItem('smartlib_demo_users', JSON.stringify(localUsers));

      toast.success(`Staff account "${staffName}" successfully created (Demo Mode).`);
      setStaffName('');
      setStaffEmail('');
      setStaffPassword('');
      setStaffRole('librarian');
    }
  };

  return (
    <div className="max-w-4xl stagger-children space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Registry Configuration</h2>
          <p className="page-subtitle">Configure system parameters, fine scales, and archival preferences.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        <div className="v-card p-6">
          <h3 className="font-serif text-heading-lg text-wood-800 mb-6 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[22px] text-brass-500">tune</span>
            General Parameters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="v-label">Library Archives Name</label>
              <input
                className="v-input font-serif"
                value={settings.libraryName}
                onChange={(e) => setSettings({ ...settings, libraryName: e.target.value })}
                disabled={!isAdmin}
              />
            </div>
            <div>
              <label className="v-label">Max Borrow Duration (Days)</label>
              <input
                className="v-input"
                type="number"
                value={settings.maxBorrowDays}
                onChange={(e) => setSettings({ ...settings, maxBorrowDays: parseInt(e.target.value) || 0 })}
                disabled={!isAdmin}
              />
            </div>
            <div>
              <label className="v-label">Max Volumes Per Reader</label>
              <input
                className="v-input"
                type="number"
                value={settings.maxBooksPerReader}
                onChange={(e) => setSettings({ ...settings, maxBooksPerReader: parseInt(e.target.value) || 0 })}
                disabled={!isAdmin}
              />
            </div>
            <div>
              <label className="v-label">Overdue Fine Scale ($ / day)</label>
              <input
                className="v-input"
                type="number"
                step="0.10"
                value={settings.overdueFeePerDay}
                onChange={(e) => setSettings({ ...settings, overdueFeePerDay: parseFloat(e.target.value) || 0 })}
                disabled={!isAdmin}
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="v-card p-6">
          <h3 className="font-serif text-heading-lg text-wood-800 mb-6 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[22px] text-brass-500">notifications</span>
            Communication Alerts
          </h3>
          <div className="space-y-5">
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="font-serif text-heading-sm text-wood-800">Dispatch Email Alerts</p>
                <p className="text-body-xs text-ink-300 font-sans mt-0.5">Send electronic notifications for overdue items and registration status.</p>
              </div>
              <button
                type="button"
                className={`v-toggle ${settings.enableNotifications ? 'bg-brass-500' : 'bg-ink-200'} ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => isAdmin && setSettings({ ...settings, enableNotifications: !settings.enableNotifications })}
                disabled={!isAdmin}
              >
                <span className={`v-toggle-knob ${settings.enableNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-1 border-t border-warm-border pt-4">
              <div>
                <p className="font-serif text-heading-sm text-wood-800">Auto Reminders</p>
                <p className="text-body-xs text-ink-300 font-sans mt-0.5">Automatically trigger warnings prior to official return deadlines.</p>
              </div>
              <button
                type="button"
                className={`v-toggle ${settings.enableAutoReminders ? 'bg-brass-500' : 'bg-ink-200'} ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => isAdmin && setSettings({ ...settings, enableAutoReminders: !settings.enableAutoReminders })}
                disabled={!isAdmin}
              >
                <span className={`v-toggle-knob ${settings.enableAutoReminders ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {settings.enableAutoReminders && (
              <div className="pt-2 border-t border-warm-border/50 max-w-xs animate-fade-in">
                <label className="v-label">Reminder Threshold (Days Prior)</label>
                <input
                  className="v-input"
                  type="number"
                  value={settings.reminderDaysBefore}
                  onChange={(e) => setSettings({ ...settings, reminderDaysBefore: parseInt(e.target.value) || 1 })}
                  disabled={!isAdmin}
                />
              </div>
            )}
          </div>
        </div>

        {/* Provision Staff Account (ADMIN ONLY) */}
        {isAdmin && (
          <div className="v-card p-6 border-l-4 border-brass-400">
            <h3 className="font-serif text-heading-lg text-wood-800 mb-1 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[22px] text-brass-500">person_add</span>
              Provision Staff Account
            </h3>
            <p className="text-body-xs text-ink-300 mb-6 font-sans">
              Create and authorize a new librarian or assistant staff account. Only system administrators can perform this action.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="v-label">Staff Full Name</label>
                <input
                  className="v-input"
                  type="text"
                  placeholder="e.g. Watson Arthur"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                />
              </div>
              <div>
                <label className="v-label">Email Address</label>
                <input
                  className="v-input"
                  type="email"
                  placeholder="e.g. watson@university.edu"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="v-label">Account Password</label>
                <input
                  className="v-input"
                  type="password"
                  placeholder="At least 6 characters"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="v-label">Account Privilege Role</label>
                <select
                  className="v-select"
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                >
                  <option value="librarian">Librarian (Standard Access)</option>
                  <option value="staff">Staff Assistant</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <button
                type="button"
                onClick={handleCreateStaff}
                className="btn btn-brass btn-md"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Register Staff Account
              </button>
            </div>
          </div>
        )}

        {/* Save Button */}
        {isAdmin && (
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={handleReset}
              className="btn btn-outline btn-md"
            >
              Reset defaults
            </button>
            <button 
              type="submit" 
              className="btn btn-brass btn-md"
            >
              Save preferences
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
