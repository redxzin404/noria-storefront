import Link from 'next/link';

import { prisma } from '@/lib/db';

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });

  if (!order) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-[#4A4D46]">Pedido não encontrado.</div>;
  }

  const isPaid = order.paymentStatus === 'PAID';
  const isDemo = !order.paymentPreferenceId && order.status !== 'PAYMENT_SETUP_FAILED';
  const needsReview = order.status === 'PAID_REQUIRES_REVIEW';
  const paymentLabel: Record<string, string> = {
    PENDING: 'aguardando confirmação',
    PAID: 'confirmado',
    REJECTED: 'recusado',
    CANCELLED: 'cancelado',
    FAILED: 'falhou',
    EXPIRED: 'expirado',
    REFUNDED: 'reembolsado',
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center md:px-8 lg:px-12">
      <p className="text-sm uppercase tracking-[0.2em] text-[#656C57]">{isPaid ? 'Pagamento confirmado' : isDemo ? 'Demonstração local' : 'Aguardando pagamento'}</p>
      <h1 className="mt-4 text-4xl font-semibold text-[#292A24]">{needsReview ? 'Estamos revisando seu pedido.' : isPaid ? 'Obrigado por comprar com a NÓRIA.' : 'Seu pedido foi registrado.'}</h1>
      <p className="mt-4 text-lg text-[#4A4D46]">Pedido <span className="font-semibold text-[#292A24]">#{order.orderNumber}</span></p>
      <div className="mt-8 inline-flex rounded-full bg-[#F7F4EF] px-5 py-3 text-sm font-medium text-[#292A24]">
        Pagamento: {paymentLabel[order.paymentStatus] ?? 'em análise'}
      </div>
      {isDemo && <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-[#656C57]">Pedido de demonstração local: não houve cobrança nem contratação de frete.</p>}
      {needsReview && <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-[#8C5B25]">O pagamento foi confirmado após a reserva de estoque expirar. A equipe precisa revisar este pedido antes de confirmar a entrega.</p>}
      {!isPaid && !isDemo && <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-[#656C57]">Aguarde a confirmação segura do Mercado Pago. A página não considera o retorno do navegador como confirmação de pagamento.</p>}
      {order.shippingServiceName && <p className="mt-3 text-sm text-[#656C57]">Entrega selecionada: {order.shippingServiceName}{order.shippingEstimatedDays ? ` · prazo informado de ${order.shippingEstimatedDays} dias` : ''}</p>}
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/catalog" className="rounded-full bg-[#292A24] px-6 py-3 text-sm font-medium text-white">Continuar comprando</Link>
        <Link href="/account" className="rounded-full border border-[#E7E3DC] bg-white px-6 py-3 text-sm font-medium text-[#292A24]">Minha conta</Link>
      </div>
    </div>
  );
}
