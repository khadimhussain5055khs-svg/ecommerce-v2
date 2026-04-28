import { Router } from 'express';
import { z } from 'zod';
import { authRequired, requireRole } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

const productSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['shoes', 'shirts']),
  price: z.number().nonnegative(),
  rating: z.number().min(0).max(5).default(4.5),
  stockSold: z.number().nonnegative().default(0),
  availableStock: z.number().nonnegative(),
  images: z.array(z.string()).default([]),
  description: z.string().min(1),
  tags: z.array(z.string()).default([]),
  season: z.enum(['spring', 'summer', 'fall', 'winter']).nullable().optional(),
  isNewArrival: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isBudgetFriendly: z.boolean().optional(),
  isMostSearched: z.boolean().optional(),
});

const bannerSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().default(''),
  image: z
    .string()
    .min(1)
    .refine(
      (value) => value.startsWith('data:image/') || /^https?:\/\//i.test(value),
      'Image must be a valid http(s) URL or an uploaded image.',
    ),
  cta: z.string().default('Shop Now'),
});

const sectionSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .transform((value) => value.trim().toLowerCase().replace(/\s+/g, '-')),
  description: z.string().default(''),
  image: z.string().default(''),
  showInHeader: z.boolean().default(true),
  showInHomepage: z.boolean().default(true),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  productIds: z.array(z.string()).default([]),
});

const settingsSchema = z.object({
  headerDealsImage: z.string().default(''),
  headerDealsText: z.string().default(''),
  footerText: z.string().default(''),
  footerLinks: z.array(z.object({ label: z.string().min(1), href: z.string().min(1) })).default([]),
});

async function getOrCreateSettings() {
  const existing = await prisma.siteSettings.findUnique({ where: { key: 'primary' } });
  if (existing) return existing;
  return prisma.siteSettings.create({ data: { key: 'primary', footerLinks: [] } });
}

router.get('/products', async (_req, res) => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  return res.json({ products });
});

router.get('/banners', async (_req, res) => {
  const banners = await prisma.banner.findMany({ orderBy: { createdAt: 'desc' } });
  return res.json({ banners });
});

router.get('/sections', async (_req, res) => {
  const sections = await prisma.section.findMany({
    include: {
      products: { include: { product: true } },
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
  const normalized = sections.map((section) => ({
    ...section,
    productIds: section.products.map((entry) => entry.product),
  }));
  return res.json({ sections: normalized });
});

router.get('/sections/:slug', async (req, res) => {
  const section = await prisma.section.findUnique({
    where: { slug: req.params.slug },
    include: {
      products: { include: { product: true } },
    },
  });
  if (!section || !section.isActive) return res.status(404).json({ message: 'Section not found' });
  return res.json({
    section: {
      ...section,
      productIds: section.products.map((entry) => entry.product),
    },
  });
});

router.get('/site-settings', async (_req, res) => {
  const settings = await getOrCreateSettings();
  return res.json({ settings });
});

router.post('/products', authRequired, requireRole('admin', 'owner'), async (req, res) => {
  const payload = productSchema.parse(req.body);
  const product = await prisma.product.create({
    data: {
      ...payload,
      images: payload.images ?? [],
      tags: payload.tags ?? [],
    },
  });
  return res.status(201).json({ product });
});

router.patch('/products/:id', authRequired, requireRole('admin', 'owner'), async (req, res) => {
  const payload = productSchema.partial().parse(req.body);
  let product;
  try {
    product = await prisma.product.update({
      where: { id: req.params.id },
      data: payload,
    });
  } catch {
    return res.status(404).json({ message: 'Product not found' });
  }
  return res.json({ product });
});

router.delete('/products/:id', authRequired, requireRole('admin', 'owner'), async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } }).catch(() => undefined);
  return res.status(204).send();
});

router.post('/banners', authRequired, requireRole('admin', 'owner'), async (req, res) => {
  const payload = bannerSchema.parse(req.body);
  const banner = await prisma.banner.create({ data: payload });
  return res.status(201).json({ banner });
});

router.patch('/banners/:id', authRequired, requireRole('admin', 'owner'), async (req, res) => {
  const payload = bannerSchema.partial().parse(req.body);
  let banner;
  try {
    banner = await prisma.banner.update({ where: { id: req.params.id }, data: payload });
  } catch {
    return res.status(404).json({ message: 'Banner not found' });
  }
  return res.json({ banner });
});

router.delete('/banners/:id', authRequired, requireRole('admin', 'owner'), async (req, res) => {
  await prisma.banner.delete({ where: { id: req.params.id } }).catch(() => undefined);
  return res.status(204).send();
});

router.post('/sections', authRequired, requireRole('admin', 'owner'), async (req, res) => {
  const payload = sectionSchema.parse(req.body);
  const section = await prisma.section.create({
    data: {
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      image: payload.image,
      showInHeader: payload.showInHeader,
      showInHomepage: payload.showInHomepage,
      isActive: payload.isActive,
      sortOrder: payload.sortOrder,
      products: {
        create: payload.productIds.map((productId) => ({ productId })),
      },
    },
    include: { products: { include: { product: true } } },
  });
  return res.status(201).json({
    section: {
      ...section,
      productIds: section.products.map((entry) => entry.product),
    },
  });
});

router.patch('/sections/:id', authRequired, requireRole('admin', 'owner'), async (req, res) => {
  const payload = sectionSchema.partial().parse(req.body);
  const existing = await prisma.section.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: 'Section not found' });

  const section = await prisma.section.update({
    where: { id: req.params.id },
    data: {
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      image: payload.image,
      showInHeader: payload.showInHeader,
      showInHomepage: payload.showInHomepage,
      isActive: payload.isActive,
      sortOrder: payload.sortOrder,
    },
  });

  if (payload.productIds) {
    await prisma.sectionProduct.deleteMany({ where: { sectionId: req.params.id } });
    if (payload.productIds.length > 0) {
      await prisma.sectionProduct.createMany({
        data: payload.productIds.map((productId) => ({ sectionId: req.params.id, productId })),
      });
    }
  }

  const populated = await prisma.section.findUnique({
    where: { id: req.params.id },
    include: { products: { include: { product: true } } },
  });
  return res.json({
    section: {
      ...section,
      productIds: populated?.products.map((entry) => entry.product) ?? [],
    },
  });
});

router.delete('/sections/:id', authRequired, requireRole('admin', 'owner'), async (req, res) => {
  await prisma.section.delete({ where: { id: req.params.id } }).catch(() => undefined);
  return res.status(204).send();
});

router.patch('/site-settings', authRequired, requireRole('admin', 'owner'), async (req, res) => {
  const payload = settingsSchema.partial().parse(req.body);
  const settings = await prisma.siteSettings.upsert({
    where: { key: 'primary' },
    update: payload,
    create: {
      key: 'primary',
      headerDealsImage: payload.headerDealsImage ?? '',
      headerDealsText: payload.headerDealsText ?? 'Hot deals live now',
      footerText:
        payload.footerText ??
        'Your one-stop destination for premium shoes and shirts. Quality products at unbeatable prices.',
      footerLinks: payload.footerLinks ?? [],
    },
  });
  return res.json({ settings });
});

router.get('/admin/reports', authRequired, requireRole('admin', 'owner'), async (_req, res) => {
  const [orders, products, sections, banners] = await Promise.all([
    prisma.order.findMany(),
    prisma.product.findMany(),
    prisma.section.findMany(),
    prisma.banner.findMany(),
  ]);
  const totalSales = orders.reduce((sum, order) => sum + (order.total ?? 0), 0);
  const stockReport = {
    totalProducts: products.length,
    inStockProducts: products.filter((product) => product.availableStock > 0).length,
    lowStockProducts: products.filter((product) => product.availableStock > 0 && product.availableStock < 10).length,
    outOfStockProducts: products.filter((product) => product.availableStock === 0).length,
  };
  const dealsReport = {
    totalDeals: banners.length,
    activeSections: sections.filter((section) => section.isActive).length,
    sectionsShownInHeader: sections.filter((section) => section.showInHeader).length,
  };
  return res.json({
    salesReport: {
      totalSales,
      totalOrders: orders.length,
      averageOrderValue: orders.length ? totalSales / orders.length : 0,
    },
    stockReport,
    dealsReport,
  });
});

export { router as catalogRoutes };
