import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { ProductWithDetails } from '../types/database';

interface WishlistItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  created_at: string;
  product?: ProductWithDetails;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (productId: string, variantId?: string) => Promise<void>;
  removeFromWishlist: (productId: string, variantId?: string) => Promise<void>;
  isInWishlist: (productId: string, variantId?: string) => boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const STORAGE_KEY = 'wishlist_guest';

  useEffect(() => {
    const guestItems = loadGuestWishlist();

    if (user) {
      mergeGuestIntoAccount(guestItems).finally(() => fetchWishlist());
    } else {
      setItems(guestItems);
      setLoading(false);
    }
  }, [user]);

  const loadGuestWishlist = (): WishlistItem[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (error) {
      console.error('Error loading guest wishlist:', error);
      return [];
    }
  };

  const persistGuestWishlist = (next: WishlistItem[]) => {
    if (!next || next.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const mergeGuestIntoAccount = async (guestItems: WishlistItem[]) => {
    if (!user || guestItems.length === 0) return;

    try {
      for (const item of guestItems) {
        const { error } = await supabase
          .from('wishlists')
          .insert({
            user_id: user.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
          });

        if (error && error.code !== '23505') {
          console.error('Error merging wishlist item:', error);
        }
      }
      persistGuestWishlist([]);
    } catch (error) {
      console.error('Error merging guest wishlist:', error);
    }
  };

  const fetchWishlist = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          product:products(
            *,
            category:categories(*),
            variants:product_variants(*),
            images:product_images(*)
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string, variantId?: string) => {
    if (!user) {
      const guestItem: WishlistItem = {
        id: productId,
        product_id: productId,
        variant_id: variantId || null,
        created_at: new Date().toISOString(),
      };
      if (isInWishlist(productId, variantId)) return;
      const next = [...items, guestItem];
      setItems(next);
      persistGuestWishlist(next);
      return;
    }

    try {
      const { error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          product_id: productId,
          variant_id: variantId || null,
        });

      if (error && error.code !== '23505') throw error;
      await fetchWishlist();
    } catch (error: any) {
      if (error.code !== '23505') {
        console.error('Error adding to wishlist:', error);
        alert('Failed to add to wishlist');
      }
    }
  };

  const removeFromWishlist = async (productId: string, variantId?: string) => {
    if (!user) {
      const next = items.filter(
        (item) =>
          !(item.product_id === productId && (variantId ? item.variant_id === variantId : !item.variant_id))
      );
      setItems(next);
      persistGuestWishlist(next);
      return;
    }

    try {
      let query = supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (variantId) {
        query = query.eq('variant_id', variantId);
      } else {
        query = query.is('variant_id', null);
      }

      const { error } = await query;

      if (error) throw error;
      await fetchWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove from wishlist');
    }
  };

  const isInWishlist = (productId: string, variantId?: string) => {
    return items.some(
      (item) =>
        item.product_id === productId &&
        (variantId ? item.variant_id === variantId : !item.variant_id)
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
