import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { CartProvider } from '@/components/cart/CartProvider';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-[#F7F4EF] text-[#292A24]">
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
