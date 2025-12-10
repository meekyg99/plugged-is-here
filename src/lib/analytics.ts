// Lightweight analytics helpers for GA4 and Meta Pixel
// Safely no-op when trackers are absent.

export type AnalyticsItem = {
  item_id?: string;
  item_name?: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
};

const sendGA = (eventName: string, params: Record<string, any>) => {
  if (typeof window === 'undefined') return;
  const gtag = (window as any).gtag;
  if (typeof gtag === 'function') {
    gtag('event', eventName, params);
  }
};

const sendMeta = (eventName: string, params: Record<string, any>) => {
  if (typeof window === 'undefined') return;
  const fbq = (window as any).fbq;
  if (typeof fbq === 'function') {
    fbq('track', eventName, params);
  }
};

export const trackViewItem = (item: AnalyticsItem, value?: number, currency: string = 'NGN') => {
  sendGA('view_item', {
    currency,
    value,
    items: [item],
  });
};

export const trackAddToCart = (item: AnalyticsItem, value?: number, currency: string = 'NGN') => {
  sendGA('add_to_cart', {
    currency,
    value,
    items: [item],
  });
  sendMeta('AddToCart', {
    currency,
    value,
    content_ids: item.item_id ? [item.item_id] : undefined,
    content_name: item.item_name,
    contents: [
      {
        id: item.item_id,
        quantity: item.quantity || 1,
        item_price: item.price,
      },
    ],
  });
};

export const trackBeginCheckout = (items: AnalyticsItem[], value?: number, currency: string = 'NGN') => {
  sendGA('begin_checkout', {
    currency,
    value,
    items,
  });
  sendMeta('InitiateCheckout', {
    currency,
    value,
    num_items: items.length,
    contents: items.map((item) => ({
      id: item.item_id,
      quantity: item.quantity || 1,
      item_price: item.price,
    })),
  });
};

export const trackPurchase = (
  items: AnalyticsItem[],
  value: number,
  transactionId: string,
  currency: string = 'NGN'
) => {
  sendGA('purchase', {
    transaction_id: transactionId,
    currency,
    value,
    items,
  });
  sendMeta('Purchase', {
    currency,
    value,
    contents: items.map((item) => ({
      id: item.item_id,
      quantity: item.quantity || 1,
      item_price: item.price,
    })),
  });
};
