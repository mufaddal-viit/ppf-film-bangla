/** Vendor portal constants shared by server code and the request proxy. Keep this file free of server-only imports. */

export const VENDOR_SESSION_COOKIE = 'vendor_session';

export const VENDOR_ROUTES = {
  login: '/vendor/login',
  dashboard: '/vendor',
  stock: '/vendor/stock',
  account: '/vendor/account',
} as const;
