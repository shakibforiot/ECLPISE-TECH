import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, Loader2, ChevronRight, Shield, Zap, Cpu } from 'lucide-react';
import { toast } from 'react-hot-toast';
import EclipseLogo from '../../components/EclipseLogo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('All fields required');
      return;
    }
    try {
      setLoading(true);
      await login(email, password);
      toast.success('Access granted');
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 text-purple-50">
      {/* LEFT — cinematic brand panel */}
      <section className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 border-r border-purple-500/15">
        <div className="absolute inset-0 et-grid-bg opacity-30" style={{
          maskImage: 'radial-gradient(ellipse at 30% 40%, #000, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 30% 40%, #000, transparent 70%)',
        }} />
        <div
          className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.45), transparent 65%)', filter: 'blur(40px)' }}
        />
        <div
          className="absolute -bottom-40 right-0 h-[420px] w-[420px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.40), transparent 65%)', filter: 'blur(50px)' }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <EclipseLogo size={44} withWordmark />
          <span className="ml-auto et-chip">SECURE GATEWAY</span>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <EclipseLogo size={260} />
          <h1 className="mt-10 font-display text-5xl xl:text-6xl font-black tracking-[0.12em] chrome-text leading-none">
            INITIATE
          </h1>
          <h2 className="mt-2 font-display text-5xl xl:text-6xl font-black tracking-[0.12em] violet-text leading-none">
            SEQUENCE
          </h2>
          <p className="mt-6 max-w-md font-tech text-purple-200/70 text-lg leading-relaxed">
            A next-generation studio for logo systems, AR filters and digital arsenals.
            Engineered in the dark. Deployed at light-speed.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3 w-full max-w-md">
            {[
              { icon: Shield, label: 'Encrypted' },
              { icon: Zap, label: 'Realtime' },
              { icon: Cpu, label: 'AI-Ready' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="et-card et-corners px-3 py-4 flex flex-col items-center gap-2">
                <Icon className="h-5 w-5 text-purple-300" />
                <span className="font-tech text-[10px] tracking-[0.25em] uppercase text-purple-200/80">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between font-tech text-[10px] tracking-[0.3em] uppercase text-purple-300/50">
          <span>// ECLIPSE.SYS</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 et-pulse-dot" />
            LINK STABLE
          </span>
          <span>© 2026</span>
        </div>
      </section>

      {/* RIGHT — form */}
      <section className="relative flex items-center justify-center p-6 sm:p-10">
        {/* mobile brand mark */}
        <div className="lg:hidden absolute top-6 left-6">
          <EclipseLogo size={40} withWordmark />
        </div>

        <div className="w-full max-w-md et-card et-corners p-8 sm:p-10 et-rise">
          <div className="mb-8">
            <span className="et-chip mb-4">AUTH / LOGIN</span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-black chrome-text font-display tracking-wider">
              WELCOME BACK
            </h1>
            <p className="mt-2 font-tech text-purple-200/60 text-sm tracking-wide">
              Authenticate to access your console.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="w-full pl-12 pr-4 py-4 bg-purple-500/[0.06] border border-purple-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/70 focus:border-transparent transition-all text-purple-50 placeholder:text-purple-300/30 font-tech"
                  required
                />
              </div>
            </div>

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
                  placeholder="••••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-purple-500/[0.06] border border-purple-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/70 focus:border-transparent transition-all text-purple-50 placeholder:text-purple-300/30 font-tech"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400/70 hover:text-purple-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between font-tech text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-purple-200/70">
                <input type="checkbox" className="w-4 h-4 rounded border-purple-500/40 bg-purple-500/10 text-purple-500 focus:ring-purple-400/70" />
                Remember device
              </label>
              <Link to="#" className="text-purple-300 hover:text-white tracking-wide">
                Recover access
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-4 rounded-xl font-display font-bold tracking-[0.2em] text-white text-sm overflow-hidden disabled:opacity-60"
              style={{
                background: 'linear-gradient(90deg, #6d28d9, #a855f7, #6d28d9)',
                backgroundSize: '200% 100%',
                boxShadow: '0 10px 30px -10px rgba(124,58,237,0.8), inset 0 1px 0 rgba(255,255,255,0.25)',
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    AUTHENTICATING
                  </>
                ) : (
                  <>
                    ENTER SYSTEM
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)', transform: 'translateX(-100%)', animation: 'none' }}
              />
            </button>
          </form>

          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
            <span className="font-tech text-[10px] tracking-[0.3em] uppercase text-purple-300/50">or</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button className="py-3 bg-purple-500/[0.06] hover:bg-purple-500/15 border border-purple-500/20 rounded-xl font-tech text-sm text-purple-100 flex items-center justify-center gap-2 transition-colors">
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#c084fc" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#a855f7" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#d8b4fe" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#7c3aed" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button className="py-3 bg-purple-500/[0.06] hover:bg-purple-500/15 border border-purple-500/20 rounded-xl font-tech text-sm text-purple-100 flex items-center justify-center gap-2 transition-colors">
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#c084fc" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              Apple
            </button>
          </div>

          <div className="mt-8 text-center font-tech text-sm text-purple-200/60">
            No clearance yet?{' '}
            <Link to="/register" className="text-purple-300 hover:text-white font-semibold tracking-wide">
              Request Access →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
