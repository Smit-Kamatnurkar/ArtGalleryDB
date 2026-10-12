import React, { useEffect, useState } from 'react';
import { api, HealthInfo } from '../../services/api';

interface SignInScreenProps {
  onSignInSuccess: (user: {
    id: number;
    email: string;
    name: string;
    role: 'ADMIN' | 'USER';
  }) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const DEMO_ACCOUNTS = [
  { label: 'Dr. Vance (Admin)', email: 'admin@artgallery.edu', password: 'admin123', role: 'vance' as const },
  { label: 'Student (Lab)', email: 'student@artgallery.edu', password: 'student123', role: 'student' as const },
];

export const SignInScreen: React.FC<SignInScreenProps> = ({
  onSignInSuccess,
  onShowToast
}) => {
  const [username, setUsername] = useState(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS[0].password);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'vance' | 'student'>('vance');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthInfo | null>(null);

  useEffect(() => {
    api.health()
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  const handleSelectRole = (role: 'vance' | 'student') => {
    setSelectedRole(role);
    setFormError(null);
    const account = DEMO_ACCOUNTS.find((a) => a.role === role);
    if (account) {
      setUsername(account.email);
      setPassword(account.password);
      onShowToast(
        `Loaded ${role === 'vance' ? 'Administrator' : 'Lab Student'} seed credentials`,
        'info'
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      const user = await api.auth.login(username.trim(), password);
      onShowToast(
        user.role === 'ADMIN'
          ? 'Authenticated with ADMIN grants to artgallery_db'
          : 'Authenticated with READ_ONLY lab role',
        'success'
      );
      onSignInSuccess(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-in failed';
      setFormError(message);
      onShowToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dbUp = health?.status === 'UP';

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#9e3825] selection:text-white bg-[#faf9f6]">
      {/* Top Micro Header for academic DBMS workspace status */}
      <header className="w-full border-b border-[#e9e8e5] bg-white/90 backdrop-blur px-8 py-3 flex items-center justify-between text-xs text-[#57423e]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-mono text-[11px] bg-[#f4f3f1] px-2.5 py-1 rounded border border-[#e5e4e0]">
            <span className={`w-2 h-2 rounded-full ${dbUp ? 'bg-[#2e6a4f] animate-pulse' : 'bg-[#ba1a1a]'}`}></span>
            <span className="text-[#1f2421] font-semibold">PostgreSQL 16 Database</span>
            <span className="text-[#8c928e]">| artgallery_db : 5432</span>
          </div>
          <span className="hidden md:inline-block text-[#a0a5a2]">•</span>
          <span className="hidden md:inline-block font-mono text-[11px] text-[#57423e]">
            Type-4 Thin JDBC Ready (pgJDBC)
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#8c928e]">Session Cookie</span>
            <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#eaf2ec] text-[#2e6a4f] border border-[#2e6a4f]/20">
              HTTPONLY
            </span>
          </div>
          <button
            onClick={() => onShowToast('Installation & setup guide: see README.md in the project root', 'info')}
            className="hover:text-[#9e3825] transition-colors font-medium text-xs cursor-pointer"
          >
            System Documentation
          </button>
        </div>
      </header>

      {/* Main Login Workspace Container */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-10 lg:p-12">
        <div className="w-full max-w-6xl bg-white rounded-2xl border border-[#e5e4e0] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
          {/* Left Column: Branding, Curatorial Visual & Educational Value Prop */}
          <div className="lg:col-span-5 bg-[#fbfaf8] border-b lg:border-b-0 lg:border-r border-[#e8e7e4] p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#9e3825]/5 rounded-full blur-3xl pointer-events-none"></div>

            <div>
              {/* Logo & Brand Header */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#9e3825] text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">account_balance</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-[#1f2421] tracking-tight">ArtGallery</h1>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#fdf2f0] text-[#9e3825] font-semibold border border-[#f2cfc7]">
                      DBMS
                    </span>
                  </div>
                  <p className="text-xs text-[#57423e]">Relational Management & Archival Platform</p>
                </div>
              </div>

              {/* Hero Headline & Description */}
              <div className="space-y-3 mb-6">
                <h2 className="text-2xl font-bold text-[#1f2421] tracking-tight leading-snug">
                  Your Gallery.<br />Your Data. Your Queries.
                </h2>
                <p className="text-sm text-[#57423e] leading-relaxed">
                  Curate high-value artworks, execute declarative SQL assertions, test JDBC Type-4 driver pipelines, and master relational database theory in a unified studio.
                </p>
              </div>

              {/* Visual Artwork Card */}
              <div className="relative rounded-xl border border-[#e4e3df] overflow-hidden shadow-xs bg-white mb-6 group">
                <div className="h-44 w-full overflow-hidden bg-[#eeede9]">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD74XYOm6FsKOKjz0pe2oT6YO_aJa98mZItHH1ztblnuI1zg70sLG0-5qSPiVPyPOCt_qd7QNSGHLY1Lw-vARw2Rdwwtit12fv9AfhyaiqDO0VkcR_PeBak0CEdXEmkQaMJphu6RBIcswjIB4rbjHhih9whT3-XnGXpFiYI30gC2ZnpwFxN5H_QYkW7tGinbAr0IL-_NpVqkMT0ii0aDOfA3ZBeGs2CLHQwP0dqX4MB6wW0639if67o"
                    alt="Minimalist Museum Interior"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>
                <div className="p-3.5 bg-white border-t border-[#eeede9] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#1f2421]">Curatorial Archive #4092</p>
                    <p className="text-[11px] font-mono text-[#8c928e]">Schema: public • {health?.artworks ?? '—'} Artworks</p>
                  </div>
                  <span className="font-mono text-[10px] text-[#9e3825] bg-[#fdf2f0] px-2 py-0.5 rounded border border-[#f2cfc7] font-semibold">
                    {dbUp ? 'LIVE DB' : 'DB OFFLINE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Capability Badges at Bottom */}
            <div className="pt-6 border-t border-[#eeede9] grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-white border border-[#eae9e5]">
                <p className="text-[10px] font-mono uppercase text-[#8c928e]">Dialect</p>
                <p className="text-xs font-semibold text-[#1f2421] mt-0.5">PostgreSQL 16</p>
              </div>
              <div className="p-2 rounded-lg bg-white border border-[#eae9e5]">
                <p className="text-[10px] font-mono uppercase text-[#8c928e]">Drivers</p>
                <p className="text-xs font-semibold text-[#1f2421] mt-0.5">JDBC & ODBC</p>
              </div>
              <div className="p-2 rounded-lg bg-white border border-[#eae9e5]">
                <p className="text-[10px] font-mono uppercase text-[#8c928e]">Integrity</p>
                <p className="text-xs font-semibold text-[#2e6a4f] mt-0.5">ACID Compliant</p>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Form Section */}
          <div className="lg:col-span-7 p-8 lg:p-14 flex flex-col justify-center bg-white">
            <div className="max-w-md w-full mx-auto space-y-7">
              {/* Title & Context */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f4f3f1] border border-[#e4e3df] text-[11px] font-mono text-[#57423e] mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9e3825]"></span>
                  Secure Database Authentication
                </div>
                <h3 className="text-2xl font-bold text-[#1f2421] tracking-tight">Welcome back</h3>
                <p className="text-sm text-[#57423e] mt-1">
                  Credentials are verified against the <span className="font-mono">users</span> table (BCrypt) via the Spring Boot backend.
                </p>
              </div>

              {/* Quick Select Role Selector */}
              <div className="bg-[#faf9f6] p-3 rounded-xl border border-[#e8e7e4] flex items-center justify-between text-xs">
                <span className="text-[#57423e] font-medium">Quick Select Role:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectRole('vance')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                      selectedRole === 'vance'
                        ? 'bg-white border-[#9e3825] text-[#9e3825] font-semibold shadow-2xs'
                        : 'bg-white border-[#dfdeda] text-[#57423e] hover:border-[#9e3825]'
                    }`}
                  >
                    Dr. Vance (Admin)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectRole('student')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                      selectedRole === 'student'
                        ? 'bg-white border-[#9e3825] text-[#9e3825] font-semibold shadow-2xs'
                        : 'bg-white border-[#dfdeda] text-[#57423e] hover:border-[#9e3825]'
                    }`}
                  >
                    Student (Lab)
                  </button>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1f2421]">
                    Staff Email <span className="text-[#9e3825]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setFormError(null);
                      }}
                      placeholder="e.g. admin@artgallery.edu"
                      className="w-full rounded-lg border border-[#d8d7d2] px-3.5 py-2.5 text-sm text-[#1f2421] placeholder-[#a0a5a2] focus:border-[#9e3825] focus:outline-none focus:ring-1 focus:ring-[#9e3825] font-mono transition-colors bg-[#fdfdfc]"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#8c928e]">
                      <span className="material-symbols-outlined text-[18px]">person</span>
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1f2421]">
                    Password <span className="text-[#9e3825]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setFormError(null);
                      }}
                      placeholder="Enter your database passphrase"
                      className="w-full rounded-lg border border-[#d8d7d2] px-3.5 py-2.5 text-sm text-[#1f2421] placeholder-[#a0a5a2] focus:border-[#9e3825] focus:outline-none focus:ring-1 focus:ring-[#9e3825] font-mono transition-colors bg-[#fdfdfc]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8c928e] hover:text-[#1f2421] focus:outline-none cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Inline Validation Error */}
                {formError && (
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#ffdad6] border border-[#ffb4ab] text-[#8c1d18] text-xs font-mono">
                    <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
                    <span>{formError}</span>
                  </div>
                )}

                {/* Remember Me & Grants */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] font-mono text-[#8c928e] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-[#2e6a4f]">
                      verified
                    </span>
                    <span>BCrypt Hash Verification</span>
                  </div>
                  <div className="text-[11px] font-mono text-[#8c928e]">
                    ADMIN: read/write · USER: read-only
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#9e3825] hover:bg-[#822e1e] text-white text-sm font-semibold shadow-xs transition-all focus:ring-2 focus:ring-[#9e3825] cursor-pointer disabled:opacity-70"
                  >
                    <span>{isSubmitting ? 'Verifying credentials...' : 'Sign In to DBMS Workspace'}</span>
                    {!isSubmitting && (
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    )}
                  </button>

                  {/* Seed credential hint (real accounts from database/seed.sql) */}
                  <div className="p-2.5 rounded-lg bg-[#f4f3f1] border border-[#e8e7e4] text-[11px] font-mono text-[#57423e] leading-relaxed">
                    <span className="font-semibold text-[#7e2110]">Seed accounts (dev):</span>{' '}
                    admin@artgallery.edu / admin123 · student@artgallery.edu / student123
                  </div>
                </div>
              </form>

              {/* Footer Links */}
              <div className="pt-4 border-t border-[#eeede9] flex flex-col sm:flex-row items-center justify-between text-xs text-[#57423e] gap-2">
                <p>
                  New to the platform?{' '}
                  <button
                    onClick={() => onShowToast('Accounts are provisioned by the DBMS workspace administrator (see database/seed.sql)', 'info')}
                    className="text-[#9e3825] font-semibold hover:underline cursor-pointer"
                  >
                    Create an account
                  </button>
                </p>
                <div className="flex items-center gap-3 text-[11px] text-[#8c928e]">
                  <span>Privacy</span>
                  <span>•</span>
                  <span>Terms</span>
                  <span>•</span>
                  <span className="font-mono">v1.0-PG</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Desktop Bottom Operational Status Bar */}
      <footer className="w-full border-t border-[#e9e8e5] bg-white px-8 py-2.5 flex items-center justify-between text-xs text-[#8c928e]">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${dbUp ? 'bg-[#2e6a4f]' : 'bg-[#ba1a1a]'}`}></span>
            <span className="font-mono text-[11px] text-[#57423e]">
              {dbUp ? `Connection Ping: ${health?.dbLatencyMs}ms` : 'Database unreachable'}
            </span>
          </span>
          <span className="font-mono text-[11px] hidden sm:inline-block">Listener: PostgreSQL 16 @ localhost:5432</span>
          <span className="font-mono text-[11px] hidden md:inline-block">Isolation: READ COMMITTED</span>
        </div>
        <div className="font-mono text-[11px] text-[#8c928e]">
          Curator SQL Studio © 2025 ArtGallery DBMS
        </div>
      </footer>
    </div>
  );
};
