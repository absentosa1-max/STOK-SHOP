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
  {
    id: 'usr-002',
    name: 'Staf Operasional',
    email: 'staff@abs.com',
    role: 'staff',
    roleLabel: 'Staf Operasional Gudang',
    password: 'staff123',
    isPrimaryAdmin: false,
    status: 'active',
    department: 'Manajemen Pergudangan Lantai 1',
    createdAt: '2026-08-12 00:00',
  },
  {
    id: 'usr-003',
    name: 'Supervisor Logistik',
    email: 'gudang@abs.com',
    role: 'staff',
    roleLabel: 'Supervisor Logistik & Distribusi',
    password: 'gudang123',
    isPrimaryAdmin: false,
    status: 'active',
    department: 'Logistik & Ekspedisi',
    createdAt: '2026-08-12 00:00',
  },
];

