import { useEffect, useState } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { useAuth } from '../context/AuthContext';
import type { Advertisement, Product, Section } from '../data/products';
import { apiRequest } from '../lib/api';
import { formatPKR } from '../lib/currency';
import { uploadImageToCloudinary } from '../lib/uploadImage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

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

const emptyAd: Omit<Advertisement, 'id'> = {
  title: '',
  subtitle: '',
  image: '',
  cta: 'Shop Now',
};

const emptySection: Omit<Section, 'id'> = {
  name: '',
  slug: '',
  description: '',
  image: '',
  showInHeader: true,
  showInHomepage: true,
  isActive: true,
  sortOrder: 0,
  productIds: [],
};


export function AdminDashboardPage() {
  const {
    products,
    advertisements,
    sections,
    siteSettings,
    addProduct,
    updateProduct,
    deleteProduct,
    addAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
    addSection,
    updateSection,
    deleteSection,
    updateSiteSettings,
  } = useCatalog();
  const { user, updateCredentials } = useAuth();
  const [productForm, setProductForm] = useState(emptyProduct);
  const [adForm, setAdForm] = useState(emptyAd);
  const [sectionForm, setSectionForm] = useState(emptySection);
  const [reports, setReports] = useState<any>(null);
  const [adminOrders, setAdminOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [credentialForm, setCredentialForm] = useState({ email: user?.email ?? '', currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    setCredentialForm((prev) => ({ ...prev, email: user?.email ?? '' }));
  }, [user?.email]);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    apiRequest('/catalog/admin/reports', { token })
      .then(setReports)
      .catch(() => undefined);
  }, []);

  const loadAdminOrders = async () => {
    setOrdersLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await apiRequest<{ orders: any[] }>('/orders/admin/orders', { token });
      setAdminOrders(response.orders);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    loadAdminOrders().catch(() => undefined);
  }, []);

  const handleCreateSection = async (event: React.FormEvent) => {
    event.preventDefault();
    await addSection(sectionForm);
    setSectionForm(emptySection);
    setMessage('Section created successfully.');
  };

  const handleCreateProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    await addProduct({
      ...productForm,
      images: productForm.images.filter(Boolean),
      tags: productForm.tags.filter(Boolean),
    });
    setProductForm(emptyProduct);
    setMessage('Product created successfully.');
  };

  const handleCreateAd = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await addAdvertisement(adForm);
      setAdForm(emptyAd);
      setMessage('Ad created successfully.');
    } catch (error: any) {
      setMessage(error?.message ?? 'Failed to create ad');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, onReady: (image: string) => void) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setMessage('Uploading image...');
      const url = await uploadImageToCloudinary(file);
      onReady(url);
      setMessage('Image uploaded successfully.');
    } catch (error: any) {
      setMessage(error?.message ?? 'Image upload failed.');
    }
  };

  const toggleProductInSection = (product: Product) => {
    setSectionForm((previous) => {
      const exists = previous.productIds.some((item) => item.id === product.id);
      return {
        ...previous,
        productIds: exists
          ? previous.productIds.filter((item) => item.id !== product.id)
          : [...previous.productIds, product],
      };
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Control sections, header/footer, credentials, and site reports from one place.</p>
        {message && <p className="mt-2 text-green-600">{message}</p>}
      </div>

      <Tabs defaultValue="orders" className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
        <TabsList className="w-full flex-wrap justify-start">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="ads">Ads</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="site">Site</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl font-semibold">Customer Orders</h2>
            <button
              type="button"
              onClick={() => loadAdminOrders().catch(() => undefined)}
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          {ordersLoading ? (
            <p className="text-gray-500">Loading orders...</p>
          ) : adminOrders.length === 0 ? (
            <p className="text-gray-600">No customer orders yet.</p>
          ) : (
            <div className="space-y-4">
              {adminOrders.map((order) => (
                <div key={order.id ?? order._id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold">Order #{String(order.id ?? order._id).slice(-8)}</p>
                      <p className="text-sm text-gray-600">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                      </p>
                      <p className="mt-2 text-sm text-gray-700">
                        <span className="font-semibold">Payment:</span> {order.paymentStatus} ({order.paymentMethod})
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Total:</span> {formatPKR(Number(order.total ?? 0))}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Status</label>
                      <select
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                        value={order.orderStatus}
                        onChange={async (event) => {
                          const token = localStorage.getItem('auth_token');
                          await apiRequest(`/orders/admin/orders/${order.id ?? order._id}/status`, {
                            method: 'PATCH',
                            token,
                            body: { orderStatus: event.target.value },
                          });
                          await loadAdminOrders();
                        }}
                      >
                        <option value="pending">pending</option>
                        <option value="processing">processing</option>
                        <option value="shipped">shipped</option>
                        <option value="delivered">delivered</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </div>
                  </div>

                  {order.shippingAddress && (
                    <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm">
                      <p className="font-semibold">Shipping</p>
                      <p className="text-gray-700">
                        {order.shippingAddress.fullName} · {order.shippingAddress.phone}
                      </p>
                      <p className="text-gray-700">
                        {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state},{' '}
                        {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                      </p>
                      <p className="text-gray-700">{order.shippingAddress.email}</p>
                    </div>
                  )}

                  <div className="mt-4">
                    <p className="mb-2 text-sm font-semibold">Items</p>
                    <div className="space-y-2">
                      {(order.items ?? []).map((item: any, idx: number) => (
                        <div
                          key={`${order.id ?? order._id}-${idx}`}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-gray-100 bg-white px-3 py-2 text-sm"
                        >
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-600">Qty: {item.quantity}</span>
                          <span className="font-semibold text-red-600">
                            {formatPKR(Number(item.unitPrice ?? 0) * Number(item.quantity ?? 0))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="products" className="mt-4">
          <h2 className="mb-4 text-2xl font-semibold">Product Management</h2>
          <form onSubmit={handleCreateProduct} className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            <input className="rounded-md border border-gray-300 px-3 py-2" placeholder="Product name" value={productForm.name} onChange={(event) => setProductForm((previous) => ({ ...previous, name: event.target.value }))} required />
            <select className="rounded-md border border-gray-300 px-3 py-2" value={productForm.category} onChange={(event) => setProductForm((previous) => ({ ...previous, category: event.target.value as Product['category'] }))}>
              <option value="shoes">Shoes</option>
              <option value="shirts">Shirts</option>
            </select>
            <input className="rounded-md border border-gray-300 px-3 py-2" type="number" min={0} step="0.01" placeholder="Price" value={productForm.price} onChange={(event) => setProductForm((previous) => ({ ...previous, price: Number(event.target.value) }))} />
            <input className="rounded-md border border-gray-300 px-3 py-2" type="number" min={0} placeholder="Available stock" value={productForm.availableStock} onChange={(event) => setProductForm((previous) => ({ ...previous, availableStock: Number(event.target.value) }))} />
            <input className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" placeholder="Image URL" value={productForm.images[0]} onChange={(event) => setProductForm((previous) => ({ ...previous, images: [event.target.value] }))} />
            <input type="file" accept="image/*" className="md:col-span-2" onChange={(event) => handleImageUpload(event, (image) => setProductForm((previous) => ({ ...previous, images: [image] })))} />
            <input className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" placeholder="Tags (comma separated)" value={productForm.tags.join(', ')} onChange={(event) => setProductForm((previous) => ({ ...previous, tags: event.target.value.split(',').map((tag) => tag.trim()) }))} />
            <textarea className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" rows={3} placeholder="Description" value={productForm.description} onChange={(event) => setProductForm((previous) => ({ ...previous, description: event.target.value }))} required />
            <button className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 md:col-span-2" type="submit">Add Product</button>
          </form>
          <div className="space-y-3">
            {products.map((product) => (
              <div key={product.id} className="grid grid-cols-1 gap-2 rounded-md border border-gray-200 p-3 md:grid-cols-6">
                <input className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" value={product.name} onChange={(event) => updateProduct(product.id, { name: event.target.value }).catch(() => undefined)} />
                <input className="rounded-md border border-gray-300 px-3 py-2" type="number" min={0} step="0.01" value={product.price} onChange={(event) => updateProduct(product.id, { price: Number(event.target.value) }).catch(() => undefined)} />
                <input className="rounded-md border border-gray-300 px-3 py-2" type="number" min={0} value={product.availableStock} onChange={(event) => updateProduct(product.id, { availableStock: Number(event.target.value) }).catch(() => undefined)} />
                <input className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" value={product.images[0] ?? ''} onChange={(event) => updateProduct(product.id, { images: [event.target.value] }).catch(() => undefined)} />
                <button className="rounded-md bg-gray-900 px-3 py-2 text-white hover:bg-black md:col-span-6" onClick={() => deleteProduct(product.id).catch(() => undefined)} type="button">Delete Product</button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ads" className="mt-4">
          <h2 className="mb-4 text-2xl font-semibold">Ad Management</h2>
          <form onSubmit={handleCreateAd} className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            <input className="rounded-md border border-gray-300 px-3 py-2" placeholder="Ad title" value={adForm.title} onChange={(event) => setAdForm((previous) => ({ ...previous, title: event.target.value }))} required />
            <input className="rounded-md border border-gray-300 px-3 py-2" placeholder="CTA" value={adForm.cta} onChange={(event) => setAdForm((previous) => ({ ...previous, cta: event.target.value }))} />
            <input className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" placeholder="Subtitle" value={adForm.subtitle} onChange={(event) => setAdForm((previous) => ({ ...previous, subtitle: event.target.value }))} />
            <input className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" placeholder="Image URL" value={adForm.image} onChange={(event) => setAdForm((previous) => ({ ...previous, image: event.target.value }))} required />
            <input type="file" accept="image/*" className="md:col-span-2" onChange={(event) => handleImageUpload(event, (image) => setAdForm((previous) => ({ ...previous, image })))} />
            <button className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 md:col-span-2" type="submit">Add Ad</button>
          </form>
          <div className="space-y-3">
            {advertisements.map((ad) => (
              <div key={ad.id} className="grid grid-cols-1 gap-2 rounded-md border border-gray-200 p-3 md:grid-cols-4">
                <input className="rounded-md border border-gray-300 px-3 py-2" value={ad.title} onChange={(event) => updateAdvertisement(ad.id, { title: event.target.value }).catch(() => undefined)} />
                <input className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" value={ad.image} onChange={(event) => updateAdvertisement(ad.id, { image: event.target.value }).catch(() => undefined)} />
                <button className="rounded-md bg-gray-900 px-3 py-2 text-white hover:bg-black" onClick={() => deleteAdvertisement(ad.id).catch(() => undefined)} type="button">Delete Ad</button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sections" className="mt-4 space-y-6">
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Create Section</h2>
            <form onSubmit={handleCreateSection} className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input className="rounded-md border border-gray-300 px-3 py-2" placeholder="Section name" value={sectionForm.name} onChange={(event) => setSectionForm((previous) => ({ ...previous, name: event.target.value }))} required />
              <input className="rounded-md border border-gray-300 px-3 py-2" placeholder="Slug (example: seasonal)" value={sectionForm.slug} onChange={(event) => setSectionForm((previous) => ({ ...previous, slug: event.target.value }))} required />
              <textarea className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" placeholder="Description" value={sectionForm.description} onChange={(event) => setSectionForm((previous) => ({ ...previous, description: event.target.value }))} />
              <input className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" placeholder="Image URL" value={sectionForm.image} onChange={(event) => setSectionForm((previous) => ({ ...previous, image: event.target.value }))} />
              <input type="file" accept="image/*" className="md:col-span-2" onChange={(event) => handleImageUpload(event, (image) => setSectionForm((previous) => ({ ...previous, image })))} />
              <label className="flex items-center gap-2"><input type="checkbox" checked={sectionForm.showInHeader} onChange={(event) => setSectionForm((previous) => ({ ...previous, showInHeader: event.target.checked }))} />Show in header</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={sectionForm.showInHomepage} onChange={(event) => setSectionForm((previous) => ({ ...previous, showInHomepage: event.target.checked }))} />Show on homepage</label>
              <div className="md:col-span-2">
                <p className="mb-2 font-medium">Select products for this section</p>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {products.map((product) => {
                    const checked = sectionForm.productIds.some((item) => item.id === product.id);
                    return (
                      <label key={product.id} className="flex items-center gap-2 rounded border border-gray-200 p-2">
                        <input type="checkbox" checked={checked} onChange={() => toggleProductInSection(product)} />
                        <span>{product.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <button className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 md:col-span-2" type="submit">Create Section</button>
            </form>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-semibold">Manage Sections</h2>
            <div className="space-y-3">
              {sections.map((section) => (
                <div key={section.id} className="flex flex-col gap-2 rounded-md border border-gray-200 p-3 md:flex-row md:items-center">
                  <input className="flex-1 rounded-md border border-gray-300 px-3 py-2" value={section.name} onChange={(event) => updateSection(section.id, { name: event.target.value }).catch(() => undefined)} />
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={section.showInHeader} onChange={(event) => updateSection(section.id, { showInHeader: event.target.checked }).catch(() => undefined)} />Header</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={section.showInHomepage} onChange={(event) => updateSection(section.id, { showInHomepage: event.target.checked }).catch(() => undefined)} />Homepage</label>
                  <button className="rounded-md bg-gray-900 px-3 py-2 text-white hover:bg-black" onClick={() => deleteSection(section.id).catch(() => undefined)} type="button">Delete</button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="site" className="mt-4">
          <h2 className="mb-4 text-2xl font-semibold">Header and Footer Settings</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" placeholder="Deals text" value={siteSettings.headerDealsText} onChange={(event) => updateSiteSettings({ headerDealsText: event.target.value }).catch(() => undefined)} />
            <input className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" placeholder="Deals image URL" value={siteSettings.headerDealsImage} onChange={(event) => updateSiteSettings({ headerDealsImage: event.target.value }).catch(() => undefined)} />
            <input type="file" accept="image/*" className="md:col-span-2" onChange={(event) => handleImageUpload(event, (image) => updateSiteSettings({ headerDealsImage: image }).catch(() => undefined))} />
            <textarea className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" rows={3} placeholder="Footer text" value={siteSettings.footerText} onChange={(event) => updateSiteSettings({ footerText: event.target.value }).catch(() => undefined)} />
          </div>
        </TabsContent>

        <TabsContent value="credentials" className="mt-4">
          <h2 className="mb-4 text-2xl font-semibold">Change Admin Credentials</h2>
          <form className="grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={async (event) => {
            event.preventDefault();
            await updateCredentials({ currentPassword: credentialForm.currentPassword, email: credentialForm.email, newPassword: credentialForm.newPassword || undefined });
            setCredentialForm((previous) => ({ ...previous, currentPassword: '', newPassword: '' }));
            setMessage('Credentials updated in database.');
          }}>
            <input className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" type="email" placeholder="New email" value={credentialForm.email} onChange={(event) => setCredentialForm((previous) => ({ ...previous, email: event.target.value }))} />
            <input className="rounded-md border border-gray-300 px-3 py-2" type="password" placeholder="Current password" value={credentialForm.currentPassword} onChange={(event) => setCredentialForm((previous) => ({ ...previous, currentPassword: event.target.value }))} required />
            <input className="rounded-md border border-gray-300 px-3 py-2" type="password" placeholder="New password (optional)" value={credentialForm.newPassword} onChange={(event) => setCredentialForm((previous) => ({ ...previous, newPassword: event.target.value }))} />
            <button className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 md:col-span-2" type="submit">Update Credentials</button>
          </form>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <h2 className="mb-4 text-2xl font-semibold">Reports</h2>
          {reports ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-md border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Sales report</p>
                <p className="text-xl font-bold">{formatPKR(reports.salesReport.totalSales)}</p>
                <p className="text-sm text-gray-600">Orders: {reports.salesReport.totalOrders}</p>
              </div>
              <div className="rounded-md border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Stock report</p>
                <p className="text-xl font-bold">{reports.stockReport.totalProducts} products</p>
                <p className="text-sm text-gray-600">Low stock: {reports.stockReport.lowStockProducts}</p>
              </div>
              <div className="rounded-md border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Deals and discounts</p>
                <p className="text-xl font-bold">{reports.dealsReport.totalDeals} banners</p>
                <p className="text-sm text-gray-600">Active sections: {reports.dealsReport.activeSections}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Loading reports...</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
