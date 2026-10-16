import Link from 'next/link';

export default function FavoritesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 text-center md:px-8 lg:px-12">
      <h1 className="text-4xl font-semibold text-[#292A24]">Favoritos</h1>
      <p className="mt-4 text-[#4A4D46]">Sua lista de desejos ainda está sendo organizada. Faça login para salvar favoritos e revisitar peças preferidas.</p>
      <Link href="/catalog" className="mt-6 inline-flex rounded-full bg-[#292A24] px-6 py-3 text-sm font-medium text-white">
        Explorar catálogo
      </Link>
    </div>
  );
}
