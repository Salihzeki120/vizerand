// Simple IndexedDB wrapper for storing appointments, customers, and invoices offline

export interface Customer {
  id: string;
  trackingCode: string;
  fullName: string;
  email: string;
  phone: string;
  passportNumber: string;
  consulate: string;
  visaType: string;
  createdAt: Date;
  status: 'registered' | 'appointment-scheduled' | 'invoiced' | 'paid';
  appointmentDate?: Date;
  appointmentTime?: string;
  invoiceId?: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  trackingCode: string;
  amount: number;
  currency: string;
  description: string;
  createdAt: Date;
  status: 'draft' | 'issued' | 'paid';
}

export interface PaymentRecord {
  id: string;
  trackingCode: string;
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: Date;
  notes?: string;
}

let db: IDBDatabase | null = null;

export async function initializeDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('VisaAppointmentDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create customers store
      if (!database.objectStoreNames.contains('customers')) {
        const customerStore = database.createObjectStore('customers', { keyPath: 'id' });
        customerStore.createIndex('trackingCode', 'trackingCode', { unique: true });
        customerStore.createIndex('email', 'email', { unique: true });
        customerStore.createIndex('createdAt', 'createdAt');
      }

      // Create invoices store
      if (!database.objectStoreNames.contains('invoices')) {
        const invoiceStore = database.createObjectStore('invoices', { keyPath: 'id' });
        invoiceStore.createIndex('trackingCode', 'trackingCode');
        invoiceStore.createIndex('createdAt', 'createdAt');
      }

      // Create payments store
      if (!database.objectStoreNames.contains('payments')) {
        const paymentStore = database.createObjectStore('payments', { keyPath: 'id' });
        paymentStore.createIndex('trackingCode', 'trackingCode');
        paymentStore.createIndex('paymentDate', 'paymentDate');
      }
    };
  });
}

function generateTrackingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function addCustomer(data: Omit<Customer, 'id' | 'trackingCode' | 'createdAt' | 'status'>): Promise<Customer> {
  const database = db || (await initializeDB());
  
  const customer: Customer = {
    ...data,
    id: crypto.randomUUID(),
    trackingCode: generateTrackingCode(),
    createdAt: new Date(),
    status: 'registered',
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['customers'], 'readwrite');
    const store = transaction.objectStore('customers');
    const request = store.add(customer);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(customer);
  });
}

export async function getCustomerByTrackingCode(trackingCode: string): Promise<Customer | undefined> {
  const database = db || (await initializeDB());

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['customers'], 'readonly');
    const store = transaction.objectStore('customers');
    const index = store.index('trackingCode');
    const request = index.get(trackingCode);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function updateCustomer(customer: Customer): Promise<void> {
  const database = db || (await initializeDB());

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['customers'], 'readwrite');
    const store = transaction.objectStore('customers');
    const request = store.put(customer);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getAllCustomers(): Promise<Customer[]> {
  const database = db || (await initializeDB());

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['customers'], 'readonly');
    const store = transaction.objectStore('customers');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function getCustomersWithAppointments(): Promise<Customer[]> {
  const customers = await getAllCustomers();
  return customers.filter(c => c.appointmentDate && c.status !== 'paid');
}

export async function addInvoice(data: Omit<Invoice, 'id' | 'createdAt'>): Promise<Invoice> {
  const database = db || (await initializeDB());

  const invoice: Invoice = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date(),
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['invoices'], 'readwrite');
    const store = transaction.objectStore('invoices');
    const request = store.add(invoice);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(invoice);
  });
}

export async function getInvoicesByTrackingCode(trackingCode: string): Promise<Invoice[]> {
  const database = db || (await initializeDB());

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['invoices'], 'readonly');
    const store = transaction.objectStore('invoices');
    const index = store.index('trackingCode');
    const request = index.getAll(trackingCode);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function addPayment(data: Omit<PaymentRecord, 'id'>): Promise<PaymentRecord> {
  const database = db || (await initializeDB());

  const payment: PaymentRecord = {
    ...data,
    id: crypto.randomUUID(),
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['payments'], 'readwrite');
    const store = transaction.objectStore('payments');
    const request = store.add(payment);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(payment);
  });
}

export async function getPaymentsByTrackingCode(trackingCode: string): Promise<PaymentRecord[]> {
  const database = db || (await initializeDB());

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['payments'], 'readonly');
    const store = transaction.objectStore('payments');
    const index = store.index('trackingCode');
    const request = index.getAll(trackingCode);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}
