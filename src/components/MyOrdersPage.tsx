import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { formatPKR } from '../lib/currency';
import { Progress } from './ui/progress';

type Order = {
  id: string;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
};

const TRACKING_STEPS = ['pending', 'processing', 'shipped', 'delivered'] as const;
type TrackingStep = (typeof TRACKING_STEPS)[number];

function getTrackingIndex(status: string) {
  const normalized = String(status ?? '').toLowerCase();
  const idx = TRACKING_STEPS.indexOf(normalized as TrackingStep);
  if (idx >= 0) return idx;
  if (normalized === 'cancelled') return -1;
  return 0;
}

export function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    apiRequest<{ orders: Order[] }>('/orders/my-orders', { token })
      .then((response) => setOrders(response.orders))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-10">Loading orders...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-600">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">Order #{order.id.slice(-8)}</p>
                <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
              </div>

              <div className="mb-3 text-sm">
                <span className="mr-4">Status: <strong>{order.orderStatus}</strong></span>
                <span>Payment: <strong>{order.paymentStatus}</strong></span>
              </div>

              {String(order.orderStatus).toLowerCase() === 'cancelled' ? (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  This order was cancelled.
                </div>
              ) : (
                <div className="mb-4">
                  <p className="mb-2 text-sm font-semibold">Order Tracking</p>
                  <Progress value={Math.max(0, (getTrackingIndex(order.orderStatus) / (TRACKING_STEPS.length - 1)) * 100)} className="bg-red-100 [&_[data-slot=progress-indicator]]:bg-red-600" />
                  <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                    {TRACKING_STEPS.map((step, idx) => {
                      const active = idx <= getTrackingIndex(order.orderStatus);
                      return (
                        <div key={step} className={`rounded-md border px-2 py-1 text-center ${active ? 'border-red-200 bg-red-50 text-red-700 font-semibold' : 'border-gray-200 text-gray-500'}`}>
                          {step}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <ul className="mb-3 list-disc pl-5 text-sm text-gray-700">
                {order.items.map((item, idx) => (
                  <li key={`${order.id}-${idx}`}>
                    {item.name} x {item.quantity} - {formatPKR(item.unitPrice * item.quantity)}
                  </li>
                ))}
              </ul>
              <p className="font-semibold text-red-600">Total: {formatPKR(order.total)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
