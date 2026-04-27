import { Router } from 'express';
import { z } from 'zod';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

router.use(authRequired);

async function getPopulatedCart(userId) {
  const cart = await Cart.findOne({ userId }).populate('items.productId');
  return cart;
}

router.get('/', async (req, res) => {
  const cart = await getPopulatedCart(req.user._id);
  return res.json({ cart: cart ?? { userId: req.user._id, items: [] } });
});

router.put('/', async (req, res) => {
  const payload = z.array(cartItemSchema).parse(req.body.items);
  const existing = await Cart.findOne({ userId: req.user._id });
  const items = [];
  for (const row of payload) {
    const product = await Product.findById(row.productId);
    if (product) items.push({ productId: product._id, quantity: row.quantity });
  }

  const cart = existing
    ? await Cart.findByIdAndUpdate(existing._id, { items }, { new: true })
    : await Cart.create({ userId: req.user._id, items });
  const populated = await Cart.findById(cart._id).populate('items.productId');
  return res.json({ cart: populated });
});

router.delete('/', async (req, res) => {
  await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] }, { upsert: true, new: true });
  return res.status(204).send();
});

export { router as cartRoutes };
