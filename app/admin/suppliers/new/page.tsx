import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requireAdmin } from '@/lib/auth';
import { createSupplierAction } from '@/lib/admin-actions';

export const dynamic = 'force-dynamic';

export default async function NewSupplierPage() {
  const admin = await requireAdmin();

  if (!admin) {
    redirect('/login');
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8 lg:px-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#656C57]">Dropshipping manual</p>
          <h1 className="mt-2 text-4xl font-semibold text-[#292A24]">Novo fornecedor</h1>
        </div>
        <Link href="/admin/suppliers" className="rounded-full border border-[#E7E3DC] bg-white px-4 py-2 text-sm font-medium text-[#292A24]">Voltar</Link>
      </div>
      <SupplierForm action={createSupplierAction} />
    </div>
  );
}

function SupplierForm({ action }: { action: (formData: FormData) => void | Promise<void> }) {
  return (
    <form action={action} className="grid gap-5 rounded-[1.5rem] border border-[#E7E3DC] bg-white p-6 md:grid-cols-2">
      <label className="space-y-2 text-sm text-[#292A24] md:col-span-2">
        <span>Nome *</span>
        <input name="name" required className="w-full rounded-xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3" />
      </label>
      <label className="space-y-2 text-sm text-[#292A24]">
        <span>E-mail de contato</span>
        <input name="contactEmail" type="email" className="w-full rounded-xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3" />
      </label>
      <label className="space-y-2 text-sm text-[#292A24]">
        <span>Telefone</span>
        <input name="contactPhone" className="w-full rounded-xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3" />
      </label>
      <label className="space-y-2 text-sm text-[#292A24]">
        <span>Site</span>
        <input name="website" type="url" placeholder="https://" className="w-full rounded-xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3" />
      </label>
      <label className="space-y-2 text-sm text-[#292A24]">
        <span>Referência/ID no fornecedor</span>
        <input name="supplierReference" className="w-full rounded-xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3" />
      </label>
      <label className="space-y-2 text-sm text-[#292A24]">
        <span>Regiões de entrega informadas</span>
        <input name="shippingRegions" className="w-full rounded-xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3" />
      </label>
      <label className="space-y-2 text-sm text-[#292A24]">
        <span>Prazo de processamento informado</span>
        <input name="processingTime" className="w-full rounded-xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3" />
      </label>
      <label className="space-y-2 text-sm text-[#292A24] md:col-span-2">
        <span>Política de devolução informada</span>
        <textarea name="returnPolicy" rows={3} className="w-full rounded-xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3" />
      </label>
      <label className="space-y-2 text-sm text-[#292A24] md:col-span-2">
        <span>Notas internas</span>
        <textarea name="internalNotes" rows={3} className="w-full rounded-xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3" />
      </label>
      <label className="inline-flex items-center gap-2 text-sm text-[#292A24]">
        <input name="active" type="checkbox" defaultChecked className="h-4 w-4" /> Ativo
      </label>
      <div className="flex justify-end md:col-span-2">
        <button type="submit" className="rounded-full bg-[#292A24] px-6 py-3 text-sm font-medium text-white">Salvar fornecedor</button>
      </div>
    </form>
  );
}
