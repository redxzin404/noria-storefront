import Link from 'next/link';
import { ArrowRight, Sparkles, Truck, ShieldCheck, HeartHandshake } from 'lucide-react';

import { StoreExperience } from '@/components/experience/StoreExperience';
import { ProductCard } from '@/components/products/ProductCard';
import { getCategories, getFeaturedProducts, getLatestProducts, getStoreSettings } from '@/lib/store';

export default async function StoreHomePage() {
  const [settings, categories, featured, latest] = await Promise.all([
    getStoreSettings(),
    getCategories(),
    getFeaturedProducts(),
    getLatestProducts(),
  ]);

  return (
    <div>
      <section className="border-b border-[#E7E3DC] bg-[#F7F4EF]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[1.1fr_0.9fr] md:px-8 lg:px-12">
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.24em] text-[#656C57]">{settings?.topMessage ?? 'Design e funcionalidade para o seu dia a dia.'}</p>
            <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-[#292A24] md:text-6xl">
              Um lar com a sua essência.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-[#4A4D46]">
              Peças e detalhes que tornam cada espaço mais seu.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/catalog" className="inline-flex items-center gap-2 rounded-full bg-[#292A24] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#3b3b35]">
                Explorar coleção <ArrowRight size={16} />
              </Link>
              <Link href="/about" className="inline-flex items-center gap-2 rounded-full border border-[#292A24]/20 bg-white/70 px-6 py-3 text-sm font-medium text-[#292A24] transition hover:bg-white">
                Conhecer a NÓRIA
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-[#E7E3DC] bg-[#E7E3DC]">
            <img
              src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
              alt="Ambiente acolhedor em casa"
              className="h-full min-h-[420px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 lg:px-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-[#656C57]">Categorias</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#292A24]">Crie um ambiente que agrade o olhar e o cotidiano.</h2>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          {categories.map((category) => (
            <Link key={category.id} href={`/catalog?category=${category.slug}`} className="group overflow-hidden rounded-[1.5rem] border border-[#E7E3DC] bg-white">
              <div className="h-52 overflow-hidden bg-[#E7E3DC]">
                <img
                  src={category.image ?? 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80'}
                  alt={category.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-medium text-[#292A24]">{category.name}</h3>
                <p className="mt-2 text-sm text-[#5D5F5A]">{category.description ?? 'Peças pensadas para o seu ritmo.'}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#E7E3DC] py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-[#656C57]">Produtos em destaque</p>
              <h2 className="mt-2 text-3xl font-semibold text-[#292A24]">Peças que fazem a casa respirar.</h2>
            </div>
            <Link href="/catalog" className="text-sm font-medium text-[#292A24] underline decoration-[#656C57] underline-offset-4">
              Ver catálogo completo
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 lg:px-12">
        <div className="overflow-hidden rounded-[2rem] border border-[#E7E3DC] bg-[#F1EFE9] shadow-[0_20px_45px_rgba(41,42,36,0.05)] lg:grid lg:grid-cols-[1.2fr_0.8fr]">
          <div className="bg-[#F7F4EF] p-8 md:p-10">
            <p className="text-sm uppercase tracking-[0.22em] text-[#656C57]">Novidades</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#292A24]">Uma seleção de olhar cuidadoso para cada ambiente.</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#4A4D46]">
              Descubra objetos com proporção, materiais naturais e presença discreta. Tudo pensado para habitar o cotidiano com conforto e beleza.
            </p>
          </div>
          <div className="relative min-h-[300px]">
            <img
              src="https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1000&q=80"
              alt="Editorial de decoração"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <StoreExperience />

      <section className="bg-[#292A24] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
          <div className="mb-6 text-center">
            <p className="text-sm uppercase tracking-[0.22em] text-[#B8A58C]">A NÓRIA em detalhes</p>
            <h2 className="mt-2 text-3xl font-semibold">Foco em bem-estar e funcionalidade.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              { icon: Sparkles, title: 'Design pensado', text: 'Peças com estética contemporânea e uso prático no dia a dia.' },
              { icon: Truck, title: 'Entrega transparente', text: 'Estime prazo e acompanhe o pedido com informações reais.' },
              { icon: ShieldCheck, title: 'Qualidade e cuidado', text: 'Materiais selecionados com atenção ao conforto e à durabilidade.' },
              { icon: HeartHandshake, title: 'Atendimento humano', text: 'Suporte dedicado para ajudar na escolha e no pós-venda.' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
                <div className="mb-5 inline-flex rounded-full bg-[#B8A58C] p-3 text-[#292A24]">
                  <Icon size={18} />
                </div>
                <h3 className="text-xl font-medium">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/70">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 lg:px-12">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.22em] text-[#656C57]">Novidades</p>
          <h2 className="mt-2 text-3xl font-semibold text-[#292A24]">Últimas adições</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {latest.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
