'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    };

    setLoading(true);
    setError('');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? 'Não foi possível entrar.');
      return;
    }

    router.push('/account');
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 md:px-8">
      <div className="rounded-[2rem] border border-[#E7E3DC] bg-white p-8 shadow-[0_20px_45px_rgba(41,42,36,0.05)]">
        <p className="text-sm uppercase tracking-[0.2em] text-[#656C57]">Minha conta</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#292A24]">Entrar</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input name="email" type="email" placeholder="E-mail" className="w-full rounded-xl border border-[#E7E3DC] px-4 py-3 outline-none" required />
          <input name="password" type="password" placeholder="Senha" className="w-full rounded-xl border border-[#E7E3DC] px-4 py-3 outline-none" required />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-[#292A24] px-5 py-3 text-sm font-medium text-white disabled:opacity-60">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="mt-5 text-sm text-[#4A4D46]">
          Ainda não tem conta? <Link href="/signup" className="font-medium text-[#292A24] underline">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
