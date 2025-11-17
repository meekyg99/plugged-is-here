import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, ProductVariant, Product } from '../types/database';
import { supabase } from '../lib/supabase';

interface CartContextType {
  items: CartItem[];
  addItem: (variantId: string, productId: string, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isOpen: boolean;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          setItems(parsedCart);
          loadCartItemDetails(parsedCart);
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('cart', JSON.stringify(items));
    } else {
      localStorage.removeItem('cart');
    }
  }, [items]);

  const loadCartItemDetails = async (cartItems: CartItem[]) => {
    try {
      const variantIds = cartItems.map(item => item.variant_id);
      if (variantIds.length === 0) return;

      const { data: variants, error: variantError } = await supabase
        .from('product_variants')
        .select('*, product:products(*)')
        .in('id', variantIds);

      if (variantError) throw variantError;

      setItems(prevItems =>
        prevItems.map(item => {
          const variantData = variants?.find(v => v.id === item.variant_id);
          if (variantData) {
            return {
              ...item,
              variant: variantData as ProductVariant,
              product: variantData.product as Product,
            };
          }
          return item;
        })
      );
    } catch (error) {
      console.error('Error loading cart item details:', error);
    }
  };

  const addItem = async (variantId: string, productId: string, quantity: number = 1) => {
    const existingItem = items.find(item => item.variant_id === variantId);

    if (existingItem) {
      updateQuantity(variantId, existingItem.quantity + quantity);
    } else {
      try {
        const { data: variant, error: variantError } = await supabase
          .from('product_variants')
          .select('*')
          .eq('id', variantId)
          .single();

        if (variantError) throw variantError;

        if (!variant || variant.stock_quantity < quantity) {
          alert('This item is out of stock or insufficient quantity available.');
          return;
        }

        const { data: product, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (productError) throw productError;

        const newItem: CartItem = {
          variant_id: variantId,
          product_id: productId,
          quantity,
          variant,
          product,
        };

        setItems([...items, newItem]);
      } catch (error) {
        console.error('Error adding item to cart:', error);
        alert('Failed to add item to cart. Please try again.');
      }
    }
  };

  const removeItem = (variantId: string) => {
    setItems(items.filter(item => item.variant_id !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
    } else {
      setItems(items.map(item =>
        item.variant_id === variantId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  const total = items.reduce((sum, item) => {
    const price = item.variant?.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      total,
      itemCount,
      isOpen,
      toggleCart,
    }}>
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
