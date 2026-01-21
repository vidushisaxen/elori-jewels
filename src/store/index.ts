import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Cart, CartItem, Product, ProductVariant } from '../app/lib/shopify/types';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type WishlistItem = {
  id: string;
  handle: string;
  name: string;
  price: string;
  defaultImage: string;
  hoverImage?: string;
  variantId?: string;
  currencyCode?: string;
  priceAmount?: string;
};

type UpdateType = 'plus' | 'minus' | 'delete';

interface StoreState {
  // Hydration flag
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Wishlist
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  clearWishlistLocal: () => void; // Clear local only (for logout)
  setWishlist: (items: WishlistItem[]) => void;
  syncWishlistToShopify: () => Promise<void>;
  fetchWishlistFromShopify: () => Promise<WishlistItem[]>;

  // Cart
  cart: Cart | undefined;
  isCartLoading: boolean;
  setCart: (cart: Cart | undefined) => void;
  setCartLoading: (loading: boolean) => void;
  addCartItem: (variant: ProductVariant, product: Product) => Promise<void>;
  updateCartItem: (merchandiseId: string, updateType: UpdateType) => Promise<void>;
  fetchCart: () => Promise<void>;
  clearCart: () => Promise<void>;
  associateCartWithCustomer: () => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function calculateItemCost(quantity: number, price: string): string {
  return (Number(price) * quantity).toString();
}

function updateCartItemHelper(item: CartItem, updateType: UpdateType): CartItem | null {
  if (updateType === 'delete') return null;

  const newQuantity = updateType === 'plus' ? item.quantity + 1 : item.quantity - 1;
  if (newQuantity === 0) return null;

  const singleItemAmount = Number(item.cost.totalAmount.amount) / item.quantity;
  const newTotalAmount = calculateItemCost(newQuantity, singleItemAmount.toString());

  return {
    ...item,
    quantity: newQuantity,
    cost: {
      ...item.cost,
      totalAmount: {
        ...item.cost.totalAmount,
        amount: newTotalAmount,
      },
    },
  };
}

function createOrUpdateCartItem(
  existingItem: CartItem | undefined,
  variant: ProductVariant,
  product: Product
): CartItem {
  const quantity = existingItem ? existingItem.quantity + 1 : 1;
  const totalAmount = calculateItemCost(quantity, variant.price.amount);

  return {
    id: existingItem?.id,
    quantity,
    cost: {
      totalAmount: {
        amount: totalAmount,
        currencyCode: variant.price.currencyCode,
      },
    },
    merchandise: {
      id: variant.id,
      title: variant.title,
      selectedOptions: variant.selectedOptions,
      product: {
        id: product.id,
        handle: product.handle,
        title: product.title,
        featuredImage: product.featuredImage,
      },
    },
  };
}

function updateCartTotals(lines: CartItem[]): Pick<Cart, 'totalQuantity' | 'cost'> {
  const totalQuantity = lines.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = lines.reduce((sum, item) => sum + Number(item.cost.totalAmount.amount), 0);
  const currencyCode = lines[0]?.cost.totalAmount.currencyCode ?? 'USD';

  return {
    totalQuantity,
    cost: {
      subtotalAmount: { amount: totalAmount.toString(), currencyCode },
      totalAmount: { amount: totalAmount.toString(), currencyCode },
      totalTaxAmount: { amount: '0', currencyCode },
    },
  };
}

function createEmptyCart(): Cart {
  return {
    id: undefined,
    checkoutUrl: '',
    totalQuantity: 0,
    lines: [],
    cost: {
      subtotalAmount: { amount: '0', currencyCode: 'USD' },
      totalAmount: { amount: '0', currencyCode: 'USD' },
      totalTaxAmount: { amount: '0', currencyCode: 'USD' },
    },
  };
}

// Helper to normalize product ID (remove gid:// prefix for comparison)
function normalizeId(id: string): string {
  if (!id) return '';
  const match = id.match(/\/(\d+)$/);
  return match ? match[1] : id;
}

// ─────────────────────────────────────────────────────────────────────────────
// STORE WITH PERSISTENCE
// ─────────────────────────────────────────────────────────────────────────────

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // ─────────────────────────────────────────────────────────────────────────
      // HYDRATION FLAG
      // ─────────────────────────────────────────────────────────────────────────
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      // ─────────────────────────────────────────────────────────────────────────
      // WISHLIST STATE & ACTIONS
      // ─────────────────────────────────────────────────────────────────────────
      wishlist: [],

      setWishlist: (items) => set({ wishlist: items }),

      addToWishlist: (item) => {
        set((state) => {
          const normalizedNewId = normalizeId(item.id);
          if (state.wishlist.some((x) => normalizeId(x.id) === normalizedNewId || x.handle === item.handle)) {
            return state;
          }
          return { wishlist: [...state.wishlist, item] };
        });
        // Sync to Shopify in background (don't await)
        get().syncWishlistToShopify();
      },

      removeFromWishlist: (id) => {
        const normalizedId = normalizeId(id);
        set((state) => ({
          wishlist: state.wishlist.filter((x) => normalizeId(x.id) !== normalizedId && x.handle !== id),
        }));
        // Sync to Shopify in background
        get().syncWishlistToShopify();
      },

      toggleWishlist: (item) => {
        const { wishlist } = get();
        const normalizedNewId = normalizeId(item.id);
        const exists = wishlist.some((x) => normalizeId(x.id) === normalizedNewId || x.handle === item.handle);
        if (exists) {
          set({ 
            wishlist: wishlist.filter((x) => normalizeId(x.id) !== normalizedNewId && x.handle !== item.handle) 
          });
        } else {
          set({ wishlist: [...wishlist, item] });
        }
        // Sync to Shopify in background
        get().syncWishlistToShopify();
      },

      isInWishlist: (id) => {
        const normalizedId = normalizeId(id);
        return get().wishlist.some((x) => normalizeId(x.id) === normalizedId || x.handle === id);
      },

      // Clear wishlist and sync to Shopify (user action)
      clearWishlist: () => {
        set({ wishlist: [] });
        get().syncWishlistToShopify();
      },

      // Clear wishlist locally only - DON'T sync to Shopify (for logout)
      clearWishlistLocal: () => {
        set({ wishlist: [] });
      },

      // Sync current wishlist to Shopify customer metafield
      syncWishlistToShopify: async () => {
        try {
          const { wishlist } = get();
          await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wishlist }),
          });
        } catch (error) {
          // Silently fail - local wishlist is still saved
          console.error('Failed to sync wishlist to Shopify:', error);
        }
      },

      // Fetch wishlist from Shopify customer metafield
      fetchWishlistFromShopify: async () => {
        try {
          const response = await fetch('/api/wishlist');
          if (response.ok) {
            const data = await response.json();
            if (data.authenticated && Array.isArray(data.wishlist)) {
              set({ wishlist: data.wishlist });
              return data.wishlist;
            }
          }
        } catch (error) {
          console.error('Failed to fetch wishlist from Shopify:', error);
        }
        return [];
      },

      // ─────────────────────────────────────────────────────────────────────────
      // CART STATE & ACTIONS
      // ─────────────────────────────────────────────────────────────────────────
      cart: createEmptyCart(),
      isCartLoading: true,

      setCart: (cart) => set({ cart }),
      setCartLoading: (loading) => set({ isCartLoading: loading }),

      fetchCart: async () => {
        try {
          const response = await fetch('/api/cart');
          if (response.ok) {
            const cart = await response.json();
            set({ cart, isCartLoading: false });
          } else {
            set({ isCartLoading: false });
          }
        } catch (error) {
          console.error('Failed to fetch cart:', error);
          set({ isCartLoading: false });
        }
      },

      // Associate cart with logged-in customer (cartBuyerIdentityUpdate)
      associateCartWithCustomer: async () => {
        try {
          const response = await fetch('/api/cart/associate', {
            method: 'POST',
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.cart) {
              set({ cart: data.cart });
            }
          }
        } catch (error) {
          console.error('Failed to associate cart with customer:', error);
        }
      },

      addCartItem: async (variant, product) => {
        const { cart } = get();
        const currentCart = cart || createEmptyCart();

        // Optimistic update
        const existingItem = currentCart.lines.find((item) => item.merchandise.id === variant.id);
        const updatedItem = createOrUpdateCartItem(existingItem, variant, product);

        const updatedLines = existingItem
          ? currentCart.lines.map((item) => (item.merchandise.id === variant.id ? updatedItem : item))
          : [...currentCart.lines, updatedItem];

        const optimisticCart = {
          ...currentCart,
          ...updateCartTotals(updatedLines),
          lines: updatedLines,
        };

        set({ cart: optimisticCart });

        // Persist to backend
        try {
          const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ variant, product }),
          });

          const data = await response.json();

          if (response.ok && !data.error) {
            set({ cart: data });
          } else {
            console.error('API error:', data.error || data.details);
            await get().fetchCart();
            throw new Error(data.error || 'Failed to add item');
          }
        } catch (error) {
          console.error('Failed to add to cart:', error);
          await get().fetchCart();
          throw error;
        }
      },

      updateCartItem: async (merchandiseId, updateType) => {
        const { cart } = get();
        const currentCart = cart || createEmptyCart();

        // Optimistic update
        const updatedLines = currentCart.lines
          .map((item) =>
            item.merchandise.id === merchandiseId ? updateCartItemHelper(item, updateType) : item
          )
          .filter(Boolean) as CartItem[];

        let optimisticCart: Cart;
        if (updatedLines.length === 0) {
          optimisticCart = {
            ...currentCart,
            lines: [],
            totalQuantity: 0,
            cost: {
              ...currentCart.cost,
              totalAmount: { ...currentCart.cost.totalAmount, amount: '0' },
            },
          };
        } else {
          optimisticCart = {
            ...currentCart,
            ...updateCartTotals(updatedLines),
            lines: updatedLines,
          };
        }

        set({ cart: optimisticCart });

        // Persist to backend
        try {
          const response = await fetch('/api/cart/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ merchandiseId, updateType }),
          });

          if (response.ok) {
            const updatedCart = await response.json();
            set({ cart: updatedCart });
          } else {
            await get().fetchCart();
          }
        } catch (error) {
          console.error('Failed to update cart:', error);
          await get().fetchCart();
        }
      },

      clearCart: async () => {
        const emptyCart = createEmptyCart();
        set({ cart: emptyCart });

        try {
          const response = await fetch("/api/cart/clear", {
            method: "POST",
          });

          if (!response.ok) {
            throw new Error("Failed to clear cart");
          }

          const clearedCart = await response.json();
          set({ cart: clearedCart });
        } catch (error) {
          console.error("Clear cart failed:", error);
          await get().fetchCart();
        }
      },
    }),
    {
      name: 'elori-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        wishlist: state.wishlist,
        cart: state.cart,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// ─────────────────────────────────────────────────────────────────────────────
// HYDRATION HELPER
// ─────────────────────────────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  useStore.persist.rehydrate();
}

// ─────────────────────────────────────────────────────────────────────────────
// SELECTORS
// ─────────────────────────────────────────────────────────────────────────────

export const useWishlist = () => useStore((state) => state.wishlist);
export const useHasHydrated = () => useStore((state) => state._hasHydrated);
export const useWishlistActions = () =>
  useStore((state) => ({
    addToWishlist: state.addToWishlist,
    removeFromWishlist: state.removeFromWishlist,
    toggleWishlist: state.toggleWishlist,
    isInWishlist: state.isInWishlist,
    clearWishlist: state.clearWishlist,
    clearWishlistLocal: state.clearWishlistLocal,
    setWishlist: state.setWishlist,
    syncWishlistToShopify: state.syncWishlistToShopify,
    fetchWishlistFromShopify: state.fetchWishlistFromShopify,
  }));

export const useCart = () => useStore((state) => state.cart);
export const useCartLoading = () => useStore((state) => state.isCartLoading);
export const useCartActions = () =>
  useStore((state) => ({
    addCartItem: state.addCartItem,
    updateCartItem: state.updateCartItem,
    fetchCart: state.fetchCart,
    setCart: state.setCart,
    associateCartWithCustomer: state.associateCartWithCustomer,
  }));
