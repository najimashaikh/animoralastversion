import { type FormEvent, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, LoaderCircle } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { authSignIn, authSignUp, type AppUser } from '@/lib/supabase';

type AuthPageProps = {
  mode: 'login' | 'signup';
  admin?: boolean;
};

export default function AuthPage({ mode, admin = false }: AuthPageProps) {
  const [, navigate] = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === 'signup';
  const title = admin ? 'ADMIN / LOGIN' : isSignup ? 'JOIN THE LIBRARY' : 'WELCOME BACK';
  const subtitle = admin
    ? 'Use an administrator account to access the studio dashboard.'
    : isSignup
      ? 'Create a secure account to keep your work connected to the library.'
      : 'Sign in to continue your studio practice.';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const user: AppUser = isSignup
        ? await authSignUp(name, email, password)
        : await authSignIn(email, password);

      if (admin && user.role !== 'admin') {
        throw new Error('This account does not have administrator access.');
      }
      navigate(admin ? '/admin/dashboard' : '/');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to connect to the library.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grain flex min-h-screen items-center justify-center bg-[#172520] px-5 py-10 text-[#eff0dc]">
      <div className="line-grid pointer-events-none fixed inset-0 opacity-40" />
      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#51665a] bg-[#1e3028] shadow-2xl shadow-black/40 md:grid-cols-[.9fr_1.1fr]">
        <div className="hidden min-h-[590px] flex-col justify-between bg-[#c3e12c] p-9 text-[#172520] md:flex">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 font-mono-custom text-[10px] font-bold uppercase tracking-[.18em]"><ArrowLeft size={14} /> Back to library</Link>
            <p className="mt-20 font-mono-custom text-[10px] uppercase tracking-[.24em]">ANIMORA / STUDIO</p>
            <h1 className="mt-5 max-w-sm font-display text-7xl font-semibold leading-[.84] tracking-[-.08em]">MAKE THE NEXT FRAME.</h1>
          </div>
          <p className="max-w-xs text-sm leading-6 text-[#455117]">A considered learning space for 2D animation, 3D animation and visual effects.</p>
        </div>

        <div className="p-6 sm:p-10 md:p-14">
          <Link href="/" className="inline-flex items-center gap-2 font-mono-custom text-[10px] font-bold uppercase tracking-[.18em] text-[#c3e12c] md:hidden"><ArrowLeft size={14} /> Back to library</Link>
          <div className="mt-10 md:mt-0">
            <p className="font-mono-custom text-[10px] uppercase tracking-[.25em] text-[#c3e12c]">{title}</p>
            <h2 className="mt-4 font-display text-5xl font-semibold leading-[.9] tracking-[-.07em]">{admin ? 'Open the studio dashboard.' : isSignup ? 'Start with a clear direction.' : 'Keep moving forward.'}</h2>
            <p className="mt-5 max-w-sm text-sm leading-6 text-[#aab5a8]">{subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-9 space-y-5">
            {isSignup && <label className="block"><span className="font-mono-custom text-[10px] uppercase tracking-[.16em] text-[#aab5a8]">Name</span><input data-testid="input-auth-name" required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className="mt-2 w-full border-b border-[#52665b] bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-[#c3e12c]" /></label>}
            <label className="block"><span className="font-mono-custom text-[10px] uppercase tracking-[.16em] text-[#aab5a8]">Email</span><input data-testid="input-auth-email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="mt-2 w-full border-b border-[#52665b] bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-[#c3e12c]" /></label>
            <label className="block"><span className="font-mono-custom text-[10px] uppercase tracking-[.16em] text-[#aab5a8]">Password</span><input data-testid="input-auth-password" required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isSignup ? 'new-password' : 'current-password'} className="mt-2 w-full border-b border-[#52665b] bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-[#c3e12c]" /></label>
            {error && <p role="alert" className="rounded-xl border border-[#d17d69]/50 bg-[#5c332c] px-4 py-3 text-sm leading-5 text-[#ffd7cc]">{error}</p>}
            <button data-testid="button-auth-submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-3 rounded-full bg-[#c3e12c] px-5 py-4 text-xs font-bold uppercase tracking-[.12em] text-[#172520] transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60">
              {isSubmitting ? <LoaderCircle className="animate-spin" size={16} /> : <>{isSignup ? 'Create account' : admin ? 'Enter dashboard' : 'Log in'} <ArrowRight size={15} /></>}
            </button>
          </form>

          <div className="mt-7 flex items-center gap-2 text-xs text-[#aab5a8]">
            <Check size={14} className="text-[#c3e12c]" />
            <span>{isSignup ? 'Your password is stored securely.' : 'Your session stays active after refresh.'}</span>
          </div>
          {!admin && <p className="mt-7 text-center text-xs text-[#8f9d91]">{isSignup ? 'Already have an account? ' : 'New to Animora? '}<Link href={isSignup ? '/login' : '/signup'} className="font-bold text-[#c3e12c] hover:underline">{isSignup ? 'Log in' : 'Create an account'}</Link></p>}
        </div>
      </section>
    </main>
  );
}