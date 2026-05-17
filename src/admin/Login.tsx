import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Shield, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function Login() {
  const { session, signIn, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && session) {
    return <Navigate to="/admin" replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#030509] text-white font-sans flex items-center justify-center p-4">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-sm bg-[#0d121b] border border-white/5 rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex items-center gap-2 font-black text-xl tracking-wider mb-2">
          <Shield className="w-6 h-6 text-cyan-400" />
          <span>VPN <span className="text-cyan-400">FREE</span></span>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-8">
          Painel de Administração
        </p>

        <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[#161c26] border border-white/10 rounded-lg px-4 py-3 text-sm mb-4 focus:outline-none focus:border-cyan-400/50"
          placeholder="admin@dominio.com"
        />

        <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">
          Palavra-passe
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-[#161c26] border border-white/10 rounded-lg px-4 py-3 text-sm mb-6 focus:outline-none focus:border-cyan-400/50"
          placeholder="••••••••"
        />

        {error && (
          <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-cyan-400 text-black py-3 rounded-lg font-black text-xs tracking-wider hover:bg-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> A ENTRAR...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" /> ENTRAR
            </>
          )}
        </button>

        <p className="text-[10px] text-gray-600 mt-6 leading-relaxed">
          Cria um utilizador admin no Supabase Dashboard (Authentication → Users → Add user)
          e usa essas credenciais aqui.
        </p>
      </form>
    </div>
  );
}
