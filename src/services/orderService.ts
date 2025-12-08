import { supabase } from '../lib/supabase';

export interface ConfirmPaymentResult {
  success: boolean;
  error?: string;
}

export const orderService = {
  /**
   * Confirm payment and reduce stock for an order.
   * Only call this when payment is verified as successful.
   * Stock is only decremented when payment is confirmed.
   */
  async confirmPaymentAndReduceStock(
    orderId: string,
    paymentReference?: string
  ): Promise<ConfirmPaymentResult> {
    try {
      // Call the database function that handles everything atomically
      const { data, error } = await supabase.rpc('confirm_payment_and_reduce_stock', {
        order_id_param: orderId,
        payment_reference: paymentReference || null,
      });

      if (error) {
        console.error('Error confirming payment:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.error('Unexpected error confirming payment:', err);
      return { success: false, error: err.message || 'Failed to confirm payment' };
    }
  },

  /**
   * Mark order as failed/cancelled without reducing stock
   */
  async cancelOrder(orderId: string, reason?: string): Promise<ConfirmPaymentResult> {
    try {
      // Update order status to cancelled
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          admin_notes: reason || 'Payment failed or cancelled'
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Update payment status to failed
      const { error: paymentError } = await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('order_id', orderId);

      if (paymentError) throw paymentError;

      return { success: true };
    } catch (err: any) {
      console.error('Error cancelling order:', err);
      return { success: false, error: err.message || 'Failed to cancel order' };
    }
  },

  /**
   * Verify Paystack payment and confirm order
   */
  async verifyPaystackPayment(reference: string, orderId: string): Promise<ConfirmPaymentResult> {
    try {
      // In production, you would verify with Paystack API here
      // For now, we'll assume the callback means success
      // The actual verification should happen server-side (Supabase Edge Function)
      
      return await this.confirmPaymentAndReduceStock(orderId, reference);
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Handle bank transfer confirmation (admin action)
   */
  async confirmBankTransfer(orderId: string, adminNotes?: string): Promise<ConfirmPaymentResult> {
    try {
      const result = await this.confirmPaymentAndReduceStock(orderId);
      
      if (result.success && adminNotes) {
        await supabase
          .from('orders')
          .update({ admin_notes: adminNotes })
          .eq('id', orderId);
      }
      
      return result;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Restore stock when an order is refunded or cancelled after payment
   */
  async restoreStockForOrder(orderId: string): Promise<ConfirmPaymentResult> {
    try {
      const { data, error } = await supabase.rpc('restore_stock_for_order', {
        order_id_param: orderId,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
