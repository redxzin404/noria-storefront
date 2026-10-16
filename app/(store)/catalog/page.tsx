import Link from 'next/link';
import { ProductCard } from '@/components/products/ProductCard';
import { getCategories, getCatalogProducts } from '@/lib/store';
import { getRangeFromSearchParams } from '@/lib/utils';

export default async function CatalogPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = searchParams ? await searchParams : {};
  const category = getRangeFromSearchParams(params.category);
  const search = getRangeFromSearchParams(params.search);
  const sort = getRangeFromSearchParams(params.sort) ?? 'newest';
  const minPrice = getRangeFromSearchParams(params.minPrice);
  const maxPrice = getRangeFromSearchParams(params.maxPrice);

  const [categories, result] = await Promise.all([
    getCategories(),
    getCatalogProducts({
      category: category ?? undefined,
      search: search ?? undefined,
      sort,
      minPrice: minPrice ? Number(minPrice) * 100 : undefined,
      maxPrice: maxPrice ? Number(maxPrice) * 100 : undefined,
      page: 1,
      pageSize: 8,
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 lg:px-12">
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-[#656C57]">Catálogo</p>
          <h1 className="mt-2 text-4xl font-semibold text-[#292A24]">Coleção NÓRIA</h1>
        </div>
        <form method="get" className="flex w-full max-w-xl items-center gap-3 rounded-full border border-[#E7E3DC] bg-white p-2">
          <input
            name="search"
            defaultValue={search ?? ''}
            placeholder="Buscar por nome ou essência"
            className="w-full bg-transparent px-4 py-2 text-sm text-[#292A24] outline-none placeholder:text-[#6B6D68]"
          />
          <button type="submit" className="rounded-full bg-[#292A24] px-5 py-2 text-sm font-medium text-white">
            Buscar
          </button>
        </form>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-[1.5rem] border border-[#E7E3DC] bg-white p-5">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#292A24]">Categorias</h2>
            <div className="mt-4 flex flex-col gap-2">
              <Link href="/catalog" className="text-sm text-[#4A4D46] hover:text-[#292A24]">
                Todas
              </Link>
              {categories.map((category) => (
                <Link key={category.id} href={`/catalog?category=${category.slug}`} className="text-sm text-[#4A4D46] hover:text-[#292A24]">
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <form method="get" className="space-y-4">
            <input type="hidden" name="category" value={category ?? ''} />
            <input type="hidden" name="search" value={search ?? ''} />
            <div>
              <label className="mb-2 block text-sm font-medium text-[#292A24]">Faixa de preço</label>
              <div className="space-y-2">
                <input name="minPrice" type="number" defaultValue={minPrice ?? ''} placeholder="Mínimo" className="w-full rounded-xl border border-[#E7E3DC] px-3 py-2 text-sm outline-none" />
                <input name="maxPrice" type="number" defaultValue={maxPrice ?? ''} placeholder="Máximo" className="w-full rounded-xl border border-[#E7E3DC] px-3 py-2 text-sm outline-none" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#292A24]">Ordenar</label>
              <select name="sort" defaultValue={sort} className="w-full rounded-xl border border-[#E7E3DC] px-3 py-2 text-sm outline-none">
                <option value="newest">Mais recentes</option>
                <option value="price_asc">Menor preço</option>
                <option value="price_desc">Maior preço</option>
                <option value="featured">Em destaque</option>
              </select>
            </div>
            <button type="submit" className="w-full rounded-full bg-[#292A24] px-4 py-2.5 text-sm font-medium text-white">
              Aplicar filtros
            </button>
          </form>
        </aside>

        <section>
          {result.items.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {result.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[#C7C1B6] bg-white p-10 text-center">
              <h2 className="text-2xl font-semibold text-[#292A24]">Nenhum resultado encontrado.</h2>
              <p className="mt-3 text-[#4A4D46]">Tente outra busca ou ajuste os filtros.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
