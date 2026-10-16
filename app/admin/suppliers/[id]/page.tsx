import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { deleteSupplierAction, updateSupplierAction } from '@/lib/admin-actions';

export const dynamic = 'force-dynamic';

export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();

  if (!admin) {
    redirect('/login');
  }

  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier) {
    redirect('/admin/suppliers');
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8 lg:px-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#656C57]">Dropshipping manual</p>
          <h1 className="mt-2 text-4xl font-semibold text-[#292A24]">Editar fornecedor</h1>
        </div>
        <Link href="/admin/suppliers" className="rounded-full border border-[#E7E3DC] bg-white px-4 py-2 text-sm font-medium text-[#292A24]">Voltar</Link>
      </div>
      <form action={updateSupplierAction} className="grid gap-5 rounded-[1.5rem] border border-[#E7E3DC] bg-white p-6 md:grid-cols-2">
        <input type="hidden" name="id" value={supplier.id} />
        <label className="space-y-2 text-sm text-[#292A24] md:col-span-2">
          <span>Nome *</span>
          <input name="name" defaultValue={supplier.name} required className="w-full rounded-xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3" />
        </label>
        <label className="space-y-2 text-sm text-[#292A24]">
          <span>E-mail de contato</span>
          <input name="contactEmail" type="email" defaultValue={supplier.contactEmail ?? ''} className="w-full rounded-xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3" />
        </label>
        <label className="space-y-2 text-sm text-[#292A24]">
          <span>Telefone</span>
          <input name="contactPhone" defaultValue={supplier.contactPhone ?? ''} className="w-full rounded-xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3" />
        </label>
        <label className="space-y-2 text-sm text-[#292A24]">
          <span>Site</span>
          <input name="website" type="url" defaultValue={supplier.website ?? ''} className="w-full rounded-xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3" />
        </label>
        <label className="space-y-2 text-sm text-[#292A24]">
          <span>Referência/ID no fornecedor</span>
          <input name="supplierReference" defaultValue={supplier.supplierReference ?? ''} className="w-full rounded-xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3" />
        </label>
        <label className="space-y-2 text-sm text-[#292A24]">
          <span>Regiões de entrega informadas</span>
          <input name="shippingRegions" defaultValue={supplier.shippingRegions ?? ''} className="w-full rounded-xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3" />
        </label>
        <label className="space-y-2 text-sm text-[#292A24]">
          <span>Prazo de processamento informado</span>
          <input name="processingTime" defaultValue={supplier.processingTime ?? ''} className="w-full rounded-xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3" />
        </label>
        <label className="space-y-2 text-sm text-[#292A24] md:col-span-2">
          <span>Política de devolução informada</span>
          <textarea name="returnPolicy" rows={3} defaultValue={supplier.returnPolicy ?? ''} className="w-full rounded-xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3" />
        </label>
        <label className="space-y-2 text-sm text-[#292A24] md:col-span-2">
          <span>Notas internas</span>
          <textarea name="internalNotes" rows={3} defaultValue={supplier.internalNotes ?? ''} className="w-full rounded-xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3" />
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-[#292A24]">
          <input name="active" type="checkbox" defaultChecked={supplier.active} className="h-4 w-4" /> Ativo
        </label>
        <div className="flex justify-between gap-4 md:col-span-2">
          <button type="submit" formAction={deleteSupplierAction} className="rounded-full border border-[#B85C4A] bg-[#FFF7F3] px-5 py-3 text-sm font-medium text-[#B85C4A]">
            Excluir fornecedor
          </button>
          <button type="submit" className="rounded-full bg-[#292A24] px-6 py-3 text-sm font-medium text-white">Salvar alterações</button>
        </div>
      </form>
      <p className="mt-4 text-sm text-[#656C57]">Status de operação: {supplier.integrationStatus === 'manual' ? 'manual — nenhuma integração automática' : supplier.integrationStatus}</p>
    </div>
  );
}
