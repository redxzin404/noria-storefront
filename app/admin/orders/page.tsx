import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const admin = await requireAdmin();

  if (!admin) {
    redirect('/login');
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true },
    take: 20,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:px-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#656C57]">Administração</p>
          <h1 className="mt-2 text-4xl font-semibold text-[#292A24]">Pedidos</h1>
        </div>
        <Link href="/admin" className="rounded-full border border-[#E7E3DC] bg-white px-4 py-2 text-sm font-medium text-[#292A24]">
          Voltar ao painel
        </Link>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-[#E7E3DC] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#F7F4EF] text-[#292A24]">
            <tr>
              <th className="px-5 py-4">Pedido</th>
              <th className="px-5 py-4">Cliente</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Itens</th>
              <th className="px-5 py-4">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-[#E7E3DC] align-top">
                <td className="px-5 py-4 font-medium text-[#292A24]">#{order.orderNumber}</td>
                <td className="px-5 py-4 text-[#4A4D46]">{order.customerEmail}</td>
                <td className="px-5 py-4 text-[#4A4D46]">{order.status}</td>
                <td className="px-5 py-4 text-[#4A4D46]">{order.items.length}</td>
                <td className="px-5 py-4 text-[#4A4D46]">{formatCurrency(order.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
