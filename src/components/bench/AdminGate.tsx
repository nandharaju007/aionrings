import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';

/** Password sign-in + server-side admin role check (has_role), shared by /bench pages. */
export function AdminGate({ title, children }: { title: string; children: ReactNode }) {
  const [state, setState] = useState<'loading' | 'out' | 'denied' | 'ok'>('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const check = async (userId?: string) => {
      if (!userId) return setState('out');
      const { data } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
      setState(data === true ? 'ok' : 'denied');
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => { setTimeout(() => check(s?.user?.id), 0); });
    supabase.auth.getSession().then(({ data }) => check(data.session?.user?.id));
    return () => subscription.unsubscribe();
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title={`${title} · aiOn`} description="Internal sizing accuracy tools." noindex />
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-28 text-base sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-light">{title}</h1>
          {state === 'ok' && (
            <nav className="flex gap-2" aria-label="Bench pages">
              <Button asChild variant="outline" className="h-11"><Link to="/bench">Test bench</Link></Button>
              <Button asChild variant="outline" className="h-11"><Link to="/bench/sources">Data sources</Link></Button>
              <Button variant="ghost" className="h-11" onClick={() => supabase.auth.signOut()}>Sign out</Button>
            </nav>
          )}
        </div>
        {state === 'loading' && <p>Loading…</p>}
        {state === 'denied' && <p role="alert">This account is not an admin.</p>}
        {state === 'out' && (
          <form onSubmit={login} className="max-w-sm space-y-4">
            <div><Label htmlFor="bench-email">Email</Label><Input id="bench-email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 h-11 text-base" /></div>
            <div><Label htmlFor="bench-pass">Password</Label><Input id="bench-pass" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 h-11 text-base" /></div>
            {error && <p role="alert" className="text-destructive">{error}</p>}
            <Button type="submit" className="h-11 w-full">Sign in</Button>
          </form>
        )}
        {state === 'ok' && children}
      </main>
      <Footer />
    </div>
  );
}
