// app/cart/page.tsx
import { getCart } from '../lib/shopify';
import CartPageClient from './CartPageClient';

export default async function CartPage() {
  const cart = await getCart();
  return <CartPageClient cart={cart} />;
}
