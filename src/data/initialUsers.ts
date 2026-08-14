import { UserAccount } from '../types';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-001',
    name: 'Yanz',
    email: 'yanz@abs.com',
    role: 'primary_admin',
    roleLabel: 'Administrator Utama',
    password: 'yanz123',
    isPrimaryAdmin: true,
    status: 'active',
    department: 'Direksi & Sistem IT Ops',
    createdAt: '2026-08-12 00:00',
  },
];

