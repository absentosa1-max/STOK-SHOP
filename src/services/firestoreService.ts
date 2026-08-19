import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Product,
  StockLog,
  NotificationItem,
  UserAccount,
  IncomingStockRecord,
  OutgoingStockRecord,
} from '../types';
import { INITIAL_USERS } from '../data/initialUsers';
import {
  INITIAL_PRODUCTS,
  INITIAL_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_INCOMING_RECORDS,
  INITIAL_OUTGOING_RECORDS,
} from '../data/mockData';

// Collection references
const SYSTEM_COL = '_system';
const USERS_COL = 'users';
const PRODUCTS_COL = 'products';
const LOGS_COL = 'logs';
const INCOMING_COL = 'incomingRecords';
const OUTGOING_COL = 'outgoingRecords';
const NOTIFICATIONS_COL = 'notifications';

// Clean object helper to remove undefined values before Firestore write
function cleanPayload<T extends Record<string, any>>(obj: T): T {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        cleaned[key] = value.map((item) =>
          typeof item === 'object' && item !== null ? cleanPayload(item) : item
        );
      } else if (typeof value === 'object' && value !== null) {
        cleaned[key] = cleanPayload(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned as T;
}

/**
 * Bootstrap default data into Firestore ONCE on initial deployment.
 * Never re-seed deleted items on subsequent reloads.
 */
export async function bootstrapFirestoreDefaults() {
  try {
    // Check if system has already been initialized in Cloud or localStorage
    const sysDocRef = doc(db, SYSTEM_COL, 'metadata');
    const sysSnap = await getDoc(sysDocRef);

    if (sysSnap.exists() && sysSnap.data()?.isBootstrapped) {
      // System is already initialized. Never resurrect deleted items!
      return;
    }

    // Check if users collection already exists
    const userSnap = await getDocs(collection(db, USERS_COL));
    if (userSnap.empty) {
      console.log('[Firestore] Initial seeding of users...');
      const batch = writeBatch(db);
      for (const u of INITIAL_USERS) {
        const docRef = doc(db, USERS_COL, u.id);
        batch.set(docRef, cleanPayload(u));
      }
      await batch.commit();
    }

    // Check products
    const prodSnap = await getDocs(collection(db, PRODUCTS_COL));
    if (prodSnap.empty) {
      console.log('[Firestore] Initial seeding of products...');
      const batch = writeBatch(db);
      for (const p of INITIAL_PRODUCTS) {
        const docRef = doc(db, PRODUCTS_COL, p.id);
        batch.set(docRef, cleanPayload(p));
      }
      await batch.commit();
    }

    // Check logs
    const logSnap = await getDocs(collection(db, LOGS_COL));
    if (logSnap.empty) {
      const batch = writeBatch(db);
      for (const l of INITIAL_LOGS) {
        const docRef = doc(db, LOGS_COL, l.id);
        batch.set(docRef, cleanPayload(l));
      }
      await batch.commit();
    }

    // Check incoming
    const inSnap = await getDocs(collection(db, INCOMING_COL));
    if (inSnap.empty) {
      const batch = writeBatch(db);
      for (const r of INITIAL_INCOMING_RECORDS) {
        const docRef = doc(db, INCOMING_COL, r.id);
        batch.set(docRef, cleanPayload(r));
      }
      await batch.commit();
    }

    // Check outgoing
    const outSnap = await getDocs(collection(db, OUTGOING_COL));
    if (outSnap.empty) {
      const batch = writeBatch(db);
      for (const r of INITIAL_OUTGOING_RECORDS) {
        const docRef = doc(db, OUTGOING_COL, r.id);
        batch.set(docRef, cleanPayload(r));
      }
      await batch.commit();
    }

    // Check notifications
    const notifSnap = await getDocs(collection(db, NOTIFICATIONS_COL));
    if (notifSnap.empty) {
      const batch = writeBatch(db);
      for (const n of INITIAL_NOTIFICATIONS) {
        const docRef = doc(db, NOTIFICATIONS_COL, n.id);
        batch.set(docRef, cleanPayload(n));
      }
      await batch.commit();
    }

    // Mark system as permanently bootstrapped
    await setDoc(sysDocRef, {
      isBootstrapped: true,
      initializedAt: new Date().toISOString(),
      version: '1.0.0',
    });
  } catch (err) {
    console.error('[Firestore] Error bootstrapping defaults:', err);
  }
}

/**
 * Setup real-time Firestore listeners for all collections
 */
export function subscribeToRealtimeData(callbacks: {
  onUsers?: (users: UserAccount[]) => void;
  onProducts?: (products: Product[]) => void;
  onLogs?: (logs: StockLog[]) => void;
  onIncoming?: (incoming: IncomingStockRecord[]) => void;
  onOutgoing?: (outgoing: OutgoingStockRecord[]) => void;
  onNotifications?: (notifications: NotificationItem[]) => void;
  onError?: (err: any) => void;
}): () => void {
  const unsubscribers: Unsubscribe[] = [];

  // Users listener
  if (callbacks.onUsers) {
    const unsub = onSnapshot(
      collection(db, USERS_COL),
      (snap) => {
        const list: UserAccount[] = [];
        snap.forEach((d) => list.push(d.data() as UserAccount));
        callbacks.onUsers!(list);
      },
      (err) => {
        console.warn('[Firestore] Users listener notice:', err.message);
        if (callbacks.onError) callbacks.onError(err);
      }
    );
    unsubscribers.push(unsub);
  }

  // Products listener - directly reflects deletions (even if collection becomes empty)
  if (callbacks.onProducts) {
    const unsub = onSnapshot(
      collection(db, PRODUCTS_COL),
      (snap) => {
        const list: Product[] = [];
        snap.forEach((d) => list.push(d.data() as Product));
        // Sort by product id
        list.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
        callbacks.onProducts!(list);
      },
      (err) => {
        console.warn('[Firestore] Products listener notice:', err.message);
        if (callbacks.onError) callbacks.onError(err);
      }
    );
    unsubscribers.push(unsub);
  }

  // Logs listener
  if (callbacks.onLogs) {
    const unsub = onSnapshot(
      collection(db, LOGS_COL),
      (snap) => {
        const list: StockLog[] = [];
        snap.forEach((d) => list.push(d.data() as StockLog));
        list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        callbacks.onLogs!(list);
      },
      (err) => {
        console.warn('[Firestore] Logs listener notice:', err.message);
        if (callbacks.onError) callbacks.onError(err);
      }
    );
    unsubscribers.push(unsub);
  }

  // Incoming records listener
  if (callbacks.onIncoming) {
    const unsub = onSnapshot(
      collection(db, INCOMING_COL),
      (snap) => {
        const list: IncomingStockRecord[] = [];
        snap.forEach((d) => list.push(d.data() as IncomingStockRecord));
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        callbacks.onIncoming!(list);
      },
      (err) => {
        console.warn('[Firestore] Incoming listener notice:', err.message);
        if (callbacks.onError) callbacks.onError(err);
      }
    );
    unsubscribers.push(unsub);
  }

  // Outgoing records listener
  if (callbacks.onOutgoing) {
    const unsub = onSnapshot(
      collection(db, OUTGOING_COL),
      (snap) => {
        const list: OutgoingStockRecord[] = [];
        snap.forEach((d) => list.push(d.data() as OutgoingStockRecord));
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        callbacks.onOutgoing!(list);
      },
      (err) => {
        console.warn('[Firestore] Outgoing listener notice:', err.message);
        if (callbacks.onError) callbacks.onError(err);
      }
    );
    unsubscribers.push(unsub);
  }

  // Notifications listener
  if (callbacks.onNotifications) {
    const unsub = onSnapshot(
      collection(db, NOTIFICATIONS_COL),
      (snap) => {
        const list: NotificationItem[] = [];
        snap.forEach((d) => list.push(d.data() as NotificationItem));
        callbacks.onNotifications!(list);
      },
      (err) => {
        console.warn('[Firestore] Notifications listener notice:', err.message);
        if (callbacks.onError) callbacks.onError(err);
      }
    );
    unsubscribers.push(unsub);
  }

  // Return master cleanup
  return () => {
    unsubscribers.forEach((u) => u());
  };
}

/* =========================================================================
   Direct Firestore Write / Delete Actions (Realtime Cloud Persistence)
========================================================================= */

export async function firestoreSaveUser(user: UserAccount): Promise<void> {
  try {
    const docRef = doc(db, USERS_COL, user.id);
    await setDoc(docRef, cleanPayload(user), { merge: true });
  } catch (err) {
    console.error('[Firestore] Error saving user:', err);
    throw err;
  }
}

export async function firestoreDeleteUser(userId: string): Promise<void> {
  try {
    const docRef = doc(db, USERS_COL, userId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('[Firestore] Error deleting user:', err);
    throw err;
  }
}

export async function firestoreSaveProduct(product: Product): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COL, product.id);
    await setDoc(docRef, cleanPayload(product), { merge: true });
  } catch (err) {
    console.error('[Firestore] Error saving product:', err);
    throw err;
  }
}

export async function firestoreDeleteProduct(productId: string): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COL, productId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('[Firestore] Error deleting product:', err);
    throw err;
  }
}

export async function firestoreBulkSaveProducts(products: Product[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const p of products) {
      const docRef = doc(db, PRODUCTS_COL, p.id);
      batch.set(docRef, cleanPayload(p), { merge: true });
    }
    await batch.commit();
  } catch (err) {
    console.error('[Firestore] Error bulk saving products:', err);
    throw err;
  }
}

export async function firestoreClearProducts(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, PRODUCTS_COL));
    const batch = writeBatch(db);
    snap.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
  } catch (err) {
    console.error('[Firestore] Error clearing products:', err);
  }
}

export async function firestoreSaveLog(log: StockLog): Promise<void> {
  try {
    const docRef = doc(db, LOGS_COL, log.id);
    await setDoc(docRef, cleanPayload(log), { merge: true });
  } catch (err) {
    console.error('[Firestore] Error saving log:', err);
  }
}

export async function firestoreClearLogs(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, LOGS_COL));
    const batch = writeBatch(db);
    snap.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
  } catch (err) {
    console.error('[Firestore] Error clearing logs:', err);
  }
}

export async function firestoreSaveIncomingRecord(record: IncomingStockRecord): Promise<void> {
  try {
    const docRef = doc(db, INCOMING_COL, record.id);
    await setDoc(docRef, cleanPayload(record), { merge: true });
  } catch (err) {
    console.error('[Firestore] Error saving incoming record:', err);
    throw err;
  }
}

export async function firestoreDeleteIncomingRecord(recordId: string): Promise<void> {
  try {
    const docRef = doc(db, INCOMING_COL, recordId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('[Firestore] Error deleting incoming record:', err);
  }
}

export async function firestoreClearIncomingRecords(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, INCOMING_COL));
    const batch = writeBatch(db);
    snap.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
  } catch (err) {
    console.error('[Firestore] Error clearing incoming records:', err);
  }
}

export async function firestoreSaveOutgoingRecord(record: OutgoingStockRecord): Promise<void> {
  try {
    const docRef = doc(db, OUTGOING_COL, record.id);
    await setDoc(docRef, cleanPayload(record), { merge: true });
  } catch (err) {
    console.error('[Firestore] Error saving outgoing record:', err);
    throw err;
  }
}

export async function firestoreDeleteOutgoingRecord(recordId: string): Promise<void> {
  try {
    const docRef = doc(db, OUTGOING_COL, recordId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('[Firestore] Error deleting outgoing record:', err);
  }
}

export async function firestoreClearOutgoingRecords(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, OUTGOING_COL));
    const batch = writeBatch(db);
    snap.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
  } catch (err) {
    console.error('[Firestore] Error clearing outgoing records:', err);
  }
}

export async function firestoreSaveNotification(notif: NotificationItem): Promise<void> {
  try {
    const docRef = doc(db, NOTIFICATIONS_COL, notif.id);
    await setDoc(docRef, cleanPayload(notif), { merge: true });
  } catch (err) {
    console.error('[Firestore] Error saving notification:', err);
  }
}

export async function firestoreMarkNotificationRead(notifId: string): Promise<void> {
  try {
    const docRef = doc(db, NOTIFICATIONS_COL, notifId);
    await setDoc(docRef, { read: true }, { merge: true });
  } catch (err) {
    console.error('[Firestore] Error updating notification:', err);
  }
}

export async function firestoreMarkAllNotificationsRead(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, NOTIFICATIONS_COL));
    const batch = writeBatch(db);
    snap.forEach((d) => {
      batch.update(d.ref, { read: true });
    });
    await batch.commit();
  } catch (err) {
    console.error('[Firestore] Error marking notifications read:', err);
  }
}

export async function firestoreClearNotifications(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, NOTIFICATIONS_COL));
    const batch = writeBatch(db);
    snap.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
  } catch (err) {
    console.error('[Firestore] Error clearing notifications:', err);
  }
}
