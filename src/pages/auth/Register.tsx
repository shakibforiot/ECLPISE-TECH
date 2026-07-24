import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Loader2, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import EclipseLogo from '../../components/EclipseLogo';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !displayName) {
      toast.error('All fields required');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passcodes do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Passcode must be 6+ characters');
      return;
    }
    try {
      setLoading(true);
      await signup(email, password, displayName);
      toast.success('Operator registered');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 text-purple-50">
      {/* LEFT — cinematic brand */}
      <section className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 border-r border-purple-500/15">
        <div className="absolute inset-0 et-grid-bg opacity-30" style={{
          maskImage: 'radial-gradient(ellipse at 70% 60%, #000, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 70% 60%, #000, transparent 70%)',
        }} />
        <div
          className="absolute -top-40 right-0 h-[480px] w-[480px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.45), transparent 65%)', filter: 'blur(40px)' }}
        />
        <div
          className="absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.40), transparent 65%)', filter: 'blur(50px)' }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <EclipseLogo size={44} withWordmark />
          <span className="ml-auto et-chip">NEW OPERATOR</span>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <EclipseLogo size={240} />
          <h1 className="mt-10 font-display text-5xl xl:text-6xl font-black tracking-[0.12em] chrome-text leading-none">
            JOIN THE
          </h1>
          <h2 className="mt-2 font-display text-5xl xl:text-6xl font-black tracking-[0.12em] violet-text leading-none">
            ECLIPSE
          </h2>
          <p className="mt-6 max-w-md font-tech text-purple-200/70 text-lg leading-relaxed">
            Provision your operator profile and unlock the full Eclipse Tech arsenal —
            logos, AR filters, brand systems and beyond.
          </p>

          <div className="mt-10 w-full max-w-md space-y-3 text-left">
            {[
              'Realtime collaborative console',
              'Access to exclusive drops & arsenals',
              'Priority channel & encrypted sync',
            ].map((line, i) => (
              <div key={i} className="et-card px-4 py-3 flex items-center gap-3">
                <span className="font-display text-purple-300 text-xs">0{i + 1}</span>
                <span className="font-tech text-sm text-purple-100/90 tracking-wide">{line}</span>
                <ChevronRight className="h-4 w-4 text-purple-300/60 ml-auto" />
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between font-tech text-[10px] tracking-[0.3em] uppercase text-purple-300/50">
          <span>// REG.PROTOCOL</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 et-pulse-dot" />
            CHANNEL OPEN
          </span>
          <span>© 2026</span>
        </div>
      </section>

      {/* RIGHT — form */}
      <section className="relative flex items-center justify-center p-6 sm:p-10 py-16">
        <div className="lg:hidden absolute top-6 left-6">
          <EclipseLogo size={40} withWordmark />
        </div>

        <div className="w-full max-w-md et-card et-corners p-8 sm:p-10 et-rise">
          <div className="mb-8">
            <span className="et-chip mb-4">AUTH / REGISTER</span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-black chrome-text font-display tracking-wider">
              CREATE PROFILE
            </h1>
            <p className="mt-2 font-tech text-purple-200/60 text-sm tracking-wide">
              Establish your identity in the Eclipse network.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-tech text-[10px] tracking-[0.3em] uppercase text-purple-300/70 mb-2">
                // Callsign
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400/70" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your operator name"
                  className="w-full pl-12 pr-4 py-3.5 bg-purple-500/[0.06] border border-purple-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/70 focus:border-transparent transition-all text-purple-50 placeholder:text-purple-300/30 font-tech"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-tech text-[10px] tracking-[0.3em] uppercase text-purple-300/70 mb-2">
                // Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400/70" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@eclipse.tech"
                  className="w-full pl-12 pr-4 py-3.5 bg-purple-500/[0.06] border border-purple-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/70 focus:border-transparent transition-all text-purple-50 placeholder:text-purple-300/30 font-tech"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-tech text-[10px] tracking-[0.3em] uppercase text-purple-300/70 mb-2">
                  // Passcode
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400/70" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-10 py-3.5 bg-purple-500/[0.06] border border-purple-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/70 focus:border-transparent transition-all text-purple-50 placeholder:text-purple-300/30 font-tech"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400/70 hover:text-purple-200">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-tech text-[10px] tracking-[0.3em] uppercase text-purple-300/70 mb-2">
                  // Confirm
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400/70" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-10 py-3.5 bg-purple-500/[0.06] border border-purple-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/70 focus:border-transparent transition-all text-purple-50 placeholder:text-purple-300/30 font-tech"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400/70 hover:text-purple-200">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer font-tech text-xs text-purple-200/70">
              <input type="checkbox" className="w-4 h-4 mt-0.5 rounded border-purple-500/40 bg-purple-500/10 text-purple-500 focus:ring-purple-400/70" />
              <span>I accept the Eclipse Tech <Link to="#" className="text-purple-300 hover:text-white">protocols</Link> and <Link to="#" className="text-purple-300 hover:text-white">privacy charter</Link>.</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-4 rounded-xl font-display font-bold tracking-[0.2em] text-white text-sm overflow-hidden disabled:opacity-60"
              style={{
                background: 'linear-gradient(90deg, #6d28d9, #a855f7, #6d28d9)',
                boxShadow: '0 10px 30px -10px rgba(124,58,237,0.8), inset 0 1px 0 rgba(255,255,255,0.25)',
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    PROVISIONING
                  </>
                ) : (
                  <>
                    INITIALIZE PROFILE
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-6 text-center font-tech text-sm text-purple-200/60">
            Already enlisted?{' '}
            <Link to="/login" className="text-purple-300 hover:text-white font-semibold tracking-wide">
              Sign In →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
