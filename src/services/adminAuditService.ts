import { supabase } from '../lib/supabase';

export interface AuditLogEntry {
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
}

export const adminAuditService = {
  /**
   * Log an admin action to the audit log
   */
  async logAction(entry: AuditLogEntry): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('Cannot log action: No authenticated user');
        return;
      }

      await supabase.rpc('log_admin_action', {
        user_id: user.id,
        action_name: entry.action,
        resource_type: entry.resourceType || null,
        resource_id: entry.resourceId || null,
        action_details: entry.details ? JSON.parse(JSON.stringify(entry.details)) : null,
        user_ip: null, // Could be enhanced with actual IP
        user_agent_string: navigator.userAgent,
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
      // Don't throw - logging failures shouldn't break the main action
    }
  },

  /**
   * Log product creation
   */
  async logProductCreate(productId: string, productName: string): Promise<void> {
    await this.logAction({
      action: 'product_create',
      resourceType: 'product',
      resourceId: productId,
      details: { product_name: productName },
    });
  },

  /**
   * Log product update
   */
  async logProductUpdate(productId: string, productName: string, changes: Record<string, any>): Promise<void> {
    await this.logAction({
      action: 'product_update',
      resourceType: 'product',
      resourceId: productId,
      details: { product_name: productName, changes },
    });
  },

  /**
   * Log product deletion
   */
  async logProductDelete(productId: string, productName: string): Promise<void> {
    await this.logAction({
      action: 'product_delete',
      resourceType: 'product',
      resourceId: productId,
      details: { product_name: productName },
    });
  },

  /**
   * Log order status change
   */
  async logOrderStatusChange(orderId: string, orderNumber: string, oldStatus: string, newStatus: string): Promise<void> {
    await this.logAction({
      action: 'order_status_change',
      resourceType: 'order',
      resourceId: orderId,
      details: {
        order_number: orderNumber,
        old_status: oldStatus,
        new_status: newStatus,
      },
    });
  },

  /**
   * Log inventory adjustment
   */
  async logInventoryAdjustment(variantId: string, sku: string, oldQuantity: number, newQuantity: number, reason?: string): Promise<void> {
    await this.logAction({
      action: 'inventory_adjustment',
      resourceType: 'product_variant',
      resourceId: variantId,
      details: {
        sku,
        old_quantity: oldQuantity,
        new_quantity: newQuantity,
        adjustment: newQuantity - oldQuantity,
        reason,
      },
    });
  },

  /**
   * Log customer profile view (for privacy tracking)
   */
  async logCustomerView(customerId: string, customerEmail: string): Promise<void> {
    await this.logAction({
      action: 'customer_view',
      resourceType: 'profile',
      resourceId: customerId,
      details: { customer_email: customerEmail },
    });
  },

  /**
   * Log user role change
   */
  async logRoleChange(userId: string, userEmail: string, oldRole: string, newRole: string): Promise<void> {
    await this.logAction({
      action: 'role_change',
      resourceType: 'profile',
      resourceId: userId,
      details: {
        user_email: userEmail,
        old_role: oldRole,
        new_role: newRole,
      },
    });
  },

  /**
   * Log content/banner changes
   */
  async logContentChange(contentType: string, contentId: string, action: 'create' | 'update' | 'delete'): Promise<void> {
    await this.logAction({
      action: `content_${action}`,
      resourceType: contentType,
      resourceId: contentId,
      details: { content_type: contentType },
    });
  },

  /**
   * Log report generation
   */
  async logReportGeneration(reportType: string, filters: Record<string, any>): Promise<void> {
    await this.logAction({
      action: 'report_generate',
      resourceType: 'report',
      details: {
        report_type: reportType,
        filters,
      },
    });
  },
};
