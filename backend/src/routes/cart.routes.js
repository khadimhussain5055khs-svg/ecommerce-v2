import { Router } from 'express';
import { z } from 'zod';
import { authRequired } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

router.use(authRequired);

async function getPopulatedCart(userId) {
  return prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });
}

router.get('/', async (req, res) => {
  const cart = await getPopulatedCart(req.user.id);
  if (!cart) return res.json({ cart: { userId: req.user.id, items: [] } });
  return res.json({
    cart: {
      ...cart,
      items: cart.items.map((item) => ({ ...item, productId: item.product })),
    },
  });
});

router.put('/', async (req, res) => {
  const payload = z.array(cartItemSchema).parse(req.body.items);
  const existing = await prisma.cart.findUnique({ where: { userId: req.user.id } });
  const items = [];
  for (const row of payload) {
    const product = await prisma.product.findUnique({ where: { id: row.productId } });
    if (product) items.push({ productId: product.id, quantity: row.quantity });
  }

  const cart = existing
    ? await prisma.cart.update({ where: { id: existing.id }, data: { items: { deleteMany: {}, create: items } } })
    : await prisma.cart.create({ data: { userId: req.user.id, items: { create: items } } });
  const populated = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  });
  return res.json({
    cart: {
      ...populated,
      items: (populated?.items ?? []).map((item) => ({ ...item, productId: item.product })),
    },
  });
});

router.delete('/', async (req, res) => {
  const existing = await prisma.cart.findUnique({ where: { userId: req.user.id } });
  if (existing) {
    await prisma.cartItem.deleteMany({ where: { cartId: existing.id } });
  } else {
    await prisma.cart.create({ data: { userId: req.user.id } });
  }
  return res.status(204).send();
});

export { router as cartRoutes };
