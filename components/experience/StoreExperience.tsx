'use client';

import { useMemo, useState } from 'react';

const spaces = [
  {
    id: 'salas-acolhedoras',
    name: 'Sala acolhedora',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    accent: 'Móveis em madeira + texturas suaves',
    products: [
      { id: 'vaso-ceramica-claro', slug: 'vaso-ceramica-claro', name: 'Vaso de Cerâmica Claro', price: 17900, shortDescription: 'Cerâmica leve e sofisticada.', },
      { id: 'almofada-algodao', slug: 'almofada-algodao', name: 'Almofada de Algodão', price: 12900, shortDescription: 'Conforto para o dia a dia.', },
    ],
  },
  {
    id: 'cozinha-racional',
    name: 'Cozinha funcional',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80',
    accent: 'Organização sem perder o calor',
    products: [
      { id: 'jogo-de-tacas-vidro', slug: 'jogo-de-tacas-vidro', name: 'Jogo de Taças de Vidro', price: 15900, shortDescription: 'Um toque de sofisticação para a mesa.', },
    ],
  },
  {
    id: 'work-focus',
    name: 'Home office',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
    accent: 'Ar, luz e foco',
    products: [
      { id: 'candeeiro-mesa-lino', slug: 'candeeiro-mesa-lino', name: 'Candeeiro de Mesa Lino', price: 28900, shortDescription: 'Luz acolhedora e discreta.', },
    ],
  },
] as const;

const moods = [
  'Natural',
  'Minimalista',
  'Aconchegante',
  'Contemporâneo',
  'Colorido',
  'Funcional',
] as const;

export function StoreExperience() {
  const [selectedSpace, setSelectedSpace] = useState<(typeof spaces)[number]>(spaces[0]);
  const [selectedMood, setSelectedMood] = useState<(typeof moods)[number]>('Aconchegante');

  const moodMatches = useMemo(() => {
    const filtered = spaces.filter((space) => {
      if (selectedMood === 'Natural') return space.name.includes('Sala') || space.name.includes('Cozinha');
      if (selectedMood === 'Minimalista') return space.id === 'work-focus';
      if (selectedMood === 'Aconchegante') return space.id === 'salas-acolhedoras';
      if (selectedMood === 'Contemporâneo') return space.id === 'work-focus';
      if (selectedMood === 'Colorido') return space.id === 'salas-acolhedoras';
      return space.id === 'cozinha-racional';
    });

    return filtered.length > 0 ? filtered : spaces;
  }, [selectedMood]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 lg:px-12">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-[#656C57]">NÓRIA Spaces</p>
          <h2 className="mt-2 text-3xl font-semibold text-[#292A24]">Ambientes pensados para viver melhor.</h2>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <div className="space-y-4">
          {spaces.map((space) => (
            <button
              key={space.id}
              type="button"
              onClick={() => setSelectedSpace(space)}
              className={`w-full overflow-hidden rounded-[1.5rem] border text-left transition ${selectedSpace.id === space.id ? 'border-[#292A24] bg-white shadow-[0_18px_32px_rgba(41,42,36,0.06)]' : 'border-[#E7E3DC] bg-[#F7F4EF]'}`}
            >
              <div className="flex items-center gap-4 p-3">
                <img src={space.image} alt={space.name} className="h-20 w-24 rounded-[1rem] object-cover" />
                <div>
                  <p className="text-lg font-medium text-[#292A24]">{space.name}</p>
                  <p className="mt-1 text-sm text-[#4A4D46]">{space.accent}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-[#E7E3DC] bg-white">
          <div className="relative">
            <img src={selectedSpace.image} alt={selectedSpace.name} className="h-[420px] w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#292A24]/80 via-[#292A24]/10 to-transparent p-6 text-white">
              <p className="text-xs uppercase tracking-[0.25em] text-[#E7E3DC]">Ambiente selecionado</p>
              <h3 className="mt-2 text-3xl font-semibold">{selectedSpace.name}</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-5 flex flex-wrap gap-2">
              {selectedSpace.products.map((product) => (
                <span key={product.id} className="rounded-full bg-[#F7F4EF] px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-[#656C57]">{product.name}</span>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {selectedSpace.products.map((product) => (
                <div key={product.id} className="rounded-[1rem] border border-[#E7E3DC] p-3">
                  <p className="text-base font-medium text-[#292A24]">{product.name}</p>
                  <p className="mt-2 text-sm text-[#4A4D46]">{product.shortDescription}</p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-medium text-[#292A24]">R$ {String(product.price / 100).replace('.', ',')}</span>
                    <a href={`/product/${product.slug}`} className="text-[#292A24] underline">Ver peça</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-[1.75rem] border border-[#E7E3DC] bg-[#F7F4EF] p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-[#656C57]">Encontre seu ambiente</p>
            <h3 className="mt-2 text-2xl font-semibold text-[#292A24]">Escolha o clima que você quer viver.</h3>
          </div>
          <button type="button" onClick={() => setSelectedMood('Aconchegante')} className="rounded-full border border-[#E7E3DC] bg-white px-4 py-2 text-sm font-medium text-[#292A24]">
            Reiniciar
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {moods.map((mood) => (
            <button
              key={mood}
              type="button"
              onClick={() => setSelectedMood(mood)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedMood === mood ? 'bg-[#292A24] text-white' : 'border border-[#E7E3DC] bg-white text-[#292A24]'}`}
            >
              {mood}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {moodMatches.map((space) => (
            <button key={space.id} type="button" onClick={() => setSelectedSpace(space)} className="rounded-[1.25rem] border border-[#E7E3DC] bg-white p-4 text-left">
              <p className="text-lg font-medium text-[#292A24]">{space.name}</p>
              <p className="mt-2 text-sm text-[#4A4D46]">{space.accent}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
