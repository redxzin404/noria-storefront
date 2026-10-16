'use client';

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-[#656C57]">Erro</p>
      <h1 className="mt-3 text-4xl font-semibold text-[#292A24]">Algo saiu do lugar.</h1>
      <button onClick={() => reset()} className="mt-6 inline-flex rounded-full bg-[#292A24] px-6 py-3 text-sm font-medium text-white">
        Tentar novamente
      </button>
    </div>
  );
}
