// Firebase entities for Firestore collections
import { 
  db,
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from './firebaseClient.js';

// Product entity
export const Product = {
  collection: 'products',
  
  // Get all products
  async getAll() {
    const productsRef = collection(db, this.collection);
    const snapshot = await getDocs(productsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  // Get product by ID
  async getById(id) {
    const productRef = doc(db, this.collection, id);
    const snapshot = await getDoc(productRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  },
  
  // Create product
  async create(data) {
    const productsRef = collection(db, this.collection);
    return await addDoc(productsRef, data);
  },
  
  // Update product
  async update(id, data) {
    const productRef = doc(db, this.collection, id);
    return await updateDoc(productRef, data);
  },
  
  // Delete product
  async delete(id) {
    const productRef = doc(db, this.collection, id);
    return await deleteDoc(productRef);
  },
  
  // Search products
  async search(field, value) {
    const productsRef = collection(db, this.collection);
    const q = query(productsRef, where(field, '==', value));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

// Order entity
export const Order = {
  collection: 'orders',
  
  // Get all orders
  async getAll() {
    const ordersRef = collection(db, this.collection);
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  // Get order by ID
  async getById(id) {
    const orderRef = doc(db, this.collection, id);
    const snapshot = await getDoc(orderRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  },
  
  // Create order
  async create(data) {
    const ordersRef = collection(db, this.collection);
    return await addDoc(ordersRef, { ...data, createdAt: new Date() });
  },
  
  // Update order
  async update(id, data) {
    const orderRef = doc(db, this.collection, id);
    return await updateDoc(orderRef, data);
  },
  
  // Delete order
  async delete(id) {
    const orderRef = doc(db, this.collection, id);
    return await deleteDoc(orderRef);
  },
  
  // Get orders by user
  async getByUser(userId) {
    const ordersRef = collection(db, this.collection);
    const q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

// Coupon entity
export const Coupon = {
  collection: 'coupons',
  
  // Get all coupons
  async getAll() {
    const couponsRef = collection(db, this.collection);
    const snapshot = await getDocs(couponsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  // Get coupon by code
  async getByCode(code) {
    const couponsRef = collection(db, this.collection);
    const q = query(couponsRef, where('code', '==', code));
    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0 ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } : null;
  },
  
  // Create coupon
  async create(data) {
    const couponsRef = collection(db, this.collection);
    return await addDoc(couponsRef, data);
  },
  
  // Update coupon
  async update(id, data) {
    const couponRef = doc(db, this.collection, id);
    return await updateDoc(couponRef, data);
  },
  
  // Delete coupon
  async delete(id) {
    const couponRef = doc(db, this.collection, id);
    return await deleteDoc(couponRef);
  }
};

// User entity (for authentication)
export const User = {
  collection: 'users',
  
  // Get all users
  async getAll() {
    const usersRef = collection(db, this.collection);
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  // Get user by ID
  async getById(id) {
    const userRef = doc(db, this.collection, id);
    const snapshot = await getDoc(userRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  },
  
  // Create user
  async create(data) {
    const usersRef = collection(db, this.collection);
    return await addDoc(usersRef, { ...data, createdAt: new Date() });
  },
  
  // Update user
  async update(id, data) {
    const userRef = doc(db, this.collection, id);
    return await updateDoc(userRef, data);
  },
  
  // Delete user
  async delete(id) {
    const userRef = doc(db, this.collection, id);
    return await deleteDoc(userRef);
  },
  
  // Get user by email
  async getByEmail(email) {
    const usersRef = collection(db, this.collection);
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0 ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } : null;
  }
};