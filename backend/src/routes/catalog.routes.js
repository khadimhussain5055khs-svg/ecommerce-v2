import { Router } from 'express';
import { z } from 'zod';
import { Product } from '../models/Product.js';
import { Banner } from '../models/Banner.js';
import { authRequired, requireRole } from '../middleware/auth.js';

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
  image: z.string().url(),
  cta: z.string().default('Shop Now'),
});

router.get('/products', async (_req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  return res.json({ products });
});

router.get('/banners', async (_req, res) => {
  const banners = await Banner.find().sort({ createdAt: -1 });
  return res.json({ banners });
});

router.post('/products', authRequired, requireRole('admin', 'owner'), async (req, res) => {
  const payload = productSchema.parse(req.body);
  const product = await Product.create(payload);
  return res.status(201).json({ product });
});

router.patch('/products/:id', authRequired, requireRole('admin', 'owner'), async (req, res) => {
  const payload = productSchema.partial().parse(req.body);
  const product = await Product.findByIdAndUpdate(req.params.id, payload, { new: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  return res.json({ product });
});

router.delete('/products/:id', authRequired, requireRole('admin', 'owner'), async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  return res.status(204).send();
});

router.post('/banners', authRequired, requireRole('admin', 'owner'), async (req, res) => {
  const payload = bannerSchema.parse(req.body);
  const banner = await Banner.create(payload);
  return res.status(201).json({ banner });
});

router.patch('/banners/:id', authRequired, requireRole('admin', 'owner'), async (req, res) => {
  const payload = bannerSchema.partial().parse(req.body);
  const banner = await Banner.findByIdAndUpdate(req.params.id, payload, { new: true });
  if (!banner) return res.status(404).json({ message: 'Banner not found' });
  return res.json({ banner });
});

router.delete('/banners/:id', authRequired, requireRole('admin', 'owner'), async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  return res.status(204).send();
});

export { router as catalogRoutes };
