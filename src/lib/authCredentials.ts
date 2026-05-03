export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};

export const DEMO_FRANCHISE = {
  email: 'demo@shop.com',
  password: 'demo123',
  franchiseName: 'Demo Store',
  shopNumber: 'SHOP-001',
};

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizePassword(value: string) {
  return value.trim();
}
