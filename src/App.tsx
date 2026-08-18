import { useState, useEffect, useRef } from 'react';
import {
  Product,
  StockLog,
  NotificationItem,
  NavigationTab,
  UserAccount,
  IncomingStockRecord,
  OutgoingStockRecord,
} from './types';
import { INITIAL_PRODUCTS, INITIAL_LOGS, INITIAL_NOTIFICATIONS, INITIAL_INCOMING_RECORDS, INITIAL_OUTGOING_RECORDS } from './data/mockData';
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

function loadStoredUsers(): UserAccount[] {
  try {
    const saved = localStorage.getItem('stockmaster_users');
    if (saved) {
      const parsed: UserAccount[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure default initial users exist while retaining all user-added accounts
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
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_PRODUCTS;
  });

  const [logs, setLogs] = useState<StockLog[]>(() => {
    try {
      const saved = localStorage.getItem('stockmaster_logs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('stockmaster_notifications');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_NOTIFICATIONS;
  });

  const [incomingRecords, setIncomingRecords] = useState<IncomingStockRecord[]>(() => {
    try {
      const saved = localStorage.getItem('stockmaster_incoming');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_INCOMING_RECORDS;
  });

  const [outgoingRecords, setOutgoingRecords] = useState<OutgoingStockRecord[]>(() => {
    try {
      const saved = localStorage.getItem('stockmaster_outgoing');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_OUTGOING_RECORDS;
  });

  // Realtime Sync setup via WebSocket & BroadcastChannel
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const isRemoteChangeRef = useRef(false);

  useEffect(() => {
    // 1. Cross-tab BroadcastChannel (always active in any environment)
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('stockmaster_realtime');
      channelRef.current = channel;
      channel.onmessage = (e) => {
        if (e.data?.type === 'SYNC_ALL' && e.data.data) {
          isRemoteChangeRef.current = true;
          const { products: p, logs: l, notifications: n, incomingRecords: inc, outgoingRecords: out, users: u } = e.data.data;
          if (p) { setProducts(p); try { localStorage.setItem('stockmaster_products', JSON.stringify(p)); } catch (err) {} }
          if (l) { setLogs(l); try { localStorage.setItem('stockmaster_logs', JSON.stringify(l)); } catch (err) {} }
          if (n) { setNotifications(n); try { localStorage.setItem('stockmaster_notifications', JSON.stringify(n)); } catch (err) {} }
          if (inc) { setIncomingRecords(inc); try { localStorage.setItem('stockmaster_incoming', JSON.stringify(inc)); } catch (err) {} }
          if (out) { setOutgoingRecords(out); try { localStorage.setItem('stockmaster_outgoing', JSON.stringify(out)); } catch (err) {} }
          if (u) { setUsers(u); try { localStorage.setItem('stockmaster_users', JSON.stringify(u)); } catch (err) {} }
        }
      };
    }

    // 2. Full-stack WebSocket connection (when running with backend server)
    const isStaticHosting = window.location.hostname.endsWith('github.io') || window.location.protocol === 'file:';
    if (isStaticHosting) {
      // On static hosting (GitHub Pages), cross-tab BroadcastChannel and localStorage are active
      setIsRealtimeConnected(true);
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    let socket: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    const connectWS = () => {
      try {
        socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          setIsRealtimeConnected(true);
        };

        socket.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data);
            if ((msg.type === 'INIT_STATE' || msg.type === 'STATE_UPDATE') && msg.data) {
              isRemoteChangeRef.current = true;
              const { products: p, logs: l, notifications: n, incomingRecords: inc, outgoingRecords: out, users: u } = msg.data;
              if (p) setProducts(p);
              if (l) setLogs(l);
              if (n) setNotifications(n);
              if (inc) setIncomingRecords(inc);
              if (out) setOutgoingRecords(out);
              if (u) setUsers(u);
            }
          } catch (err) {
            console.error('[Realtime] Message parse error:', err);
          }
        };

        socket.onclose = () => {
          setIsRealtimeConnected(false);
          reconnectTimeout = setTimeout(connectWS, 5000);
        };

        socket.onerror = () => {
          setIsRealtimeConnected(false);
        };
      } catch (err) {
        setIsRealtimeConnected(false);
      }
    };

    connectWS();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (socket) socket.close();
      if (channelRef.current) channelRef.current.close();
    };
  }, []);

  // Sync state changes to server, localStorage, and other tabs whenever local state updates
  useEffect(() => {
    // Persist to localStorage for static hosting / offline resilience
    try {
      localStorage.setItem('stockmaster_products', JSON.stringify(products));
      localStorage.setItem('stockmaster_logs', JSON.stringify(logs));
      localStorage.setItem('stockmaster_notifications', JSON.stringify(notifications));
      localStorage.setItem('stockmaster_incoming', JSON.stringify(incomingRecords));
      localStorage.setItem('stockmaster_outgoing', JSON.stringify(outgoingRecords));
      localStorage.setItem('stockmaster_users', JSON.stringify(users));
    } catch (err) {}

    if (isRemoteChangeRef.current) {
      isRemoteChangeRef.current = false;
      return;
    }

    const payload = {
      products,
      logs,
      notifications,
      incomingRecords,
      outgoingRecords,
      users,
    };

    // BroadcastChannel
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'SYNC_ALL',
        data: payload,
      });
    }

    // WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'UPDATE_FULL_STATE',
          data: payload,
        })
      );
    }
  }, [products, logs, notifications, incomingRecords, outgoingRecords, users]);

  // Handlers for Outgoing Stock Records
  const handleAddOutgoingRecord = (recordData: Partial<OutgoingStockRecord>) => {
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

    setOutgoingRecords((prev) => [newRecord, ...prev]);

    // Automatically deduct inventory stock if linked to an existing product
    if (recordData.productId && recordData.productId !== 'custom') {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === recordData.productId) {
            return { ...p, stock: Math.max(0, p.stock - newRecord.quantity) };
          }
          return p;
        })
      );
    }

    // Add audit log
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
    setLogs((prev) => [newLog, ...prev]);

    showToast(`Barang keluar ${newRecord.productName} (-${newRecord.quantity} unit) berhasil dicatat!`);
  };

  const handleEditOutgoingRecord = (recordId: string, updatedData: Partial<OutgoingStockRecord>) => {
    const existing = outgoingRecords.find((r) => r.id === recordId);
    if (!existing) return;

    const oldQty = existing.quantity;
    const newQty = updatedData.quantity !== undefined ? updatedData.quantity : oldQty;
    // Difference in outgoing quantity: if newQty > oldQty, additional inventory is removed (delta negative)
    const qtyDelta = oldQty - newQty;

    setOutgoingRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              ...updatedData,
              updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            }
          : r
      )
    );

    // Adjust inventory if linked to a product
    const targetProductId = updatedData.productId || existing.productId;
    if (targetProductId && targetProductId !== 'custom' && qtyDelta !== 0) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === targetProductId) {
            return { ...p, stock: Math.max(0, p.stock + qtyDelta) };
          }
          return p;
        })
      );
    }

    // Audit log
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
    setLogs((prev) => [newLog, ...prev]);

    showToast(`Record barang keluar #${recordId} berhasil diperbarui.`);
  };

  const handleDeleteOutgoingRecord = (recordId: string) => {
    const existing = outgoingRecords.find((r) => r.id === recordId);
    if (!existing) return;

    setOutgoingRecords((prev) => prev.filter((r) => r.id !== recordId));

    // Restore inventory stock if linked
    if (existing.productId && existing.productId !== 'custom') {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === existing.productId) {
            return { ...p, stock: p.stock + existing.quantity };
          }
          return p;
        })
      );
    }

    showToast(`Record barang keluar #${recordId} telah dihapus.`);
  };

  // Handlers for Incoming Stock Records
  const handleAddIncomingRecord = (recordData: Partial<IncomingStockRecord>) => {
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

    setIncomingRecords((prev) => [newRecord, ...prev]);

    // Automatically update inventory stock if linked to an existing product
    if (recordData.productId && recordData.productId !== 'custom') {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === recordData.productId) {
            return { ...p, stock: p.stock + newRecord.quantity };
          }
          return p;
        })
      );
    }

    // Add audit log
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
    setLogs((prev) => [newLog, ...prev]);

    showToast(`Stok masuk ${newRecord.productName} (+${newRecord.quantity} unit) berhasil dicatat!`);
  };

  const handleEditIncomingRecord = (recordId: string, updatedData: Partial<IncomingStockRecord>) => {
    const existing = incomingRecords.find((r) => r.id === recordId);
    if (!existing) return;

    const oldQty = existing.quantity;
    const newQty = updatedData.quantity !== undefined ? updatedData.quantity : oldQty;
    const qtyDelta = newQty - oldQty;

    setIncomingRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              ...updatedData,
              updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            }
          : r
      )
    );

    // Adjust inventory if linked to a product
    const targetProductId = updatedData.productId || existing.productId;
    if (targetProductId && targetProductId !== 'custom' && qtyDelta !== 0) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === targetProductId) {
            return { ...p, stock: Math.max(0, p.stock + qtyDelta) };
          }
          return p;
        })
      );
    }

    // Audit log
    const newLog: StockLog = {
      id: `log-${Date.now()}`,
      productId: targetProductId,
      productName: updatedData.productName || existing.productName,
      sku: updatedData.sku || existing.sku,
      type: qtyDelta >= 0 ? 'IN' : 'ADJUSTMENT',
      delta: qtyDelta,
      previousStock: oldQty,
      newStock: newQty,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      user: currentUser?.name || 'Ops Manager',
      note: `Koreksi data entry stok masuk #${recordId} (${existing.poNumber})`,
    };
    setLogs((prev) => [newLog, ...prev]);

    showToast(`Record stok masuk #${recordId} berhasil diperbarui.`);
  };

  const handleDeleteIncomingRecord = (recordId: string) => {
    const existing = incomingRecords.find((r) => r.id === recordId);
    if (!existing) return;

    setIncomingRecords((prev) => prev.filter((r) => r.id !== recordId));

    // Revert inventory stock if linked
    if (existing.productId && existing.productId !== 'custom') {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === existing.productId) {
            return { ...p, stock: Math.max(0, p.stock - existing.quantity) };
          }
          return p;
        })
      );
    }

    showToast(`Record stok masuk #${recordId} telah dihapus.`);
  };

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Toast feedback
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

  // User Account Management handlers
  const handleAddUser = (userData: Omit<UserAccount, 'id' | 'createdAt'>) => {
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

    showToast(`Akun ${newUser.name} (${newUser.roleLabel}) berhasil ditambahkan!`);
  };

  const handleUpdateUser = (userId: string, updatedData: Partial<UserAccount>) => {
    setUsers((prev) => {
      const updated = prev.map((u) => {
        if (u.id === userId) {
          const mod = {
            ...u,
            ...updatedData,
            name: updatedData.name !== undefined ? updatedData.name.trim() : u.name,
            email: updatedData.email !== undefined ? updatedData.email.trim() : u.email,
            password: updatedData.password !== undefined ? updatedData.password.trim() : u.password,
            roleLabel: updatedData.roleLabel !== undefined ? updatedData.roleLabel.trim() : u.roleLabel,
            department: updatedData.department !== undefined ? updatedData.department.trim() : u.department,
          };
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

    showToast(`Data akun pengguna telah diperbarui.`);
  };

  const handleDeleteUser = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    setUsers((prev) => {
      const updated = prev.filter((u) => u.id !== userId);
      try {
        localStorage.setItem('stockmaster_users', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    showToast(`Akun ${targetUser?.name || ''} telah dihapus.`);
  };

  // Live stock adjustment +/- handler
  const handleUpdateStock = (productId: string, variantId: string | null, delta: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id !== productId) return p;

        if (variantId && p.variants) {
          const updatedVariants = p.variants.map((v) => {
            if (v.id !== variantId) return v;
            const newVarStock = Math.max(0, v.stock + delta);
            return { ...v, stock: newVarStock };
          });
          const totalMainStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);

          // Audit log record
          const targetVariant = p.variants.find((v) => v.id === variantId);
          const newLog: StockLog = {
            id: `log-${Date.now()}`,
            productId: p.id,
            productName: `${p.name} (${targetVariant?.size}/${targetVariant?.color})`,
            sku: targetVariant?.sku || p.sku,
            type: delta > 0 ? 'IN' : 'OUT',
            delta,
            previousStock: targetVariant?.stock || 0,
            newStock: Math.max(0, (targetVariant?.stock || 0) + delta),
            timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
            user: 'Ops Manager',
            note: delta > 0 ? 'Penyesuaian stok masuk cepat (+)' : 'Penyesuaian stok keluar cepat (-)',
          };
          setLogs((prev) => [newLog, ...prev]);

          showToast(
            `Stok ${p.name} (${targetVariant?.size}) diperbarui menjadi ${Math.max(
              0,
              (targetVariant?.stock || 0) + delta
            )}`
          );

          return { ...p, stock: totalMainStock, variants: updatedVariants };
        } else {
          const newStock = Math.max(0, p.stock + delta);

          const newLog: StockLog = {
            id: `log-${Date.now()}`,
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            type: delta > 0 ? 'IN' : 'OUT',
            delta,
            previousStock: p.stock,
            newStock,
            timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
            user: 'Ops Manager',
            note: delta > 0 ? 'Penyesuaian manual (+)' : 'Penyesuaian manual (-)',
          };
          setLogs((prev) => [newLog, ...prev]);

          showToast(`Stok ${p.name} diperbarui menjadi ${newStock}`);

          return { ...p, stock: newStock };
        }
      })
    );
  };

  // Add or edit product
  const handleClearStock = () => {
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        stock: 0,
        variants: p.variants?.map((v) => ({ ...v, stock: 0 })),
        lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
      }))
    );
    showToast('Seluruh stok produk telah dikosongkan menjadi 0.');
  };

  const handleClearIncomingRecords = () => {
    setIncomingRecords([]);
    showToast('Seluruh riwayat stok masuk telah dihapus.');
  };

  const handleClearOutgoingRecords = () => {
    setOutgoingRecords([]);
    showToast('Seluruh riwayat stok keluar telah dihapus.');
  };

  const handleClearLogs = () => {
    setLogs([]);
    showToast('Seluruh riwayat laporan & audit log telah dihapus.');
  };

  const handleSaveProduct = (productData: Partial<Product>) => {
    if (productData.id) {
      // Edit existing
      setProducts((prev) =>
        prev.map((p) => (p.id === productData.id ? ({ ...p, ...productData } as Product) : p))
      );
      showToast(`Detail produk ${productData.name} berhasil diperbarui.`);
    } else {
      // Add new
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
      setProducts((prev) => [newProd, ...prev]);
      showToast(`Produk baru ${newProd.name} berhasil ditambahkan.`);
    }
  };

  // Delete product
  const handleDeleteProduct = (productId: string) => {
    const targetProduct = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (targetProduct) {
      showToast(`Produk "${targetProduct.name}" berhasil dihapus.`);
    }
  };

  // Copy / Duplicate product
  const handleCopyProduct = (product: Product) => {
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

    setProducts((prev) => [duplicatedProduct, ...prev]);
    showToast(`Produk "${product.name}" berhasil disalin.`);
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
            check_circle
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
        onMarkAllRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
      />
    </div>
  );
}
