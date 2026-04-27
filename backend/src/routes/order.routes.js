import { Router } from 'express';
import { z } from 'zod';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { env } from '../config/env.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { InventoryLog } from '../models/InventoryLog.js';
import { Payment } from '../models/Payment.js';

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
  const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
  if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

  let subtotal = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const product = item.productId;
    if (!product) continue;
    if (product.availableStock < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
    }
    subtotal += product.price * item.quantity;
    orderItems.push({
      productId: product._id,
      name: product.name,
      image: product.images?.[0] ?? '',
      quantity: item.quantity,
      unitPrice: product.price,
    });
  }

  const tax = Number((subtotal * 0.1).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));
  const order = await Order.create({
    userId: req.user._id,
    items: orderItems,
    shippingAddress: payload.shippingAddress,
    subtotal,
    tax,
    total,
    paymentMethod: payload.paymentMethod,
    paymentStatus: payload.paymentMethod === 'cod' ? 'pending' : 'pending',
  });

  if (payload.paymentMethod === 'cod') {
    for (const item of cart.items) {
      const product = item.productId;
      if (!product) continue;
      product.availableStock -= item.quantity;
      product.stockSold += item.quantity;
      await product.save();
      await InventoryLog.create({
        productId: product._id,
        delta: -item.quantity,
        reason: 'Order placed (COD)',
        orderId: order._id,
        createdBy: req.user._id,
      });
    }
    await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] });
  }

  if (payload.paymentMethod === 'razorpay') {
    if (!razorpayClient) {
      return res.status(400).json({ message: 'Razorpay is not configured' });
    }
    const rpOrder = await razorpayClient.orders.create({
      amount: Math.round(total * 100),
      currency: 'INR',
      receipt: order._id.toString(),
      notes: { orderId: order._id.toString(), userId: req.user._id.toString() },
    });
    order.razorpayOrderId = rpOrder.id;
    await order.save();
    await Payment.create({
      orderId: order._id,
      providerOrderId: rpOrder.id,
      amount: total,
      status: 'created',
    });
    return res.status(201).json({
      order,
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

  const order = await Order.findOne({ razorpayOrderId: payload.razorpayOrderId });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.paymentStatus === 'paid') {
    return res.json({ message: 'Payment already verified', order });
  }

  order.paymentStatus = 'paid';
  order.razorpayPaymentId = payload.razorpayPaymentId;
  await order.save();

  await Payment.findOneAndUpdate(
    { providerOrderId: payload.razorpayOrderId },
    { providerPaymentId: payload.razorpayPaymentId, status: 'paid' },
    { new: true },
  );

  for (const item of order.items) {
    const product = await Product.findById(item.productId);
    if (!product) continue;
    product.availableStock -= item.quantity;
    product.stockSold += item.quantity;
    await product.save();
    await InventoryLog.create({
      productId: product._id,
      delta: -item.quantity,
      reason: 'Order paid (Razorpay)',
      orderId: order._id,
      createdBy: req.user._id,
    });
  }
  await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] });

  return res.json({ message: 'Payment verified', order });
});

router.get('/my-orders', async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
  return res.json({ orders });
});

router.get('/admin/orders', requireRole('admin', 'owner'), async (_req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  return res.json({ orders });
});

router.patch('/admin/orders/:id/status', requireRole('admin', 'owner'), async (req, res) => {
  const payload = z.object({ orderStatus: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']) }).parse(req.body);
  const order = await Order.findByIdAndUpdate(req.params.id, payload, { new: true });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  return res.json({ order });
});

export { router as orderRoutes };
