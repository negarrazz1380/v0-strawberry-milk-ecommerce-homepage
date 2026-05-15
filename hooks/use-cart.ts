'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/lib/cart-store'

export const useCart = () => {
  const [mounted, setMounted] = useState(false)
  const cart = useCartStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return {
      items: [],
      drawerOpen: false,
      setDrawerOpen: () => {},
      addItem: () => {},
      removeItem: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      total: () => 0,
    }
  }

  return cart
}
