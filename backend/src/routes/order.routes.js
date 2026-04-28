import { Router } from 'express';
import { z } from 'zod';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { env } from '../config/env.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

const addressSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(3),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().min(1),
});

const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  paymentMethod: z.enum(['cod', 'razorpay']),
});

const razorpayClient =
  env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET
    ? new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET })
    : null;

router.use(authRequired);

router.post('/checkout', async (req, res) => {
  const payload = checkoutSchema.parse(req.body);
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: { items: { include: { product: true } } },
  });
  if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

  let subtotal = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const product = item.product;
    if (!product) continue;
    if (product.availableStock < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
    }
    subtotal += product.price * item.quantity;
    orderItems.push({
      productId: product.id,
      name: product.name,
      image: (Array.isArray(product.images) ? product.images : [])[0] ?? '',
      quantity: item.quantity,
      unitPrice: product.price,
    });
  }

  const tax = Number((subtotal * 0.1).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));
  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      shippingAddress: payload.shippingAddress,
      subtotal,
      tax,
      total,
      paymentMethod: payload.paymentMethod,
      paymentStatus: 'pending',
      items: {
        create: orderItems,
      },
    },
    include: { items: true },
  });

  if (payload.paymentMethod === 'cod') {
    for (const item of cart.items) {
      const product = item.product;
      if (!product) continue;
      await prisma.product.update({
        where: { id: product.id },
        data: {
          availableStock: { decrement: item.quantity },
          stockSold: { increment: item.quantity },
        },
      });
      await prisma.inventoryLog.create({
        data: {
          productId: product.id,
          delta: -item.quantity,
          reason: 'Order placed (COD)',
          orderId: order.id,
          createdBy: req.user.id,
        },
      });
    }
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  if (payload.paymentMethod === 'razorpay') {
    if (!razorpayClient) {
      return res.status(400).json({ message: 'Razorpay is not configured' });
    }
    const rpOrder = await razorpayClient.orders.create({
      amount: Math.round(total * 100),
      currency: 'INR',
      receipt: order.id.toString(),
      notes: { orderId: order.id.toString(), userId: req.user.id.toString() },
    });
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: rpOrder.id },
      include: { items: true },
    });
    await prisma.payment.create({
      data: {
        orderId: order.id,
        providerOrderId: rpOrder.id,
        amount: total,
        status: 'created',
      },
    });
    return res.status(201).json({
      order: updatedOrder,
      razorpay: {
        keyId: env.RAZORPAY_KEY_ID,
        orderId: rpOrder.id,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
      },
    });
  }

  return res.status(201).json({ order });
});

router.post('/verify-razorpay', async (req, res) => {
  const payload = z
    .object({
      razorpayOrderId: z.string().min(1),
      razorpayPaymentId: z.string().min(1),
      razorpaySignature: z.string().min(1),
    })
    .parse(req.body);

  if (!env.RAZORPAY_KEY_SECRET) {
    return res.status(400).json({ message: 'Razorpay is not configured' });
  }

  const generated = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${payload.razorpayOrderId}|${payload.razorpayPaymentId}`)
    .digest('hex');

  if (generated !== payload.razorpaySignature) {
    return res.status(400).json({ message: 'Invalid payment signature' });
  }

  const order = await prisma.order.findFirst({
    where: { razorpayOrderId: payload.razorpayOrderId },
    include: { items: true },
  });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.paymentStatus === 'paid') {
    return res.json({ message: 'Payment already verified', order });
  }

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: 'paid',
      razorpayPaymentId: payload.razorpayPaymentId,
    },
    include: { items: true },
  });

  await prisma.payment.updateMany({
    where: { providerOrderId: payload.razorpayOrderId },
    data: { providerPaymentId: payload.razorpayPaymentId, status: 'paid' },
  });

  for (const item of order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        availableStock: { decrement: item.quantity },
        stockSold: { increment: item.quantity },
      },
    });
    await prisma.inventoryLog.create({
      data: {
        productId: item.productId,
        delta: -item.quantity,
        reason: 'Order paid (Razorpay)',
        orderId: order.id,
        createdBy: req.user.id,
      },
    });
  }
  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  return res.json({ message: 'Payment verified', order: updatedOrder });
});

router.get('/my-orders', async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  return res.json({ orders });
});

router.get('/admin/orders', requireRole('admin', 'owner'), async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  return res.json({ orders });
});

router.patch('/admin/orders/:id/status', requireRole('admin', 'owner'), async (req, res) => {
  const payload = z.object({ orderStatus: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']) }).parse(req.body);
  let order;
  try {
    order = await prisma.order.update({ where: { id: req.params.id }, data: payload, include: { items: true } });
  } catch {
    return res.status(404).json({ message: 'Order not found' });
  }
  return res.json({ order });
});

export { router as orderRoutes };
