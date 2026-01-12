'use client';

import React, {
  createContext,
  startTransition,
  useContext,
  useMemo,
  useOptimistic,
  useEffect,
  useState
} from 'react';
import { Cart, CartItem, Product, ProductVariant } from '../../app/lib/shopify/types';

type UpdateType = 'plus' | 'minus' | 'delete';

type CartAction =
  | {
      type: 'UPDATE_ITEM';
      payload: { merchandiseId: string; updateType: UpdateType };
    }
  | {
      type: 'ADD_ITEM';
      payload: { variant: ProductVariant; product: Product };
    };

type CartContextType = {
  cart: Cart | undefined;
  updateCartItem: (merchandiseId: string, updateType: UpdateType) => Promise<void>;
  addCartItem: (variant: ProductVariant, product: Product) => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function calculateItemCost(quantity: number, price: string): string {
  return (Number(price) * quantity).toString();
}

function updateCartItem(
  item: CartItem,
  updateType: UpdateType
): CartItem | null {
  if (updateType === 'delete') return null;

  const newQuantity =
    updateType === 'plus' ? item.quantity + 1 : item.quantity - 1;
  if (newQuantity === 0) return null;

  const singleItemAmount = Number(item.cost.totalAmount.amount) / item.quantity;
  const newTotalAmount = calculateItemCost(
    newQuantity,
    singleItemAmount.toString()
  );

  return {
    ...item,
    quantity: newQuantity,
    cost: {
      ...item.cost,
      totalAmount: {
        ...item.cost.totalAmount,
        amount: newTotalAmount
      }
    }
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
        currencyCode: variant.price.currencyCode
      }
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
        // images: product.images
      }
    }
  };
}

function updateCartTotals(
  lines: CartItem[]
): Pick<Cart, 'totalQuantity' | 'cost'> {
  const totalQuantity = lines.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = lines.reduce(
    (sum, item) => sum + Number(item.cost.totalAmount.amount),
    0
  );
  const currencyCode = lines[0]?.cost.totalAmount.currencyCode ?? 'USD';

  return {
    totalQuantity,
    cost: {
      subtotalAmount: { amount: totalAmount.toString(), currencyCode },
      totalAmount: { amount: totalAmount.toString(), currencyCode },
      totalTaxAmount: { amount: '0', currencyCode }
    }
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
      totalTaxAmount: { amount: '0', currencyCode: 'USD' }
    }
  };
}

function cartReducer(state: Cart | undefined, action: CartAction): Cart {
  const currentCart = state || createEmptyCart();
  
  if (!currentCart.lines) {
    currentCart.lines = [];
  }

  switch (action.type) {
    case 'UPDATE_ITEM': {
      const { merchandiseId, updateType } = action.payload;
      const updatedLines = currentCart.lines
        .map((item) =>
          item.merchandise.id === merchandiseId
            ? updateCartItem(item, updateType)
            : item
        )
        .filter(Boolean) as CartItem[];

      if (updatedLines.length === 0) {
        return {
          ...currentCart,
          lines: [],
          totalQuantity: 0,
          cost: {
            ...currentCart.cost,
            totalAmount: { ...currentCart.cost.totalAmount, amount: '0' }
          }
        };
      }

      return {
        ...currentCart,
        ...updateCartTotals(updatedLines),
        lines: updatedLines
      };
    }
    case 'ADD_ITEM': {
      const { variant, product } = action.payload;
      const existingItem = currentCart.lines.find(
        (item) => item.merchandise.id === variant.id
      );
      const updatedItem = createOrUpdateCartItem(
        existingItem,
        variant,
        product
      );

      const updatedLines = existingItem
        ? currentCart.lines.map((item) =>
            item.merchandise.id === variant.id ? updatedItem : item
          )
        : [...currentCart.lines, updatedItem];

      return {
        ...currentCart,
        ...updateCartTotals(updatedLines),
        lines: updatedLines
      };
    }
    default:
      return currentCart;
  }
}

const CART_SNAPSHOT_KEY = 'cart_snapshot_v1';

function readCartSnapshot(): Cart | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem(CART_SNAPSHOT_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function writeCartSnapshot(cart: Cart | undefined) {
  if (typeof window === 'undefined') return;
  try {
    if (!cart) {
      localStorage.removeItem(CART_SNAPSHOT_KEY);
      return;
    }
    localStorage.setItem(CART_SNAPSHOT_KEY, JSON.stringify(cart));
  } catch {
    // ignore
  }
}


export function CartProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [initialCart, setInitialCart] = useState<Cart | undefined>(() => {
   return readCartSnapshot() ?? createEmptyCart();
 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch('/api/cart');
        if (response.ok) {
          const cart = await response.json();
          setInitialCart(cart);
          writeCartSnapshot(cart);
        }
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCart();
  }, []);

  const [optimisticCart, updateOptimisticCart] = useOptimistic(
    initialCart,
    cartReducer
  );

  useEffect(() => {
  writeCartSnapshot(optimisticCart);
}, [optimisticCart]);

  const updateItem = async (merchandiseId: string, updateType: UpdateType) => {
    startTransition(() => {
      updateOptimisticCart({
        type: 'UPDATE_ITEM',
        payload: { merchandiseId, updateType }
      });
    });
    
    try {
      const response = await fetch('/api/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchandiseId, updateType })
      });
      
      if (response.ok) {
        const updatedCart = await response.json();
        setInitialCart(updatedCart);
        writeCartSnapshot(updatedCart);
      }
    } catch (error) {
      console.error('Failed to update cart:', error);
      // Refetch cart to sync state
      const response = await fetch('/api/cart');
      if (response.ok) {
        const cart = await response.json();
        setInitialCart(cart);
      }
    }
  };

  const addItem = async (variant: ProductVariant, product: Product) => {
    // Optimistic update
    startTransition(() => {
      updateOptimisticCart({ 
        type: 'ADD_ITEM', 
        payload: { variant, product } 
      });
    });
    
    // Persist to backend
    try {
      console.log('🔄 Calling /api/cart/add with:', { variantId: variant.id });
      
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant, product })
      });
      
      const data = await response.json();
      console.log('📥 Response from /api/cart/add:', { 
        ok: response.ok, 
        status: response.status,
        hasError: !!data.error 
      });
      
      if (response.ok && !data.error) {
        // Update the actual cart state after successful API call
        setInitialCart(data);
        writeCartSnapshot(data);
        console.log('✅ Cart updated successfully');
      } else {
        console.error('❌ API error:', data.error || data.details);
        throw new Error(data.error || 'Failed to add item');
      }
    } catch (error) {
      console.error('❌ Failed to add to cart:', error);
      // Revert by refetching current cart state
      try {
        const response = await fetch('/api/cart');
        if (response.ok) {
          const cart = await response.json();
          setInitialCart(cart);
          console.log('🔄 Cart state reverted');
        }
      } catch (revertError) {
        console.error('Failed to revert cart state:', revertError);
      }
      throw error; // Re-throw so the component can handle it
    }
  };

  const value = useMemo(
    () => ({
      cart: optimisticCart,
      updateCartItem: updateItem,
      addCartItem: addItem
    }),
    [optimisticCart]
  );

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}