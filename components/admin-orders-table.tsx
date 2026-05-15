'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Search } from 'lucide-react'

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  phone?: string | null
  total: number
  order_status: string
  created_at: string
}

interface Props {
  orders: Order[]
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
    case 'processing':
      return { bg: '#fef5f9', text: '#d4456f' }
    case 'shipped':
    case 'delivered':
      return { bg: '#e0f5e6', text: '#047857' }
    case 'cancelled':
      return { bg: '#fee2e2', text: '#dc2626' }
    default:
      return { bg: '#f3f4f6', text: '#6b7280' }
  }
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const formatTotal = (total: number) => {
  if (total > 1000) return (total / 100).toFixed(2)
  return total.toFixed(2)
}

export function AdminOrdersTable({ orders }: Props) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? orders.filter(order => {
        const q = query.toLowerCase()
        return (
          order.order_number.toLowerCase().includes(q) ||
          order.customer_name.toLowerCase().includes(q) ||
          order.customer_email.toLowerCase().includes(q) ||
          (order.phone ?? '').toLowerCase().includes(q)
        )
      })
    : orders

  return (
    <>
      {/* Search bar */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by order number, name, email or phone..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 text-sm focus:outline-none transition-colors"
          style={{ borderColor: '#f5d5e6' }}
          onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #d4456f')}
          onBlur={(e) => (e.target.style.boxShadow = 'none')}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
            aria-label="Clear search"
          >
            &times;
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl">
          <p className="text-gray-600">
            {query ? `No orders matching "${query}"` : 'No orders yet'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {query && (
            <div className="px-6 py-3 text-sm text-gray-500 border-b" style={{ backgroundColor: '#fef5f9' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#fef5f9', borderBottom: '2px solid #f5d5e6' }}>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#d4456f' }}>Order</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#d4456f' }}>Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#d4456f' }}>Email</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold" style={{ color: '#d4456f' }}>Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#d4456f' }}>Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#d4456f' }}>Date</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold" style={{ color: '#d4456f' }}>View</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, idx) => {
                  const statusColor = getStatusColor(order.order_status)
                  return (
                    <tr
                      key={order.id}
                      style={{ borderBottom: idx !== filtered.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-mono" style={{ color: '#d4456f' }}>
                        {order.order_number}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold">{order.customer_name}</p>
                        {order.phone && (
                          <p className="text-xs text-gray-500 mt-0.5">{order.phone}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.customer_email}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-right">${formatTotal(order.total)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
                          style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                        >
                          {order.order_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.created_at)}</td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/admin/orders/${order.order_number}`}
                          className="inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors"
                          style={{ color: '#d4456f' }}
                        >
                          <ChevronRight size={20} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
