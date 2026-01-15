"use client";

import Link from "next/link";
import Image from "next/image";
import { startTransition, useActionState } from "react";
import {
  removeItem,
  updateItemQuantity,
  redirectToCheckout,
} from "../../components/cart/actions";
import { useStore } from "../../store";
import type { Cart } from "../lib/shopify/types";
import { useEffect } from "react";
import PrimaryButton from "../../components/Buttons/PrimaryButton";

export default function CartPageClient({
  cart: initialCart,
}: {
  cart: Cart | undefined;
}) {
  // Use Zustand store for real-time cart state
  const cart = useStore((state) => state.cart);
  const setCart = useStore((state) => state.setCart);
  const clearCart = useStore((state) => state.clearCart);

  // Sync initial server cart with Zustand store
  useEffect(() => {
    if (initialCart) {
      setCart(initialCart);
    }
  }, [initialCart, setCart]);

  const handleDeleteAll = () => {
    clearCart();
  };

  const handleCheckout = () => {
    if (cart?.checkoutUrl) {
      window.open(cart.checkoutUrl, "_blank");
    }
  };

  if (!cart || cart.lines.length === 0) {
    return (
      <div className="min-h-screen bg-white px-4 py-16 text-center ">
        <h1 className="text-4xl font-light uppercase tracking-wide mb-6">
          My Cart
        </h1>
        <p className="text-zinc-600 mb-8">Your cart is empty.</p>
         <div onClick={handleDeleteAll} className="w-fit mt-0 text-center inline-block">
            <PrimaryButton text={"Continue Shopping"} href={"/products"} border={true} />
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-start justify-between mb-12">
          <div>
            <h1 className="text-4xl font-light uppercase tracking-wide mb-2">
              My Cart
            </h1>
            <p className="text-zinc-600 text-sm">{cart.totalQuantity} items</p>
          </div>

           <div onClick={handleDeleteAll} className="w-fit mt-0 text-center">
            <PrimaryButton text={"Delete All"} href={"#"} border={true} />
          </div>
          
       
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cart.lines.map((line) => (
            <CartItemCard key={line.merchandise.id} line={line} />
          ))}
        </div>

        <div className="mt-16 border-t border-zinc-200 pt-12 flex items-center justify-between">
          <div className="text-zinc-700">
            <div className="text-sm uppercase tracking-wider">Total</div>
            <div className="text-2xl font-light">
              {cart.cost.totalAmount.currencyCode}{" "}
              {cart.cost.totalAmount.amount}
            </div>
          </div>
          <div onClick={handleCheckout} className="w-fit">
            <PrimaryButton text={"Checkout"} href={"#"} border={true} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CartItemCard({ line }: { line: any }) {
  const merchandiseId = line.merchandise.id;
  const updateCartItem = useStore((state) => state.updateCartItem);

  const [_, removeAction] = useActionState(removeItem, null);
  const removeBound = removeAction.bind(null, merchandiseId);

  const [__, qtyAction] = useActionState(updateItemQuantity, null);

  const featured = line.merchandise.product.featuredImage;

  const secondImage =
    line.merchandise.product?.images?.edges?.[1]?.node ?? featured;

  const handleRemove = async () => {
    updateCartItem(merchandiseId, "delete");
    removeBound();
  };

  const handleDecrement = async () => {
    updateCartItem(merchandiseId, "minus");
    qtyAction.bind(null, { merchandiseId, quantity: line.quantity - 1 })();
  };

  const handleIncrement = async () => {
    updateCartItem(merchandiseId, "plus");
    qtyAction.bind(null, { merchandiseId, quantity: line.quantity + 1 })();
  };

  return (
    <div className="group relative">
      <div className="relative aspect-3/4 overflow-hidden bg-zinc-100 mb-4">
        {/* Remove button */}
        <form action={handleRemove}>
          <button
            type="submit"
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Remove from cart"
          >
            ✕
          </button>
        </form>

        {/* Base image */}
        <Image
          src={featured.url}
          alt={featured.altText || line.merchandise.product.title}
          fill
          className="absolute inset-0 object-cover transition-all duration-700 ease-out
                     opacity-100 scale-100
                     group-hover:opacity-0 group-hover:scale-[1.2]"
          sizes="(max-width: 768px) 100vw, 25vw"
        />

        {/* Hover image */}
        <Image
          src={secondImage.url}
          alt={
            secondImage.altText || `${line.merchandise.product.title} detail`
          }
          fill
          className="absolute inset-0 object-cover transition-all duration-700 ease-out
                     opacity-0 scale-[1.2]
                     group-hover:opacity-100 group-hover:scale-[1.15]"
          sizes="(max-width: 768px) 100vw, 25vw"
        />

        {/* Bottom overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Link
            href={`/product/${line.merchandise.product.handle}`}
            className="block w-full bg-white text-black py-3 px-4 text-sm uppercase tracking-wider text-center hover:bg-zinc-100 transition-colors"
          >
            View Product
          </Link>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-light tracking-[0.15em] uppercase text-zinc-700">
          {line.merchandise.product.title}
        </h3>
        <p className="text-sm text-zinc-600 tracking-wider">
          {line.cost.totalAmount.currencyCode} {line.cost.totalAmount.amount}
        </p>

        <div className="flex items-center gap-3">
          <form action={handleDecrement}>
            <button type="submit" className="px-3 py-1 border">
              -
            </button>
          </form>

          <span className="min-w-6 text-center">{line.quantity}</span>

          <form action={handleIncrement}>
            <button type="submit" className="px-3 py-1 border">
              +
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
