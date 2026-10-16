import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-[#656C57]">404</p>
      <h1 className="mt-3 text-4xl font-semibold text-[#292A24]">Página não encontrada.</h1>
      <p className="mt-4 text-[#4A4D46]">A NÓRIA não localizou esta página no momento.</p>
      <Link href="/" className="mt-6 inline-flex rounded-full bg-[#292A24] px-6 py-3 text-sm font-medium text-white">
        Voltar ao início
      </Link>
    </div>
  );
}
