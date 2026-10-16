import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:px-12">
      <h1 className="text-4xl font-semibold text-[#292A24]">Minha conta</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.5rem] border border-[#E7E3DC] bg-white p-6">
          <p className="text-sm uppercase tracking-[0.18em] text-[#656C57]">Cliente</p>
          <h2 className="mt-3 text-2xl font-semibold text-[#292A24]">{user.name}</h2>
          <p className="mt-2 text-[#4A4D46]">{user.email}</p>
          <p className="mt-5 text-sm text-[#656C57]">Perfil {user.role.toLowerCase()}</p>
          <Link href="/catalog" className="mt-6 inline-flex rounded-full bg-[#292A24] px-6 py-3 text-sm font-medium text-white">Continuar comprando</Link>
        </div>

        <div className="rounded-[1.5rem] border border-[#E7E3DC] bg-white p-6">
          <h2 className="text-2xl font-semibold text-[#292A24]">Histórico de pedidos</h2>
          <div className="mt-5 space-y-3">
            {orders.length === 0 ? <p className="text-[#4A4D46]">Você ainda não realizou pedidos.</p> : orders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-[#E7E3DC] p-4 text-sm text-[#4A4D46]">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-[#292A24]">#{order.orderNumber}</span>
                  <span>{order.status}</span>
                </div>
                <p className="mt-2">Pagamento: {order.paymentStatus}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
