import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  uid: string; // Unique identifier for the specific configuration
  id: string;
  name: string;
  image?: string | null;
  price: number;
  quantity: number;
  variant?: any;
  attribute?: any;
  notes?: string;
}

interface CartStore {
  cart: CartItem[];
  tableId: string | null;
  hasActiveOrder: boolean;
  lastOrderType: "dine-in" | "takeaway" | null;
  setTableId: (id: string) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (uid: string) => void;
  clearCart: () => void;
  setOrderPlaced: (type: "dine-in" | "takeaway") => void;
  getCartTotal: () => number;
  getProductQuantity: (itemId: string) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      tableId: null,
      hasActiveOrder: false,
      lastOrderType: null,
      setTableId: (id) => set((state) => {
        if (state.tableId !== id) {
            return { tableId: id, cart: [], hasActiveOrder: false, lastOrderType: null };
        }
        return { tableId: id };
      }),
      addToCart: (newItem) => set((state) => {
        const uid = newItem.uid || `${newItem.id}-${newItem.variant?.id || 'none'}-${newItem.attribute?.id || 'none'}-${newItem.notes || 'none'}`;
        const existing = state.cart.find(item => item.uid === uid);
        let newCart;
        if (existing) {
          newCart = state.cart.map(item => item.uid === uid ? { ...item, quantity: item.quantity + (newItem.quantity || 1) } : item);
        } else {
          newCart = [...state.cart, { ...newItem, uid, quantity: newItem.quantity || 1 }];
        }
        return { cart: newCart };
      }),
      removeFromCart: (uid) => set((state) => {
        const newCart = state.cart.map(item => {
          if (item.uid === uid) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        }).filter(item => item.quantity > 0);
        return { cart: newCart };
      }),
      clearCart: () => set({ cart: [] }),
      setOrderPlaced: (type) => set({ hasActiveOrder: true, lastOrderType: type, cart: [] }),
      getCartTotal: () => get().cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0),
      getProductQuantity: (itemId) => get().cart.filter(item => item.id === itemId).reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'pos-cart-storage',
    }
  )
);
