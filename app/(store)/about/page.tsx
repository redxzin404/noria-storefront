export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:px-8 lg:px-12">
      <p className="text-sm uppercase tracking-[0.18em] text-[#656C57]">Sobre a NÓRIA</p>
      <h1 className="mt-3 text-4xl font-semibold text-[#292A24]">Design que acolhe a rotina.</h1>
      <p className="mt-6 text-lg leading-8 text-[#4A4D46]">
        A NÓRIA nasceu para celebrar o cotidiano com objetos que combinam utilidade, textura e personalidade. Nossa proposta é criar ambientes mais práticos, acolhedores e genuínos.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          'Materiais naturais e de qualidade.',
          'Peças funcionais para cada espaço da casa.',
          'Estética contemporânea com senso de acolhimento.',
        ].map((item) => (
          <div key={item} className="rounded-[1.5rem] border border-[#E7E3DC] bg-white p-6 text-[#292A24]">{item}</div>
        ))}
      </div>
    </div>
  );
}
