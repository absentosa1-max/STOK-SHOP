import { useState, useEffect } from 'react';
import {
  Product,
  StockLog,
  NotificationItem,
  NavigationTab,
  UserAccount,
  IncomingStockRecord,
  OutgoingStockRecord,
} from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_INCOMING_RECORDS,
  INITIAL_OUTGOING_RECORDS,
} from './data/mockData';
import { INITIAL_USERS } from './data/initialUsers';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StockTable } from './components/StockTable';
import { DashboardView } from './components/DashboardView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { UserManagementView } from './components/UserManagementView';
import { IncomingStockView } from './components/IncomingStockView';
import { OutgoingStockView } from './components/OutgoingStockView';
import { QuickSearchModal } from './components/QuickSearchModal';
import { AddEditProductModal } from './components/AddEditProductModal';
import { ExportModal } from './components/ExportModal';
import { StockHistoryModal } from './components/StockHistoryModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import {
  bootstrapFirestoreDefaults,
  subscribeToRealtimeData,
  firestoreSaveUser,
  firestoreDeleteUser,
  firestoreSaveProduct,
  firestoreDeleteProduct,
  firestoreBulkSaveProducts,
  firestoreClearProducts,
  firestoreSaveLog,
  firestoreClearLogs,
  firestoreSaveIncomingRecord,
  firestoreDeleteIncomingRecord,
  firestoreClearIncomingRecords,
  firestoreSaveOutgoingRecord,
  firestoreDeleteOutgoingRecord,
  firestoreClearOutgoingRecords,
  firestoreMarkAllNotificationsRead,
  firestoreClearNotifications,
} from './services/firestoreService';

function loadStoredUsers(): UserAccount[] {
  try {
    const saved = localStorage.getItem('stockmaster_users');
    if (saved) {
      const parsed: UserAccount[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const merged = [...parsed];
        for (const initUser of INITIAL_USERS) {
          if (!merged.some((u) => u.email.toLowerCase().trim() === initUser.email.toLowerCase().trim())) {
            merged.push(initUser);
          }
        }
        return merged;
      }
    }
  } catch (e) {
    console.error('Error reading stored users:', e);
  }
  return INITIAL_USERS;
}

export default function App() {
  const [users, setUsers] = useState<UserAccount[]>(loadStoredUsers);
  
  // Persist / restore logged-in session across page reloads & tabs
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    try {
      const saved = localStorage.getItem('stockmaster_auth');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_USERS[0];
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('stockmaster_auth');
      if (saved) return true;
    } catch (e) {}
    return false;
  });

  const [userEmail, setUserEmail] = useState(currentUser?.email || INITIAL_USERS[0].email);
  const [activeTab, setActiveTab] = useState<NavigationTab>('inventory');
  const [selectedWarehouse, setSelectedWarehouse] = useState('Lantai 1');

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('stockmaster_products');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_PRODUCTS;
  });

  const [logs, setLogs] = useState<StockLog[]>(() => {
    try {
      const saved = localStorage.getItem('stockmaster_logs');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('stockmaster_notifications');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_NOTIFICATIONS;
  });

  const [incomingRecords, setIncomingRecords] = useState<IncomingStockRecord[]>(() => {
    try {
      const saved = localStorage.getItem('stockmaster_incoming');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_INCOMING_RECORDS;
  });

  const [outgoingRecords, setOutgoingRecords] = useState<OutgoingStockRecord[]>(() => {
    try {
      const saved = localStorage.getItem('stockmaster_outgoing');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_OUTGOING_RECORDS;
  });

  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  // Firestore Realtime Synchronization
  useEffect(() => {
    // 1. Initialize cloud defaults if database is freshly provisioned
    bootstrapFirestoreDefaults().then(() => {
      setIsRealtimeConnected(true);
    });

    // 2. Setup active Firestore real-time subscriptions
    const unsubscribe = subscribeToRealtimeData({
      onUsers: (cloudUsers) => {
        if (cloudUsers.length > 0) {
          const merged = [...cloudUsers];
          for (const initUser of INITIAL_USERS) {
            if (!merged.some((u) => u.email.toLowerCase().trim() === initUser.email.toLowerCase().trim())) {
              merged.push(initUser);
            }
          }
          setUsers(merged);
          try {
            localStorage.setItem('stockmaster_users', JSON.stringify(merged));
          } catch (e) {}
        }
      },
      onProducts: (cloudProducts) => {
        setProducts(cloudProducts);
        try {
          localStorage.setItem('stockmaster_products', JSON.stringify(cloudProducts));
        } catch (e) {}
      },
      onLogs: (cloudLogs) => {
        setLogs(cloudLogs);
        try {
          localStorage.setItem('stockmaster_logs', JSON.stringify(cloudLogs));
        } catch (e) {}
      },
      onIncoming: (cloudIncoming) => {
        setIncomingRecords(cloudIncoming);
        try {
          localStorage.setItem('stockmaster_incoming', JSON.stringify(cloudIncoming));
        } catch (e) {}
      },
      onOutgoing: (cloudOutgoing) => {
        setOutgoingRecords(cloudOutgoing);
        try {
          localStorage.setItem('stockmaster_outgoing', JSON.stringify(cloudOutgoing));
        } catch (e) {}
      },
      onNotifications: (cloudNotifs) => {
        setNotifications(cloudNotifs);
        try {
          localStorage.setItem('stockmaster_notifications', JSON.stringify(cloudNotifs));
        } catch (e) {}
      },
      onError: (err) => {
        console.warn('[Realtime Sync] Notice:', err);
      },
    });

    setIsRealtimeConnected(true);

    return () => {
      unsubscribe();
    };
  }, []);

  // Modal States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Toast Notification Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setUserEmail(user.email);
    setIsLoggedIn(true);
    try {
      localStorage.setItem('stockmaster_auth', JSON.stringify(user));
    } catch (e) {}
    showToast(`Selamat datang kembali, ${user.name}!`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    try {
      localStorage.removeItem('stockmaster_auth');
    } catch (e) {}
    showToast('Sesi telah berakhir.');
  };

  // User Account Management handlers with Cloud Sync
  const handleAddUser = async (userData: Omit<UserAccount, 'id' | 'createdAt'>) => {
    const newUser: UserAccount = {
      ...userData,
      name: userData.name.trim(),
      email: userData.email.trim(),
      password: userData.password.trim(),
      roleLabel: userData.roleLabel?.trim() || 'Staf Operasional',
      department: userData.department?.trim() || 'Manajemen Gudang',
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    
    setUsers((prev) => {
      const updated = [...prev, newUser];
      try {
        localStorage.setItem('stockmaster_users', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      await firestoreSaveUser(newUser);
    } catch (err) {
      console.error('[Cloud] Error saving user:', err);
    }

    showToast(`Akun ${newUser.name} (${newUser.roleLabel}) tersimpan di Cloud Database!`);
  };

  const handleUpdateUser = async (userId: string, updatedData: Partial<UserAccount>) => {
    let targetUpdated: UserAccount | null = null;

    setUsers((prev) => {
      const updated = prev.map((u) => {
        if (u.id === userId) {
          const mod: UserAccount = {
            ...u,
            ...updatedData,
            name: updatedData.name !== undefined ? updatedData.name.trim() : u.name,
            email: updatedData.email !== undefined ? updatedData.email.trim() : u.email,
            password: updatedData.password !== undefined ? updatedData.password.trim() : u.password,
            roleLabel: updatedData.roleLabel !== undefined ? updatedData.roleLabel.trim() : u.roleLabel,
            department: updatedData.department !== undefined ? updatedData.department.trim() : u.department,
          };
          targetUpdated = mod;
          if (currentUser?.id === userId) {
            setCurrentUser(mod);
            try {
              localStorage.setItem('stockmaster_auth', JSON.stringify(mod));
            } catch (e) {}
          }
          return mod;
        }
        return u;
      });

      try {
        localStorage.setItem('stockmaster_users', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (targetUpdated) {
      try {
        await firestoreSaveUser(targetUpdated);
      } catch (err) {
        console.error('[Cloud] Error updating user:', err);
      }
    }

    showToast(`Data akun pengguna telah diperbarui di Cloud.`);
  };

  const handleDeleteUser = async (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    setUsers((prev) => {
      const updated = prev.filter((u) => u.id !== userId);
      try {
        localStorage.setItem('stockmaster_users', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      await firestoreDeleteUser(userId);
    } catch (err) {
      console.error('[Cloud] Error deleting user:', err);
    }

    showToast(`Akun ${targetUser?.name || ''} telah dihapus dari Cloud.`);
  };

  // Handlers for Outgoing Stock Records
  const handleAddOutgoingRecord = async (recordData: Partial<OutgoingStockRecord>) => {
    const newRecordId = `out-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord: OutgoingStockRecord = {
      id: newRecordId,
      dateOut: recordData.dateOut || new Date().toISOString().slice(0, 10),
      productId: recordData.productId || 'custom',
      productName: recordData.productName || 'Produk Keluar',
      sku: recordData.sku || `SKU-${Date.now().toString().slice(-4)}`,
      category: recordData.category || 'Umum',
      size: recordData.size || '—',
      color: recordData.color || '—',
      colorHex: recordData.colorHex,
      quantity: recordData.quantity || 1,
      unitPrice: recordData.unitPrice || 0,
      customerOrDestination: recordData.customerOrDestination || 'Pelanggan Umum',
      soNumber: recordData.soNumber || `SO-${Date.now().toString().slice(-6)}`,
      shippingCarrier: recordData.shippingCarrier || 'Internal',
      reason: recordData.reason || 'Penjualan',
      note: recordData.note,
      processedBy: currentUser?.name || 'Ops Manager',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };

    setOutgoingRecords((prev) => {
      const updated = [newRecord, ...prev];
      try {
        localStorage.setItem('stockmaster_outgoing', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    let updatedTargetProduct: Product | null = null;
    if (recordData.productId && recordData.productId !== 'custom') {
      setProducts((prev) => {
        const updated = prev.map((p) => {
          if (p.id === recordData.productId) {
            const updatedP = { ...p, stock: Math.max(0, p.stock - newRecord.quantity) };
            updatedTargetProduct = updatedP;
            return updatedP;
          }
          return p;
        });
        try {
          localStorage.setItem('stockmaster_products', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }

    const newLog: StockLog = {
      id: `log-${Date.now()}`,
      productId: newRecord.productId,
      productName: `${newRecord.productName} (${newRecord.size}/${newRecord.color})`,
      sku: newRecord.sku,
      type: 'OUT',
      delta: -newRecord.quantity,
      previousStock: 0,
      newStock: 0,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      user: currentUser?.name || 'Ops Manager',
      note: `Pengeluaran barang (${newRecord.soNumber}) ke ${newRecord.customerOrDestination}`,
    };
    
    setLogs((prev) => {
      const updated = [newLog, ...prev];
      try {
        localStorage.setItem('stockmaster_logs', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      await firestoreSaveOutgoingRecord(newRecord);
      await firestoreSaveLog(newLog);
      if (updatedTargetProduct) {
        await firestoreSaveProduct(updatedTargetProduct);
      }
    } catch (err) {
      console.error('[Cloud] Error saving outgoing record:', err);
    }

    showToast(`Barang keluar ${newRecord.productName} (-${newRecord.quantity} unit) tersimpan di Cloud!`);
  };

  const handleEditOutgoingRecord = async (recordId: string, updatedData: Partial<OutgoingStockRecord>) => {
    const existing = outgoingRecords.find((r) => r.id === recordId);
    if (!existing) return;

    const oldQty = existing.quantity;
    const newQty = updatedData.quantity !== undefined ? updatedData.quantity : oldQty;
    const qtyDelta = oldQty - newQty;
    let modifiedRecord: OutgoingStockRecord | null = null;
    let updatedTargetProduct: Product | null = null;

    setOutgoingRecords((prev) => {
      const updated = prev.map((r) => {
        if (r.id === recordId) {
          const mod = {
            ...r,
            ...updatedData,
            updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
          };
          modifiedRecord = mod;
          return mod;
        }
        return r;
      });
      try {
        localStorage.setItem('stockmaster_outgoing', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const targetProductId = updatedData.productId || existing.productId;
    if (targetProductId && targetProductId !== 'custom' && qtyDelta !== 0) {
      setProducts((prev) => {
        const updated = prev.map((p) => {
          if (p.id === targetProductId) {
            const updatedP = { ...p, stock: Math.max(0, p.stock + qtyDelta) };
            updatedTargetProduct = updatedP;
            return updatedP;
          }
          return p;
        });
        try {
          localStorage.setItem('stockmaster_products', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }

    const newLog: StockLog = {
      id: `log-${Date.now()}`,
      productId: targetProductId,
      productName: updatedData.productName || existing.productName,
      sku: updatedData.sku || existing.sku,
      type: 'ADJUSTMENT',
      delta: qtyDelta,
      previousStock: oldQty,
      newStock: newQty,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      user: currentUser?.name || 'Ops Manager',
      note: `Koreksi data entry barang keluar #${recordId} (${existing.soNumber})`,
    };
    
    setLogs((prev) => {
      const updated = [newLog, ...prev];
      try {
        localStorage.setItem('stockmaster_logs', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      if (modifiedRecord) await firestoreSaveOutgoingRecord(modifiedRecord);
      await firestoreSaveLog(newLog);
      if (updatedTargetProduct) await firestoreSaveProduct(updatedTargetProduct);
    } catch (err) {
      console.error('[Cloud] Error updating outgoing record:', err);
    }

    showToast(`Record barang keluar #${recordId} berhasil diperbarui di Cloud.`);
  };

  const handleDeleteOutgoingRecord = async (recordId: string) => {
    const existing = outgoingRecords.find((r) => r.id === recordId);
    if (!existing) return;

    setOutgoingRecords((prev) => {
      const updated = prev.filter((r) => r.id !== recordId);
      try {
        localStorage.setItem('stockmaster_outgoing', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    let updatedTargetProduct: Product | null = null;
    if (existing.productId && existing.productId !== 'custom') {
      setProducts((prev) => {
        const updated = prev.map((p) => {
          if (p.id === existing.productId) {
            const updatedP = { ...p, stock: p.stock + existing.quantity };
            updatedTargetProduct = updatedP;
            return updatedP;
          }
          return p;
        });
        try {
          localStorage.setItem('stockmaster_products', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }

    try {
      await firestoreDeleteOutgoingRecord(recordId);
      if (updatedTargetProduct) await firestoreSaveProduct(updatedTargetProduct);
    } catch (err) {
      console.error('[Cloud] Error deleting outgoing record:', err);
    }

    showToast(`Record barang keluar #${recordId} telah dihapus dari Cloud.`);
  };

  // Handlers for Incoming Stock Records
  const handleAddIncomingRecord = async (recordData: Partial<IncomingStockRecord>) => {
    const newRecordId = `in-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord: IncomingStockRecord = {
      id: newRecordId,
      dateAdded: recordData.dateAdded || new Date().toISOString().slice(0, 10),
      productId: recordData.productId || 'custom',
      productName: recordData.productName || 'Produk Masuk',
      sku: recordData.sku || `SKU-${Date.now().toString().slice(-4)}`,
      category: recordData.category || 'Umum',
      size: recordData.size || '—',
      color: recordData.color || '—',
      colorHex: recordData.colorHex,
      quantity: recordData.quantity || 1,
      unitPrice: recordData.unitPrice || 0,
      supplier: recordData.supplier || 'Pemasok Umum',
      poNumber: recordData.poNumber || `PO-${Date.now().toString().slice(-6)}`,
      note: recordData.note,
      receivedBy: currentUser?.name || 'Ops Manager',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };

    setIncomingRecords((prev) => {
      const updated = [newRecord, ...prev];
      try {
        localStorage.setItem('stockmaster_incoming', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    let updatedTargetProduct: Product | null = null;
    if (recordData.productId && recordData.productId !== 'custom') {
      setProducts((prev) => {
        const updated = prev.map((p) => {
          if (p.id === recordData.productId) {
            const updatedP = { ...p, stock: p.stock + newRecord.quantity };
            updatedTargetProduct = updatedP;
            return updatedP;
          }
          return p;
        });
        try {
          localStorage.setItem('stockmaster_products', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }

    const newLog: StockLog = {
      id: `log-${Date.now()}`,
      productId: newRecord.productId,
      productName: `${newRecord.productName} (${newRecord.size}/${newRecord.color})`,
      sku: newRecord.sku,
      type: 'IN',
      delta: newRecord.quantity,
      previousStock: 0,
      newStock: newRecord.quantity,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      user: currentUser?.name || 'Ops Manager',
      note: `Penerimaan stok masuk (${newRecord.poNumber}) dari ${newRecord.supplier}`,
    };
    
    setLogs((prev) => {
      const updated = [newLog, ...prev];
      try {
        localStorage.setItem('stockmaster_logs', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      await firestoreSaveIncomingRecord(newRecord);
      await firestoreSaveLog(newLog);
      if (updatedTargetProduct) await firestoreSaveProduct(updatedTargetProduct);
    } catch (err) {
      console.error('[Cloud] Error saving incoming record:', err);
    }

    showToast(`Stok masuk ${newRecord.productName} (+${newRecord.quantity} unit) tersimpan di Cloud!`);
  };

  const handleEditIncomingRecord = async (recordId: string, updatedData: Partial<IncomingStockRecord>) => {
    const existing = incomingRecords.find((r) => r.id === recordId);
    if (!existing) return;

    const oldQty = existing.quantity;
    const newQty = updatedData.quantity !== undefined ? updatedData.quantity : oldQty;
    const qtyDelta = newQty - oldQty;
    let modifiedRecord: IncomingStockRecord | null = null;
    let updatedTargetProduct: Product | null = null;

    setIncomingRecords((prev) => {
      const updated = prev.map((r) => {
        if (r.id === recordId) {
          const mod = {
            ...r,
            ...updatedData,
            updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
          };
          modifiedRecord = mod;
          return mod;
        }
        return r;
      });
      try {
        localStorage.setItem('stockmaster_incoming', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const targetProductId = updatedData.productId || existing.productId;
    if (targetProductId && targetProductId !== 'custom' && qtyDelta !== 0) {
      setProducts((prev) => {
        const updated = prev.map((p) => {
          if (p.id === targetProductId) {
            const updatedP = { ...p, stock: Math.max(0, p.stock + qtyDelta) };
            updatedTargetProduct = updatedP;
            return updatedP;
          }
          return p;
        });
        try {
          localStorage.setItem('stockmaster_products', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }

    const newLog: StockLog = {
      id: `log-${Date.now()}`,
      productId: targetProductId,
      productName: updatedData.productName || existing.productName,
      sku: updatedData.sku || existing.sku,
      type: 'ADJUSTMENT',
      delta: qtyDelta,
      previousStock: oldQty,
      newStock: newQty,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      user: currentUser?.name || 'Ops Manager',
      note: `Koreksi data entry stok masuk #${recordId} (${existing.poNumber})`,
    };
    
    setLogs((prev) => {
      const updated = [newLog, ...prev];
      try {
        localStorage.setItem('stockmaster_logs', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      if (modifiedRecord) await firestoreSaveIncomingRecord(modifiedRecord);
      await firestoreSaveLog(newLog);
      if (updatedTargetProduct) await firestoreSaveProduct(updatedTargetProduct);
    } catch (err) {
      console.error('[Cloud] Error updating incoming record:', err);
    }

    showToast(`Record stok masuk #${recordId} berhasil diperbarui di Cloud.`);
  };

  const handleDeleteIncomingRecord = async (recordId: string) => {
    const existing = incomingRecords.find((r) => r.id === recordId);
    if (!existing) return;

    setIncomingRecords((prev) => {
      const updated = prev.filter((r) => r.id !== recordId);
      try {
        localStorage.setItem('stockmaster_incoming', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    let updatedTargetProduct: Product | null = null;
    if (existing.productId && existing.productId !== 'custom') {
      setProducts((prev) => {
        const updated = prev.map((p) => {
          if (p.id === existing.productId) {
            const updatedP = { ...p, stock: Math.max(0, p.stock - existing.quantity) };
            updatedTargetProduct = updatedP;
            return updatedP;
          }
          return p;
        });
        try {
          localStorage.setItem('stockmaster_products', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }

    try {
      await firestoreDeleteIncomingRecord(recordId);
      if (updatedTargetProduct) await firestoreSaveProduct(updatedTargetProduct);
    } catch (err) {
      console.error('[Cloud] Error deleting incoming record:', err);
    }

    showToast(`Record stok masuk #${recordId} telah dihapus dari Cloud.`);
  };

  // Live stock adjustment +/- handler
  const handleUpdateStock = async (productId: string, variantId: string | null, delta: number) => {
    let updatedTargetProduct: Product | null = null;
    let newLog: StockLog | null = null;

    setProducts((prevProducts) => {
      const updated = prevProducts.map((p) => {
        if (p.id !== productId) return p;

        if (variantId && p.variants) {
          const updatedVariants = p.variants.map((v) => {
            if (v.id !== variantId) return v;
            const newVarStock = Math.max(0, v.stock + delta);
            return { ...v, stock: newVarStock };
          });
          const totalMainStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);

          const targetVariant = p.variants.find((v) => v.id === variantId);
          newLog = {
            id: `log-${Date.now()}`,
            productId: p.id,
            productName: `${p.name} (${targetVariant?.size}/${targetVariant?.color})`,
            sku: targetVariant?.sku || p.sku,
            type: delta > 0 ? 'IN' : 'OUT',
            delta,
            previousStock: targetVariant?.stock || 0,
            newStock: Math.max(0, (targetVariant?.stock || 0) + delta),
            timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
            user: currentUser?.name || 'Ops Manager',
            note: delta > 0 ? 'Penyesuaian stok masuk cepat (+)' : 'Penyesuaian stok keluar cepat (-)',
          };

          const fullProduct: Product = { ...p, stock: totalMainStock, variants: updatedVariants };
          updatedTargetProduct = fullProduct;
          return fullProduct;
        } else {
          const newStock = Math.max(0, p.stock + delta);
          newLog = {
            id: `log-${Date.now()}`,
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            type: delta > 0 ? 'IN' : 'OUT',
            delta,
            previousStock: p.stock,
            newStock,
            timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
            user: currentUser?.name || 'Ops Manager',
            note: delta > 0 ? 'Penyesuaian manual (+)' : 'Penyesuaian manual (-)',
          };

          const fullProduct: Product = { ...p, stock: newStock };
          updatedTargetProduct = fullProduct;
          return fullProduct;
        }
      });
      try {
        localStorage.setItem('stockmaster_products', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (newLog) {
      setLogs((prev) => {
        const updated = [newLog!, ...prev];
        try {
          localStorage.setItem('stockmaster_logs', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }

    try {
      if (updatedTargetProduct) await firestoreSaveProduct(updatedTargetProduct);
      if (newLog) await firestoreSaveLog(newLog);
    } catch (err) {
      console.error('[Cloud] Error updating stock:', err);
    }

    showToast(`Stok ${updatedTargetProduct?.name || 'produk'} diperbarui di Cloud.`);
  };

  // Add or edit product
  const handleClearStock = async () => {
    const cleared = products.map((p) => ({
      ...p,
      stock: 0,
      variants: p.variants?.map((v) => ({ ...v, stock: 0 })),
      lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
    }));
    setProducts(cleared);
    try {
      localStorage.setItem('stockmaster_products', JSON.stringify(cleared));
    } catch (e) {}

    try {
      await firestoreBulkSaveProducts(cleared);
    } catch (err) {
      console.error('[Cloud] Error clearing stock:', err);
    }

    showToast('Seluruh stok produk telah dikosongkan di Cloud.');
  };

  const handleClearIncomingRecords = async () => {
    setIncomingRecords([]);
    try {
      localStorage.setItem('stockmaster_incoming', JSON.stringify([]));
    } catch (e) {}
    await firestoreClearIncomingRecords();
    showToast('Seluruh riwayat stok masuk telah dibersihkan.');
  };

  const handleClearOutgoingRecords = async () => {
    setOutgoingRecords([]);
    try {
      localStorage.setItem('stockmaster_outgoing', JSON.stringify([]));
    } catch (e) {}
    await firestoreClearOutgoingRecords();
    showToast('Seluruh riwayat stok keluar telah dibersihkan.');
  };

  const handleClearLogs = async () => {
    setLogs([]);
    try {
      localStorage.setItem('stockmaster_logs', JSON.stringify([]));
    } catch (e) {}
    await firestoreClearLogs();
    showToast('Seluruh riwayat laporan & audit log telah dibersihkan.');
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (productData.id) {
      let modified: Product | null = null;
      setProducts((prev) => {
        const updated = prev.map((p) => {
          if (p.id === productData.id) {
            const up = { ...p, ...productData } as Product;
            modified = up;
            return up;
          }
          return p;
        });
        try {
          localStorage.setItem('stockmaster_products', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      if (modified) {
        try {
          await firestoreSaveProduct(modified);
        } catch (err) {
          console.error('[Cloud] Error saving product:', err);
        }
      }

      showToast(`Detail produk ${productData.name} tersimpan di Cloud.`);
    } else {
      const nextId = (products.length + 1).toString().padStart(3, '0');
      const newProd: Product = {
        id: nextId,
        name: productData.name || 'Produk Baru',
        description: productData.description || 'Deskripsi Produk',
        sku: productData.sku || `SKU-${nextId}`,
        category: productData.category || 'Elektronik',
        size: productData.size || '—',
        color: productData.color || '—',
        stock: productData.stock || 10,
        price: productData.price || 100000,
        minThreshold: 10,
        lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
      setProducts((prev) => {
        const updated = [newProd, ...prev];
        try {
          localStorage.setItem('stockmaster_products', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      try {
        await firestoreSaveProduct(newProd);
      } catch (err) {
        console.error('[Cloud] Error creating product:', err);
      }

      showToast(`Produk baru ${newProd.name} tersimpan di Cloud.`);
    }
  };

  // Delete product permanently
  const handleDeleteProduct = async (productId: string) => {
    const targetProduct = products.find((p) => p.id === productId);
    const updatedProducts = products.filter((p) => p.id !== productId);
    setProducts(updatedProducts);
    try {
      localStorage.setItem('stockmaster_products', JSON.stringify(updatedProducts));
    } catch (e) {}

    try {
      await firestoreDeleteProduct(productId);
    } catch (err) {
      console.error('[Cloud] Error deleting product from Cloud:', err);
    }

    if (targetProduct) {
      showToast(`Produk "${targetProduct.name}" berhasil dihapus secara permanen.`);
    }
  };

  // Copy / Duplicate product
  const handleCopyProduct = async (product: Product) => {
    const nextId = (Math.max(...products.map((p) => parseInt(p.id) || 0), 0) + 1)
      .toString()
      .padStart(3, '0');

    const duplicatedProduct: Product = {
      ...product,
      id: nextId,
      name: `${product.name} (Salinan)`,
      sku: `${product.sku}-CPY`,
      lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };

    setProducts((prev) => {
      const updated = [duplicatedProduct, ...prev];
      try {
        localStorage.setItem('stockmaster_products', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      await firestoreSaveProduct(duplicatedProduct);
    } catch (err) {
      console.error('[Cloud] Error duplicating product:', err);
    }

    showToast(`Produk "${product.name}" berhasil disalin ke Cloud.`);
  };

  // If user is logged out, display exact Login Screen
  if (!isLoggedIn) {
    return <LoginScreen users={users} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-mono tracking-wider uppercase px-5 py-3.5 flex items-center gap-3 border border-slate-700 shadow-xl rounded-lg animate-fade-in">
          <span className="material-symbols-outlined text-[18px] text-blue-400">
            cloud_done
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLogout={handleLogout}
        unreadCount={notifications.filter((n) => !n.read).length}
        currentUser={currentUser}
        isRealtimeConnected={isRealtimeConnected}
      />

      {/* Main Container Right of Sidebar */}
      <div className="pl-64 flex-1 flex flex-col min-h-screen bg-slate-50">
        {/* Sticky Top Header */}
        <Header
          userEmail={userEmail}
          currentUser={currentUser}
          notifications={notifications}
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleNotifs={() => setIsNotifOpen(!isNotifOpen)}
          showNotifDrawer={isNotifOpen}
          selectedWarehouse={selectedWarehouse}
          onSelectWarehouse={setSelectedWarehouse}
          onLogout={handleLogout}
          isRealtimeConnected={isRealtimeConnected}
        />

        {/* View Content Canvas */}
        <main className="p-6 md:p-8 flex-1 max-w-[1440px] w-full mx-auto">
          {activeTab === 'inventory' && (
            <StockTable
              products={products}
              onUpdateStock={handleUpdateStock}
              onOpenAddModal={() => {
                setProductToEdit(null);
                setIsAddEditOpen(true);
              }}
              onOpenEditModal={(product) => {
                setProductToEdit(product);
                setIsAddEditOpen(true);
              }}
              onOpenExportModal={() => setIsExportOpen(true)}
              onViewLogs={(product) => {
                setHistoryProduct(product);
                setIsHistoryOpen(true);
              }}
              onDeleteProduct={handleDeleteProduct}
              onCopyProduct={handleCopyProduct}
              onNavigateIncomingStock={() => setActiveTab('incoming_stock')}
              onNavigateOutgoingStock={() => setActiveTab('outgoing_stock')}
            />
          )}

          {activeTab === 'incoming_stock' && (
            <IncomingStockView
              incomingRecords={incomingRecords}
              products={products}
              onAddRecord={handleAddIncomingRecord}
              onEditRecord={handleEditIncomingRecord}
              onDeleteRecord={handleDeleteIncomingRecord}
            />
          )}

          {activeTab === 'outgoing_stock' && (
            <OutgoingStockView
              outgoingRecords={outgoingRecords}
              products={products}
              onAddRecord={handleAddOutgoingRecord}
              onEditRecord={handleEditOutgoingRecord}
              onDeleteRecord={handleDeleteOutgoingRecord}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              products={products}
              logs={logs}
              selectedWarehouse={selectedWarehouse}
              onNavigateToStock={() => setActiveTab('inventory')}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              products={products}
              onOpenExportModal={() => setIsExportOpen(true)}
            />
          )}

          {activeTab === 'users' && (
            <UserManagementView
              currentUser={currentUser}
              users={users}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              userEmail={userEmail}
              currentUser={currentUser}
              selectedWarehouse={selectedWarehouse}
              onSelectWarehouse={setSelectedWarehouse}
              onLogout={handleLogout}
              onNavigateToUsers={() => setActiveTab('users')}
              onClearStock={handleClearStock}
              onClearIncomingRecords={handleClearIncomingRecords}
              onClearOutgoingRecords={handleClearOutgoingRecords}
              onClearLogs={handleClearLogs}
            />
          )}
        </main>
      </div>

      {/* Quick Command Palette Search Modal */}
      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(p) => {
          setActiveTab('inventory');
          showToast(`Terpilih: ${p.name} (${p.sku})`);
        }}
      />

      {/* Add / Edit Product Modal */}
      <AddEditProductModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        productToEdit={productToEdit}
        onSave={handleSaveProduct}
        existingCategories={products.map((p) => p.category).filter(Boolean)}
      />

      {/* Export Report Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        products={products}
      />

      {/* Stock History Audit Log Modal */}
      <StockHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        product={historyProduct}
        logs={logs}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          firestoreMarkAllNotificationsRead();
        }}
      />
    </div>
  );
}
