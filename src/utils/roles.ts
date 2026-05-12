/**
 * Centralised RBAC helpers for the admin console.
 *
 * Roles are stored as plain strings on the user (legacy `admin_users.role`
 * column is a VARCHAR). Treat `admin` as the super-role: it implicitly has
 * every other permission.
 */

export type AdminRole =
  | 'admin'
  | 'order_processor'
  | 'content_manager'
  | 'editor'
  | 'viewer';

export const ROLE_OPTIONS: Array<{ value: AdminRole; label: string; description: string }> = [
  {
    value: 'admin',
    label: 'Administrator',
    description: 'Full access. Manages users, settings, catalogue, orders.',
  },
  {
    value: 'order_processor',
    label: 'Order Processor',
    description: 'Orders, customers, leads, and cart requests only.',
  },
  {
    value: 'content_manager',
    label: 'Content Manager',
    description: 'Catalogue (products, locations, brands, content) only.',
  },
  {
    value: 'editor',
    label: 'Editor (legacy)',
    description: 'Backward-compatible content editor.',
  },
  {
    value: 'viewer',
    label: 'Viewer',
    description: 'Read-only across the console.',
  },
];

export function getRoleLabel(role?: string | null): string {
  const match = ROLE_OPTIONS.find((r) => r.value === role);
  return match ? match.label : role || 'User';
}

function asRole(role?: string | null): string {
  return (role || '').toLowerCase().trim();
}

/** Admin sees everything. */
export function isAdmin(role?: string | null): boolean {
  return asRole(role) === 'admin';
}

/** Can read order data (list, view detail). */
export function canViewOrders(role?: string | null): boolean {
  const r = asRole(role);
  return r === 'admin' || r === 'order_processor' || r === 'viewer';
}

/** Can change order status / payment / refund / shipment / notes. */
export function canManageOrders(role?: string | null): boolean {
  const r = asRole(role);
  return r === 'admin' || r === 'order_processor';
}

/** Catalogue & marketing content. */
export function canManageContent(role?: string | null): boolean {
  const r = asRole(role);
  return r === 'admin' || r === 'content_manager' || r === 'editor';
}

/** User management & sensitive settings — admin only. */
export function canManageUsers(role?: string | null): boolean {
  return isAdmin(role);
}

/** Company settings is admin + content_manager (branding/legal). */
export function canManageSettings(role?: string | null): boolean {
  const r = asRole(role);
  return r === 'admin' || r === 'content_manager';
}

export function canViewAuditLogs(role?: string | null): boolean {
  return isAdmin(role);
}
