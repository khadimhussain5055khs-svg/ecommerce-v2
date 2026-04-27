import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

type Order = {
  _id: string;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
};

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
            <div key={order._id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">Order #{order._id.slice(-8)}</p>
                <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="mb-3 text-sm">
                <span className="mr-4">Status: <strong>{order.orderStatus}</strong></span>
                <span>Payment: <strong>{order.paymentStatus}</strong></span>
              </div>
              <ul className="mb-3 list-disc pl-5 text-sm text-gray-700">
                {order.items.map((item, idx) => (
                  <li key={`${order._id}-${idx}`}>
                    {item.name} x {item.quantity} - ${(item.unitPrice * item.quantity).toFixed(2)}
                  </li>
                ))}
              </ul>
              <p className="font-semibold text-red-600">Total: ${order.total.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
