import { useEffect, useState } from 'react';
import { useCatalog } from '../context/CatalogContext';
import type { Product } from '../data/products';
import { apiRequest } from '../lib/api';

const emptyProduct: Omit<Product, 'id'> = {
  name: '',
  category: 'shoes',
  price: 0,
  rating: 4.5,
  stockSold: 0,
  availableStock: 0,
  images: [''],
  description: '',
  tags: [],
  season: 'summer',
  isNewArrival: false,
  isTrending: false,
  isBudgetFriendly: false,
  isMostSearched: false,
};

export function AdminDashboardPage() {
  const {
    products,
    advertisements,
    addProduct,
    deleteProduct,
    updateProduct,
    addAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
  } = useCatalog();
  const [productForm, setProductForm] = useState(emptyProduct);
  const [adForm, setAdForm] = useState({ title: '', subtitle: '', image: '', cta: '' });
  const [orders, setOrders] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const loadOrders = async () => {
    const token = localStorage.getItem('auth_token');
    const response = await apiRequest<{ orders: any[] }>('/orders/admin/orders', { token });
    setOrders(response.orders);
  };

  useEffect(() => {
    loadOrders().catch(() => undefined);
  }, []);

  const handleCreateProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!productForm.name.trim() || !productForm.description.trim()) return;
    setBusy(true);
    await addProduct({
      ...productForm,
      tags: productForm.tags.filter(Boolean),
      images: productForm.images.filter(Boolean),
    });
    setProductForm(emptyProduct);
    setBusy(false);
  };

  const handleCreateAd = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!adForm.title.trim() || !adForm.image.trim()) return;
    setBusy(true);
    await addAdvertisement(adForm);
    setAdForm({ title: '', subtitle: '', image: '', cta: '' });
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage products and homepage advertisements. Changes are saved instantly for this deployment.
        </p>
      </div>

      <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-2xl font-semibold">Add Product</h2>
        <form onSubmit={handleCreateProduct} className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            className="rounded-md border border-gray-300 px-3 py-2"
            placeholder="Product name"
            value={productForm.name}
            onChange={(event) => setProductForm((previous) => ({ ...previous, name: event.target.value }))}
            required
          />
          <select
            className="rounded-md border border-gray-300 px-3 py-2"
            value={productForm.category}
            onChange={(event) =>
              setProductForm((previous) => ({ ...previous, category: event.target.value as Product['category'] }))
            }
          >
            <option value="shoes">Shoes</option>
            <option value="shirts">Shirts</option>
          </select>
          <input
            className="rounded-md border border-gray-300 px-3 py-2"
            type="number"
            min={0}
            step="0.01"
            placeholder="Price"
            value={productForm.price}
            onChange={(event) => setProductForm((previous) => ({ ...previous, price: Number(event.target.value) }))}
          />
          <input
            className="rounded-md border border-gray-300 px-3 py-2"
            type="number"
            min={0}
            placeholder="Available stock"
            value={productForm.availableStock}
            onChange={(event) =>
              setProductForm((previous) => ({ ...previous, availableStock: Number(event.target.value) }))
            }
          />
          <input
            className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2"
            placeholder="Image URL"
            value={productForm.images[0]}
            onChange={(event) => setProductForm((previous) => ({ ...previous, images: [event.target.value] }))}
            required
          />
          <input
            className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2"
            placeholder="Tags (comma separated)"
            value={productForm.tags.join(', ')}
            onChange={(event) =>
              setProductForm((previous) => ({
                ...previous,
                tags: event.target.value.split(',').map((tag) => tag.trim()),
              }))
            }
          />
          <textarea
            className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2"
            rows={3}
            placeholder="Description"
            value={productForm.description}
            onChange={(event) => setProductForm((previous) => ({ ...previous, description: event.target.value }))}
            required
          />
          <button className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 md:col-span-2 disabled:bg-gray-400" type="submit" disabled={busy}>
            Add Product
          </button>
        </form>
      </section>

      <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-2xl font-semibold">Products ({products.length})</h2>
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col gap-2 rounded-md border border-gray-200 p-3 md:flex-row md:items-center">
              <input
                className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                value={product.name}
                onChange={(event) => updateProduct(product.id, { name: event.target.value }).catch(() => undefined)}
              />
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 md:w-40"
                type="number"
                min={0}
                step="0.01"
                value={product.price}
                onChange={(event) => updateProduct(product.id, { price: Number(event.target.value) }).catch(() => undefined)}
              />
              <button
                className="rounded-md bg-gray-900 px-3 py-2 text-white hover:bg-black"
                onClick={() => deleteProduct(product.id).catch(() => undefined)}
                type="button"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-2xl font-semibold">Homepage Ads ({advertisements.length})</h2>
        <form onSubmit={handleCreateAd} className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            className="rounded-md border border-gray-300 px-3 py-2"
            placeholder="Title"
            value={adForm.title}
            onChange={(event) => setAdForm((previous) => ({ ...previous, title: event.target.value }))}
            required
          />
          <input
            className="rounded-md border border-gray-300 px-3 py-2"
            placeholder="CTA text"
            value={adForm.cta}
            onChange={(event) => setAdForm((previous) => ({ ...previous, cta: event.target.value }))}
          />
          <input
            className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2"
            placeholder="Subtitle"
            value={adForm.subtitle}
            onChange={(event) => setAdForm((previous) => ({ ...previous, subtitle: event.target.value }))}
          />
          <input
            className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2"
            placeholder="Image URL"
            value={adForm.image}
            onChange={(event) => setAdForm((previous) => ({ ...previous, image: event.target.value }))}
            required
          />
          <button className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 md:col-span-2 disabled:bg-gray-400" type="submit" disabled={busy}>
            Add Ad
          </button>
        </form>

        <div className="space-y-3">
          {advertisements.map((ad) => (
            <div key={ad.id} className="flex flex-col gap-2 rounded-md border border-gray-200 p-3 md:flex-row md:items-center">
              <input
                className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                value={ad.title}
                onChange={(event) => updateAdvertisement(ad.id, { title: event.target.value }).catch(() => undefined)}
              />
              <input
                className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                value={ad.image}
                onChange={(event) => updateAdvertisement(ad.id, { image: event.target.value }).catch(() => undefined)}
              />
              <button
                className="rounded-md bg-gray-900 px-3 py-2 text-white hover:bg-black"
                onClick={() => deleteAdvertisement(ad.id).catch(() => undefined)}
                type="button"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-2xl font-semibold">Orders ({orders.length})</h2>
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="flex flex-col gap-2 rounded-md border border-gray-200 p-3 md:flex-row md:items-center">
              <div className="flex-1">
                <p className="font-semibold">#{order._id.slice(-8)} - {order.shippingAddress?.fullName ?? 'Customer'}</p>
                <p className="text-sm text-gray-600">Total: ${order.total?.toFixed?.(2) ?? order.total}</p>
              </div>
              <select
                className="rounded-md border border-gray-300 px-3 py-2"
                value={order.orderStatus}
                onChange={async (event) => {
                  const token = localStorage.getItem('auth_token');
                  await apiRequest(`/orders/admin/orders/${order._id}/status`, {
                    method: 'PATCH',
                    token,
                    body: { orderStatus: event.target.value },
                  });
                  await loadOrders();
                }}
              >
                <option value="pending">pending</option>
                <option value="processing">processing</option>
                <option value="shipped">shipped</option>
                <option value="delivered">delivered</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
