import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateStoreSettingsAction } from '@/lib/admin-actions';

export const dynamic = 'force-dynamic';

export default async function StoreSettingsPage() {
  const admin = await requireAdmin();

  if (!admin) {
    redirect('/login');
  }

  const settings = await prisma.storeSettings.findFirst();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8 lg:px-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#656C57]">Configurações</p>
          <h1 className="mt-2 text-4xl font-semibold text-[#292A24]">Loja e branding</h1>
        </div>
        <Link href="/admin" className="rounded-full border border-[#E7E3DC] bg-white px-4 py-2 text-sm font-medium text-[#292A24]">
          Voltar ao painel
        </Link>
      </div>

      <form action={updateStoreSettingsAction} className="space-y-6 rounded-[1.75rem] border border-[#E7E3DC] bg-white p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Nome da loja</span>
            <input name="storeName" defaultValue={settings?.storeName ?? 'NÓRIA'} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Telefone</span>
            <input name="phone" defaultValue={settings?.phone ?? '+55 (11) 3333-0000'} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24] md:col-span-2">
            <span>Slogan</span>
            <input name="slogan" defaultValue={settings?.slogan ?? 'Sua casa, no seu ritmo.'} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24] md:col-span-2">
            <span>Mensagem principal</span>
            <input name="topMessage" defaultValue={settings?.topMessage ?? 'Design e funcionalidade para o seu dia a dia.'} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>E-mail</span>
            <input name="email" defaultValue={settings?.email ?? 'hello@noria.com'} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Instagram</span>
            <input name="instagram" defaultValue={settings?.instagram ?? ''} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Pinterest</span>
            <input name="pinterest" defaultValue={settings?.pinterest ?? ''} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Facebook</span>
            <input name="facebook" defaultValue={settings?.facebook ?? ''} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>SEO - título</span>
            <input name="seoTitle" defaultValue={settings?.seoTitle ?? ''} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24] md:col-span-2">
            <span>SEO - descrição</span>
            <textarea name="seoDescription" rows={3} defaultValue={settings?.seoDescription ?? ''} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="rounded-full bg-[#292A24] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#1f201c]">
            Salvar ajustes
          </button>
        </div>
      </form>
    </div>
  );
}
