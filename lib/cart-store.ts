import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  image_url?: string
  quantity: number
  device_model?: string // the specific model selected by the customer
  is_preorder?: boolean // flag for pre-order items
}

// Unique key per cart row — same product + different model = separate rows
export function cartItemKey(item: Pick<CartItem, 'id' | 'device_model'>): string {
  return `${item.id}::${item.device_model ?? ''}`
}

interface CartStore {
  items: CartItem[]
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (key: string) => void
  updateQuantity: (key: string, quantity: number) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      drawerOpen: false,
      setDrawerOpen: (open) => set({ drawerOpen: open }),
      addItem: (item) =>
        set((state) => {
          const key = cartItemKey(item)
          const existing = state.items.find((i) => cartItemKey(i) === key)
          if (existing) {
            return {
              items: state.items.map((i) =>
                cartItemKey(i) === key ? { ...i, quantity: i.quantity + 1 } : i
              ),
              drawerOpen: true,
            }
          }
          return { items: [...state.items, { ...item, quantity: 1 }], drawerOpen: true }
        }),
      removeItem: (key) =>
        set((state) => ({
          items: state.items.filter((i) => cartItemKey(i) !== key),
        })),
      updateQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            cartItemKey(i) === key ? { ...i, quantity: Math.max(0, quantity) } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      total: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },
    }),
    {
      name: 'case-kiss-cart',
    }
  )
)
