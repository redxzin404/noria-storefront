import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[#E7E3DC] bg-[#F7F4EF]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-8 lg:px-12">
        <div>
          <p className="text-2xl font-semibold tracking-[0.18em] text-[#292A24]">NÓRIA</p>
          <p className="mt-4 text-sm leading-6 text-[#4A4D46]">Sua casa, no seu ritmo.</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#656C57]">Loja</h3>
          <ul className="mt-4 space-y-2 text-sm text-[#4A4D46]">
            <li><Link href="/catalog">Catálogo</Link></li>
            <li><Link href="/about">Sobre</Link></li>
            <li><Link href="/cart">Carrinho</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#656C57]">Atendimento</h3>
          <ul className="mt-4 space-y-2 text-sm text-[#4A4D46]">
            <li><Link href="/contact">Contato</Link></li>
            <li><Link href="/faq">Perguntas frequentes</Link></li>
            <li><Link href="/shipping">Entrega</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#656C57]">Políticas</h3>
          <ul className="mt-4 space-y-2 text-sm text-[#4A4D46]">
            <li><Link href="/privacy">Privacidade</Link></li>
            <li><Link href="/terms">Termos</Link></li>
            <li><Link href="/returns">Trocas</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#E7E3DC] py-4 text-center text-xs text-[#656C57]">
        © 2026 NÓRIA. Todos os direitos reservados.
      </div>
    </footer>
  );
}
