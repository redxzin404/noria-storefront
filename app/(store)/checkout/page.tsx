'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { z } from 'zod';

import { useCart } from '@/components/cart/CartProvider';
import { formatCurrency } from '@/lib/utils';

type ShippingOption = {
  code: string;
  name: string;
  carrier: string;
  priceInCents: number;
  deliveryDays: number;
};

const shippingOptionsSchema = z.array(z.object({
  code: z.string(),
  name: z.string(),
  carrier: z.string(),
  priceInCents: z.number().int().min(0),
  deliveryDays: z.number().int().min(0),
}));
const shippingQuoteResponseSchema = z.object({
  demo: z.boolean(),
  subtotalInCents: z.number().int().min(0),
  items: z.array(z.object({
    productId: z.string(),
    unitPriceInCents: z.number().int().min(0),
  })),
  options: shippingOptionsSchema,
});

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const router = useRouter();
  const demoMode = process.env.NEXT_PUBLIC_NORIA_DEMO_MODE === 'true';
  const [form, setForm] = useState({
    customerEmail: '',
    name: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Brasil',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [quoteError, setQuoteError] = useState('');
  const [quoting, setQuoting] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingCode, setSelectedShippingCode] = useState('');
  const [demoShipping, setDemoShipping] = useState(false);
  const [quotedSubtotal, setQuotedSubtotal] = useState<number | null>(null);
  const [quotedPrices, setQuotedPrices] = useState<Record<string, number>>({});
  const idempotencyKey = useRef<string | null>(null);
  const selectedShipping = shippingOptions.find((option) => option.code === selectedShippingCode);

  if (demoMode) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center md:px-8">
        <h1 className="text-4xl font-semibold text-[#292A24]">Demonstração da NÓRIA</h1>
        <p className="mt-4 rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] p-6 text-sm leading-6 text-[#4A4D46]">
          Esta versão é apenas para demonstração. O checkout está desativado e nenhum pedido ou pagamento será processado.
        </p>
        <Link href="/catalog" className="mt-6 inline-flex rounded-full bg-[#292A24] px-6 py-3 text-sm font-medium text-white">
          Voltar ao catálogo
        </Link>
      </div>
    );
  }

  async function requestShippingQuote() {
    setQuoteError('');
    setQuoting(true);
    setShippingOptions([]);
    setSelectedShippingCode('');
    setQuotedSubtotal(null);
    setQuotedPrices({});
    setDemoShipping(false);

    try {
      const response = await fetch('/api/shipping/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postalCode: form.postalCode,
          items: items.map(({ id, quantity }) => ({ productId: id, quantity })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setQuoteError(data.error ?? 'Não foi possível calcular o frete.');
        return;
      }

      const quote = shippingQuoteResponseSchema.safeParse(data);
      if (!quote.success) {
        setQuoteError('O serviço de frete retornou dados em formato inválido.');
        return;
      }

      setShippingOptions(quote.data.options);
      setQuotedSubtotal(quote.data.subtotalInCents);
      setQuotedPrices(Object.fromEntries(quote.data.items.map((item) => [item.productId, item.unitPriceInCents])));
      setDemoShipping(quote.data.demo);
      if (quote.data.options.length === 1) {
        setSelectedShippingCode(quote.data.options[0].code);
      }
    } catch {
      setQuoteError('Não foi possível conectar ao serviço de frete. Tente novamente.');
    } finally {
      setQuoting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedShippingCode || !selectedShipping || quotedSubtotal === null) {
      setError('Calcule e selecione uma opção de frete antes de continuar.');
      return;
    }

    setSubmitting(true);
    setError('');
    const payload = {
      customerEmail: form.customerEmail,
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        variant: item.variant ?? null,
      })),
      shippingServiceCode: selectedShippingCode,
      shippingQuotePriceInCents: selectedShipping?.priceInCents,
      subtotalQuoteInCents: quotedSubtotal,
      shippingAddress: {
        recipientName: form.name,
        postalCode: form.postalCode,
        street: form.street,
        number: form.number,
        neighborhood: form.neighborhood,
        city: form.city,
        state: form.state,
        country: form.country,
      },
      shippingCost: 0,
    };

    try {
      idempotencyKey.current ??= window.crypto.randomUUID();
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey.current,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status >= 500) {
          idempotencyKey.current = null;
        }
        setError(data.error ?? 'Não foi possível criar o pedido.');
        return;
      }

      if (data.paymentUrl) {
        window.location.assign(data.paymentUrl);
        return;
      }

      if (data.orderId) {
        router.push(`/order/${data.orderId}`);
      }
    } catch {
      setError('Não foi possível conectar ao servidor. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-[#4A4D46]">Adicione itens ao carrinho antes de finalizar a compra.</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:px-12">
      <h1 className="text-4xl font-semibold text-[#292A24]">Checkout</h1>
      <p className="mt-3 rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] p-4 text-sm leading-6 text-[#4A4D46]">
        O frete é cotado com o Melhor Envio. Com Mercado Pago configurado, o pagamento será concluído no ambiente selecionado pela loja; pedidos só são considerados pagos após confirmação autenticada do provedor.
      </p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-[1.5rem] border border-[#E7E3DC] bg-white p-6">
          {error && <p role="alert" className="rounded-xl border border-[#B85C4A] bg-[#FFF7F3] p-3 text-sm text-[#8E4032]">{error}</p>}
          <div>
            <h2 className="text-xl font-semibold text-[#292A24]">Identificação</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do cliente" autoComplete="name" className="rounded-xl border border-[#E7E3DC] px-3 py-2.5" />
              <input required type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} placeholder="E-mail" autoComplete="email" className="rounded-xl border border-[#E7E3DC] px-3 py-2.5" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#292A24]">Endereço</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input required value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} placeholder="Rua" autoComplete="address-line1" className="md:col-span-2 rounded-xl border border-[#E7E3DC] px-3 py-2.5" />
              <input required value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="Número" className="rounded-xl border border-[#E7E3DC] px-3 py-2.5" />
              <input required value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} placeholder="Bairro" className="rounded-xl border border-[#E7E3DC] px-3 py-2.5" />
              <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Cidade" autoComplete="address-level2" className="rounded-xl border border-[#E7E3DC] px-3 py-2.5" />
              <input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="Estado" autoComplete="address-level1" className="rounded-xl border border-[#E7E3DC] px-3 py-2.5" />
              <input required value={form.postalCode} onChange={(e) => {
                setForm({ ...form, postalCode: e.target.value });
                setShippingOptions([]);
                setSelectedShippingCode('');
                setQuotedSubtotal(null);
                setQuotedPrices({});
              }} placeholder="CEP" autoComplete="postal-code" className="rounded-xl border border-[#E7E3DC] px-3 py-2.5" />
            </div>
          </div>

          <section className="space-y-3">
            <div>
              <h2 className="text-xl font-semibold text-[#292A24]">Entrega</h2>
              <p className="mt-1 text-sm text-[#656C57]">A cotação é refeita no servidor antes de registrar o pedido.</p>
            </div>
            <button type="button" onClick={requestShippingQuote} disabled={quoting} className="rounded-full border border-[#292A24] px-5 py-2.5 text-sm font-medium text-[#292A24] disabled:opacity-60">
              {quoting ? 'Consultando opções...' : 'Calcular frete pelo CEP'}
            </button>
            {quoteError && <p role="alert" className="text-sm text-[#8E4032]">{quoteError}</p>}
            {demoShipping && <p className="rounded-xl bg-[#FFF4E8] p-3 text-sm text-[#8C5B25]">Opção ilustrativa local; nenhum serviço de entrega foi consultado ou contratado.</p>}
            {shippingOptions.map((option) => (
              <label key={option.code} className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E7E3DC] p-4">
                <input type="radio" name="shippingService" value={option.code} checked={selectedShippingCode === option.code} onChange={() => setSelectedShippingCode(option.code)} className="mt-1" />
                <span className="flex flex-1 justify-between gap-3 text-sm">
                  <span><span className="font-medium text-[#292A24]">{option.carrier} · {option.name}</span>{option.deliveryDays > 0 && <span className="block text-[#656C57]">Prazo informado: {option.deliveryDays} dias</span>}</span>
                  <span className="font-semibold text-[#292A24]">{formatCurrency(option.priceInCents)}</span>
                </span>
              </label>
            ))}
          </section>

          <button type="submit" disabled={submitting} className="inline-flex w-full justify-center rounded-full bg-[#292A24] px-6 py-3 text-sm font-medium text-white disabled:opacity-60">
            {submitting ? 'Processando...' : 'Continuar para pagamento'}
          </button>
        </form>

        <aside className="rounded-[1.5rem] border border-[#E7E3DC] bg-white p-6">
          <h2 className="text-xl font-semibold text-[#292A24]">Resumo</h2>
          <div className="mt-5 space-y-3 text-sm text-[#4A4D46]">
            {items.map((item) => (
              <div key={`${item.id}-${item.variant ?? 'base'}`} className="flex justify-between gap-3">
                <span>{item.name} x{item.quantity}</span>
                <span>{formatCurrency((quotedPrices[item.id] ?? item.price) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2 border-t border-[#E7E3DC] pt-4 text-sm text-[#4A4D46]">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(quotedSubtotal ?? subtotal)}</span></div>
            <div className="flex justify-between"><span>Entrega</span><span>{formatCurrency(selectedShipping?.priceInCents ?? 0)}</span></div>
            <div className="flex justify-between"><span>Total</span><span className="text-lg font-semibold text-[#292A24]">{formatCurrency((quotedSubtotal ?? subtotal) + (selectedShipping?.priceInCents ?? 0))}</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
